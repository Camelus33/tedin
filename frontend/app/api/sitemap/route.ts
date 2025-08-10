import { NextResponse } from 'next/server'
import axios from 'axios'

export async function GET() {
  const baseUrl = 'https://habitus33.vercel.app'
  
  // 정적 페이지 목록 - SEO 최적화를 위해 더 많은 페이지 포함
  const staticPages = [
    {
      url: '',
      priority: '1.0',
      changefreq: 'daily',
      lastmod: new Date().toISOString()
    },
    {
      url: '/tech-blog',
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/privacy-policy',
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/terms-of-service',
      priority: '0.5',
      changefreq: 'monthly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/marketing',
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/ir',
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/auth/login',
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/auth/register',
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/auth/reset-password',
      priority: '0.4',
      changefreq: 'monthly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/onboarding',
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/zengo',
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    },
    {
      url: '/ts',
      priority: '0.6',
      changefreq: 'weekly',
      lastmod: new Date().toISOString()
    }
  ]

  // 동적: 기술블로그 글 목록을 백엔드에서 가져와 sitemap에 추가
  let blogUrls: string[] = []
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const { data } = await axios.get(`${apiBase}/api/tech-blog`, { timeout: 5000 })
    if (Array.isArray(data)) {
      blogUrls = data.map((p: any) => `/tech-blog/${p.slug}`)
    }
  } catch (_) {
    blogUrls = []
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`).join('')}
${blogUrls.map(slug => `
  <url>
    <loc>${baseUrl}${slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`).join('')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
} 