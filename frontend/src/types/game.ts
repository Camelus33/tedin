export interface GameOwner {
  _id?: string; // API 응답에 따라 실제 사용자 ID가 없을 수도 있음을 반영
  nickname: string;
}

export interface Game {
  _id: string;
  id?: string;
  title: string;
  inputText: string;
  description?: string;
  type?: string;
  updatedAt?: string;
  owner?: GameOwner;
  collectionId?: string | { _id: string; name: string; type?: string };
  wordMappings?: { word: string; coords?: { x: number; y: number } }[];
  boardSize?: number;
  visibility?: 'private' | 'public' | 'group';
  sharedWith?: string[];
  totalWords?: number;
  totalAllowedStones?: number;
  initialDisplayTimeMs?: number;
} 