import dotenv from 'dotenv';
import { prisma } from '../services/prisma';

dotenv.config();

async function verify() {
  try {
    console.log('\n=== Verificando datos en la base de datos ===\n');

    const users = await prisma.user.findMany();
    console.log(`✅ Usuarios: ${users.length}`);
    if (users.length > 0) {
      console.log(`   Ejemplo: ${users[0].name} (${users[0].email})`);
    }

    const roles = await prisma.rol.findMany();
    console.log(`✅ Roles: ${roles.length}`);
    if (roles.length > 0) {
      console.log(`   Ejemplos: ${roles.map(r => r.description).join(', ')}`);
    }

    const positions = await prisma.position.findMany();
    console.log(`✅ Posiciones: ${positions.length}`);
    if (positions.length > 0) {
      console.log(`   Ejemplo: ${positions[0].title}`);
    }

    const processes = await prisma.process.findMany();
    console.log(`✅ Procesos: ${processes.length}`);
    if (processes.length > 0) {
      console.log(`   Ejemplo: ${processes[0].title}`);
    }

    const talentProfiles = await prisma.talentProfile.findMany();
    console.log(`✅ Perfiles de Talentos: ${talentProfiles.length}`);

    const cvs = await prisma.talentCV.findMany();
    console.log(`✅ CVs: ${cvs.length}`);

    const monthlyGoals = await prisma.monthlyGoal.findMany();
    console.log(`✅ Metas Mensuales: ${monthlyGoals.length}`);

    const annualGoals = await prisma.annualGoal.findMany();
    console.log(`✅ Metas Anuales: ${annualGoals.length}`);

    console.log('\n=== Verificación completada ===\n');
  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verify();

