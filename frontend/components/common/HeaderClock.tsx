'use client';

import { useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { FiClock, FiLayers } from 'react-icons/fi';

function formatHms(totalMs: number): string {
  const totalSec = Math.max(0, Math.floor(totalMs / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hh = String(h).padStart(2, '0');
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export default function HeaderClock() {
  const [sessionStartMs] = useState<number>(() => {
    if (typeof window === 'undefined') return Date.now();
    const saved = sessionStorage.getItem('h33_session_start_ms');
    const now = Date.now();
    if (saved) return Number(saved) || now;
    sessionStorage.setItem('h33_session_start_ms', String(now));
    return now;
  });
  const [totalBaseMs, setTotalBaseMs] = useState<number>(0);
  const [lastSyncAtMs, setLastSyncAtMs] = useState<number>(Date.now());
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const intervalRef = useRef<number | null>(null);
  const lastHeartbeatAtRef = useRef<number>(Date.now());

  // Initial fetch of total usage from server (if available)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const stats = await apiClient.get('/users/me/stats');
        const initial = (stats?.totalUsageMs ?? stats?.data?.totalUsageMs ?? 0) as number;
        if (mounted && typeof initial === 'number' && isFinite(initial)) {
          setTotalBaseMs(initial);
          setLastSyncAtMs(Date.now());
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Tick every second when visible
  useEffect(() => {
    function start() {
      if (intervalRef.current != null) return;
      intervalRef.current = window.setInterval(() => {
        setNowMs(Date.now());
      }, 1000) as unknown as number;
    }
    function stop() {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    function onVis() {
      if (document.visibilityState === 'hidden') {
        // send a quick heartbeat before pausing
        void sendHeartbeat();
        stop();
      } else {
        setNowMs(Date.now());
        start();
      }
    }
    start();
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stop();
    };
  }, [sessionStartMs]);

  // Send heartbeat roughly every 60s to accumulate total usage
  async function sendHeartbeat() {
    try {
      const now = Date.now();
      const since = now - lastHeartbeatAtRef.current;
      // Cap and floor to avoid noisy writes
      const delta = Math.min(Math.max(since, 0), 5 * 60 * 1000); // up to 5 min per beat
      if (delta < 10 * 1000) return; // skip if under 10s to reduce churn
      lastHeartbeatAtRef.current = now;
      const res = await apiClient.post('/users/me/usage', { deltaMs: delta });
      const serverTotal = res?.totalUsageMs ?? res?.data?.totalUsageMs;
      if (typeof serverTotal === 'number' && isFinite(serverTotal)) {
        setTotalBaseMs(serverTotal);
        setLastSyncAtMs(Date.now());
      } else {
        // Fallback: advance base by delta and reset sync time to now
        setTotalBaseMs(prev => prev + delta);
        setLastSyncAtMs(Date.now());
      }
    } catch {
      // graceful degradation: do not toast
    }
  }

  function handleBeforeUnload() {
    // Best effort heartbeat before unloading
    const now = Date.now();
    const since = now - lastHeartbeatAtRef.current;
    const delta = Math.min(Math.max(since, 0), 5 * 60 * 1000);
    if (delta <= 0) return;
    lastHeartbeatAtRef.current = now;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const url = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') + '/api/users/me/usage';
      // Use fetch keepalive to include Authorization header
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ deltaMs: delta }),
        keepalive: true,
        cache: 'no-store',
      }).catch(() => {});
    } catch {}
  }

  // Schedule periodic heartbeats
  useEffect(() => {
    const id = window.setInterval(() => { void sendHeartbeat(); }, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const sessionElapsed = nowMs - sessionStartMs;
  const displayTotal = totalBaseMs + (nowMs - lastSyncAtMs);

  return (
    <div
      className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-transparent border border-white/10 text-white/85 hover:border-cyan-400/30 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
      aria-label={`누적 사용시간 ${formatHms(displayTotal)}, 세션 ${formatHms(sessionElapsed)}`}
      title={`${formatHms(displayTotal)} • ${formatHms(sessionElapsed)}`}
    >
      <div className="inline-flex items-center gap-1.5">
        <FiLayers className="w-3.5 h-3.5 text-indigo-300 drop-shadow-[0_0_6px_rgba(99,102,241,0.35)]" aria-hidden="true" />
        <span className="text-[11px] [font-variant-numeric:tabular-nums] tracking-wide" aria-hidden="true">{formatHms(displayTotal)}</span>
        <span className="sr-only">누적 {formatHms(displayTotal)}</span>
      </div>
      <div className="inline-flex items-center gap-1.5">
        <FiClock className="w-3.5 h-3.5 text-cyan-300 drop-shadow-[0_0_6px_rgba(34,211,238,0.35)]" aria-hidden="true" />
        <span className="text-[11px] [font-variant-numeric:tabular-nums] tracking-wide" aria-hidden="true">{formatHms(sessionElapsed)}</span>
        <span className="sr-only">세션 {formatHms(sessionElapsed)}</span>
      </div>
    </div>
  );
}


