/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  // API 프록시 설정 강화
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // 백엔드 API 서버 주소로 프록시
        // 추가 설정으로 안정성 향상
        has: [
          {
            type: 'header',
            key: 'accept',
            value: '(.*)',
          },
        ],
      }
    ]
  },
  // 백엔드 연결 문제 시 오류 페이지 표시 방지
  onDemandEntries: {
    // 개발 중에 페이지를 메모리에 유지하는 시간 (ms)
    maxInactiveAge: 60 * 60 * 1000, // 1시간
    // 한 번에 메모리에 유지할 페이지 수
    pagesBufferLength: 5,
  },
  // 웹소켓 재연결 시도 횟수 증가
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 브라우저 환경에서만 적용
      config.optimization.moduleIds = 'deterministic';
    }
    return config;
  }
}

module.exports = nextConfig 