import dotenv from 'dotenv';
import { prisma } from '../services/prisma';

dotenv.config();

async function checkTables() {
  try {
    console.log('\n=== Verificando tablas en PostgreSQL ===\n');

    const result = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    console.log('Tablas encontradas en la base de datos:');
    result.forEach(table => {
      console.log(`  - ${table.tablename}`);
    });

    console.log('\n=== Consultando datos directamente ===\n');

    const userCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "User";
    `;
    console.log(`Usuarios en tabla "User": ${userCount[0].count}`);

    const positionCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Position";
    `;
    console.log(`Posiciones en tabla "Position": ${positionCount[0].count}`);

    const processCount = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "Process";
    `;
    console.log(`Procesos en tabla "Process": ${processCount[0].count}`);

    console.log('\n=== IMPORTANTE ===');
    console.log('En PostgreSQL, los nombres de tablas con mayúsculas deben ir entre comillas dobles:');
    console.log('  ✅ SELECT * FROM "User";');
    console.log('  ✅ SELECT * FROM "Position";');
    console.log('  ✅ SELECT * FROM "Rol";');
    console.log('  ❌ SELECT * FROM user; (no funcionará)');
    console.log('  ❌ SELECT * FROM User; (no funcionará sin comillas)\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();

