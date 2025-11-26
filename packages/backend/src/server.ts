import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import invoiceRoutes from './routes/invoice.routes.js'
import settingsRoutes from './routes/settings.routes.js'
import clientRoutes from './routes/client.routes.js'
import projectRoutes from './routes/project.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.use('/api/invoices', invoiceRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/clients', clientRoutes)
app.use('/api/projects', projectRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Invoice Manager API is running' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

