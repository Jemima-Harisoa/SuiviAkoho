import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { getPool } from './config/database.config';
import raceRoutes from './routes/race.routes';
import sexeRoutes from './routes/sexe.routes';
import typeProductionRoutes from './routes/type-production.routes';
import phaseAlimentationRoutes from './routes/phase-alimentation.routes';
import referenceCompositionAlimentRoutes from './routes/reference-composition-aliment.routes';
import uniteRoutes from './routes/unite.routes';
import parametreRoutes from './routes/parametre.routes';



dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/races', raceRoutes);
app.use('/api/sexes', sexeRoutes);
app.use('/api/type-productions', typeProductionRoutes);
app.use('/api/phase-alimentations', phaseAlimentationRoutes);
app.use('/api/reference-composition-aliments', referenceCompositionAlimentRoutes);
app.use('/api/unites', uniteRoutes);
app.use('/api/parametres', parametreRoutes); 

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

