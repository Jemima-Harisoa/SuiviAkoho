import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { getPool, closePool } from './config/database.config';
import routes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de sécurité
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Logger middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await getPool();
    res.status(200).json({ 
      success: true,
      status: 'OK', 
      message: 'Serveur et DB opérationnels',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      status: 'ERROR', 
      message: 'Problème de connexion DB',
      error: error.message 
    });
  }
});

// Routes (toutes les routes sont enregistrées via routes/index.ts)
app.use('/', routes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.method} ${req.path} non trouvée` 
  });
});

// Global Error Handler
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Erreur non gérée:', error.message);
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({ 
    success: false, 
    message: error.message || 'Erreur serveur interne',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Démarrage du serveur
const server = app.listen(PORT, async () => {
  console.log(`\n✅  Serveur démarré sur http://localhost:${PORT}`);
  try {
    const pool = await getPool();
    console.log(`✅  Connexion BD établie (pool actif)`);
  } catch (error: any) {
    console.error(`❌  Impossible de se connecter à la BD: ${error.message}`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏹️  Arrêt du serveur...');
  server.close(async () => {
    try {
      await closePool();
      console.log('✅  Pool BD fermé');
      process.exit(0);
    } catch (error: any) {
      console.error('❌  Erreur lors de la fermeture:', error.message);
      process.exit(1);
    }
  });
});

