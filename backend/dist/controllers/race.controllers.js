"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRaces = getAllRaces;
exports.getRaceById = getRaceById;
exports.createRace = createRace;
const raceRepository = __importStar(require("../repositories/race.repositories"));
async function getAllRaces(req, res) {
    try {
        const races = await raceRepository.findAllRacees();
        res.json(races);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}
async function getRaceById(req, res) {
    try {
        const raceId = parseInt(req.params.id || '', 10);
        if (isNaN(raceId)) {
            res.status(400).json({ message: 'ID de race invalide' });
            return;
        }
        const race = await raceRepository.findRaceById(raceId);
        if (!race) {
            res.status(404).json({ message: 'Race Course non trouvée' });
        }
        res.json(race);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}
async function createRace(req, res) {
    try {
        const { name, descriptionJson } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Le nom de la race est requis' });
            return;
        }
        const newRace = await raceRepository.createRace({ name, descriptionJson });
        if (!newRace) {
            res.status(500).json({ message: 'Erreur lors de la création de la race' });
            return;
        }
        res.status(201).json(newRace);
    }
    catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
}
