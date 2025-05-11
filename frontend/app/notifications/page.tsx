'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface NotificationType {
  _id: string;
  senderId: { nickname: string };
  gameId: string;
  type: 'game_shared' | 'game_received';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('알림 불러오기 실패');
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      toast.error('알림 로딩 실패');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('읽음 처리 실패');
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
      toast.error('읽음 처리 실패');
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notifications/readAll', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('모두 읽음 처리 실패');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
      toast.error('모두 읽음 처리 실패');
    }
  };

  const handleNavigate = (n: NotificationType) => {
    markAsRead(n._id);
    router.push(`/myverse/games/${n.gameId}`);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">알림</h1>
        <button onClick={markAllAsRead} className="px-4 py-2 bg-blue-500 text-white rounded">
          모두 읽음 처리
        </button>
      </div>
      {loading ? (
        <p>로딩 중...</p>
      ) : notifications.length === 0 ? (
        <p>알림이 없습니다.</p>
      ) : (
        <ul>
          {notifications.map(n => (
            <li key={n._id} onClick={() => handleNavigate(n)} className={`cursor-pointer p-4 mb-2 border rounded ${n.isRead ? 'bg-white' : 'bg-blue-50'} hover:bg-blue-100`}>
              <div className="flex justify-between items-center">
                <div>
                  <p>{n.message}</p>
                  <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markAsRead(n._id)} className="px-2 py-1 bg-green-500 text-white rounded">
                    읽음
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 