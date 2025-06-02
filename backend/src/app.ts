import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

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
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  credentials: true
};

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
app.use(morgan('dev'));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 