import { prisma } from "../../services/prisma";
import bcrypt from "bcrypt";

export const initializeTestUsers = async () => {
  const adminRole = await prisma.rol.findUnique({ where: { description: "admin" } });
  const userRole = await prisma.rol.findUnique({ where: { description: "user" } });
  const clientRole = await prisma.rol.findUnique({ where: { description: "client" } });
  const talentRole = await prisma.rol.findUnique({ where: { description: "talent" } });

  if (!adminRole || !userRole || !clientRole || !talentRole) {
    throw new Error("Algunos roles no existen. Asegúrate de inicializar los roles primero.");
  }

  const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12);
  };

  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@test.com" } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: "admin@test.com",
        password: await hashPassword("admin123"),
        name: "Admin User",
        rolId: adminRole.id,
      },
    });
    console.log("Usuario admin creado: admin@test.com / admin123");
  }

  const existingRecruiter = await prisma.user.findUnique({ where: { email: "recruiter@test.com" } });
  if (!existingRecruiter) {
    await prisma.user.create({
      data: {
        email: "recruiter@test.com",
        password: await hashPassword("recruiter123"),
        name: "Recruiter User",
        rolId: userRole.id,
      },
    });
    console.log("Usuario recruiter creado: recruiter@test.com / recruiter123");
  }

  const existingClient = await prisma.user.findUnique({ where: { email: "client@test.com" } });
  if (!existingClient) {
    await prisma.user.create({
      data: {
        email: "client@test.com",
        password: await hashPassword("client123"),
        name: "Client User",
        rolId: clientRole.id,
      },
    });
    console.log("Usuario client creado: client@test.com / client123");
  }

  const existingTalent = await prisma.user.findUnique({ where: { email: "talent@test.com" } });
  if (!existingTalent) {
    await prisma.user.create({
      data: {
        email: "talent@test.com",
        password: await hashPassword("talent123"),
        name: "Talent User",
        rolId: talentRole.id,
      },
    });
    console.log("Usuario talent creado: talent@test.com / talent123");
  }

  const additionalUsers = [
    { email: "recruiter2@test.com", password: "recruiter123", name: "María González", role: userRole },
    { email: "recruiter3@test.com", password: "recruiter123", name: "Carlos Rodríguez", role: userRole },
    { email: "recruiter4@test.com", password: "recruiter123", name: "Ana Martínez", role: userRole },
    { email: "recruiter5@test.com", password: "recruiter123", name: "Luis Fernández", role: userRole },
    { email: "client2@test.com", password: "client123", name: "TechCorp Solutions", role: clientRole },
    { email: "client3@test.com", password: "client123", name: "InnovateLab Inc", role: clientRole },
    { email: "client4@test.com", password: "client123", name: "Digital Ventures", role: clientRole },
    { email: "client5@test.com", password: "client123", name: "StartupHub", role: clientRole },
    { email: "talent2@test.com", password: "talent123", name: "Sofía López", role: talentRole },
    { email: "talent3@test.com", password: "talent123", name: "Diego Ramírez", role: talentRole },
    { email: "talent4@test.com", password: "talent123", name: "Laura Sánchez", role: talentRole },
    { email: "talent5@test.com", password: "talent123", name: "Javier Torres", role: talentRole },
    { email: "talent6@test.com", password: "talent123", name: "Carmen Ruiz", role: talentRole },
    { email: "talent7@test.com", password: "talent123", name: "Roberto Morales", role: talentRole },
    { email: "talent8@test.com", password: "talent123", name: "Patricia Jiménez", role: talentRole },
    { email: "talent9@test.com", password: "talent123", name: "Fernando Castro", role: talentRole },
    { email: "talent10@test.com", password: "talent123", name: "Isabel Vega", role: talentRole },
  ];

  for (const userData of additionalUsers) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: userData.email,
          password: await hashPassword(userData.password),
          name: userData.name,
          rolId: userData.role.id,
        },
      });
      console.log(`Usuario ${userData.name} creado: ${userData.email} / ${userData.password}`);
    }
  }
};

export const initializeAdminUser = async () => {
  await initializeTestUsers();
};
