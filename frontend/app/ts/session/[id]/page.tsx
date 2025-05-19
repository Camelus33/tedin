"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import api from "@/lib/api";

// 세션 상태별 라우팅 경로 매핑
const statusToRoute = {
  pending: "warmup",
  active: "reading",
  completed: "result",
  review: "review", // 혹시 review 상태가 따로 있다면
};

export default function SessionHubPage() {
  const router = useRouter();
  const { id: sessionId } = useParams() as { id: string };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sessionId) return;
    let isMounted = true;
    setLoading(true);
    setError("");

    const fetchSession = async (retry = 0) => {
      try {
        const res = await api.get(`/sessions/${sessionId}`);
        if (!isMounted) return;
        const session = res.data;
        if (!session || !session.status) {
          setError("세션 정보를 찾을 수 없습니다.");
          setLoading(false);
          return;
        }
        // 상태에 따라 분기
        let route = statusToRoute[session.status as keyof typeof statusToRoute];
        if (!route) {
          // fallback: completed이면 result, 아니면 warmup
          route = session.status === "completed" ? "result" : "warmup";
        }
        // 쿼리스트링으로 sessionId 전달
        router.replace(`/ts/${route}?sessionId=${sessionId}`);
      } catch (err: any) {
        // 404면 재시도 (최대 3회, 지수 백오프)
        if (err?.response?.status === 404 && retry < 3) {
          const delay = 500 * Math.pow(2, retry); // 0.5s, 1s, 2s
          setTimeout(() => fetchSession(retry + 1), delay);
        } else {
          setError("세션 정보를 불러오는 데 실패했습니다.");
          setLoading(false);
        }
      }
    };
    fetchSession();
    return () => {
      isMounted = false;
    };
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Spinner size="lg" color="cyan" />
        <p className="mt-4 text-gray-400">세션 정보를 불러오는 중...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }
  // 분기 후에는 이 컴포넌트가 곧 unmount됨
  return null;
} 