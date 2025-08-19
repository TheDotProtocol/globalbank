# GlobalBank API Documentation

Complete API reference for GlobalBank digital banking platform.

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Account Management](#account-management)
4. [Transactions](#transactions)
5. [Fixed Deposits](#fixed-deposits)
6. [Cards](#cards)
7. [E-Checks](#e-checks)
8. [KYC Management](#kyc-management)
9. [AI Assistant](#ai-assistant)
10. [Admin APIs](#admin-apis)
11. [Analytics](#analytics)

---

## 🔐 Authentication

### Base URL
```
https://api.globalbank.com
```

### Authentication Headers
All API requests require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Error Responses
```json
{
  "error": "Error message",
  "status": 400
}
```

---

## 👤 User Management

### Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "user_id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "account": {
    "accountNumber": "0506111234",
    "accountType": "SAVINGS"
  }
}
```

### Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "kycStatus": "PENDING",
    "accounts": [
      {
        "id": "account_id",
        "accountNumber": "0506111234",
        "accountType": "SAVINGS",
        "balance": "1000.00",
        "currency": "USD"
      }
    ]
  }
}
```

### Reset Password
**POST** `/api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

---

## 💳 Account Management

### Get User Accounts
**GET** `/api/user/accounts`

**Response:**
```json
{
  "accounts": [
    {
      "id": "account_id",
      "accountNumber": "0506111234",
      "accountType": "SAVINGS",
      "balance": "1000.00",
      "currency": "USD",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "recentTransactions": [
        {
          "id": "transaction_id",
          "type": "CREDIT",
          "amount": "500.00",
          "description": "Salary deposit",
          "status": "COMPLETED",
          "createdAt": "2024-01-15T10:30:00Z"
        }
      ]
    }
  ],
  "totalBalance": "1000.00",
  "accountCount": 1
}
```

### Get Account Details
**GET** `/api/user/accounts/{accountId}`

**Response:**
```json
{
  "account": {
    "id": "account_id",
    "accountNumber": "0506111234",
    "accountType": "SAVINGS",
    "balance": "1000.00",
    "currency": "USD",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "statistics": {
      "totalTransactions": 25,
      "totalCredits": "2500.00",
      "totalDebits": "1500.00",
      "averageBalance": "1200.00"
    },
    "transactions": [
      {
        "id": "transaction_id",
        "type": "CREDIT",
        "amount": "500.00",
        "description": "Salary deposit",
        "status": "COMPLETED",
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

## 💰 Transactions

### Get Transactions
**GET** `/api/transactions`

**Query Parameters:**
- `accountId` (optional): Filter by account
- `type` (optional): CREDIT, DEBIT, TRANSFER, WITHDRAWAL, DEPOSIT
- `status` (optional): PENDING, COMPLETED, FAILED, CANCELLED
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date

**Response:**
```json
{
  "transactions": [
    {
      "id": "transaction_id",
      "type": "CREDIT",
      "amount": "500.00",
      "description": "Salary deposit",
      "reference": "TXN1234567890",
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:30:00Z",
      "account": {
        "accountNumber": "0506111234",
        "accountType": "SAVINGS"
      }
    }
  ],
  "statistics": {
    "totalAmount": "500.00",
    "totalCredits": "500.00",
    "totalDebits": "0.00"
  },
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 25,
    "totalPages": 2
  }
}
```

### Create Transaction
**POST** `/api/transactions`

**Request Body:**
```json
{
  "accountId": "account_id",
  "type": "TRANSFER",
  "amount": "100.00",
  "description": "Transfer to savings",
  "recipientAccountId": "recipient_account_id"
}
```

**Response:**
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "transaction_id",
    "type": "TRANSFER",
    "amount": "100.00",
    "description": "Transfer to savings",
    "reference": "TXN1234567890",
    "status": "COMPLETED",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📈 Fixed Deposits

### Get Fixed Deposits
**GET** `/api/fixed-deposits`

**Response:**
```json
{
  "fixedDeposits": [
    {
      "id": "deposit_id",
      "amount": "5000.00",
      "interestRate": "9.0",
      "duration": 12,
      "maturityDate": "2025-01-15T00:00:00Z",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T00:00:00Z",
      "currentValue": "5450.00",
      "interestEarned": "450.00",
      "daysRemaining": 365
    }
  ]
}
```

### Create Fixed Deposit
**POST** `/api/fixed-deposits`

**Request Body:**
```json
{
  "accountId": "account_id",
  "amount": "5000.00",
  "duration": 12
}
```

**Response:**
```json
{
  "message": "Fixed deposit created successfully",
  "fixedDeposit": {
    "id": "deposit_id",
    "amount": "5000.00",
    "interestRate": "9.0",
    "duration": 12,
    "maturityDate": "2025-01-15T00:00:00Z",
    "status": "ACTIVE",
    "createdAt": "2024-01-15T00:00:00Z"
  }
}
```

### Get Interest Rates
**GET** `/api/interest-rates`

**Response:**
```json
{
  "availableRates": {
    "3_months": {
      "rate": 6.5,
      "minAmount": 100,
      "name": "3 Months"
    },
    "6_months": {
      "rate": 7.5,
      "minAmount": 100,
      "name": "6 Months"
    },
    "12_months": {
      "rate": 9.0,
      "minAmount": 100,
      "name": "12 Months"
    },
    "24_months": {
      "rate": 10.0,
      "minAmount": 100,
      "name": "24 Months"
    }
  }
}
```

---

## 💳 Cards

### Get User Cards
**GET** `/api/cards`

**Response:**
```json
{
  "cards": [
    {
      "id": "card_id",
      "cardNumber": "4111111111111111",
      "cardType": "VIRTUAL",
      "expiryDate": "2027-01-15T00:00:00Z",
      "isActive": true,
      "dailyLimit": "1000.00",
      "monthlyLimit": "5000.00",
      "createdAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

### Generate Card
**POST** `/api/cards`

**Request Body:**
```json
{
  "cardType": "VIRTUAL",
  "dailyLimit": 1000,
  "monthlyLimit": 5000,
  "isPhysical": false
}
```

**Response:**
```json
{
  "message": "Virtual card generated successfully",
  "card": {
    "id": "card_id",
    "cardNumber": "4111111111111111",
    "cardType": "VIRTUAL",
    "expiryDate": "01/27",
    "cvv": "123",
    "isActive": true,
    "dailyLimit": "1000.00",
    "monthlyLimit": "5000.00",
    "createdAt": "2024-01-15T00:00:00Z",
    "cardHolderName": "John Doe",
    "isPhysical": false
  }
}
```

---

## 📋 E-Checks

### Get E-Checks
**GET** `/api/e-checks`

**Query Parameters:**
- `status` (optional): PENDING, CLEARED, REJECTED
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "eChecks": [
    {
      "id": "check_id",
      "checkNumber": "EC123456789",
      "payeeName": "John Smith",
      "amount": "500.00",
      "memo": "Rent payment",
      "status": "PENDING",
      "createdAt": "2024-01-15T10:30:00Z",
      "account": {
        "accountNumber": "0506111234",
        "accountType": "SAVINGS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

### Create E-Check
**POST** `/api/e-checks`

**Request Body:**
```json
{
  "accountId": "account_id",
  "payeeName": "John Smith",
  "amount": "500.00",
  "memo": "Rent payment"
}
```

**Response:**
```json
{
  "message": "E-Check created successfully",
  "eCheck": {
    "id": "check_id",
    "checkNumber": "EC123456789",
    "payeeName": "John Smith",
    "amount": "500.00",
    "memo": "Rent payment",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "account": {
      "accountNumber": "0506111234",
      "accountType": "SAVINGS"
    }
  }
}
```

---

## 📄 KYC Management

### Upload KYC Document
**POST** `/api/kyc/upload`

**Request Body (FormData):**
```
documentType: ID_PROOF
file: [file]
```

**Response:**
```json
{
  "message": "Document uploaded successfully",
  "document": {
    "id": "document_id",
    "documentType": "ID_PROOF",
    "fileUrl": "https://storage.globalbank.com/kyc/document.pdf",
    "status": "PENDING",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get KYC Status
**GET** `/api/kyc/status`

**Response:**
```json
{
  "overallStatus": "PARTIAL",
  "completedDocuments": 2,
  "totalDocuments": 4,
  "documentStatus": {
    "ID_PROOF": {
      "status": "VERIFIED",
      "uploaded": true
    },
    "ADDRESS_PROOF": {
      "status": "VERIFIED",
      "uploaded": true
    },
    "INCOME_PROOF": {
      "status": "PENDING",
      "uploaded": false
    },
    "BANK_STATEMENT": {
      "status": "PENDING",
      "uploaded": false
    }
  }
}
```

---

## 🤖 AI Assistant

### Send Message to AI
**POST** `/api/ai/chat`

**Request Body:**
```json
{
  "message": "What are the fixed deposit rates?",
  "category": "GENERAL_QUERY"
}
```

**Response:**
```json
{
  "response": "Here are our competitive fixed deposit rates...",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Get Chat History
**GET** `/api/ai/chat`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "interactions": [
    {
      "id": "interaction_id",
      "message": "What are the fixed deposit rates?",
      "response": "Here are our competitive fixed deposit rates...",
      "category": "GENERAL_QUERY",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 15,
    "totalPages": 1
  }
}
```

---

## 👨‍💼 Admin APIs

### Get Admin Dashboard
**GET** `/api/admin/dashboard`

**Response:**
```json
{
  "statistics": {
    "totalUsers": 1250,
    "activeUsers": 980,
    "totalAccounts": 1500,
    "totalTransactions": 5000,
    "totalFixedDeposits": 300,
    "pendingKyc": 45,
    "totalCards": 800,
    "systemBalance": "2500000.00"
  },
  "recentUsers": [
    {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "kycStatus": "VERIFIED",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "recentTransactions": [
    {
      "id": "transaction_id",
      "type": "CREDIT",
      "amount": "500.00",
      "description": "Salary deposit",
      "status": "COMPLETED",
      "createdAt": "2024-01-15T10:30:00Z",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "account": {
        "accountNumber": "0506111234",
        "accountType": "SAVINGS"
      }
    }
  ]
}
```

### Get KYC Documents (Admin)
**GET** `/api/admin/kyc`

**Query Parameters:**
- `status` (optional): PENDING, VERIFIED, REJECTED
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "documents": [
    {
      "id": "document_id",
      "documentType": "ID_PROOF",
      "status": "PENDING",
      "fileUrl": "https://storage.globalbank.com/kyc/document.pdf",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "kycStatus": "PENDING"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 45,
    "totalPages": 3
  }
}
```

### Review KYC Document (Admin)
**PUT** `/api/admin/kyc`

**Request Body:**
```json
{
  "documentId": "document_id",
  "status": "VERIFIED",
  "comments": "Document verified successfully"
}
```

**Response:**
```json
{
  "message": "KYC document reviewed successfully",
  "document": {
    "id": "document_id",
    "status": "VERIFIED",
    "verifiedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Disputes (Admin)
**GET** `/api/admin/disputes`

**Query Parameters:**
- `status` (optional): PENDING, UNDER_REVIEW, RESOLVED, REJECTED
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "disputes": [
    {
      "id": "transaction_id",
      "type": "DEBIT",
      "amount": "100.00",
      "description": "Suspicious transaction",
      "disputeReason": "Unauthorized transaction",
      "disputeStatus": "PENDING",
      "disputeCreatedAt": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user_id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com"
      },
      "account": {
        "accountNumber": "0506111234",
        "accountType": "SAVINGS"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalCount": 5,
    "totalPages": 1
  }
}
```

### Resolve Dispute (Admin)
**PUT** `/api/admin/disputes`

**Request Body:**
```json
{
  "transactionId": "transaction_id",
  "status": "RESOLVED",
  "resolution": "Refund processed"
}
```

**Response:**
```json
{
  "message": "Dispute resolved successfully",
  "dispute": {
    "id": "transaction_id",
    "disputeStatus": "RESOLVED",
    "disputeResolution": "Refund processed",
    "disputeResolvedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📊 Analytics

### Get User Analytics
**GET** `/api/analytics`

**Query Parameters:**
- `period` (optional): Number of days (default: 30)

**Response:**
```json
{
  "financialOverview": {
    "totalBalance": "10000.00",
    "totalFixedDeposits": "5000.00",
    "totalCards": 3,
    "accountCount": 2
  },
  "transactionAnalytics": {
    "totalTransactions": 25,
    "totalIncome": "2500.00",
    "totalExpenses": "1500.00",
    "averageTransaction": "160.00"
  },
  "interestEarnings": {
    "savingsInterest": "45.00",
    "fixedDepositInterest": "450.00",
    "totalInterest": "495.00"
  },
  "growthMetrics": {
    "balanceGrowth": "15.5",
    "transactionGrowth": "25.0",
    "depositGrowth": "10.0"
  },
  "recentActivity": [
    {
      "date": "2024-01-15",
      "transactions": 5,
      "amount": "500.00"
    }
  ]
}
```

---

## 🔧 Error Codes

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Common Error Messages
```json
{
  "error": "Missing required fields",
  "status": 400
}
```

```json
{
  "error": "Invalid credentials",
  "status": 401
}
```

```json
{
  "error": "Insufficient balance",
  "status": 400
}
```

```json
{
  "error": "KYC verification required",
  "status": 400
}
```

---

## 📝 Rate Limits

### API Rate Limits
- **Authentication**: 5 requests per minute
- **Transactions**: 10 requests per minute
- **Card Generation**: 3 requests per hour
- **AI Chat**: 20 requests per minute
- **General APIs**: 100 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642233600
```

---

## 🔒 Security

### Authentication
- JWT tokens with 24-hour expiry
- Refresh token mechanism
- Secure token storage
- Automatic token refresh

### Data Protection
- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest
- Input validation and sanitization
- SQL injection prevention

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

**Last Updated**: December 19, 2024  
**API Version**: 1.0.0  
**Base URL**: https://api.globalbank.com 