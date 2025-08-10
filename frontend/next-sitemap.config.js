/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://habitus33.vercel.app',
  generateRobotsTxt: false, // 이미 robots.txt가 있으므로 false
  generateIndexSitemap: false,
  exclude: [
    '/api/*',
    '/admin/*',
    '/tech-blog/admin',
    '/auth/*',
    '/profile/*',
    '/dashboard/*',
    '/books/*',
    '/memo/*',
    '/myverse/*',
    '/reading-session/*',
    '/summary-notes/*',
    '/zengo/*',
    '/ts/*',
    '/dev/*',
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
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000
} 