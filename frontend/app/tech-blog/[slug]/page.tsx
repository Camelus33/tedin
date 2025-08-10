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
        <article className="prose prose-zinc prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-extrabold prose-h1:text-4xl md:prose-h1:text-5xl prose-h1:leading-tight prose-h2:text-3xl prose-h3:text-2xl prose-p:text-gray-700 prose-p:leading-8 prose-li:leading-8 prose-a:text-indigo-600 hover:prose-a:text-indigo-700 prose-a:underline underline-offset-2 prose-strong:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-indigo-200 prose-blockquote:text-gray-700 prose-img:rounded-xl prose-img:shadow-sm prose-hr:my-10">
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


