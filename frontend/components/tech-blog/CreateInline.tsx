"use client";
import React, { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { techBlogApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TechBlogCreateInline() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const allowed = Boolean(user?.email && user.email.toLowerCase() === 'jinny5@tedin.kr');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: 'update' as 'update' | 'post',
    excerpt: '',
    content: '',
    coverImageUrl: '',
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onUploadBodyImage = async (file: File) => {
    try {
      setBusy(true);
      const { url } = await techBlogApi.uploadImage(file);
      setForm(f => ({ ...f, content: `${f.content}\n\n![image](${url})` }));
      setMsg('본문 이미지 업로드 완료');
    } catch (err: any) {
      setMsg(err?.message || '본문 이미지 업로드 실패');
    } finally {
      setBusy(false);
    }
  }

  if (!isAuthenticated || !allowed) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg('');
    try {
      await techBlogApi.create({
        title: form.title,
        slug: form.slug,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        coverImageUrl: form.coverImageUrl || undefined,
        status: 'published',
      });
      setMsg('게시물을 생성했습니다.');
      setForm({ title: '', slug: '', category: 'update', excerpt: '', content: '', coverImageUrl: '' });
      setOpen(false);
      router.push(`/tech-blog/${encodeURIComponent(form.slug)}`);
    } catch (err: any) {
      setMsg(err?.message || '생성 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
      >
        {open ? '닫기' : '새 글 작성'}
      </button>
      {open && (
        <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded border border-gray-200 bg-white p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">커버 이미지</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    setBusy(true);
                    const { url } = await techBlogApi.uploadImage(file);
                    setForm(f => ({ ...f, coverImageUrl: url }));
                    setMsg('이미지 업로드 완료');
                  } catch (err: any) {
                    setMsg(err?.message || '이미지 업로드 실패');
                  } finally {
                    setBusy(false);
                  }
                }}
              />
              {form.coverImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.coverImageUrl} alt="cover" className="h-12 w-12 rounded object-cover border" />
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">슬러그</label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-2"
              placeholder="예: first-release"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">카테고리</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value as 'update' | 'post' }))}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="update">기능 업데이트</option>
              <option value="post">기술 포스팅</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">요약</label>
            <input
              value={form.excerpt}
              onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="mt-1 w-full rounded border px-3 py-2 h-40"
              required
            />
            <div className="mt-2 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0]; if(file) onUploadBodyImage(file)}} />
              <span className="text-xs text-gray-500">본문에 이미지 삽입</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              게시물 생성
            </button>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </form>
      )}
    </div>
  );
}


