import { Request, Response } from 'express';
import { getGameReplay } from '../services/game-replay-services';

export const getReplay = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const gameReplayS3Key = await getGameReplay(Number(id));
    res.status(200).json(gameReplayS3Key);
  } catch (err: any) {
    if (err.message === `Game ${Number(req.params)} no encontrado`)
      return res.status(404).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};
