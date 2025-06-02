import { create } from 'zustand';
// import { TSNote } from '@/components/ts/TSNoteCard'; // TSNote 타입은 현재 직접 사용되지 않음

/**
 * @interface CartItem
 * @description 지식 카트에 저장될 개별 아이템의 데이터 구조입니다.
 * 각 아이템은 1줄 메모(노트)에 대한 참조와 해당 노트의 출처 책 정보를 포함합니다.
 */
export interface CartItem {
  /** @property {string} noteId - 카트에 담긴 1줄 메모(노트)의 고유 ID. */
  noteId: string;
  /** @property {string} bookId - 해당 노트가 작성된 책의 고유 ID. */
  bookId: string;
  /** @property {string} bookTitle - 카트 UI에 표시될 책의 제목. */
  bookTitle: string;
  /** @property {string} contentPreview - 카트 UI에 표시될 노트 내용의 짧은 미리보기. */
  contentPreview: string;
  /** 
   * @property {number} addedAt - 아이템이 카트에 추가된 시간의 타임스탬프 (ms).
   * 정렬 등 부가적인 기능에 사용될 수 있습니다.
   */
  addedAt: number;
}

/**
 * @interface CartState
 * @description 지식 카트의 전체 상태와 관련 액션들을 정의하는 인터페이스입니다.
 */
interface CartState {
  /** @property {CartItem[]} items - 현재 지식 카트에 담겨있는 아이템들의 배열. */
  items: CartItem[];
  /**
   * @function addToCart
   * @description 새 아이템을 지식 카트에 추가합니다. 이미 동일한 noteId의 아이템이 있다면 중복 추가하지 않습니다.
   * @param {Omit<CartItem, 'addedAt'>} itemData - 카트에 추가할 아이템 데이터. addedAt은 함수 내부에서 자동 생성됩니다.
   */
  addToCart: (itemData: Omit<CartItem, 'addedAt'>) => void;
  /**
   * @function removeFromCart
   * @description 특정 noteId를 가진 아이템을 카트에서 제거합니다.
   * @param {string} noteId - 카트에서 제거할 아이템의 노트 ID.
   */
  removeFromCart: (noteId: string) => void;
  /**
   * @function clearCart
   * @description 지식 카트의 모든 아이템을 제거합니다.
   */
  clearCart: () => void;
  // updateItemOrder: (orderedItems: CartItem[]) => void; // 향후 드래그앤드롭 순서 변경 기능을 위한 주석 처리된 액션
}

/**
 * @const useCartStore
 * @description 지식 카트 관리를 위한 Zustand 스토어를 생성하고 내보냅니다.
 * 상태(items)와 상태를 변경하는 액션(addToCart, removeFromCart, clearCart)을 포함합니다.
 */
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (itemData) => {
    set((state) => {
      // 이미 카트에 동일한 노트 ID의 아이템이 있는지 확인합니다.
      const existingItem = state.items.find(i => i.noteId === itemData.noteId);
      if (existingItem) {
        // 아이템이 이미 존재하면, 상태를 변경하지 않고 현재 상태를 반환합니다 (중복 방지).
        // 필요에 따라 기존 아이템을 업데이트하거나 사용자에게 알림을 줄 수도 있습니다.
        console.log('Item already in cart:', itemData.noteId);
        return { items: state.items }; 
      }
      // 새 카트 아이템 객체를 생성하고, 현재 시간을 addedAt 타임스탬프로 추가합니다.
      const newItem: CartItem = {
        ...itemData,
        addedAt: Date.now(),
      };
      // 기존 아이템 배열에 새 아이템을 추가하여 상태를 업데이트합니다.
      return { items: [...state.items, newItem] };
    });
  },
  removeFromCart: (noteId) => {
    set((state) => ({
      // 전달받은 noteId와 일치하지 않는 아이템들만 필터링하여 상태를 업데이트합니다.
      items: state.items.filter(item => item.noteId !== noteId),
    }));
  },
  clearCart: () => {
    // items 배열을 빈 배열로 설정하여 모든 아이템을 제거합니다.
    set({ items: [] });
  },
  // updateItemOrder: (orderedItems) => { // 향후 드래그앤드롭 기능을 위한 주석
  //   set({ items: orderedItems });
  // },
})); 