import { PrismaClient, InvoiceStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log('🧹 Cleaning existing data...')
  await prisma.invoiceItem.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.project.deleteMany()
  await prisma.client.deleteMany()
  await prisma.invoiceSettings.deleteMany()

  // 1. Create Invoice Settings
  console.log('📝 Creating invoice settings...')
  const settings = await prisma.invoiceSettings.create({
    data: {
      invoicePrefix: 'INV',
      invoiceTheme: 'default',
      logoUrl: null,
      enableTax: true,
      enableShipping: false,
      enableDiscount: true,
      defaultTax: 10,
      defaultNotes: 'Thank you for your business!',
      defaultTerms: 'Payment is due within 30 days. Late payments may incur a 5% fee.',
      pdfNameFormat: 'invoice-{invoiceNumber}',
      enableWatermark: false,
      watermarkText: null,
      watermarkSize: 50,
      watermarkColor: '#CCCCCC',
      defaultFont: 'Helvetica',
      enableSignature: true,
      signatureImageUrl: null,
      signatureText: 'John Doe, Director',
      enableFrom: true,
      companyName: 'Acme Corporation',
      companyAddress: '123 Business Street\nSuite 100\nNew York, NY 10001',
      companyEmail: 'billing@acmecorp.com',
      companyPhone: '+1 (555) 123-4567',
      customFields: null
    }
  })
  console.log('✅ Invoice settings created:', settings.id)

  // 2. Create Clients
  console.log('👥 Creating clients...')
  const clients = await prisma.client.createMany({
    data: [
      {
        name: 'Tech Solutions Inc.',
        email: 'contact@techsolutions.com',
        phone: '+1 (555) 200-1000',
        address: '456 Innovation Drive\nSan Francisco, CA 94105',
        company: 'Tech Solutions Inc.',
        taxId: 'TAX-123456',
        notes: 'Preferred client, 30-day payment terms'
      },
      {
        name: 'Global Marketing Agency',
        email: 'info@globalmarketing.com',
        phone: '+1 (555) 300-2000',
        address: '789 Marketing Boulevard\nLos Angeles, CA 90001',
        company: 'Global Marketing Agency',
        taxId: 'TAX-789012',
        notes: 'Monthly retainer client'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 400-3000',
        address: '321 Personal Street\nAustin, TX 78701',
        company: null,
        taxId: null,
        notes: 'Freelance consultant'
      },
      {
        name: 'Digital Services Co.',
        email: 'hello@digitalservices.com',
        phone: '+1 (555) 500-4000',
        address: '654 Digital Avenue\nSeattle, WA 98101',
        company: 'Digital Services Co.',
        taxId: 'TAX-345678',
        notes: 'New client, requires invoice approval'
      }
    ]
  })
  console.log(`✅ Created ${clients.count} clients`)

  // 3. Get created clients to use their IDs
  const createdClients = await prisma.client.findMany()

  // 4. Create Projects
  console.log('📁 Creating projects...')
  const projects = await Promise.all([
    prisma.project.create({
      data: {
        name: 'Website Redesign',
        description: 'Complete website redesign and development',
        clientId: createdClients[0].id,
        status: 'active'
      }
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App Development',
        description: 'iOS and Android mobile application development',
        clientId: createdClients[0].id,
        status: 'active'
      }
    }),
    prisma.project.create({
      data: {
        name: 'Marketing Campaign Q1',
        description: 'Q1 2024 marketing campaign and strategy',
        clientId: createdClients[1].id,
        status: 'active'
      }
    }),
    prisma.project.create({
      data: {
        name: 'Consulting Services',
        description: 'Business consulting and strategy',
        clientId: createdClients[2].id,
        status: 'completed'
      }
    }),
    prisma.project.create({
      data: {
        name: 'Cloud Migration',
        description: 'Infrastructure migration to cloud',
        clientId: createdClients[3].id,
        status: 'active'
      }
    })
  ])
  console.log(`✅ Created ${projects.length} projects`)

  // 5. Create Invoices
  console.log('🧾 Creating invoices...')
  
  const now = new Date()
  const issueDate1 = new Date(now.getFullYear(), now.getMonth() - 1, 15)
  const dueDate1 = new Date(now.getFullYear(), now.getMonth(), 15)
  
  const issueDate2 = new Date(now.getFullYear(), now.getMonth(), 1)
  const dueDate2 = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  
  const issueDate3 = new Date(now.getFullYear(), now.getMonth() - 2, 10)
  const dueDate3 = new Date(now.getFullYear(), now.getMonth() - 1, 10)

  // Invoice 1: Paid invoice
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-0001',
      clientId: createdClients[0].id,
      projectId: projects[0].id,
      clientName: createdClients[0].name,
      clientEmail: createdClients[0].email,
      clientAddress: createdClients[0].address || '',
      issueDate: issueDate1,
      dueDate: dueDate1,
      status: InvoiceStatus.PAID,
      subtotal: 5000.00,
      tax: 500.00,
      shipping: 0,
      discount: 250.00,
      total: 5250.00,
      amountPaid: 5250.00,
      notes: 'Thank you for your prompt payment!',
      terms: 'Payment received. Invoice marked as paid.',
      customFields: null,
      items: {
        create: [
          {
            description: 'Website Design & Development',
            quantity: 1,
            unitPrice: 3000.00,
            total: 3000.00
          },
          {
            description: 'Content Management System Setup',
            quantity: 1,
            unitPrice: 1500.00,
            total: 1500.00
          },
          {
            description: 'SEO Optimization',
            quantity: 1,
            unitPrice: 500.00,
            total: 500.00
          }
        ]
      }
    }
  })
  console.log('✅ Created invoice:', invoice1.invoiceNumber)

  // Invoice 2: Sent invoice
  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-0002',
      clientId: createdClients[1].id,
      projectId: projects[2].id,
      clientName: createdClients[1].name,
      clientEmail: createdClients[1].email,
      clientAddress: createdClients[1].address || '',
      issueDate: issueDate2,
      dueDate: dueDate2,
      status: InvoiceStatus.SENT,
      subtotal: 8000.00,
      tax: 800.00,
      shipping: 0,
      discount: 0,
      total: 8800.00,
      amountPaid: 0,
      notes: 'Monthly retainer for marketing services.',
      terms: 'Payment is due within 30 days of invoice date.',
      customFields: null,
      items: {
        create: [
          {
            description: 'Marketing Strategy Development',
            quantity: 1,
            unitPrice: 3000.00,
            total: 3000.00
          },
          {
            description: 'Social Media Management (Monthly)',
            quantity: 1,
            unitPrice: 2000.00,
            total: 2000.00
          },
          {
            description: 'Content Creation & Copywriting',
            quantity: 1,
            unitPrice: 2000.00,
            total: 2000.00
          },
          {
            description: 'Analytics & Reporting',
            quantity: 1,
            unitPrice: 1000.00,
            total: 1000.00
          }
        ]
      }
    }
  })
  console.log('✅ Created invoice:', invoice2.invoiceNumber)

  // Invoice 3: Draft invoice
  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-0003',
      clientId: createdClients[2].id,
      projectId: projects[3].id,
      clientName: createdClients[2].name,
      clientEmail: createdClients[2].email,
      clientAddress: createdClients[2].address || '',
      issueDate: issueDate2,
      dueDate: dueDate2,
      status: InvoiceStatus.DRAFT,
      subtotal: 2500.00,
      tax: 250.00,
      shipping: 0,
      discount: 0,
      total: 2750.00,
      amountPaid: 0,
      notes: 'Draft invoice - pending approval',
      terms: null,
      customFields: null,
      items: {
        create: [
          {
            description: 'Business Strategy Consultation',
            quantity: 10,
            unitPrice: 150.00,
            total: 1500.00
          },
          {
            description: 'Market Research & Analysis',
            quantity: 1,
            unitPrice: 1000.00,
            total: 1000.00
          }
        ]
      }
    }
  })
  console.log('✅ Created invoice:', invoice3.invoiceNumber)

  // Invoice 4: Overdue invoice
  const invoice4 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-0004',
      clientId: createdClients[3].id,
      projectId: projects[4].id,
      clientName: createdClients[3].name,
      clientEmail: createdClients[3].email,
      clientAddress: createdClients[3].address || '',
      issueDate: issueDate3,
      dueDate: dueDate3,
      status: InvoiceStatus.OVERDUE,
      subtotal: 12000.00,
      tax: 1200.00,
      shipping: 500.00,
      discount: 600.00,
      total: 13100.00,
      amountPaid: 5000.00,
      notes: 'This invoice is overdue. Please contact us immediately.',
      terms: 'Payment was due 30 days ago. Late fees may apply.',
      customFields: null,
      items: {
        create: [
          {
            description: 'Cloud Infrastructure Setup',
            quantity: 1,
            unitPrice: 5000.00,
            total: 5000.00
          },
          {
            description: 'Data Migration Services',
            quantity: 1,
            unitPrice: 4000.00,
            total: 4000.00
          },
          {
            description: 'Security Configuration',
            quantity: 1,
            unitPrice: 2000.00,
            total: 2000.00
          },
          {
            description: 'Training & Documentation',
            quantity: 1,
            unitPrice: 1000.00,
            total: 1000.00
          }
        ]
      }
    }
  })
  console.log('✅ Created invoice:', invoice4.invoiceNumber)

  // Invoice 5: Another sent invoice
  const invoice5 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-0005',
      clientId: createdClients[0].id,
      projectId: projects[1].id,
      clientName: createdClients[0].name,
      clientEmail: createdClients[0].email,
      clientAddress: createdClients[0].address || '',
      issueDate: issueDate2,
      dueDate: dueDate2,
      status: InvoiceStatus.SENT,
      subtotal: 15000.00,
      tax: 1500.00,
      shipping: 0,
      discount: 750.00,
      total: 15750.00,
      amountPaid: 7875.00,
      notes: 'Mobile app development project - Phase 1',
      terms: 'Payment terms: 50% upfront, 50% on completion',
      customFields: JSON.stringify([
        { label: 'PO Number', value: 'PO-2024-001' },
        { label: 'Project Manager', value: 'Jane Smith' }
      ]),
      items: {
        create: [
          {
            description: 'iOS App Development',
            quantity: 1,
            unitPrice: 8000.00,
            total: 8000.00
          },
          {
            description: 'Android App Development',
            quantity: 1,
            unitPrice: 7000.00,
            total: 7000.00
          }
        ]
      }
    }
  })
  console.log('✅ Created invoice:', invoice5.invoiceNumber)

  console.log('\n🎉 Seeding completed successfully!')
  console.log(`\n📊 Summary:`)
  console.log(`   - Settings: 1`)
  console.log(`   - Clients: ${createdClients.length}`)
  console.log(`   - Projects: ${projects.length}`)
  console.log(`   - Invoices: 5`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

