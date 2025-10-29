# Credit Jambo - Digital Credit & Savings Platform API

A full-stack financial system demonstrating scalable architecture, modularity, and secure API design for managing customer savings, credit scoring, and loan disbursement.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-brightgreen)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

-  **Authentication & Authorization** - JWT-based with role management (Admin/Customer)
-  **Savings Management** - Deposit and withdrawal tracking
-  **Loan System** - Application, approval, and repayment workflows
-  **Payment History** - Complete transaction tracking
-  **Credit Scoring** - Dynamic loan eligibility calculation
-  **Automated Jobs** - Cron jobs for balance updates and overdue checks
-  **API Documentation** - Interactive Swagger/OpenAPI docs
-  **DTOs & Validation** - Zod schema validation
-  **Error Handling** - Centralized error management
-  **Repository Pattern** - Clean architecture implementation

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **MongoDB Atlas Account** - [Sign up free](https://www.mongodb.com/cloud/atlas/register)
- **Git** - [Download](https://git-scm.com/)

---

##  Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/aimeeumuhoza/credit-api.git
cd credit-jambo-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:
```bash
cp .env.gmail .env
```

Update the `.env` file with your configuration:
```env
# Database
DATABASE_URL="mongodb+srv://chris:chris@cluster0.k1npp.mongodb.net/credit-jambo"

# Server
SERVER_PORT=4000
NODE_ENV=development

# JWT Secrets (Change these in production!)
JWT_SECRET=
JWT_EXPIRES_IN=
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=

# App
SECRET_KEY=
```

### 4. Database Setup
```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with sample data
npm run db:seed
```

**Or run all at once:**
```bash
npm run db:all
```

### 5. Start Development Server
```bash
npm run dev
```

The server will start on `http://localhost:4000`

**Success!** Your API is now running!

---

## API Documentation

Once the server is running, access the interactive API documentation at:

**Swagger UI:** [http://localhost:4000/api-docs](http://localhost:4000/api-docs)

---

## Test Credentials

After running the seed script, you can use these credentials:

### Admin Account
```
Email: admin@creditjambo.com
Password: admin123
```

### Customer Account
```
Email: jean.uwimana@gmail.com
Password: password123
```

---

##  Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:all` | Run push, generate, and seed |
| `npm run watch` | Watch TypeScript files for changes |

---

## Project Structure
```
credit-jambo-backend/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/                   # Configuration files
│   │   ├── database.ts           # Prisma client
│   │   ├── env.ts                # Environment variables
│   │   └── swagger.ts            # API documentation setup
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.dto.ts
│   │   │   └── auth.routes.ts
│   │   ├── users/                # User management
│   │   ├── savings/              # Deposits & Withdrawals
│   │   ├── loans/                # Loan management
│   │   └── payments/             # Payment tracking
│   ├── middleware/               # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── errorHandler.middleware.ts
│   │   └── validation.middleware.ts
│   ├── common/                   # Shared code
│   │   ├── exceptions/           # Custom exceptions
│   │   ├── interfaces/           # TypeScript interfaces
│   │   └── constants/            # App constants
│   ├── utils/                    # Utility functions
│   │   ├── jwt.util.ts
│   │   ├── bcrypt.util.ts
│   │   └── response.util.ts
│   └── jobs/                     # Cron jobs
│       └── loanBalance.cron.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeding
├── .env                          # Environment variables
├── .env.gmail                  # Environment template
├── package.json
├── tsconfig.json
└── README.md

```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/refresh-token` | Refresh access token | No |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users` | Get all users | YES Admin |
| GET | `/api/users/profile` | Get current user profile | YES |
| GET | `/api/users/:id` | Get user by ID | YES |
| PUT | `/api/users/:id` | Update user | YES |
| DELETE | `/api/users/:id` | Delete user | YES Admin |

### Savings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/savings/deposit` | Make a deposit | YES |
| POST | `/api/savings/withdraw` | Make a withdrawal | YES |
| GET | `/api/savings/transactions` | Get user transactions | YES |
| GET | `/api/savings/all-transactions` | Get all transactions | YES Admin |
| GET | `/api/savings/stats` | Get savings statistics | YES |

### Loans
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/loans/apply` | Apply for loan | YES |
| GET | `/api/loans/eligibility` | Check loan eligibility | YES |
| GET | `/api/loans/my-loans` | Get user's loans | YES |
| GET | `/api/loans/stats` | Get loan statistics | YES |
| GET | `/api/loans` | Get all loans | YES Admin |
| GET | `/api/loans/:id` | Get loan by ID | YES |
| PUT | `/api/loans/:id/approve` | Approve loan | YES Admin |
| PUT | `/api/loans/:id/reject` | Reject loan | YES Admin |

### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Make loan payment | YES |
| GET | `/api/payments/my-payments` | Get user's payments | YES |
| GET | `/api/payments/loan/:loanId` | Get loan payments | YES |
| GET | `/api/payments/all` | Get all payments | YES Admin |
| GET | `/api/payments/:id` | Get payment by ID | YES |

---

## 💡 Business Logic

### Loan Eligibility Calculation

Users can borrow based on their savings:
```
Eligible Loan Amount = (Total Deposits - Total Withdrawals) × 50%
```

**Requirements:**
- Active loans reduce available loan balance

### Interest Rates

Interest rates are calculated based on loan duration:

| Duration | Interest Rate |
|----------|--------------|
| ≤ 3 months | 15% |
| 4-6 months | 12% |
| 7-12 months | 10% |
| > 12 months | 8% |

### Automated Jobs

**1. Loan Balance Update** (Runs daily at midnight)
- Recalculates eligible loan amounts for all users

**2. Overdue Loan Check** (Runs daily at 1 AM)
- Identifies overdue loans
- Marks loans as DEFAULTED after 30 days

---

## Testing

### Using Postman/Thunder Client

1. **Login to get token:**
```json
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "admin@creditjambo.com",
  "password": "admin123"
}
```

2. **Use the token in subsequent requests:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### gmail: Make a Deposit
```json
POST http://localhost:4000/api/savings/deposit
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "amount": 50000,
  "paymentType":"DEPOSIT",
}
```

---

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Environment Variables for Production

Update these in your production environment:
```env
NODE_ENV=production
DATABASE_URL="your_production_mongodb_url"
JWT_SECRET="strong_random_secret_key"
JWT_REFRESH_SECRET="strong_random_refresh_key"
```

---

##  Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

##  Author

**Aimee UMUHOZA**
- Email: aimeeumuhoza1@gmail.com

---

## Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- Database: [MongoDB](https://www.mongodb.com/)
- ORM: [Prisma](https://www.prisma.io/)
- Documentation: [Swagger](https://swagger.io/)

---

## Support

For support, email aimeeumuhoza1@gmail.com or create an issue in the repository.
