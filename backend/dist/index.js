"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_config_1 = require("./config/database.config");
const race_routes_1 = __importDefault(require("./routes/race.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middlewares
app.use((0, helmet_1.default)({ crossOriginResourcePolicy: false }));
app.use((0, cors_1.default)({
    origin: true,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes Race
app.use('/api/races', race_routes_1.default);
// Route de test
app.get('/health', async (req, res) => {
    try {
        await (0, database_config_1.getPool)();
        res.json({
            status: 'OK',
            message: 'Serveur et DB opérationnels'
        });
    }
    catch (error) {
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
        await (0, database_config_1.getPool)();
    }
    catch (error) {
        console.error('Impossible de se connecter à la DB:', error);
    }
});
