import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { authRouter } from './server/routes/authRoutes.js';
import { branchRouter } from './server/routes/branchRoutes.js';
import { academicRouter } from './server/routes/academicRoutes.js';
import { userRouter } from './server/routes/userRoutes.js';
import { resourceRouter } from './server/routes/resourceRoutes.js';
import { announcementRouter } from './server/routes/announcementRoutes.js';
import { notificationRouter } from './server/routes/notificationRoutes.js';
import { activityLogRouter } from './server/routes/activityLogRoutes.js';
import { dashboardRouter } from './server/routes/dashboardRoutes.js';
import { settingRouter } from './server/routes/settingRoutes.js';
import { supabaseRouter } from './server/routes/supabaseRoutes.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON & URL-encoded parsers
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Ensure public/uploads folder exists & serve it statically
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  // Mount API endpoints
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/branches', branchRouter);
  app.use('/api/academic', academicRouter);
  app.use('/api/users', userRouter);
  app.use('/api/resources', resourceRouter);
  app.use('/api/announcements', announcementRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/activity-logs', activityLogRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/settings', settingRouter);
  app.use('/api/supabase', supabaseRouter);

  // Vite middleware setup for Development, Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DIPS Centralized Portal server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
