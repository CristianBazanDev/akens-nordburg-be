import { Request, Response } from "express";
import { prisma } from "../services/prisma";
import { IRol } from "../types/rol";

const RolController = {
    createRol: async (req: Request<{}, {}, IRol>, res: Response): Promise<void> => {
        try {
            const { description } = req.body;

            const rol = await prisma.rol.create({
                data: {
                    description: description
                }
            }
            )
        } catch (error) {
            console.error(error);
        }
    },
    getRoles: async (req: Request<{}, {}, IRol>, res: Response): Promise<void> => {
        try {
            const roles = await prisma.rol.findMany() 
            res.json(roles)
        } catch (error) {
            console.error(error)
        }
    }
}

export default RolController;