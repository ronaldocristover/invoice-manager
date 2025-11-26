import { Router } from 'express'
import {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePdf,
  previewInvoicePdf
} from '../controllers/invoice.controller.js'

const router = Router()

router.get('/', getAllInvoices)
router.get('/:id', getInvoiceById)
router.post('/', createInvoice)
router.put('/:id', updateInvoice)
router.delete('/:id', deleteInvoice)
router.get('/:id/pdf', generateInvoicePdf)
router.get('/:id/preview', previewInvoicePdf)

export default router
