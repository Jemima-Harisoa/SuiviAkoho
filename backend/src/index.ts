import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { getPool } from './config/database.config';
import raceRoutes from './routes/race.routes';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes Race
app.use('/api/races', raceRoutes); 

// Route de test
app.get('/health', async (req, res) => {
  try {
    await getPool();
    res.json({ 
      status: 'OK', 
      message: 'Serveur et DB opérationnels' 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Problème de connexion DB' 
    });
  }
});

// Démarrage
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  try {
    await getPool();
  } catch (error) {
    console.error('Impossible de se connecter à la DB:', error);
  }
});

