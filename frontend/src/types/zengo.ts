// frontend/src/types/zengo.ts

// Interface based on backend's IZengoProverbContent
export interface ZengoProverbContent {
    _id: string; 
    level: string;
    language: string;
    boardSize: number;
    proverbText: string;
    wordMappings: { word: string; coords: { x: number; y: number } }[];
    totalWords: number;
    totalAllowedStones: number;
    initialDisplayTimeMs: number;
    targetTimeMs?: number;
}

// Interface based on backend's IZengoSessionResult
export interface ZengoSessionResult {
    _id: string;
    userId: string;
    contentId: string;
    level: string;
    language: string;
    usedStonesCount: number;
    correctPlacements: number;
    incorrectPlacements: number;
    timeTakenMs: number;
    completedSuccessfully: boolean;
    score: number;
    earnedBadgeIds?: string[];
    createdAt: string;
    activityId?: string;
}

// Game State type used in Redux slice
export type GameState =
    | 'idle'
    | 'setting'
    | 'loading'
    | 'showing'
    | 'playing'
    | 'submitting'
    | 'finished_success'
    | 'finished_fail';

// Represents a stone placed by the user in the Redux state
export interface PlacedStone {
    x: number;
    y: number;
    correct: boolean | null;
    feedback?: 'correct' | 'incorrect';
    placementIndex?: number;
}

export type BoardSize = 3 | 5 | 7 | 9 | 13 | 19;
export type InteractionMode = 'click' | 'view' | 'place';

// Represents the data structure for a stone passed to the ZengoBoard component
// Combines word info, placement info, and animation state
export interface BoardStoneData {
    position: [number, number];
    value: string;
    color: string;
    visible: boolean;
    isNew?: boolean;
    feedback?: 'correct' | 'incorrect';
    isHiding?: boolean;
    memoryPhase?: boolean;
    order?: number;
} 