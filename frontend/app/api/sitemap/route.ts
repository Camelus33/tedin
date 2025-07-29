import { NextResponse } from 'next/server'

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
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  })
} 