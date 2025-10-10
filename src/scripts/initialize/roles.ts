import { prisma } from "../../services/prisma";
import { initialRoles } from "../../../prisma/data/roles";

export const initializeRoles = async () => {
  for (const role of initialRoles) {
    const exists = await prisma.rol.findUnique({ where: { description: role.description } });
    if (!exists) {
      await prisma.rol.create({ data: role });
      console.log(`Rol creado: ${role.description}`);
    }
  }
};
