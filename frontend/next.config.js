/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 빌드 중 환경 변수 검증
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  images: {
    domains: [
      'habitus33-api.onrender.com',
      'localhost',
      'placehold.it',
      'picsum.photos',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'habitus33-api.onrender.com',
        port: '',
        pathname: '/uploads/**',
      },
    ],
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
    // 브라우저 환경에서만 적용
    if (!isServer) {
      // source map 파일 설정
      config.devtool = 'source-map';
    }

    return config;
  },
  // 오류 페이지 설정
  typescript: {
    // 타입스크립트 오류가 있어도 빌드 진행
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
}

module.exports = nextConfig 