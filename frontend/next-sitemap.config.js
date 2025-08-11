/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://habitus33.vercel.app',
  generateRobotsTxt: false, // 이미 robots.txt가 있으므로 false
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/admin/*',
    '/tech-blog/admin',
    // 비공개/내부 페이지의 상위 경로도 제외
    '/dashboard',
    '/auth/*',
    '/profile',
    '/profile/*',
    '/dashboard/*',
    '/books/*',
    '/memo/*',
    '/myverse/*',
    '/reading-session/*',
    '/summary-notes/*',
    '/zengo/*',
    '/ts',
    '/ts/*',
    '/dev',
    '/dev/*',
    '/test-concept-score',
    '/test-concept-score/*',
    '/_next/*',
    '/404',
    '/500'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/tech-blog/admin',
          '/_next/',
          '/auth/',
          '/profile/',
          '/dashboard/',
          '/books/',
          '/memo/',
          '/myverse/',
          '/reading-session/',
          '/summary-notes/',
          '/zengo/',
          '/ts/',
          '/dev/',
          '/test-concept-score/'
        ]
      }
    ],
    additionalSitemaps: [
      'https://habitus33.vercel.app/sitemap.xml'
    ]
  },
  // 동적 블로그 슬러그를 사이트맵에 포함
  additionalPaths: async (config) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiBase}/api/tech-blog`, { headers: { 'Content-Type': 'application/json' } })
      const data = await res.json()
      if (!Array.isArray(data)) return []
      const now = new Date().toISOString()
      return data
        .filter((p) => p && typeof p.slug === 'string' && p.slug.trim().length > 0)
        .map((p) => ({
          loc: `/tech-blog/${p.slug}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: now,
        }))
    } catch (_) {
      return []
    }
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000
} 