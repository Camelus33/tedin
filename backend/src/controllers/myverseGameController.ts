import { Request, Response } from 'express';
import MyverseGame, { IMyverseGame } from '../models/MyverseGame';
import Collection from '../models/Collection';
import mongoose from 'mongoose';

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
    const { title, inputText, wordMappings, boardSize, visibility, sharedWith } = req.body;
    const newGame = new MyverseGame({
      collectionId: collectionId,
      owner: userId,
      title,
      inputText,
      wordMappings,
      boardSize,
      visibility: visibility || 'private',
      sharedWith: visibility === 'group' ? sharedWith || [] : []
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