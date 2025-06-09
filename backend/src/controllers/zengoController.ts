import { Request, Response } from 'express';
import Zengo from '../models/Zengo';
import User from '../models/User';
import Badge from '../models/Badge';
import ZengoProverbContent, { IZengoProverbContent } from '../models/ZengoProverbContent';
import ZengoSessionResult, { IZengoSessionResult } from '../models/ZengoSessionResult';
import UserStats from '../models/UserStats';
import mongoose, { Types } from 'mongoose';
import { routineService } from '../services/routineService';
import { calculateCognitiveMetrics } from '../utils/cognitiveMetrics';
import { processCommonSessionResultTasks } from '../services/sessionResultService';
// import { koreanProverbs, englishProverbs } from '../scripts/data/expandedProverbs';

// 강력한 일렬 방지 함수 추가
function isColinear(positions: {x: number, y: number}[]): boolean {
  if (positions.length < 3) return false;
  for (let i = 0; i < positions.length - 2; i++) {
    for (let j = i + 1; j < positions.length - 1; j++) {
      for (let k = j + 1; k < positions.length; k++) {
        const [a, b, c] = [positions[i], positions[j], positions[k]];
        if ((b.x - a.x) * (c.y - a.y) === (b.y - a.y) * (c.x - a.x)) {
          return true;
        }
      }
    }
  }
  return false;
}

function generateNonColinearPositions(count: number, size: number): Array<{x: number, y: number}> {
  const allPositions: Array<{x: number, y: number}> = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      allPositions.push({ x, y });
    }
  }
  if (allPositions.length < count) {
    throw new Error(`보드 크기(${size}x${size})보다 많은 좌표(${count})를 생성할 수 없습니다.`);
  }
  let attempts = 0;
  while (attempts < 10000) {
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
    }
    const candidate = allPositions.slice(0, count);
    if (!isColinear(candidate)) {
      return candidate;
    }
    attempts++;
  }
  throw new Error('일렬이 아닌 좌표 조합을 생성하는 데 실패했습니다.');
}

// 좌표 유효성 검사 함수 추가
function validatePositions(wordMappings: { coords: { x: number, y: number } }[], boardSize: number) {
  for (const mapping of wordMappings) {
    const { x, y } = mapping.coords;
    if (x < 0 || x >= boardSize || y < 0 || y >= boardSize) {
      throw new Error(`좌표가 바둑판 범위를 벗어났습니다: (${x}, ${y})`);
    }
  }
}

// 사용자의 모든 Zengo 활동 조회
export const getUserZengo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const zengo = await Zengo.find({ userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json(zengo);
  } catch (error) {
    console.error('Zengo 목록 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Zengo 통계 조회
export const getZengoStats = async (req: Request, res: Response): Promise<void> => {
  try {
    // 현재 인증된 사용자의 ID
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: '인증이 필요합니다.' });
      return;
    }

    // 완료된 Zengo 활동만 조회
    const completedActivities = await Zengo.find({
      user: userId,
      status: 'completed'
    }).sort({ completedAt: -1 });

    if (completedActivities.length === 0) {
      res.status(200).json({
        totalActivities: 0,
        averageScores: {
          overall: 0,
          attention: 0,
          memory: 0,
          reasoning: 0,
          creativity: 0
        },
        moduleAverages: {},
        recentScores: [],
        progress: {
          last7Days: [],
          last30Days: []
        }
      });
      return;
    }

    // 전체 평균 점수 계산
    let totalAttention = 0;
    let totalMemory = 0;
    let totalReasoning = 0;
    let totalCreativity = 0;
    let attentionCount = 0;
    let memoryCount = 0;
    let reasoningCount = 0;
    let creativityCount = 0;

    // 모듈별 평균 저장용 객체
    const moduleScores: Record<string, { total: number; count: number; average: number }> = {};

    // 최근 점수 (최대 10개)
    const recentScores = completedActivities.slice(0, 10).map(activity => ({
      date: activity.completedAt,
      moduleId: activity.moduleId,
      scores: {
        attention: activity.scores?.attention || 0,
        memory: activity.scores?.memory || 0,
        reasoning: activity.scores?.reasoning || 0,
        creativity: activity.scores?.creativity || 0
      }
    }));

    // 각 활동별 데이터 처리
    completedActivities.forEach(activity => {
      // 모듈별 평균 계산용 데이터 수집
      if (!moduleScores[activity.moduleId]) {
        moduleScores[activity.moduleId] = { total: 0, count: 0, average: 0 };
      }
      
      // 수치형 평균값 계산을 위해 점수와 카운터 업데이트
      if (activity.scores?.attention) {
        totalAttention += activity.scores.attention;
        attentionCount++;
      }
      
      if (activity.scores?.memory) {
        totalMemory += activity.scores.memory;
        memoryCount++;
      }
      
      if (activity.scores?.reasoning) {
        totalReasoning += activity.scores.reasoning;
        reasoningCount++;
      }
      
      if (activity.scores?.creativity) {
        totalCreativity += activity.scores.creativity;
        creativityCount++;
      }

      // 모듈별 평균 계산
      const overallScore = (
        (activity.scores?.attention || 0) + 
        (activity.scores?.memory || 0) + 
        (activity.scores?.reasoning || 0) + 
        (activity.scores?.creativity || 0)
      ) / 4;

      moduleScores[activity.moduleId].total += overallScore;
      moduleScores[activity.moduleId].count += 1;
    });

    // 모듈별 평균 계산
    Object.keys(moduleScores).forEach(moduleId => {
      moduleScores[moduleId].average = moduleScores[moduleId].total / moduleScores[moduleId].count;
    });

    // 최근 7일/30일 진행 데이터
    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(now.getDate() - 7);
    
    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);

    const progress7Days = completedActivities
      .filter(activity => activity.completedAt && activity.completedAt >= last7Days)
      .map(activity => ({
        date: activity.completedAt,
        moduleId: activity.moduleId,
        overallScore: (
          (activity.scores?.attention || 0) + 
          (activity.scores?.memory || 0) + 
          (activity.scores?.reasoning || 0) + 
          (activity.scores?.creativity || 0)
        ) / 4
      }));

    const progress30Days = completedActivities
      .filter(activity => activity.completedAt && activity.completedAt >= last30Days)
      .map(activity => ({
        date: activity.completedAt,
        moduleId: activity.moduleId,
        overallScore: (
          (activity.scores?.attention || 0) + 
          (activity.scores?.memory || 0) + 
          (activity.scores?.reasoning || 0) + 
          (activity.scores?.creativity || 0)
        ) / 4
      }));

    // 평균 계산
    const overallAverage = (
      (attentionCount > 0 ? totalAttention / attentionCount : 0) +
      (memoryCount > 0 ? totalMemory / memoryCount : 0) +
      (reasoningCount > 0 ? totalReasoning / reasoningCount : 0) +
      (creativityCount > 0 ? totalCreativity / creativityCount : 0)
    ) / 4;

    res.status(200).json({
      totalActivities: completedActivities.length,
      averageScores: {
        overall: overallAverage,
        attention: attentionCount > 0 ? totalAttention / attentionCount : 0,
        memory: memoryCount > 0 ? totalMemory / memoryCount : 0,
        reasoning: reasoningCount > 0 ? totalReasoning / reasoningCount : 0,
        creativity: creativityCount > 0 ? totalCreativity / creativityCount : 0
      },
      moduleAverages: moduleScores,
      recentScores,
      progress: {
        last7Days: progress7Days,
        last30Days: progress30Days
      }
    });
  } catch (error) {
    console.error('Zengo 통계 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error });
  }
};

// 인지 능력 프로필 조회
export const getCognitiveProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // 현재 인증된 사용자의 ID
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: '인증이 필요합니다.' });
      return;
    }

    // 기간 파라미터 (기본값: 전체)
    const period = req.query.period as string || 'all';
    const limit = parseInt(req.query.limit as string) || 10;

    // 날짜 필터 계산
    const now = new Date();
    let dateFilter: Date | null = null;

    if (period === 'week') {
      dateFilter = new Date(now);
      dateFilter.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      dateFilter = new Date(now);
      dateFilter.setDate(now.getDate() - 30);
    } else if (period === 'year') {
      dateFilter = new Date(now);
      dateFilter.setDate(now.getDate() - 365);
    }

    // 완료된 Zengo 활동 및 세션 결과 조회
    const findParams: any = {
      userId: new mongoose.Types.ObjectId(userId)
    };

    if (dateFilter) {
      findParams.createdAt = { $gte: dateFilter };
    }

    const sessionResults = await ZengoSessionResult.find(findParams)
      .sort({ createdAt: -1 })
      .limit(limit);

    if (sessionResults.length === 0) {
      res.status(200).json({
        currentProfile: {
          hippocampusActivation: 0,
          workingMemory: 0,
          processingSpeed: 0,
          attention: 0,
          patternRecognition: 0,
          cognitiveFlexibility: 0
        },
        historicalData: []
      });
      return;
    }

    // 시계열 데이터 생성 (각 세션별)
    const historicalData = sessionResults.map(result => {
      const metrics = calculateCognitiveMetrics(result);
      return {
        date: result.createdAt,
        metrics
      };
    });

    // 최신 프로필 계산 (가장 최근 3개 세션의 평균)
    const recentSessions = sessionResults.slice(0, 3);
    const currentProfile = {
      hippocampusActivation: Math.round(recentSessions.reduce((sum, session) => sum + calculateCognitiveMetrics(session).hippocampusActivation, 0) / recentSessions.length) || 0,
      workingMemory: Math.round(recentSessions.reduce((sum, session) => sum + calculateCognitiveMetrics(session).workingMemory, 0) / recentSessions.length) || 0,
      processingSpeed: Math.round(recentSessions.reduce((sum, session) => sum + calculateCognitiveMetrics(session).processingSpeed, 0) / recentSessions.length) || 0,
      attention: Math.round(recentSessions.reduce((sum, session) => sum + calculateCognitiveMetrics(session).attention, 0) / recentSessions.length) || 0,
      patternRecognition: Math.round(recentSessions.reduce((sum, session) => sum + calculateCognitiveMetrics(session).patternRecognition, 0) / recentSessions.length) || 0,
      cognitiveFlexibility: Math.round(recentSessions.reduce((sum, session) => sum + calculateCognitiveMetrics(session).cognitiveFlexibility, 0) / recentSessions.length) || 0
    };

    res.status(200).json({
      currentProfile,
      historicalData
    });
  } catch (error) {
    console.error('인지 능력 프로필 조회 중 오류 발생:', error);
    // Avoid serializing Error object directly to JSON
    const errMsg = error instanceof Error ? error.message : String(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error: errMsg });
  }
};

// 특정 Zengo 활동 상세 조회
export const getZengoById = async (req: Request, res: Response) => {
  try {
    const { zengoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    // 'stats'와 같은 특수 경로 확인
    if (zengoId === 'stats' || zengoId === 'proverb-content') {
      return res.status(404).json({ 
        message: '잘못된 요청입니다. 이 ID는 특수 경로로 예약되어 있습니다.',
        suggestedPath: `/api/zengo/${zengoId}`
      });
    }

    // ObjectId 유효성 검사
    if (!mongoose.Types.ObjectId.isValid(zengoId)) {
      return res.status(400).json({ message: '유효하지 않은 Zengo ID 형식입니다.' });
    }

    const zengo = await Zengo.findOne({ _id: zengoId, userId })
      .select('-__v');

    if (!zengo) {
      return res.status(404).json({ message: '해당 Zengo 활동을 찾을 수 없습니다.' });
    }

    res.status(200).json(zengo);
  } catch (error) {
    console.error('Zengo 상세 조회 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 새 Zengo 활동 생성
export const createZengo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const { boardSize, modules } = req.body;

    const newZengo = new Zengo({
      userId,
      boardSize,
      modules,
      status: 'setup',
    });

    const savedZengo = await newZengo.save();
    
    res.status(201).json(savedZengo);
  } catch (error) {
    console.error('Zengo 활동 생성 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Zengo 활동 시작
export const startZengo = async (req: Request, res: Response) => {
  try {
    const { zengoId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const zengo = await Zengo.findOne({ _id: zengoId, userId });

    if (!zengo) {
      return res.status(404).json({ message: '해당 Zengo 활동을 찾을 수 없습니다.' });
    }

    if (zengo.status !== 'setup') {
      return res.status(400).json({ message: '이미 시작되었거나 종료된 Zengo 활동입니다.' });
    }

    const updatedZengo = await Zengo.findByIdAndUpdate(
      zengoId,
      { $set: { status: 'active' } },
      { new: true }
    ).select('-__v');

    res.status(200).json(updatedZengo);
  } catch (error) {
    console.error('Zengo 활동 시작 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Zengo 모듈 결과 업데이트
export const updateModuleResults = async (req: Request, res: Response) => {
  try {
    const { zengoId, moduleName } = req.params;
    const userId = req.user?.id;
    const { 
      accuracy, 
      reactionTimeAvg, 
      memoryScore, 
      languageScore, 
      logicScore 
    } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const zengo = await Zengo.findOne({ _id: zengoId, userId });

    if (!zengo) {
      return res.status(404).json({ message: '해당 Zengo 활동을 찾을 수 없습니다.' });
    }

    if (zengo.status !== 'active') {
      return res.status(400).json({ message: '활성 상태가 아닌 Zengo 활동은 업데이트할 수 없습니다.' });
    }

    // 지정된 모듈 찾기
    const moduleIndex = zengo.modules.findIndex(module => module.name === moduleName);
    
    if (moduleIndex === -1) {
      return res.status(404).json({ message: '해당 모듈을 찾을 수 없습니다.' });
    }

    // 업데이트할 필드 설정
    const updateQuery: any = {};
    
    if (accuracy !== undefined) updateQuery[`modules.${moduleIndex}.accuracy`] = accuracy;
    if (reactionTimeAvg !== undefined) updateQuery[`modules.${moduleIndex}.reactionTimeAvg`] = reactionTimeAvg;
    if (memoryScore !== undefined) updateQuery[`modules.${moduleIndex}.memoryScore`] = memoryScore;
    if (languageScore !== undefined) updateQuery[`modules.${moduleIndex}.languageScore`] = languageScore;
    if (logicScore !== undefined) updateQuery[`modules.${moduleIndex}.logicScore`] = logicScore;

    const updatedZengo = await Zengo.findByIdAndUpdate(
      zengoId,
      { $set: updateQuery },
      { new: true }
    ).select('-__v');

    res.status(200).json(updatedZengo);
  } catch (error) {
    console.error('Zengo 모듈 결과 업데이트 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Zengo 활동 완료
export const completeZengo = async (req: Request, res: Response) => {
  try {
    const { zengoId } = req.params;
    const userId = req.user?.id;
    const { overallScore } = req.body;

    if (!userId) {
      return res.status(401).json({ message: '인증이 필요합니다.' });
    }

    const zengo = await Zengo.findOne({ _id: zengoId, userId });

    if (!zengo) {
      return res.status(404).json({ message: '해당 Zengo 활동을 찾을 수 없습니다.' });
    }

    if (zengo.status !== 'active') {
      return res.status(400).json({ message: '활성 상태가 아닌 Zengo 활동은 완료할 수 없습니다.' });
    }

    // 배지 확인
    const badges: string[] = [];
    
    // 첫 번째 Zengo 활동 완료 배지
    const zengoCount = await Zengo.countDocuments({ 
      userId, 
      status: 'completed'
    });
    
    if (zengoCount === 0) {
      const firstZengoBadge = 'first_zengo_completed';
      badges.push(firstZengoBadge);
      
      // 배지 추가
      await Badge.findOneAndUpdate(
        { userId, name: firstZengoBadge },
        { 
          $setOnInsert: { 
            userId,
            name: firstZengoBadge,
            description: '첫 번째 Zengo 활동 완료',
            category: 'zengo'
          }
        },
        { upsert: true, new: true }
      );
    }
    
    // 고득점 배지 (80점 이상)
    if (overallScore >= 80) {
      const masterBadge = 'zengo_master';
      badges.push(masterBadge);
      
      // 배지 추가
      await Badge.findOneAndUpdate(
        { userId, name: masterBadge },
        { 
          $setOnInsert: { 
            userId,
            name: masterBadge,
            description: 'Zengo 마스터',
            category: 'zengo'
          }
        },
        { upsert: true, new: true }
      );
    }

    // Zengo 완료 처리
    const updatedZengo = await Zengo.findByIdAndUpdate(
      zengoId,
      { 
        $set: { 
          status: 'completed',
          overallScore,
          badges
        } 
      },
      { new: true }
    ).select('-__v');

    res.status(200).json(updatedZengo);
  } catch (error) {
    console.error('Zengo 활동 완료 처리 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// Zengo 활동 취소
export const cancelZengo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { zengoId } = req.params;
    
    // 'stats'라는 특수 ID를 요청하면 API 패스가 충돌하므로 여기서 처리하지 않음
    if (zengoId === 'stats') {
      res.status(404).json({ message: '잘못된 요청입니다. /api/zengo/stats 경로를 사용하세요.' });
      return;
    }
    
    const zengo = await Zengo.findById(zengoId);

    if (!zengo) {
      res.status(404).json({ message: 'Zengo 활동을 찾을 수 없습니다.' });
      return;
    }

    // 사용자 ID 확인
    if (zengo.user.toString() !== req.user?.id.toString()) {
      res.status(403).json({ message: '권한이 없습니다.' });
      return;
    }

    // 취소 상태로 업데이트
    zengo.status = 'cancelled';
    zengo.endedAt = new Date();
    await zengo.save();

    res.status(200).json({ message: 'Zengo 활동이 취소되었습니다.', zengo });
  } catch (error) {
    console.error('Zengo 활동 취소 중 오류 발생:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.', error });
  }
};

// Zengo 콘텐츠 조회 (명세서 v3.0 기반) - MongoDB 기반으로 변경
export const getProverbContent = async (req: Request, res: Response) => {
  try {
    const { level, lang, reshuffle, contentId } = req.query;

    // Input validation
    if (!level || !lang) {
      return res.status(400).json({ message: 'Level and language query parameters are required.' });
    }

    // 로깅 추가
    console.log(`요청 파라미터:`, {
      level, 
      lang, 
      reshuffle,
      contentId,
      rawQuery: req.query
    });

    // reshuffleWords 값 결정 (reshuffle 파라미터를 우선 확인, 없으면 reshuffleWords 확인)
    const shouldReshuffle = reshuffle === 'true' || req.query.reshuffleWords === 'true';
    
    // 로깅 추가
    console.log(`위치 재배치 여부: ${shouldReshuffle}`);

    // 언어 검증
    const language = lang as string;
    if (!['ko', 'en', 'zh', 'ja'].includes(language)) {
      return res.status(400).json({ message: 'Unsupported language. Supported languages are ko, en, zh, ja.' });
    }

    // 레벨 검증
    const levelStr = level as string;
    if (!['3x3-easy', '5x5-medium', '7x7-hard'].includes(levelStr)) {
      return res.status(400).json({ message: 'Unsupported level. Supported levels are 3x3-easy, 5x5-medium, 7x7-hard.' });
    }

    let proverbContent;
    const { ObjectId } = require('mongodb');

    // 특정 contentId에 대한 처리
    if (contentId) {
      try {
        let objectId;
        
        try {
          // MongoDB ObjectId로 변환 시도
          objectId = new ObjectId(contentId);
        } catch (err) {
          console.error(`유효하지 않은 ObjectId 형식: ${contentId}`);
          return res.status(400).json({ message: 'Invalid contentId format' });
        }
        
        // MongoDB에서 문서 조회
        const existingContent = await ZengoProverbContent.findById(objectId);
        
        if (existingContent) {
          console.log(`contentId ${contentId}에 해당하는 콘텐츠를 찾았습니다.`);
          
          // reshuffleWords 파라미터가 true인 경우 단어 위치만 재배치
          if (shouldReshuffle) {
            console.log(`reshuffleWords=true: 동일한 문장에 새로운 위치 생성`);
            
            // 보드 사이즈 결정
            let boardSize = existingContent.boardSize;
            
            // 단어 수에 맞는 새로운 좌표 생성 (일렬 방지)
            const wordPositions = generateNonColinearPositions(existingContent.wordMappings.length, boardSize);
            
            // 기존 단어는 유지하고 좌표만 변경 (coords 필드 사용)
            const newWordMappings = existingContent.wordMappings.map((mapping, index) => ({
              word: mapping.word,
              coords: wordPositions[index] // coords 필드에 새 위치 할당
            }));
            
            validatePositions(newWordMappings, boardSize);
            
            // 기존 콘텐츠 복사 후 새 매핑으로 업데이트
            proverbContent = {
              ...existingContent.toObject(),
              wordMappings: newWordMappings,
              updatedAt: new Date()
            };
            
            console.log(`문장 "${existingContent.proverbText}"에 대한 새 위치 생성 완료`);
          } else {
            // reshuffleWords가 false인 경우 기존 콘텐츠 그대로 반환
            console.log(`reshuffleWords=false: 동일한 콘텐츠와 위치 유지`);
            proverbContent = existingContent.toObject();
          }
          
          // 최종 응답 반환
          return res.status(200).json(proverbContent);
        } else {
          console.log(`contentId ${contentId}에 해당하는 콘텐츠를 찾을 수 없습니다. 레벨과 언어에 따른 새 콘텐츠 조회로 전환`);
          // contentId를 찾지 못했을 때 오류 메시지를 반환하지 않고, 레벨과 언어에 따른 새 콘텐츠 제공
        }
      } catch (error) {
        console.error('contentId로 콘텐츠 조회 중 오류:', error);
        // 오류 발생 시 레벨과 언어에 따른 랜덤 조회로 폴백
        console.log('MongoDB에서 레벨과 언어에 따른 랜덤 조회로 전환');
      }
    }

    // 레벨과 언어에 맞는 콘텐츠를 MongoDB에서 랜덤으로 조회
    const count = await ZengoProverbContent.countDocuments({ level: levelStr, language });
    
    if (count === 0) {
      return res.status(404).json({ 
        message: `No proverbs found for level ${levelStr} and language ${language}.`,
        details: 'Database may need to be seeded with proverb data. Please run "npm run clean-zengo-data".'
      });
    }
    
    // 랜덤 인덱스 생성
    const randomIndex = Math.floor(Math.random() * count);
    
    // MongoDB에서 레벨과 언어에 맞는 모든 속담을 가져와 랜덤으로 하나 선택
    const randomProverb = await ZengoProverbContent.findOne({ level: levelStr, language })
      .skip(randomIndex)
      .exec();
    
    if (!randomProverb) {
      return res.status(404).json({ 
        message: 'Random proverb selection failed.',
        details: 'This is likely a database access issue. Please check database connection.'
      });
    }
    
    console.log(`랜덤 속담 반환: "${randomProverb.proverbText}" (${levelStr}, ${language})`);
    
    // reshuffleWords 파라미터가 true인 경우 단어 위치 재배치
    if (shouldReshuffle) {
      console.log(`reshuffleWords=true: 선택된 랜덤 속담에 새로운 위치 생성`);
      
      // 보드 사이즈 결정
      let boardSize = randomProverb.boardSize;
      
      // 단어 수에 맞는 새로운 좌표 생성 (일렬 방지)
      const wordPositions = generateNonColinearPositions(randomProverb.wordMappings.length, boardSize);
      
      // 기존 단어는 유지하고 좌표만 변경 (coords 필드 사용)
      const newWordMappings = randomProverb.wordMappings.map((mapping, index) => ({
        word: mapping.word,
        coords: wordPositions[index] // coords 필드에 새 위치 할당
      }));
      
      validatePositions(newWordMappings, boardSize);
      
      // 기존 콘텐츠 복사 후 새 매핑으로 업데이트
      proverbContent = {
        ...randomProverb.toObject(),
        wordMappings: newWordMappings,
        updatedAt: new Date()
      };
      
      console.log(`문장 "${randomProverb.proverbText}"에 대한 새 위치 생성 완료`);
    } else {
      // reshuffleWords가 false인 경우 기존 콘텐츠 그대로 반환
      console.log(`reshuffleWords=false: 선택된 랜덤 속담과 위치 유지`);
      proverbContent = randomProverb.toObject();
    }
    
    // 최종 응답 반환
    res.status(200).json(proverbContent);

  } catch (error) {
    console.error('Error fetching Zengo proverb content:', error);
    res.status(500).json({ 
      message: 'Server error occurred while fetching proverb content.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Zengo 게임 세션 결과 저장 (v3.2 - DB 스키마 V2 필드 연동 완료)
export const saveSessionResult = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user?.id;
    if (!userId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
    }

    const {
      contentId,
      level,
      language,
      usedStonesCount,
      correctPlacements,
      incorrectPlacements,
      timeTakenMs,
      completedSuccessfully,
      resultType,
      score,
      orderCorrect,
      placementOrder,
      detailedMetrics // V2 상세 데이터 수신
    } = req.body;

    // 필수 필드 유효성 검사
    if (!contentId || !level || !language) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: '필수 필드가 누락되었습니다: contentId, level, language' });
    }

    const newSessionResultData: Partial<IZengoSessionResult> = {
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
      level,
      language,
      usedStonesCount,
      correctPlacements,
      incorrectPlacements,
      timeTakenMs,
      completedSuccessfully,
      resultType,
      score,
      orderCorrect,
      placementOrder,
      detailedDataVersion: detailedMetrics ? 'v2.0' : 'v1.0', // 데이터 버전을 조건부로 명시
      detailedMetrics: detailedMetrics ? {
        firstClickLatency: detailedMetrics.firstClickLatency || 0,
        interClickIntervals: detailedMetrics.interClickIntervals || [],
        hesitationPeriods: detailedMetrics.hesitationPeriods || [],
        spatialErrors: detailedMetrics.spatialErrors || [],
        clickPositions: detailedMetrics.clickPositions || [],
        correctPositions: detailedMetrics.correctPositions || [],
        sequentialAccuracy: detailedMetrics.sequentialAccuracy || 0,
        temporalOrderViolations: detailedMetrics.temporalOrderViolations || 0,
        spatialPatternRecognition: detailedMetrics.spatialPatternRecognition || 0,
        cognitiveLoadManagement: detailedMetrics.cognitiveLoadManagement || 0,
        taskSwitchingCost: detailedMetrics.taskSwitchingCost || 0,
        errorAdaptability: detailedMetrics.errorAdaptability || 0,
        emotionalRegulation: detailedMetrics.emotionalRegulation || 0,
      } : undefined
    };

    const newSessionResult = new ZengoSessionResult(newSessionResultData);
    const savedResult = await newSessionResult.save({ session });

    const { earnedNewBadge, newBadge } = await processCommonSessionResultTasks(
      userId,
      savedResult,
      savedResult.level,
      savedResult.completedSuccessfully
    );

    await session.commitTransaction();

    res.status(201).json({
      message: '세션 결과가 성공적으로 저장되었습니다.',
      data: {
        resultId: savedResult._id,
        earnedBadge: earnedNewBadge && newBadge ? {
          _id: newBadge._id,
          name: newBadge.name,
          description: newBadge.description,
          imageUrl: newBadge.imageUrl
        } : null,
      },
      code: 'SUCCESS'
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('세션 결과 저장 중 오류 발생:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: '데이터 유효성 검사 실패', details: error.errors });
    }
    res.status(500).json({ message: '서버 내부 오류로 인해 세션 결과를 저장하지 못했습니다.' });
  } finally {
    session.endSession();
  }
};

// 같은 문장에 대해 새로운 위치 생성
export const regeneratePositions = async (req: Request, res: Response) => {
  try {
    // URL 파라미터 또는 쿼리 파라미터에서 contentId 가져오기
    const contentId = req.params.contentId || req.query.contentId as string;
    
    if (!contentId) {
      return res.status(400).json({ error: 'Content ID is required' });
    }
    
    // 기존 콘텐츠 조회
    const content = await ZengoProverbContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    // 단어 위치 재생성 함수
    function isColinear(positions: {x: number, y: number}[]): boolean {
      if (positions.length < 2) return false;
      const allX = positions.every(pos => pos.x === positions[0].x);
      const allY = positions.every(pos => pos.y === positions[0].y);
      const allDiag1 = positions.every(pos => (pos.x - pos.y) === (positions[0].x - positions[0].y));
      const allDiag2 = positions.every(pos => (pos.x + pos.y) === (positions[0].x + positions[0].y));
      return allX || allY || allDiag1 || allDiag2;
    }
    
    function generateUniquePositions(count: number, size: number): Array<{x: number, y: number}> {
      let attempts = 0;
      while (attempts < 100) {
        const positions: Array<{x: number, y: number}> = [];
        const usedPositions = new Set<string>();
        while (positions.length < count) {
          const x = Math.floor(Math.random() * size);
          const y = Math.floor(Math.random() * size);
          const posStr = `${x},${y}`;
          if (!usedPositions.has(posStr)) {
            usedPositions.add(posStr);
            positions.push({ x, y });
          }
        }
        if (!isColinear(positions)) {
          return positions;
        }
        attempts++;
      }
      throw new Error('랜덤 배치 100회 시도에도 일렬이 아닌 배치를 만들지 못했습니다.');
    }
    
    // 단어 수 확인
    const wordCount = content.wordMappings.length;
    
    // 새 위치 생성 (일렬 방지)
    const newPositions = generateNonColinearPositions(wordCount, content.boardSize);
    
    // 기존 단어와 순서는 유지하고 위치만 변경
    const newMappings = content.wordMappings.map((mapping, index) => ({
      word: mapping.word,
      coords: newPositions[index]
    }));
    
    validatePositions(newMappings, content.boardSize);
    
    // 새로운 컨텐츠 생성 (기존 _id 사용 안함)
    const updatedContent = {
      ...content.toObject(),
      wordMappings: newMappings,
      regeneratedAt: new Date()
    };
    
    res.status(200).json(updatedContent);
  } catch (error) {
    console.error('위치 재생성 중 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
}; 