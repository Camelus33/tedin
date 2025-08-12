'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { FiBell } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/apiClient';
import ClientTimeDisplay from '@/components/share/ClientTimeDisplay';

interface NotificationType {
  _id: string;
  senderId: { nickname: string };
  gameId: string;
  type:
    | 'game_shared'
    | 'game_received'
    | 'nudge_memo'
    | 'nudge_ts'
    | 'nudge_zengo'
    | 'suggest_summary'
    | 'level_up'
    | 'nudge_evolve_last'
    | 'nudge_connect';
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Ephemeral (client-only) nudge item type
interface EphemeralNudge {
  id: string;
  message: string;
  createdAt: string;
  actionLink?: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  // Client-only periodic nudges (not persisted)
  const [nudges, setNudges] = useState<EphemeralNudge[]>([]);
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

  // --- SSE realtime stream (fallback to polling) ---
  useEffect(() => {
    if (!token) return;
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const url = `${base}/api/notifications/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url, { withCredentials: false });

      es.addEventListener('keepalive', () => {});
      es.onmessage = (ev) => {
        // generic message handler (optional)
      };
      es.addEventListener('nudge_created', (ev) => {
        try {
          const payload = JSON.parse(ev.data || '{}');
          const item: EphemeralNudge = {
            id: payload.id || `sse-${Date.now()}`,
            message: payload.message || '좋아요! 지금 한 걸음 더 나아가 볼까요?',
            createdAt: new Date().toISOString(),
            actionLink: payload.actionLink || '/dashboard',
          };
          setNudges((prev) => [item, ...prev].slice(0, 3));
        } catch {}
      });
      es.onerror = () => {
        es.close();
      };
      return () => es.close();
    } catch {}
  }, [token]);

  // --- Periodic client-side encouragement nudges ---
  // Quiet hours: 22:00~08:00 local
  const isQuietHours = () => {
    try {
      const h = new Date().getHours();
      return h >= 22 || h < 8;
    } catch {
      return false;
    }
  };

  // Curated messages with single next action
  const curated = useMemo(
    () => [
      { id: 'memo-1', message: '지금 떠오른 생각, 한 줄이면 충분해요.', actionLink: '/memo/new' },
      { id: 'think-1', message: '좋아요! 생각을 1개만 더 보태볼까요?', actionLink: '/dashboard' },
      { id: 'evolve-1', message: '3/4까지 왔어요. 마지막 한 칸이면 자동 연결 추천이 시작돼요.', actionLink: '/dashboard' },
      { id: 'connect-1', message: '유사 메모를 연결해 지식을 넓혀볼까요?', actionLink: '/dashboard' },
      { id: 'quiz-1', message: '3분 복습으로 오래 기억해요.', actionLink: '/dashboard' },
      { id: 'reward-1', message: '레벨 업! 오늘의 성장이 눈에 보여요.', actionLink: '/dashboard' },
    ],
    []
  );

  // Rotate curated messages deterministically per session
  const nextNudge = () => {
    const used = new Set(nudges.map((n) => n.id));
    const candidate = curated.find((c) => !used.has(c.id)) || curated[Math.floor(Math.random() * curated.length)];
    const now = new Date().toISOString();
    return { id: candidate.id, message: candidate.message, createdAt: now, actionLink: candidate.actionLink } as EphemeralNudge;
  };

  // Kick off periodic nudges every ~40 minutes (testing: 10 minutes)
  useEffect(() => {
    if (!token) return; // only for authenticated
    const initialDelay = 60 * 1000; // 1 min after mount
    const base = 10 * 60 * 1000; // 10 minutes (can raise to 40*60*1000 in production)

    const timers: NodeJS.Timeout[] = [];
    // Fire first after initialDelay
    timers.push(
      setTimeout(() => {
        if (!isQuietHours()) {
          setNudges((prev) => {
            const next = nextNudge();
            // cap to 3
            const merged = [next, ...prev].slice(0, 3);
            return merged;
          });
        }
      }, initialDelay)
    );

    // Then periodic
    const ticker = setInterval(() => {
      if (!isQuietHours()) {
        setNudges((prev) => {
          // avoid duplicating same id consecutively
          const next = nextNudge();
          if (prev.length && prev[0].id === next.id) return prev;
          const merged = [next, ...prev].slice(0, 3);
          return merged;
        });
      }
    }, base);
    timers.push(ticker);

    return () => {
      timers.forEach((t) => clearInterval(t));
    };
  }, [token]);

  const dismissNudge = (id: string) => {
    setNudges((prev) => prev.filter((n) => n.id !== id));
  };

  const handleToggle = () => setOpen(prev => !prev);

  const handleNavigate = async (n: NotificationType) => {
    if (!token) return;
    try {
      await apiClient.put(`/notifications/${n._id}/read`, {});
      const target = (() => {
        switch (n.type) {
          case 'game_shared':
          case 'game_received':
            return n.gameId ? `/myverse/games/${n.gameId}` : '/myverse';
          case 'nudge_memo':
            return '/memo/new';
          case 'nudge_ts':
            return '/ts';
          case 'nudge_zengo':
            return '/zengo';
          case 'suggest_summary':
            return '/summary-notes/create';
          case 'nudge_evolve_last':
          case 'nudge_connect':
          case 'level_up':
          default:
            return '/dashboard';
        }
      })();
      router.push(target);
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

          {/* List: Ephemeral nudges first */}
          <div className="max-h-[70vh] overflow-auto p-2">
            {nudges.map((n) => (
              <div
                key={`nudge-${n.id}`}
                className="p-2 rounded-lg cursor-pointer transition-colors flex items-start gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100"
                onClick={() => {
                  if (n.actionLink) {
                    router.push(n.actionLink);
                  }
                  dismissNudge(n.id);
                  setOpen(false);
                }}
              >
                <span className="bg-emerald-500 mt-1 inline-block h-2 w-2 rounded-full flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-900 font-semibold" title={n.message}>
                    {n.message}
                  </p>
                  <p className="text-xs text-gray-500">방금 전</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNudge(n.id);
                  }}
                  className="ml-1 text-[11px] text-emerald-700 hover:text-emerald-800"
                  aria-label="응원 메시지 닫기"
                >
                  닫기
                </button>
              </div>
            ))}

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