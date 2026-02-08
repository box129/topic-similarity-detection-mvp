# Topic Similarity Backend API

Express.js backend API for the Topic Similarity MVP project.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── middleware/     # Custom middleware
│   └── server.js       # Application entry point
├── prisma/             # Prisma schema and migrations
├── package.json        # Project dependencies and scripts
└── .env.example        # Environment variables template
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Set up Prisma (when ready):
```bash
npm run prisma:generate
npm run prisma:migrate
```

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests with coverage
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed the database

## Dependencies

### Production
- **express** (4.18.2) - Web framework
- **@prisma/client** (5.7.1) - Database ORM
- **dotenv** (16.3.1) - Environment variable management
- **cors** (2.8.5) - CORS middleware
- **helmet** (7.1.0) - Security headers
- **express-rate-limit** (7.1.5) - Rate limiting
- **natural** (6.10.2) - NLP library
- **axios** (1.6.5) - HTTP client
- **winston** (3.11.0) - Logging

### Development
- **nodemon** (3.0.2) - Auto-restart on file changes
- **jest** (29.7.0) - Testing framework
- **supertest** (6.3.3) - HTTP testing
- **prisma** (5.7.1) - Database toolkit
- **eslint** (8.56.0) - Code linting
- **prettier** (3.1.1) - Code formatting

## API Endpoints

### Health Check
- `GET /health` - Check server status

(More endpoints will be added as development progresses)
