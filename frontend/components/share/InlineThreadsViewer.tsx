"use client";

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';

interface InlineThread {
  _id: string;
  content: string;
  authorName: string;
  createdAt: string;
  depth?: number;
}

interface InlineThreadsViewerProps {
  shareId: string;
  noteId: string;
  count: number;
}

const InlineThreadsViewer = ({ shareId, noteId, count }: InlineThreadsViewerProps) => {
  const [threads, setThreads] = useState<InlineThread[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const fetchThreads = async () => {
    if (threads || loading) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/public-shares/${shareId}/notes/${noteId}/inline-threads`);
      if (res.status === 404) {
        setThreads([]);
        return;
      }
      if (!res.ok) {
        throw new Error('failed');
      }
      const data = await res.json();
      setThreads(data.threads as InlineThread[]);
    } catch (e) {
      setError('댓글을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open && !threads) {
      fetchThreads();
    }
    setOpen(!open);
  };

  return (
    <div className="mt-6">
      <button
        onClick={handleToggle}
        className="flex items-center text-sm text-cyan-400 hover:underline"
      >
        <MessageSquare className="h-4 w-4 mr-1" />
        {open ? '댓글 숨기기' : `댓글 ${count}개 보기`}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {loading && <p className="text-gray-400 text-sm">불러오는 중...</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {threads && threads.length === 0 && <p className="text-gray-400 text-sm">댓글이 없습니다.</p>}
          {threads && threads.map((t) => (
            <div key={t._id} className="border-l-2 border-gray-600 pl-3">
              <p className="text-sm text-gray-200 whitespace-pre-wrap">{t.content}</p>
              <p className="text-xs text-gray-500 mt-1">— {t.authorName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InlineThreadsViewer; 