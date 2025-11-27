import { PrismaClient } from '@prisma/client'
import logger from './logger.js'

// Singleton pattern for PrismaClient to avoid multiple connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Test database connection on startup
prisma.$connect()
  .then(() => {
    logger.info('Database connected successfully')
  })
  .catch((error) => {
    logger.error('Database connection failed', {
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    })
  })

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  logger.info('Prisma client disconnected')
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  logger.info('Prisma client disconnected on SIGINT')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  logger.info('Prisma client disconnected on SIGTERM')
  process.exit(0)
})

