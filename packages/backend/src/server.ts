import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import invoiceRoutes from './routes/invoice.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import clientRoutes from './routes/client.routes.js'
import projectRoutes from './routes/project.routes.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import logger from './lib/logger.js'
import './lib/prisma.js' // Initialize Prisma client

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  })
  next()
})

// Routes
app.use('/api/invoices', invoiceRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/projects', projectRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Invoice Manager API is running' })
})

// 404 handler
app.use(notFoundHandler)

// Error handler (must be last)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`, {
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  })
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise
  })
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', {
    error: error.message,
    stack: error.stack
  })
  process.exit(1)
})

