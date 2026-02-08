const { PrismaClient } = require('@prisma/client');
const config = require('./env');

/**
 * Prisma Client instance
 * Singleton pattern to ensure only one instance is created
 */
let prisma;

/**
 * Get or create Prisma Client instance
 * @returns {PrismaClient} Prisma Client instance
 */
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: config.env === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    // Handle graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
    });
  }

  return prisma;
}

module.exports = getPrismaClient();
