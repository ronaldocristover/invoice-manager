# Invoice Manager

A full-stack invoice management application built with Vue.js, Express.js, TypeScript, and Prisma.

## Features

- Create and manage invoices
- View invoice details
- Generate invoices as PDF
- Modern, responsive UI with Tailwind CSS

## Project Structure

```
invoice-manager/
├── frontend/          # Vue 3 + TypeScript + Vite + Tailwind
└── backend/          # Express + TypeScript + Prisma
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL database
- npm or yarn

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your database connection string:
```
DATABASE_URL="mysql://user:password@localhost:3306/invoice_manager"
PORT=5000
```

5. Generate Prisma Client:
```bash
npm run prisma:generate
```

6. Run database migrations:
```bash
npm run prisma:migrate
```

**Note:** After updating the Prisma schema, always run `prisma:generate` to regenerate the Prisma client with updated types.

7. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get invoice by ID
- `POST /api/invoices` - Create a new invoice
- `PUT /api/invoices/:id` - Update an invoice
- `DELETE /api/invoices/:id` - Delete an invoice
- `GET /api/invoices/:id/pdf` - Generate PDF for an invoice

## Technologies Used

### Frontend
- Vue 3 (Composition API)
- TypeScript
- Vite
- Tailwind CSS
- Vue Router
- Pinia
- Axios

### Backend
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- PDFKit (for PDF generation)

## Development

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## License

MIT

