// Instância única do Prisma para toda a aplicação
// Importar daqui evita criar múltiplas conexões com o banco
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

module.exports = prisma;