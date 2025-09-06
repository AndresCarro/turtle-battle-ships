import { Request, Response } from "express";
import { UserService } from "../services/user-service";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: "username is required" });
        }
        const user = await UserService.createUser(username);
        return res.status(201).json(user);      
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};