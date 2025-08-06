import mongoose, { Document, Schema, Types } from 'mongoose';

// 관계 타입 정의
export enum RelationshipType {
  CAUSE_EFFECT = 'cause-effect',
  BEFORE_AFTER = 'before-after', 
  FOUNDATION_EXTENSION = 'foundation-extension',
  CONTAINS = 'contains',
  CONTRAST = 'contrast'
}

// 다이어그램 노드 서브스키마
const DiagramNodeSchema = new Schema({
  noteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Note', 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  order: { 
    type: Number, 
    required: true 
  },
  color: { 
    type: String, 
    required: true 
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  // 크기 조절 기능 추가 (하위 호환성을 위해 기본값 설정)
  size: {
    width: { type: Number, default: 40 },
    height: { type: Number, default: 40 }
  }
}, { _id: false });

// 다이어그램 연결 서브스키마
const DiagramConnectionSchema = new Schema({
  id: { 
    type: String, 
    required: true 
  },
  sourceNoteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Note', 
    required: true 
  },
  targetNoteId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Note', 
    required: true 
  },
  relationshipType: { 
    type: String, 
    enum: Object.values(RelationshipType),
    required: true 
  }
}, { _id: false });

// 다이어그램 데이터 서브스키마
const DiagramDataSchema = new Schema({
  nodes: [DiagramNodeSchema],
  connections: [DiagramConnectionSchema]
}, { _id: false });

/**
 * @interface ISummaryNote
 * @description 단권화 노트(SummaryNote)의 데이터 구조를 정의하는 인터페이스입니다.
 * MongoDB의 Document를 확장하여 Mongoose 모델로 사용됩니다.
 */
export interface ISummaryNote extends Document {
  /**
   * @property {Types.ObjectId} userId - 단권화 노트를 생성한 사용자의 ID입니다. 'User' 모델을 참조합니다.
   */
  userId: Types.ObjectId;
  /**
   * @property {string} title - 단권화 노트의 전체 제목입니다. 사용자가 직접 입력하며, 기본값이 설정될 수 있습니다.
   */
  title: string;
  /**
   * @property {string} [description] - 단권화 노트에 대한 선택적인 간단한 설명입니다.
   */
  description?: string;
  /**
   * @property {Types.ObjectId[]} bookIds - 이 단권화 노트에 포함된 1줄 메모들의 출처가 된 책(Book)들의 ID 목록입니다.
   * 중복 없이 저장되며, 'Book' 모델을 참조합니다.
   */
  bookIds: Types.ObjectId[];
  /**
   * @property {Types.ObjectId[]} orderedNoteIds - 단권화 노트에 포함된 1줄 메모(TSNote 또는 Note)들의 ID 목록입니다.
   * 사용자가 지식 카트에서 정한 순서대로 저장되며, 'Note' 모델을 참조합니다.
   */
  orderedNoteIds: Types.ObjectId[];
  /**
   * @property {string[]} [tags] - 단권화 노트에 대한 태그 목록입니다. 검색 등에 활용될 수 있습니다.
   */
  tags?: string[];
  /**
   * @property {string[]} [visualPromptKeywords] - 단권화 노트에 대한 시각적 프롬프트 키워드 목록입니다.
   */
  visualPromptKeywords?: string[];
  /**
   * @property {Date} createdAt - 단권화 노트 생성 일시입니다. Mongoose의 timestamps 옵션에 의해 자동 관리됩니다.
   */
  createdAt: Date;
  /**
   * @property {Date} updatedAt - 단권화 노트 마지막 수정 일시입니다. Mongoose의 timestamps 옵션에 의해 자동 관리됩니다.
   */
  updatedAt: Date;
  /**
   * @property {string} [userMarkdownContent] - 사용자가 단권화 노트에 대해 작성한 마크다운 내용입니다.
   */
  userMarkdownContent?: string;
  /**
   * @property {Object} [diagram] - 다이어그램 관련 데이터입니다. 메모카드 간의 관계를 시각화한 정보를 포함합니다.
   */
  diagram?: {
    imageUrl?: string;           // SVG 이미지 URL/base64
    data?: {
      nodes: Array<{
        noteId: Types.ObjectId;
        content: string;
        order: number;
        color: string;
        position: { x: number; y: number };
        // 크기 조절 기능 추가 (하위 호환성을 위해 기본값 설정)
        size?: {
          width: number;
          height: number;
        };
      }>;
      connections: Array<{
        id: string;
        sourceNoteId: Types.ObjectId;
        targetNoteId: Types.ObjectId;
        relationshipType: RelationshipType;
      }>;
    };
    lastModified?: Date;         // 마지막 수정 시간
  };
}

/**
 * @const SummaryNoteSchema
 * @description ISummaryNote 인터페이스에 따라 Mongoose 스키마를 정의합니다.
 * 이 스키마는 MongoDB 컬렉션의 필드, 타입, 제약 조건 등을 명시합니다.
 */
const SummaryNoteSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, default: '나의 단권화 노트' },
  description: { type: String, trim: true },
  bookIds: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  orderedNoteIds: [{ type: Schema.Types.ObjectId, ref: 'Note' }], // 'Note' 모델 (TSNote 포함) 참조
  tags: [{ type: String, index: true }],
  visualPromptKeywords: [{ type: String }],
  userMarkdownContent: { type: String, default: '' },
  
  // 다이어그램 필드 (1:1 대응)
  diagram: {
    imageUrl: { 
      type: String 
    },
    data: DiagramDataSchema,
    lastModified: { 
      type: Date, 
      default: Date.now 
    }
  }
}, { 
  /**
   * timestamps 옵션: true로 설정 시, createdAt 및 updatedAt 필드를 자동으로 생성하고 관리합니다.
   */
  timestamps: true 
});

// 스키마 인덱스 설정: userId 필드에 대한 인덱스와 title, tags 필드에 대한 텍스트 인덱스를 생성하여 검색 성능을 향상시킵니다.
SummaryNoteSchema.index({ userId: 1, title: 'text', tags: 'text' }); 

// 다이어그램 관련 인덱스 추가
SummaryNoteSchema.index({ 'diagram.data.nodes.noteId': 1 });
SummaryNoteSchema.index({ 'diagram.data.connections.sourceNoteId': 1 });
SummaryNoteSchema.index({ 'diagram.data.connections.targetNoteId': 1 });

/**
 * @model SummaryNote
 * @description 'SummaryNote'라는 이름으로 ISummaryNote 타입의 Mongoose 모델을 생성하고 내보냅니다.
 * 이 모델을 통해 실제 MongoDB의 'summarynotes' 컬렉션과 상호작용합니다.
 */
export default mongoose.model<ISummaryNote>('SummaryNote', SummaryNoteSchema); 