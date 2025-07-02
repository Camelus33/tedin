import { Types } from 'mongoose';
import { BeliefNode, BeliefEdge, ArgumentUnit, RhetoricalRelation } from '../types/common';
import { extractArgumentUnits } from '../utils/ArgumentMiner';
import { analyzeRhetoricalStructure } from '../utils/RSTAnalyzer';

/**
 * BeliefNetworkService
 * 사용자의 신념 네트워크(Belief Network)를 관리하는 서비스
 * PBAM(확률적 신념 및 논증 모델)의 핵심 구성 요소
 */

// 임시 메모리 저장소 (추후 데이터베이스로 대체 예정)
interface BeliefNetworkData {
  userId: string;
  nodes: BeliefNode[];
  edges: BeliefEdge[];
  lastUpdated: Date;
}

// 메모리 기반 임시 저장소
const beliefNetworks: Map<string, BeliefNetworkData> = new Map();

/**
 * 사용자의 신념 네트워크에 새로운 노드를 추가합니다.
 * @param userId - 사용자 ID
 * @param node - 추가할 신념 노드
 * @returns 추가된 노드의 ID
 */
export const addNode = async (userId: string, node: BeliefNode): Promise<string> => {
  console.log(`[BeliefNetworkService] addNode called for user ${userId}, node: ${node.id}`);
  
  // 네트워크 데이터 가져오기 또는 생성
  const networkData = beliefNetworks.get(userId) || {
    userId,
    nodes: [],
    edges: [],
    lastUpdated: new Date()
  };
  
  // 중복 노드 확인
  const existingNodeIndex = networkData.nodes.findIndex(n => n.id === node.id);
  if (existingNodeIndex >= 0) {
    // 기존 노드 업데이트
    networkData.nodes[existingNodeIndex] = node;
    console.log(`[BeliefNetworkService] Updated existing node ${node.id}`);
  } else {
    // 새 노드 추가
    networkData.nodes.push(node);
    console.log(`[BeliefNetworkService] Added new node ${node.id}`);
  }
  
  networkData.lastUpdated = new Date();
  beliefNetworks.set(userId, networkData);
  
  return node.id;
};

/**
 * 사용자의 신념 네트워크에 새로운 엣지를 추가합니다.
 * @param userId - 사용자 ID
 * @param edge - 추가할 신념 엣지
 * @returns 추가 성공 여부
 */
export const addEdge = async (userId: string, edge: BeliefEdge): Promise<boolean> => {
  console.log(`[BeliefNetworkService] addEdge called for user ${userId}, edge: ${edge.sourceNodeId} -> ${edge.targetNodeId}`);
  
  const networkData = beliefNetworks.get(userId);
  if (!networkData) {
    console.warn(`[BeliefNetworkService] No network data found for user ${userId}`);
    return false;
  }
  
  // 소스와 타겟 노드가 존재하는지 확인
  const sourceExists = networkData.nodes.some(node => node.id === edge.sourceNodeId);
  const targetExists = networkData.nodes.some(node => node.id === edge.targetNodeId);
  
  if (!sourceExists || !targetExists) {
    console.warn(`[BeliefNetworkService] Source or target node not found for edge ${edge.sourceNodeId} -> ${edge.targetNodeId}`);
    return false;
  }
  
  // 중복 엣지 확인
  const existingEdgeIndex = networkData.edges.findIndex(
    e => e.sourceNodeId === edge.sourceNodeId && e.targetNodeId === edge.targetNodeId
  );
  
  if (existingEdgeIndex >= 0) {
    // 기존 엣지 업데이트
    networkData.edges[existingEdgeIndex] = edge;
    console.log(`[BeliefNetworkService] Updated existing edge ${edge.sourceNodeId} -> ${edge.targetNodeId}`);
  } else {
    // 새 엣지 추가
    networkData.edges.push(edge);
    console.log(`[BeliefNetworkService] Added new edge ${edge.sourceNodeId} -> ${edge.targetNodeId}`);
  }
  
  networkData.lastUpdated = new Date();
  beliefNetworks.set(userId, networkData);
  
  return true;
};

/**
 * 특정 ID의 신념 노드를 조회합니다.
 * @param userId - 사용자 ID
 * @param nodeId - 조회할 노드 ID
 * @returns 신념 노드 또는 null
 */
export const getNode = async (userId: string, nodeId: string): Promise<BeliefNode | null> => {
  console.log(`[BeliefNetworkService] getNode called for user ${userId}, nodeId: ${nodeId}`);
  
  const networkData = beliefNetworks.get(userId);
  if (!networkData) {
    return null;
  }
  
  return networkData.nodes.find(node => node.id === nodeId) || null;
};

/**
 * 사용자의 전체 신념 네트워크를 조회합니다.
 * @param userId - 사용자 ID
 * @returns 신념 네트워크 데이터
 */
export const getBeliefNetwork = async (userId: string): Promise<BeliefNetworkData | null> => {
  console.log(`[BeliefNetworkService] getBeliefNetwork called for user ${userId}`);
  
  return beliefNetworks.get(userId) || null;
};

/**
 * 특정 노트로부터 신념 네트워크를 업데이트합니다.
 * ArgumentMiner와 RSTAnalyzer의 결과를 통합하여 네트워크를 구축합니다.
 * @param userId - 사용자 ID
 * @param noteId - 분석할 노트 ID
 * @param noteText - 노트 내용
 * @returns 업데이트 성공 여부와 생성된 노드/엣지 정보
 */
export const updateFromNote = async (
  userId: string, 
  noteId: string, 
  noteText: string
): Promise<{
  success: boolean;
  nodesCreated: number;
  edgesCreated: number;
  argumentUnits: ArgumentUnit[];
  rhetoricalRelations: RhetoricalRelation[];
}> => {
  
  console.log(`[BeliefNetworkService] updateFromNote called for user ${userId}, noteId: ${noteId}`);
  console.log(`[BeliefNetworkService] Note text preview: ${noteText.substring(0, 100)}...`);
  
  try {
    // 1. ArgumentMiner를 사용하여 논증 단위 추출
    const argumentUnits = extractArgumentUnits(noteText, noteId);
    console.log(`[BeliefNetworkService] Extracted ${argumentUnits.length} argument units`);
    
    if (argumentUnits.length === 0) {
      console.log(`[BeliefNetworkService] No argument units found in note ${noteId}`);
      return {
        success: true,
        nodesCreated: 0,
        edgesCreated: 0,
        argumentUnits: [],
        rhetoricalRelations: []
      };
    }
    
    // 2. ArgumentUnit들을 BeliefNode로 변환하여 추가
    let nodesCreated = 0;
    for (const argumentUnit of argumentUnits) {
      const beliefNode = convertArgumentUnitToBeliefNode(argumentUnit, noteId);
      await addNode(userId, beliefNode);
      nodesCreated++;
    }
    
    // 3. RSTAnalyzer를 사용하여 수사적 관계 분석
    const rhetoricalRelations = analyzeRhetoricalStructure(argumentUnits);
    console.log(`[BeliefNetworkService] Analyzed ${rhetoricalRelations.length} rhetorical relations`);
    
    // 4. RhetoricalRelation들을 BeliefEdge로 변환하여 추가
    let edgesCreated = 0;
    for (const rhetoricalRelation of rhetoricalRelations) {
      const beliefEdge = convertRhetoricalRelationToBeliefEdge(rhetoricalRelation, noteId);
      if (beliefEdge) {
        const success = await addEdge(userId, beliefEdge);
        if (success) {
          edgesCreated++;
        }
      }
    }
    
    console.log(`[BeliefNetworkService] Successfully processed note ${noteId}: ${nodesCreated} nodes, ${edgesCreated} edges created`);
    
    return {
      success: true,
      nodesCreated,
      edgesCreated,
      argumentUnits,
      rhetoricalRelations
    };
    
  } catch (error) {
    console.error(`[BeliefNetworkService] Error processing note ${noteId}:`, error);
    return {
      success: false,
      nodesCreated: 0,
      edgesCreated: 0,
      argumentUnits: [],
      rhetoricalRelations: []
    };
  }
};

/**
 * ArgumentUnit을 BeliefNode로 변환합니다.
 * @param argumentUnit - 변환할 논증 단위
 * @param noteId - 출처 노트 ID
 * @returns 변환된 신념 노드
 */
const convertArgumentUnitToBeliefNode = (argumentUnit: ArgumentUnit, noteId: string): BeliefNode => {
  // 노드 ID 생성 (노트 ID + 텍스트 해시 기반)
  const nodeId = `${noteId}_${generateTextHash(argumentUnit.text)}`;
  
  // 신뢰도를 확률로 변환 (ArgumentUnit의 confidence를 BeliefNode의 probability로 매핑)
  const probability = argumentUnit.confidence || 0.5;
  
  // 라벨 생성 (텍스트를 요약하여 사용)
  const label = argumentUnit.text.length > 50 
    ? argumentUnit.text.substring(0, 47) + '...'
    : argumentUnit.text;
  
  return {
    '@type': 'BeliefNode',
    id: nodeId,
    label,
    probability,
    sourceArgumentUnit: argumentUnit
  };
};

/**
 * RhetoricalRelation을 BeliefEdge로 변환합니다.
 * @param rhetoricalRelation - 변환할 수사적 관계
 * @param noteId - 출처 노트 ID
 * @returns 변환된 신념 엣지 또는 null
 */
const convertRhetoricalRelationToBeliefEdge = (
  rhetoricalRelation: RhetoricalRelation, 
  noteId: string
): BeliefEdge | null => {
  
  // 소스와 타겟 노드 ID 생성
  const sourceNodeId = `${noteId}_${generateTextHash(rhetoricalRelation.sourceUnit.text)}`;
  const targetNodeId = `${noteId}_${generateTextHash(rhetoricalRelation.targetUnit.text)}`;
  
  // 관계 강도를 조건부 확률로 변환
  const conditionalProbability = rhetoricalRelation.strength || 0.5;
  
  return {
    '@type': 'BeliefEdge',
    sourceNodeId,
    targetNodeId,
    conditionalProbability,
    relationSource: rhetoricalRelation
  };
};

/**
 * 텍스트의 간단한 해시를 생성합니다.
 * @param text - 해시를 생성할 텍스트
 * @returns 해시 문자열
 */
const generateTextHash = (text: string): string => {
  // 간단한 해시 함수 (실제 프로덕션에서는 더 강력한 해시 함수 사용 권장)
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32비트 정수로 변환
  }
  return Math.abs(hash).toString(36);
};

/**
 * 사용자의 신념 네트워크를 초기화합니다.
 * @param userId - 사용자 ID
 * @returns 초기화 성공 여부
 */
export const initializeBeliefNetwork = async (userId: string): Promise<boolean> => {
  console.log(`[BeliefNetworkService] initializeBeliefNetwork called for user ${userId}`);
  
  const networkData: BeliefNetworkData = {
    userId,
    nodes: [],
    edges: [],
    lastUpdated: new Date()
  };
  
  beliefNetworks.set(userId, networkData);
  return true;
}; 