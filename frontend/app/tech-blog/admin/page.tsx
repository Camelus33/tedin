"use client";
import React, { useEffect, useState } from 'react'
import useAuth from '@/hooks/useAuth'
import { techBlogApi } from '@/lib/api'

export default function TechBlogAdminPage() {
  const { user, isAuthenticated } = useAuth()
  const [form, setForm] = useState({ title: '', slug: '', category: 'update' as 'update'|'post', content: '', excerpt: '' })
  const [message, setMessage] = useState('')

  const allowed = user?.email?.toLowerCase?.() === 'jinny5@tedin.kr'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allowed) return
    try {
      await techBlogApi.create({ ...form, category: form.category, content: form.content })
      setMessage('게시물을 생성했습니다.')
      setForm({ title: '', slug: '', category: 'update', content: '', excerpt: '' })
    } catch (err: any) {
      setMessage(err?.message || '생성 실패')
    }
  }

  if (!isAuthenticated) {
    return <div className="container mx-auto px-4 sm:px-6 py-8">로그인이 필요합니다.</div>
  }

  if (!allowed) {
    return <div className="container mx-auto px-4 sm:px-6 py-8">접근 권한이 없습니다.</div>
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold">기술블로그 관리자</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700">제목</label>
          <input value={form.title} onChange={e=>setForm(f=>({ ...f, title: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">슬러그</label>
          <input value={form.slug} onChange={e=>setForm(f=>({ ...f, slug: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" placeholder="예: first-release" required />
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
          <input value={form.excerpt} onChange={e=>setForm(f=>({ ...f, excerpt: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">내용</label>
          <textarea value={form.content} onChange={e=>setForm(f=>({ ...f, content: e.target.value }))} className="mt-1 w-full rounded border px-3 py-2 h-40" required />
        </div>
        <button type="submit" className="inline-flex items-center rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">게시물 생성</button>
        {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
      </form>
    </main>
  )
}


