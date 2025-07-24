import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://habitus33.vercel.app'
  
  // 정적 페이지 목록
  const staticPages = [
    '',
    '/privacy-policy',
    '/terms-of-service',
    '/marketing',
    '/ir',
    '/auth/login',
    '/auth/register',
    '/auth/reset-password'
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
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