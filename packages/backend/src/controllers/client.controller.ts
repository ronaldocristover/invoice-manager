import { Request, Response } from 'express'
import { prisma } from '../lib/prisma.js'

export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        _count: {
          select: {
            invoices: true,
            projects: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    res.status(500).json({ error: 'Failed to fetch clients' })
  }
}

export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            issueDate: true,
            dueDate: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        }
      }
    })

    if (!client) {
      res.status(404).json({ error: 'Client not found' })
      return
    }

    res.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    res.status(500).json({ error: 'Failed to fetch client' })
  }
}

export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      address,
      company,
      taxId,
      notes
    } = req.body

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        company,
        taxId,
        notes
      }
    })

    res.status(201).json(client)
  } catch (error) {
    console.error('Error creating client:', error)
    res.status(500).json({ error: 'Failed to create client' })
  }
}

export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name,
      email,
      phone,
      address,
      company,
      taxId,
      notes
    } = req.body

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        company,
        taxId,
        notes
      }
    })

    res.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    res.status(500).json({ error: 'Failed to update client' })
  }
}

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.client.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting client:', error)
    res.status(500).json({ error: 'Failed to delete client' })
  }
}

