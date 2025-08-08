import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

console.log(`[App] Starting application...`);
console.log(`[App] Current working directory (cwd): ${process.cwd()}`);
console.log(`[App] __dirname: ${__dirname}`);

// Load environment variables from .env file
dotenv.config();

// Validate required environment variables
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];
  
  const optionalVars = [
    'FRONTEND_URL',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY', 
    'GOOGLE_API_KEY'
  ];

  const missingRequired = requiredVars.filter(varName => !process.env[varName]);
  const availableOptional = optionalVars.filter(varName => process.env[varName]);

  if (missingRequired.length > 0) {
    console.error('❌ Missing required environment variables:', missingRequired);
    console.error('Please set these environment variables before starting the application.');
    process.exit(1);
  }

  console.log('✅ Required environment variables are set');
  
  if (availableOptional.length > 0) {
    console.log('✅ Available optional environment variables:', availableOptional);
  } else {
    console.log('⚠️ No optional environment variables found. Some features may be limited.');
  }
};

// Validate environment variables before proceeding
validateEnvironmentVariables();

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import bookRoutes from './routes/books';
import sessionRoutes from './routes/sessions';
import noteRoutes from './routes/notes';
import zengoRoutes from './routes/zengo';
import leaderboardRoutes from './routes/leaderboard';
import badgeRoutes from './routes/badges';
import inviteRoutes from './routes/invites';
import collectionRoutes from './routes/collections';
import myverseGamesRoutes from './routes/myverseGames';
import routineRoutes from './routes/routineRoutes';
import flashcardRoutes from './routes/flashcards';
import notificationRoutes from './routes/notifications';
import summaryNoteRoutes from './routes/summaryNoteRoutes';
import publicShareRoutes from './routes/publicShareRoutes';

import performanceRoutes from './routes/performance'; // 성능 모니터링 라우트 임포트
import memoSearchRoutes from './routes/memoSearch'; // 메모카드 검색 라우트 임포트
import adminRoutes from './routes/admin'; // 관리자 라우트 임포트
import aiChatRoutes from './routes/aiChat'; // AI 채팅 라우트 임포트
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import warmupRoutes from './routes/warmup';

// Initialize Express app
const app: Express = express();
app.disable('etag');
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitus33';
console.log('MongoDB URI:', MONGODB_URI);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // 시간대 설정 확인 (비동기적으로 실행)
    import('./scripts/timezoneChecker')
      .then(({ checkServerTimezone, logTimezoneInfo, validateTimezoneSettings }) => {
        const timezoneInfo = checkServerTimezone();
        logTimezoneInfo(timezoneInfo);
        
        const validation = validateTimezoneSettings();
        if (!validation.isValid) {
          console.warn('⚠️ Timezone configuration warnings detected. Run `npm run validate-timezone` for details.');
        }
      })
      .catch(error => {
        console.warn('⚠️ Could not load timezone checker:', error.message);
      });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// CORS Configuration
const allowedOrigins = [
  'https://habitus33.vercel.app', // 프로덕션 프론트엔드
  'http://localhost:3000',      // 로컬 프론트엔드 개발 환경 (포트가 다르면 수정)
  // 필요한 경우 다른 허용할 출처 추가
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // origin이 없거나 (예: 서버 간 요청, Postman 등) 허용된 출처 목록에 있으면 허용
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  credentials: true,
};

console.log(`[App] CORS options configured.`);

// Middleware
app.use(cors(corsOptions));
// Enable preflight for all routes
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: false, // 개발 중에는 비활성화
  crossOriginEmbedderPolicy: false,
}));
app.use(compression());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
console.log(`[App] Basic middleware (cors, json, urlencoded, etc.) configured.`);

// Serve static files from the 'uploads' directory
const uploadsPath = path.resolve(process.cwd(), 'uploads');
console.log(`[App] Attempting to serve static files from resolved path: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/zengo', zengoRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/myverse', myverseGamesRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/summary-notes', summaryNoteRoutes);
app.use('/api/public-shares', publicShareRoutes);

app.use('/api/performance', performanceRoutes); // 성능 모니터링 라우트 등록
app.use('/api/memo-search', memoSearchRoutes); // 메모카드 검색 라우트 등록
app.use('/api/admin', adminRoutes); // 관리자 라우트 등록
app.use('/api/ai-chat', aiChatRoutes); // AI 채팅 라우트 등록
app.use('/api', warmupRoutes); // TS warmup routes

// Cognitive metrics API route
import cognitiveRoutes from './routes/cognitive';
app.use('/api/cognitive', cognitiveRoutes);

// 헬스 체크 라우트
import healthRoutes from './routes/health';
app.use('/api/health', healthRoutes);

// 루트 경로 핸들러 (Render 헬스체크용)
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Habitus33 API Server is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// HEAD 요청도 지원 (일부 헬스체크 도구에서 사용)
app.head('/', (req, res) => {
  res.status(200).end();
});

console.log(`[App] API routes configured.`);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`[App] Server is running on port ${PORT}`);
  console.log(`[App] uploadsPath (at server start): ${uploadsPath}`);
});

export default app;