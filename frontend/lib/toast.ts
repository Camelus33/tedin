import toast from 'react-hot-toast';

/**
 * HABITUS33의 브랜드 톤과 사용자 경험에 맞는 토스트 알림 유틸리티
 * 
 * 일관된 메시지와 사용자 친화적인 알림을 제공합니다.
 */

type ToastDuration = number | undefined;

/**
 * 성공 알림 표시
 * @param message 표시할 메시지
 * @param duration 알림 표시 시간 (ms, 기본 3000ms)
 */
export const showSuccess = (message: string, duration: ToastDuration = 3000) => {
  toast.success(message, { duration });
};

/**
 * 오류 알림 표시
 * @param message 표시할 메시지
 * @param duration 알림 표시 시간 (ms, 기본 4000ms)
 */
export const showError = (message: string, duration: ToastDuration = 4000) => {
  toast.error(message, { duration });
};

/**
 * 일반 정보 알림 표시
 * @param message 표시할 메시지
 * @param duration 알림 표시 시간 (ms, 기본 3000ms)
 */
export const showInfo = (message: string, duration: ToastDuration = 3000) => {
  toast(message, { duration });
};

/**
 * 진행 중인 작업의 알림 시작 (로딩 표시)
 * @param message 표시할 메시지
 * @returns 토스트 ID (dismiss 호출 시 사용)
 */
export const showLoading = (message: string) => {
  return toast.loading(message);
};

/**
 * 진행 중인 알림을 성공 알림으로 변경
 * @param toastId 기존 토스트 ID
 * @param message 변경할 메시지
 * @param duration 알림 표시 시간 (ms, 기본 3000ms)
 */
export const updateToSuccess = (toastId: string, message: string, duration: ToastDuration = 3000) => {
  toast.success(message, { id: toastId, duration });
};

/**
 * 진행 중인 알림을 오류 알림으로 변경
 * @param toastId 기존 토스트 ID
 * @param message 변경할 메시지
 * @param duration 알림 표시 시간 (ms, 기본 4000ms)
 */
export const updateToError = (toastId: string, message: string, duration: ToastDuration = 4000) => {
  toast.error(message, { id: toastId, duration });
};

/**
 * 알림 닫기
 * @param toastId 닫을 토스트 ID
 */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// 기존 toast 함수도 export 해서 호환성 유지
export { toast }; 