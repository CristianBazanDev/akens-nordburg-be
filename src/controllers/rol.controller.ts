import { Request, Response } from "express";
import { prisma } from "../services/prisma";
import { IRol } from "../types/rol";
import { initialRol } from "../../prisma/data/roles";

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
    }
}

export default RolController;