"use client";
import React, { useState } from 'react';
import useAuth from '@/hooks/useAuth';
import { techBlogApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

type Props = { id: string; initial: { title: string; slug: string; category: 'update'|'post'; excerpt?: string; content: string; coverImageUrl?: string } };

export default function EditDeleteControls({ id, initial }: Props) {
  const { user, isAuthenticated } = useAuth();
  const allowed = Boolean(user?.email && user.email.toLowerCase() === 'jinny5@tedin.kr');
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...initial });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isAuthenticated || !allowed) return null;

  const onUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setMsg('');
    try {
      const updated = await techBlogApi.update(id, form);
      setMsg('수정 완료');
      if (form.slug !== initial.slug) {
        router.push(`/tech-blog/${encodeURIComponent(form.slug)}`);
      } else {
        router.refresh();
      }
      setOpen(false);
    } catch (err: any) {
      setMsg(err?.message || '수정 실패');
    } finally {
      setBusy(false);
    }
  };

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

  const onDelete = async () => {
    if (busy) return;
    if (!confirm('정말 삭제하시겠습니까?')) return;
    setBusy(true);
    setMsg('');
    try {
      await techBlogApi.remove(id);
      router.push('/tech-blog');
    } catch (err: any) {
      setMsg(err?.message || '삭제 실패');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex gap-3">
        <button onClick={() => setOpen(v => !v)} className="rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700">수정</button>
        <button onClick={onDelete} className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700">삭제</button>
      </div>
      {open && (
        <form onSubmit={onUpdate} className="mt-4 space-y-4 rounded border border-gray-200 bg-white p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">제목</label>
            <input value={form.title} onChange={e=>setForm(f=>({ ...f, title: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">슬러그</label>
            <input value={form.slug} onChange={e=>setForm(f=>({ ...f, slug: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">카테고리</label>
            <select value={form.category} onChange={e=>setForm(f=>({ ...f, category: e.target.value as 'update'|'post' }))} className="mt-1 w-full rounded border px-3 py-2">
              <option value="update">기능 업데이트</option>
              <option value="post">기술 포스팅</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">요약</label>
            <input value={form.excerpt || ''} onChange={e=>setForm(f=>({ ...f, excerpt: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">내용</label>
            <textarea value={form.content} onChange={e=>setForm(f=>({ ...f, content: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 h-40" required />
            <div className="mt-2 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={e=>{const file=e.target.files?.[0]; if(file) onUploadBodyImage(file)}} />
              <span className="text-xs text-gray-500">본문에 이미지 삽입</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">커버 이미지 URL</label>
            <input value={form.coverImageUrl || ''} onChange={e=>setForm(f=>({ ...f, coverImageUrl: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" />
            {form.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.coverImageUrl} alt="cover" className="mt-2 h-16 w-16 rounded object-cover border" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy} className="inline-flex items-center rounded bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 disabled:opacity-60">저장</button>
            {msg && <span className="text-sm text-gray-600">{msg}</span>}
          </div>
        </form>
      )}
    </div>
  );
}


