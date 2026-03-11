import { Request, Response  } from "express";
import * as raceRepository from "../repositories/race.repositories";

export async function getAllRaces(req: Request, res: Response): Promise<void> {
    try {
        const races = await raceRepository.findAllRacees();
        res.json(races);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
    }
}

export async function getRaceById(req: Request, res: Response): Promise<void> {
    try {
        const raceId = parseInt(req.params.id as string || '', 10);
        if (isNaN(raceId)) {
            res.status(400).json({ message: 'ID de race invalide' });
            return;
        }

        const race = await raceRepository.findRaceById(raceId);
        if (!race) {
            res.status(404).json({ message: 'Race Course non trouvée' });
        }
        res.json(race);
    } catch (error) {
        res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
    }
}

export async function createRace(req: Request, res: Response): Promise<void> {
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
        res.status(500).json({ message: 'Erreur serveur', error: (error as Error).message });
    }
}