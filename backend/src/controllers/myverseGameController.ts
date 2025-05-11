import { Request, Response } from 'express';
import MyverseGame, { IMyverseGame } from '../models/MyverseGame';
import Collection from '../models/Collection';
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import { validationResult } from 'express-validator';
import MyVerseSessionResult from '../models/MyVerseSessionResult';
import { processCommonSessionResultTasks } from '../services/sessionResultService';

// Helper function for cursor-based pagination
const applyPagination = async (
  query: mongoose.FilterQuery<IMyverseGame>,
  sortBy: string = 'updatedAt',
  order: 'asc' | 'desc' = 'desc',
  limit: number = 10,
  cursor?: string
): Promise<{ games: IMyverseGame[], nextCursor: string | null }> => {
  const sortOrder = order === 'desc' ? -1 : 1;
  const sortField = sortBy || 'updatedAt';
  let finalQuery = { ...query }; // 원본 쿼리 복사

  if (cursor) {
    const [cursorValue, cursorId] = cursor.split('_');
    
    // 커서 ID 유효성 검사 추가
    if (!cursorId || !mongoose.isValidObjectId(cursorId)) {
      console.error("Invalid cursor format or ID received:", cursor);
      // 유효하지 않은 커서의 경우, 오류를 발생시키거나 빈 결과를 반환할 수 있음
      // 여기서는 오류를 발생시켜 클라이언트가 문제를 인지하도록 함
      throw new Error('유효하지 않은 커서 형식입니다.'); 
    }

    let cursorCondition = {};
    // 정렬 방향에 따라 쿼리 조건 설정
    if (sortOrder === -1) { // 내림차순 (최신순)
      cursorCondition = {
        $or: [
          { [sortField]: { $lt: cursorValue } },
          { [sortField]: cursorValue, _id: { $lt: new mongoose.Types.ObjectId(cursorId) } }
        ]
      };
    } else { // 오름차순
      cursorCondition = {
        $or: [
          { [sortField]: { $gt: cursorValue } },
          { [sortField]: cursorValue, _id: { $gt: new mongoose.Types.ObjectId(cursorId) } }
        ]
      };
    }
    // 기존 쿼리와 커서 조건을 $and 로 결합
    finalQuery = { $and: [query, cursorCondition] };
  }

  const games = await MyverseGame.find(finalQuery) // 수정된 finalQuery 사용
    .sort({ [sortField]: sortOrder, _id: sortOrder })
    .limit(limit + 1)
    .populate('owner', 'nickname')
    .populate('collectionId', 'name type');

  let nextCursor: string | null = null;
  if (games.length > limit) {
    const nextGame = games.pop();
    if (nextGame) {
      const cursorValue = nextGame[sortField as keyof IMyverseGame];
      // 날짜 타입 처리 및 null/undefined 값 처리 강화
      const cursorFieldString = 
        cursorValue instanceof Date ? cursorValue.toISOString() 
        : (cursorValue !== null && cursorValue !== undefined ? cursorValue.toString() : 'null'); // null 또는 undefined인 경우 'null' 문자열 사용
        
      // 생성되는 커서 값 로깅 (디버깅 목적)
      // console.log(`Creating cursor: ${cursorFieldString}_${nextGame._id.toString()}`)
      nextCursor = `${cursorFieldString}_${nextGame._id.toString()}`;
    }
  }

  return { games, nextCursor };
};

// Get all games in a specific collection (페이지네이션 추가)
export const getGamesByCollection = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { collectionId } = req.params;
    const { limit = '10', cursor, sortBy = 'updatedAt', order = 'desc' } = req.query;

    const query: mongoose.FilterQuery<IMyverseGame> = { 
      collectionId, 
      owner: userId // 컬렉션 내 게임은 해당 컬렉션 소유자만 조회 가능하다고 가정
    };

    const result = await applyPagination(
      query,
      sortBy as string,
      order as 'asc' | 'desc',
      parseInt(limit as string, 10),
      cursor as string
    );
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching games by collection:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};

// Create a new game in a collection
export const createMyverseGame = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { collectionId } = req.params;
    const { title, description, inputText, wordMappings, boardSize, visibility, sharedWith, tags } = req.body;

    // === 유효성 검사 ===
    // 제목
    if (!title || title.length < 2 || title.length > 50) {
      return res.status(400).json({ error: '제목은 2~50자여야 합니다.' });
    }
    // 설명
    if (!description || description.length < 10 || description.length > 300) {
      return res.status(400).json({ error: '설명은 10~300자여야 합니다.' });
    }
    // inputText(문장)
    const words = (inputText || '').trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return res.status(400).json({ error: '암기할 단어/문장을 입력해 주세요.' });
    if (words.length > 9) return res.status(400).json({ error: '최대 9개까지 입력할 수 있습니다.' });
    if (new Set(words).size !== words.length) return res.status(400).json({ error: '중복된 단어가 있습니다.' });
    for (const w of words) {
      if (w.length < 1 || w.length > 20) return res.status(400).json({ error: '각 단어는 1~20자여야 합니다.' });
      if (!/^[가-힣a-zA-Z0-9]+$/.test(w)) return res.status(400).json({ error: '특수문자 없이 한글, 영문, 숫자만 입력해 주세요.' });
    }
    // tags
    if (tags) {
      if (!Array.isArray(tags) || tags.length > 20) {
        return res.status(400).json({ error: '태그는 최대 20개까지 입력할 수 있습니다.' });
      }
      const tagSet = new Set();
      for (const tag of tags) {
        if (typeof tag !== 'string' || tag.length < 1 || tag.length > 20) {
          return res.status(400).json({ error: '각 태그는 1~20자여야 합니다.' });
        }
        if (!/^[가-힣a-zA-Z0-9]+$/.test(tag)) {
          return res.status(400).json({ error: '태그에는 특수문자를 사용할 수 없습니다.' });
        }
        if (tagSet.has(tag)) {
          return res.status(400).json({ error: `중복된 태그가 있습니다: ${tag}` });
        }
        tagSet.add(tag);
      }
    }

    const newGame = new MyverseGame({
      collectionId: collectionId,
      owner: userId,
      title,
      description,
      inputText,
      wordMappings,
      boardSize,
      visibility: visibility || 'private',
      sharedWith: visibility === 'group' ? sharedWith || [] : [],
      tags: tags || []
    });
    const saved = await newGame.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
};

// Get a single game by ID (owner or shared)
export const getMyverseGame = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.params;
    if (!mongoose.isValidObjectId(gameId)) {
      return res.status(400).json({ error: '유효하지 않은 게임 ID입니다.' });
    }
    const game = await MyverseGame.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    // Authorization
    if (game.visibility === 'private' && game.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (game.visibility === 'group' && !game.sharedWith.map(id => id.toString()).includes(userId.toString()) && game.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.status(200).json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
};

// Update an existing game
export const updateMyverseGame = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.params;
    if (!mongoose.isValidObjectId(gameId)) {
      return res.status(400).json({ error: '유효하지 않은 게임 ID입니다.' });
    }
    const updateData = req.body;
    // === 유효성 검사 ===
    if (updateData.title && (updateData.title.length < 2 || updateData.title.length > 50)) {
      return res.status(400).json({ error: '제목은 2~50자여야 합니다.' });
    }
    if (updateData.description && (updateData.description.length < 10 || updateData.description.length > 300)) {
      return res.status(400).json({ error: '설명은 10~300자여야 합니다.' });
    }
    if (updateData.inputText) {
      const words = (updateData.inputText || '').trim().split(/\s+/).filter(Boolean);
      if (words.length === 0) return res.status(400).json({ error: '암기할 단어/문장을 입력해 주세요.' });
      if (words.length > 9) return res.status(400).json({ error: '최대 9개까지 입력할 수 있습니다.' });
      if (new Set(words).size !== words.length) return res.status(400).json({ error: '중복된 단어가 있습니다.' });
      for (const w of words) {
        if (w.length < 1 || w.length > 20) return res.status(400).json({ error: '각 단어는 1~20자여야 합니다.' });
        if (!/^[가-힣a-zA-Z0-9]+$/.test(w)) return res.status(400).json({ error: '특수문자 없이 한글, 영문, 숫자만 입력해 주세요.' });
      }
    }
    if (updateData.tags) {
      if (!Array.isArray(updateData.tags) || updateData.tags.length > 20) {
        return res.status(400).json({ error: '태그는 최대 20개까지 입력할 수 있습니다.' });
      }
      const tagSet = new Set();
      for (const tag of updateData.tags) {
        if (typeof tag !== 'string' || tag.length < 1 || tag.length > 20) {
          return res.status(400).json({ error: '각 태그는 1~20자여야 합니다.' });
        }
        if (!/^[가-힣a-zA-Z0-9]+$/.test(tag)) {
          return res.status(400).json({ error: '태그에는 특수문자를 사용할 수 없습니다.' });
        }
        if (tagSet.has(tag)) {
          return res.status(400).json({ error: `중복된 태그가 있습니다: ${tag}` });
        }
        tagSet.add(tag);
      }
    }
    const game = await MyverseGame.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    Object.assign(game, updateData);
    const updated = await game.save();
    res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating game:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
};

// Delete a game
export const deleteMyverseGame = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { gameId } = req.params;
    if (!mongoose.isValidObjectId(gameId)) {
      return res.status(400).json({ error: '유효하지 않은 게임 ID입니다.' });
    }
    const game = await MyverseGame.findById(gameId);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    if (game.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await game.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
};

// Get all accessible games (owned or shared)
export const getAccessibleGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { limit = '10', cursor, sortBy = 'updatedAt', order = 'desc' } = req.query;

    const query: mongoose.FilterQuery<IMyverseGame> = {
      $or: [
        { owner: userId },
        { sharedWith: userId }
      ]
    };

    const result = await applyPagination(
      query,
      sortBy as string,
      order as 'asc' | 'desc',
      parseInt(limit as string, 10),
      cursor as string
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching accessible games:', error);
    res.status(500).json({ error: 'Failed to fetch accessible games' });
  }
};

// Get games by category type
export const getGamesByType = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { type } = req.params; // 라우트 파라미터에서 type 가져오기
    const { limit = '10', cursor, sortBy = 'updatedAt', order = 'desc' } = req.query;

    // 1. Find collections owned by the user with the specified type
    const collections = await Collection.find({ owner: userId, type: type }).select('_id');
    const collectionIds = collections.map(c => c._id);

    if (collectionIds.length === 0) {
      // 해당 타입의 컬렉션이 없으면 빈 결과 반환
      return res.status(200).json({ games: [], nextCursor: null });
    }

    // 2. Find games belonging to these collections
    const query: mongoose.FilterQuery<IMyverseGame> = {
      collectionId: { $in: collectionIds }
    };

    const result = await applyPagination(
      query,
      sortBy as string,
      order as 'asc' | 'desc',
      parseInt(limit as string, 10),
      cursor as string
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching games by type:', error);
    res.status(500).json({ error: 'Failed to fetch games by type' });
  }
};

// Get games shared with the authenticated user (excluding owned games, add pagination)
export const getSharedGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { limit = '10', cursor, sortBy = 'updatedAt', order = 'desc' } = req.query;

    const query: mongoose.FilterQuery<IMyverseGame> = {
      sharedWith: userId,
      owner: { $ne: userId } // 사용자가 소유하지 않은 게임만 조회
    };
    
    // 그룹 공유 게임만 해당되도록 visibility 조건 추가 (기존 로직 유지 시)
    // query.visibility = 'group'; // 이 조건이 필요한지 요구사항 재확인 필요

    const result = await applyPagination(
      query,
      sortBy as string,
      order as 'asc' | 'desc',
      parseInt(limit as string, 10),
      cursor as string
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching shared games:', error);
    res.status(500).json({ error: 'Failed to fetch shared games' });
  }
};

// Get games sent by the authenticated user (owner with at least one sharedWith)
export const getSentGames = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const { limit = '10', cursor, sortBy = 'updatedAt', order = 'desc' } = req.query;

    const query: mongoose.FilterQuery<IMyverseGame> = {
      owner: userId,
      sharedWith: { $exists: true, $ne: [] }
    };

    const result = await applyPagination(
      query,
      sortBy as string,
      order as 'asc' | 'desc',
      parseInt(limit as string, 10),
      cursor as string
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching sent games:', error);
    res.status(500).json({ error: 'Failed to fetch sent games' });
  }
};

/**
 * Saves the result of a MyVerse game session.
 */
export const saveMyVerseSessionResult = async (req: Request, res: Response) => {
  // 1. Validate request body (consider adding express-validator rules in the route)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user?.id as Types.ObjectId | string | undefined;
  const {
    myVerseGameId, // Expecting this ID instead of contentId
    collectionId, // Collection ID might be needed for context or future features
    level, // e.g., "5x5-myverse"
    language,
    usedStonesCount,
    correctPlacements,
    incorrectPlacements,
    timeTakenMs,
    completedSuccessfully,
    resultType // EXCELLENT, SUCCESS, FAIL
  } = req.body;

  if (!userId) {
    return res.status(401).json({ message: '인증이 필요합니다.' });
  }

  // Optional: Verify the MyVerse game exists (helps prevent saving results for deleted games)
  try {
    const gameExists = await MyverseGame.findById(myVerseGameId);
    if (!gameExists) {
        return res.status(404).json({ message: '해당 MyVerse 게임을 찾을 수 없습니다.' });
    }
    // Optional: Check if the user owns or has access to this game/collection if needed
  } catch (error) {
    console.error('MyVerse 게임 ID 검증 중 오류 발생:', error);
    return res.status(500).json({ message: 'MyVerse 게임 검증 중 서버 오류가 발생했습니다.' });
  }

  // 2. Calculate score (Using a similar logic as standard Zengo for now)
  // You might want to adjust scoring specifically for MyVerse later.
  const score = calculateMyVerseScore(); // Use a helper or inline calculation

  // 3. Create new MyVerse session result document
  const newResult = new MyVerseSessionResult({
    userId,
    myVerseGameId,
    collectionId, // Store collectionId if provided
    level,
    language,
    usedStonesCount,
    correctPlacements,
    incorrectPlacements,
    timeTakenMs,
    completedSuccessfully,
    resultType: resultType || (completedSuccessfully ? 'SUCCESS' : 'FAIL'),
    score,
  });

  try {
    // 4. Save the MyVerse session result
    const savedResult = await newResult.save();

    // 5. Process common tasks using the service function
    // Note: processCommonSessionResultTasks currently updates Zengo-specific stats.
    // You might need to adapt the service or UserStats model if you want separate MyVerse stats.
    const { earnedNewBadge, newBadge } = await processCommonSessionResultTasks(
      userId,
      savedResult, // Pass the saved MyVerse result (ensure type compatibility or adjust service)
      level,       // Pass level
      completedSuccessfully // Pass completion status
    );

    // 6. Send Response
    if (earnedNewBadge && newBadge) {
      return res.status(201).json({
        message: 'MyVerse 세션 결과가 저장되었고 새로운 배지를 획득했습니다!',
        result: savedResult,
        score: savedResult.score,
        newBadge: newBadge
      });
    } else {
      res.status(201).json({
        message: 'MyVerse 세션 결과가 성공적으로 저장되었습니다.',
        result: savedResult,
        score: savedResult.score
      });
    }

  } catch (error) {
    console.error('MyVerse 세션 결과 저장/처리 중 오류 발생:', error);
    res.status(500).json({ message: 'MyVerse 세션 결과 처리 중 서버 오류가 발생했습니다.' });
  }

  // Helper function for MyVerse score calculation (can be refined)
  function calculateMyVerseScore(): number {
    let baseScore = correctPlacements * 10;
    baseScore -= incorrectPlacements * 5;
    const timePenalty = Math.max(0, Math.floor(timeTakenMs / 1000 / 10));
    baseScore -= timePenalty;
    const finalResultType = resultType || (completedSuccessfully ? 'SUCCESS' : 'FAIL');
    if (finalResultType === 'EXCELLENT') {
      baseScore += 20; // Bonus for perfect play
    }
    // Fail results get 0 score
    if (!completedSuccessfully) {
        return 0;
    }
    return Math.max(0, Math.min(Math.round(baseScore), 100)); // Clamp between 0 and 100
  }
}; 