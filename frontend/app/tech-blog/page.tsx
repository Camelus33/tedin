import React from 'react'
import Link from 'next/link'
import { techBlogApi } from '@/lib/api'
import TechBlogCreateInline from '@/components/tech-blog/CreateInline'

export const metadata = {
  title: 'Habitus33 기술블로그',
  description: 'Habitus33 기능 업데이트와 기술 포스팅을 안내합니다.',
  alternates: { canonical: '/tech-blog' },
  openGraph: {
    type: 'website',
    title: 'Habitus33 기술블로그',
    description: 'Habitus33 기능 업데이트와 기술 포스팅을 안내합니다.',
    url: 'https://habitus33.vercel.app/tech-blog'
  }
}

export default async function TechBlogIndexPage() {
  // 서버 컴포넌트에서 목록 호출 (공개 API)
  let posts: Awaited<ReturnType<typeof techBlogApi.list>> = []
  try {
    posts = await techBlogApi.list()
  } catch (e) {
    // 실패 시 빈 목록 렌더
    posts = []
  }

  return (
    <main className="px-4 sm:px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">Habitus33 기술블로그</h1>
        <p className="mt-3 text-gray-600">기능 업데이트 소식과 기술 포스팅을 이 곳에 정리합니다.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-500">
            아직 게시물이 없습니다.
          </div>
        )}
        {posts.map((p) => (
            <Link key={p.slug} href={`/tech-blog/${p.slug}`} className="group rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition-colors shadow-sm hover:shadow">
            <div className="text-xs text-indigo-600 font-medium uppercase tracking-wide">{p.category === 'update' ? '기능 업데이트' : '기술 포스팅'}</div>
              <h2 className="mt-1 text-xl font-extrabold text-gray-900 group-hover:text-indigo-700 leading-tight">{p.title}</h2>
            {p.coverImageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
                <img src={p.coverImageUrl} alt="cover" className="mt-2 h-36 w-full object-cover rounded-lg border" />
            )}
              {p.excerpt && <p className="mt-2 text-[15px] text-gray-700 leading-7 line-clamp-2">{p.excerpt}</p>}
            <div className="mt-2 text-xs text-gray-400">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('ko-KR') : ''}</div>
          </Link>
        ))}
        </div>

        {/* 관리자 전용 인라인 작성 */}
        <TechBlogCreateInline />
      </div>
    </main>
  )
}


