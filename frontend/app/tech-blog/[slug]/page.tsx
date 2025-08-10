export const dynamic = 'force-dynamic'
import React from 'react'
import { techBlogApi } from '@/lib/api'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import EditDeleteControls from '@/components/tech-blog/EditDeleteControls'

type Props = { params: { slug: string } }

export async function generateMetadata({ params }: Props) {
  const slug = params.slug
  try {
    const post = await techBlogApi.get(slug)
    return {
      title: `${post.title} - Habitus33 기술블로그`,
      description: post.excerpt || 'Habitus33 기술블로그 포스트',
      alternates: { canonical: `/tech-blog/${slug}` },
      openGraph: {
        type: 'article',
        title: post.title,
        description: post.excerpt || '',
        url: `https://habitus33.vercel.app/tech-blog/${slug}`,
      },
    }
  } catch {
    return { title: 'Habitus33 기술블로그', description: '기술블로그' }
  }
}

export default async function TechBlogPostPage({ params }: Props) {
  const post = await techBlogApi.get(params.slug)
  return (
    <main className="px-4 sm:px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <article className="prose prose-tech prose-lg max-w-none rounded-2xl bg-paper-ivoryDark p-6 md:p-8 font-body border border-gray-200 shadow-sm">
          <h1 className="mb-3 tracking-tight">{post.title}</h1>
          {post.coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.coverImageUrl} alt="cover" className="my-6 w-full rounded-lg border object-cover" />
          )}
          <p className="text-xs text-gray-500">{post.publishedAt ? new Date(post.publishedAt).toLocaleString('ko-KR') : ''}</p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content || ''}</ReactMarkdown>
        </article>
      </div>
      {/* 관리자 전용 수정/삭제 */}
      <EditDeleteControls id={(post as any)._id} initial={{ title: post.title, slug: post.slug, category: post.category, excerpt: post.excerpt, content: post.content }} />
      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            image: post.coverImageUrl ? [post.coverImageUrl] : undefined,
            datePublished: post.publishedAt || undefined,
            dateModified: post.publishedAt || undefined,
            author: [{ '@type': 'Person', name: 'Habitus33' }],
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://habitus33.vercel.app/tech-blog/${post.slug}`,
            },
            description: post.excerpt || '',
          }),
        }}
      />
    </main>
  )
}


