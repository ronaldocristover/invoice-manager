import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getAllProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.query

    const where = clientId ? { clientId: clientId as string } : {}

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            invoices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Failed to fetch projects' })
  }
}

export const getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        invoices: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true,
            total: true,
            issueDate: true,
            dueDate: true
          }
        }
      }
    })

    if (!project) {
      res.status(404).json({ error: 'Project not found' })
      return
    }

    res.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    res.status(500).json({ error: 'Failed to fetch project' })
  }
}

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      clientId,
      status
    } = req.body

    const project = await prisma.project.create({
      data: {
        name,
        description,
        clientId,
        status: status || 'active'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.status(201).json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Failed to create project' })
  }
}

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const {
      name,
      description,
      clientId,
      status
    } = req.body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (clientId !== undefined) updateData.clientId = clientId
    if (status !== undefined) updateData.status = status

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    res.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Failed to update project' })
  }
}

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params

    await prisma.project.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ error: 'Failed to delete project' })
  }
}

