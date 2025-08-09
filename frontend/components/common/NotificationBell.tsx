'use client';

import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';
import ClientTimeDisplay from '@/components/share/ClientTimeDisplay';

interface NotificationType {
  _id: string;
  senderId: { nickname: string };
  gameId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data: NotificationType[] = await apiClient.get('/notifications?limit=20');
      setNotifications(data);
      try {
        const countRes = await apiClient.get('/notifications/count?unreadOnly=true');
        setUnreadCount(countRes?.count ?? data.filter(n => !n.isRead).length);
      } catch {
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (err: any) {
      console.error('알림 로딩 에러', err);
      if (!err.message || !err.message.includes('AbortError')) {
        toast.error(err.message || '알림 로딩 실패');
      }
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => setOpen(prev => !prev);

  const handleNavigate = async (n: NotificationType) => {
    if (!token) return;
    try {
      await apiClient.put(`/notifications/${n._id}/read`, {});
      router.push(`/myverse/games/${n.gameId}`);
      setOpen(false);
      fetchNotifications();
    } catch (err) {
      console.error('읽음 처리 실패', err);
      toast.error('읽음 처리 실패');
    }
  };

  const deleteOne = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      await fetchNotifications();
      toast.success('삭제되었습니다');
    } catch (err) {
      console.error('삭제 실패', err);
      toast.error('삭제 실패');
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={handleToggle} className="relative inline-flex items-center justify-center p-1.5 rounded-md hover:bg-white/5 transition-colors">
        <FiBell size={20} className="text-white hover:text-gray-200 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-[10px] leading-none px-1.5 py-0.5 rounded-full bg-red-600 text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-2 sm:right-0 mt-2 w-[min(90vw,20rem)] sm:w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur rounded-xl shadow-xl border border-indigo-100 dark:border-gray-700 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
            <span className="text-sm font-semibold">알림</span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={async () => {
                    try {
                      await apiClient.put('/notifications/readAll', {});
                      setUnreadCount(0);
                      fetchNotifications();
                    } catch (e) {}
                  }}
                  className="text-xs/none underline decoration-white/60 hover:decoration-white"
                >
                  모두 읽음
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[70vh] overflow-auto p-2">
            {notifications.slice(0, 8).map((n) => (
              <div
                key={n._id}
                className={`p-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2 ${
                  n.isRead
                    ? 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-100'
                }`}
                onClick={() => handleNavigate(n)}
              >
                {/* status dot */}
                <span
                  className={`${
                    n.isRead ? 'bg-gray-300' : 'bg-indigo-500'
                  } mt-1 inline-block h-2 w-2 rounded-full flex-shrink-0`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm ${
                      n.isRead ? 'text-gray-800 dark:text-gray-100' : 'text-gray-900 font-semibold'
                    }`}
                    title={n.message}
                  >
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <ClientTimeDisplay createdAt={n.createdAt} />
                  </p>
                </div>
                {n.isRead && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne(n._id);
                    }}
                    className="ml-1 text-[11px] text-red-600 hover:text-red-700"
                    aria-label="알림 삭제"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-3 text-center text-sm text-gray-500">알림이 없습니다</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}