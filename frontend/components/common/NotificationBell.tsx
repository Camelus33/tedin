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
      const data: NotificationType[] = await apiClient.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
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
      <button onClick={handleToggle} className="relative">
        <FiBell size={24} className="text-white hover:text-gray-200 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 text-xs font-bold text-red-600">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 shadow-lg rounded divide-y divide-gray-200 dark:divide-gray-700 z-50">
          <div className="p-2">
            {notifications.slice(0,5).map(n => (
              <div
                key={n._id}
                className={`p-2 rounded cursor-pointer ${
                  n.isRead ? 'hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-blue-50 hover:bg-blue-100'
                }`}
                onClick={() => handleNavigate(n)}
              >
                <p className={`text-sm ${n.isRead ? 'text-gray-900 dark:text-gray-100' : 'font-semibold'}`}>
                  {n.message}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <ClientTimeDisplay createdAt={n.createdAt} />
                </p>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="p-2 text-center text-gray-500">알림이 없습니다</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}