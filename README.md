# Global Dot Bank - Next-Generation Banking Platform

A modern, borderless fiat-only banking platform built with Next.js 15, featuring a beautiful UI design and comprehensive banking functionality.

## 🚀 Features

### Core Banking Features
- **Multi-Account Types**: Savings, Current, Fixed Deposit, Corporate, Junior, and Pension accounts
- **Real-time Transactions**: Instant transfers and payment processing
- **KYC Verification**: Integrated Sumsub KYC system for user verification
- **Fixed Deposits**: Transparent FD management with digital certificates
- **Multi-Currency Support**: Global banking with currency conversion
- **Security**: Bank-grade encryption and 2FA authentication

### UI/UX Features
- **Modern Design**: Beautiful gradient backgrounds with animated elements
- **Dark Mode**: Complete dark/light theme support across all pages
- **Responsive Design**: Mobile-first approach with perfect desktop experience
- **Professional Navigation**: Consistent navigation bars with logo and controls
- **Interactive Components**: Hover effects, animations, and smooth transitions

### Technical Features
- **Next.js 15**: Latest App Router with React 18
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design system
- **Prisma ORM**: Type-safe database operations
- **PostgreSQL**: Robust database with proper indexing
- **JWT Authentication**: Secure token-based authentication
- **API Routes**: RESTful API endpoints for all banking operations

## 🎨 UI Design System

The application features a consistent design system across all pages:

### Color Palette
- **Primary**: Blue gradient (`from-blue-500 to-indigo-500`)
- **Background**: Light gradient (`from-blue-50 via-indigo-50 to-purple-50`)
- **Dark Mode**: Dark gradient (`from-gray-900 via-gray-800 to-gray-900`)

### Components
- **Cards**: Backdrop blur with subtle shadows and borders
- **Navigation**: Semi-transparent with blur effects
- **Buttons**: Gradient backgrounds with hover animations
- **Forms**: Clean design with proper spacing and validation

### Animations
- **Background Elements**: Pulsing gradient orbs with blur effects
- **Page Transitions**: Smooth fade-in animations
- **Hover Effects**: Scale and shadow transitions
- **Loading States**: Spinning indicators and skeleton screens

## 📱 Pages Overview

### 1. Homepage (`/`)
- Hero section with animated background
- Account type selection with expandable details
- Feature showcase with interactive cards
- Trust indicators and statistics

### 2. Login (`/login`)
- Professional login form with validation
- Benefits section highlighting key features
- Dark mode toggle and navigation
- Success/error message handling

### 3. Dashboard (`/dashboard`)
- Total balance overview with multi-currency support
- Quick action buttons for common tasks
- Account list with type-specific icons
- Recent transactions with detailed information
- Fixed deposits management
- Export functionality for statements

### 4. Profile (`/profile`)
- Tabbed interface for personal info and security
- KYC status display with appropriate indicators
- Password change functionality
- Account management overview

### 5. KYC Verification (`/kyc/verification`)
- Status-based UI for verification process
- Integrated Sumsub SDK
- Professional information cards
- Error handling and retry functionality

### 6. Registration (`/register`)
- Account type selection interface
- Multi-step registration process
- Form validation and error handling
- Professional design with benefits showcase

## 🛠️ Technical Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Database toolkit and ORM
- **PostgreSQL**: Primary database
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

### External Services
- **Sumsub**: KYC verification system
- **Resend**: Email service for notifications
- **Vercel**: Deployment platform

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Sumsub account (for KYC)
- Resend account (for emails)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd globalbank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret for JWT tokens
   - `NEXT_PUBLIC_SUMSUB_APP_TOKEN`: Sumsub API token
   - `RESEND_API_KEY`: Resend email API key

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
globalbank/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── login/            # Login page
│   │   ├── profile/          # Profile page
│   │   ├── register/         # Registration pages
│   │   ├── kyc/              # KYC verification
│   │   └── globals.css       # Global styles
│   ├── components/           # Reusable React components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions
│   └── types/               # TypeScript type definitions
├── prisma/                  # Database schema and migrations
├── public/                  # Static assets
├── docs/                    # Documentation
└── README.md               # This file
```

## 🎯 Key Features Implemented

### ✅ Completed Features
- [x] Modern UI design system with dark mode
- [x] Responsive navigation with logo and controls
- [x] User authentication and authorization
- [x] Multi-account type management
- [x] Real-time transaction processing
- [x] KYC verification integration
- [x] Fixed deposit management
- [x] Profile management with security settings
- [x] Export functionality for statements
- [x] Multi-currency support
- [x] Professional error handling
- [x] Loading states and animations

### 🔄 In Progress
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Additional payment methods
- [ ] Advanced security features

## 📚 Documentation

- [UI Fix Summary](./UI-FIX-SUMMARY.md) - Details of UI improvements
- [Build Fixes Summary](./BUILD-FIXES-SUMMARY.md) - Technical fixes applied
- [Deployment Guide](./deployment-guide.md) - Deployment instructions
- [Environment Variables](./ENVIRONMENT-VARIABLES.md) - Configuration guide
- [Features Overview](./features.md) - Detailed feature documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review the deployment guides
- Open an issue on GitHub

---

**Global Dot Bank** - The World's First Next-Generation Bank 🚀
