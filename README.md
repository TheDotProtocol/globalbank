# Global Dot Bank - Digital Banking Platform

A modern, secure digital banking platform built with Next.js, Prisma, and PostgreSQL. Features comprehensive KYC verification, secure transactions, and AI-powered banking assistance.

## 🚀 Features

### Core Banking
- **Account Management**: Personal, Premium, and Business accounts
- **Secure Transactions**: Internal transfers, external payments, and e-checks
- **Virtual Cards**: Generate and manage virtual debit/credit cards
- **Fixed Deposits**: High-yield investment options
- **Real-time Balance**: Live account balance updates

### Security & Compliance
- **KYC Verification**: Integrated Sumsub SDK for identity verification
- **Two-Factor Authentication**: Enhanced account security
- **Bank-Grade Encryption**: 256-bit encryption for all data
- **Fraud Detection**: Advanced monitoring and dispute resolution
- **Regulatory Compliance**: Full banking regulation compliance

### AI-Powered Features
- **BankBugger AI**: Intelligent banking assistant
- **Financial Literacy**: Educational content and guidance
- **Investment Advice**: Personalized investment recommendations
- **Security Education**: Proactive security awareness

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email**: Nodemailer with Resend integration
- **KYC**: Sumsub SDK integration
- **Deployment**: Vercel-ready

### Database Schema
- **Users**: Account management with KYC status tracking
- **Accounts**: Multi-currency account support
- **Transactions**: Comprehensive transaction history
- **Cards**: Virtual card management
- **Fixed Deposits**: Investment tracking
- **KYC Documents**: Identity verification storage

## 📋 Registration Flow

1. **Account Selection**: Choose Personal, Premium, or Business account
2. **Registration Form**: Complete personal information
3. **KYC Verification**: Identity verification via Sumsub SDK
4. **Admin Review**: Manual verification by bank staff
5. **Account Activation**: Full access to banking features

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Sumsub API credentials
- Resend API key (for emails)

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
JWT_SECRET="your-jwt-secret"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"
SMTP_FROM="noreply@yourdomain.com"

# KYC (Sumsub)
NEXT_PUBLIC_SUMSUB_APP_TOKEN="your-sumsub-token"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Installation Steps
```bash
# Clone repository
git clone <repository-url>
cd globalbank

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Setup
- Set all required environment variables
- Configure database connection
- Setup Sumsub webhook endpoints
- Configure email service

## 🔐 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Session management
- Rate limiting on API endpoints

### Data Protection
- Encrypted data transmission (HTTPS)
- Database encryption at rest
- Secure API endpoints
- Input validation and sanitization

### KYC Compliance
- Government ID verification
- Address proof validation
- Face verification
- Document authenticity checks

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### KYC Management
- `POST /api/kyc/update-status` - Update KYC status
- `GET /api/kyc/status` - Get KYC status

### Transactions
- `POST /api/transactions/transfer` - Make transfers
- `GET /api/transactions` - Get transaction history
- `POST /api/admin/transfer` - Admin transfers

### Accounts
- `GET /api/accounts` - Get user accounts
- `POST /api/accounts` - Create new account

## 🤖 AI Integration

### BankBugger AI Features
- Financial literacy education
- Investment guidance
- Security awareness
- Transaction analysis
- Personalized recommendations

### AI Categories
- Financial Literacy
- Investment Guidance
- Security Education
- Automation Assistance
- General Queries

## 📱 User Interface

### Modern Design
- Responsive design for all devices
- Intuitive navigation
- Real-time updates
- Accessibility compliant

### Key Pages
- **Dashboard**: Account overview and quick actions
- **Registration**: Multi-step account creation
- **KYC Verification**: Identity verification interface
- **Transactions**: Detailed transaction history
- **Cards**: Virtual card management
- **Investments**: Fixed deposit management

## 🔄 Development Workflow

### Code Structure
```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── dashboard/      # Dashboard pages
│   ├── register/       # Registration flow
│   └── kyc/           # KYC verification
├── components/         # Reusable components
├── lib/               # Utility functions
└── types/             # TypeScript definitions
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

## 🧪 Testing

### Test Coverage
- API endpoint testing
- Component testing
- Integration testing
- Security testing

### Test Commands
```bash
npm run test         # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## 📈 Performance

### Optimization
- Server-side rendering (SSR)
- Static generation where possible
- Image optimization
- Code splitting
- Database query optimization

### Monitoring
- Real-time performance metrics
- Error tracking
- User analytics
- Security monitoring

## 🔧 Configuration

### Database Configuration
- Connection pooling
- Query optimization
- Backup strategies
- Migration management

### Email Configuration
- Transactional emails
- KYC status notifications
- Security alerts
- Marketing communications

## 📞 Support

### Documentation
- API documentation
- User guides
- Developer documentation
- Security guidelines

### Contact
- Technical support
- Security issues
- Feature requests
- Bug reports

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 🔄 Changelog

### Version 2.0.0 (Latest)
- ✅ Integrated Sumsub KYC verification
- ✅ Updated registration flow with KYC
- ✅ Fixed email verification system
- ✅ Enhanced security features
- ✅ Improved user experience
- ✅ Added comprehensive documentation

### Version 1.0.0
- Initial release with basic banking features
- Account management
- Transaction processing
- Virtual card system

---

**Global Dot Bank** - Modern Banking for the Digital Age 🏦
