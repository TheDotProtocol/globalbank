import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// AI Knowledge Base for Banking
const BANKING_KNOWLEDGE = {
  fixedDeposits: {
    rates: {
      '3_months': { rate: 6.5, minAmount: 100, name: '3 Months' },
      '6_months': { rate: 7.5, minAmount: 100, name: '6 Months' },
      '12_months': { rate: 9.0, minAmount: 100, name: '12 Months' },
      '24_months': { rate: 10.0, minAmount: 100, name: '24 Months' }
    },
    benefits: [
      'Higher interest rates than regular savings',
      'Guaranteed returns',
      'No market risk',
      'Perfect for short to medium-term goals'
    ],
    tips: [
      'Consider your liquidity needs before choosing duration',
      'Longer terms offer higher rates',
      'Minimum investment is only $100',
      'Interest is calculated monthly'
    ]
  },
  savings: {
    tiers: {
      'BASIC': { minBalance: 0, maxBalance: 500, rate: 4.5 },
      'STANDARD': { minBalance: 500, maxBalance: 2000, rate: 5.5 },
      'PREMIUM': { minBalance: 2000, maxBalance: null, rate: 6.0 }
    },
    benefits: [
      'Easy access to your money',
      'No minimum balance requirements',
      'Tiered interest rates',
      'No withdrawal penalties'
    ]
  },
  security: [
    'Enable two-factor authentication',
    'Use strong, unique passwords',
    'Never share your credentials',
    'Monitor your accounts regularly',
    'Report suspicious activity immediately'
  ],
  general: {
    features: [
      'Fixed Deposits with competitive rates',
      'Savings accounts with tiered interest',
      'Virtual cards for secure payments',
      'KYC verification for enhanced security',
      'Real-time transaction monitoring'
    ]
  }
};

// AI Response Generator
function generateAIResponse(message: string, userContext?: any): string {
  const lowerMessage = message.toLowerCase();
  
  // Fixed Deposits
  if (lowerMessage.includes('fixed deposit') || lowerMessage.includes('fd') || lowerMessage.includes('term deposit')) {
    if (lowerMessage.includes('rate') || lowerMessage.includes('interest')) {
      return `Here are our competitive fixed deposit rates:

**Fixed Deposit Interest Rates:**
• 3 Months: **6.5% p.a.** (Minimum $100)
• 6 Months: **7.5% p.a.** (Minimum $100) 
• 12 Months: **9.0% p.a.** (Minimum $100)
• 24 Months: **10.0% p.a.** (Minimum $100)

**Key Benefits:**
✅ Higher returns than regular savings
✅ Guaranteed interest rates
✅ No market risk
✅ Perfect for financial goals

**Pro Tips:**
• Longer terms = higher rates
• Minimum investment is only $100
• Interest is calculated monthly
• You can create multiple deposits

Would you like me to help you create a fixed deposit or explain more about any specific duration?`;
    }
    
    if (lowerMessage.includes('how') || lowerMessage.includes('create') || lowerMessage.includes('open')) {
      return `Creating a fixed deposit is easy! Here's how:

**Steps to Create a Fixed Deposit:**

1. **Navigate to Fixed Deposits** - Click the "Fixed Deposits" tab in your dashboard
2. **Click "New Deposit"** - This opens the creation form
3. **Choose Amount** - Minimum $100, no maximum limit
4. **Select Duration** - 3, 6, 12, or 24 months
5. **Review & Confirm** - Check the interest rate and maturity date
6. **Submit** - Your deposit is created instantly!

**Requirements:**
• Active savings account with sufficient balance
• KYC verification completed
• Minimum $100 investment

**What Happens Next:**
• Amount is transferred from your savings to the fixed deposit
• Interest starts accruing immediately
• You can track progress in the dashboard
• Automatic maturity notification

The process takes less than 2 minutes! Would you like me to walk you through it step by step?`;
    }
    
    return `**Fixed Deposits** are a great way to earn higher interest on your savings!

**What are Fixed Deposits?**
Fixed deposits let you lock your money for a specific period (3-24 months) and earn guaranteed higher interest rates than regular savings accounts.

**Our Rates:**
• 3 Months: 6.5% p.a.
• 6 Months: 7.5% p.a.  
• 12 Months: 9.0% p.a.
• 24 Months: 10.0% p.a.

**Perfect for:**
• Short-term savings goals
• Emergency fund building
• Higher returns on idle money
• Risk-free investment

Would you like to know more about rates, how to create one, or compare with savings accounts?`;
  }
  
  // Savings Accounts
  if (lowerMessage.includes('savings') || lowerMessage.includes('saving account')) {
    if (lowerMessage.includes('rate') || lowerMessage.includes('interest')) {
      return `**Savings Account Interest Rates:**

We offer tiered interest rates based on your balance:

**Tier System:**
• **Basic Tier** ($0 - $500): **4.5% p.a.**
• **Standard Tier** ($500 - $2,000): **5.5% p.a.**
• **Premium Tier** ($2,000+): **6.0% p.a.**

**How it Works:**
✅ Your entire balance earns the rate for your tier
✅ No minimum balance requirements
✅ Interest calculated daily, paid monthly
✅ Automatic tier upgrades as your balance grows

**Example:**
If you have $1,500 in savings, you earn 5.5% on the entire amount!

**Pro Tip:** Consider fixed deposits for amounts you won't need immediately - they offer even higher rates (up to 10% p.a.)!

Would you like me to help you calculate potential earnings or explain how to reach the next tier?`;
    }
    
    return `**Savings Accounts** are your foundation for financial growth!

**Key Features:**
✅ **Tiered Interest Rates** - Earn more as you save more
✅ **No Minimum Balance** - Start with any amount
✅ **Easy Access** - Withdraw anytime without penalties
✅ **Daily Interest** - Your money works harder for you

**Interest Tiers:**
• Basic ($0-$500): 4.5% p.a.
• Standard ($500-$2,000): 5.5% p.a.
• Premium ($2,000+): 6.0% p.a.

**Perfect for:**
• Emergency funds
• Short-term goals
• Regular savings
• Easy access to money

Would you like to know more about interest rates, how to maximize earnings, or compare with fixed deposits?`;
  }
  
  // Security
  if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('protect')) {
    return `**Security is our top priority!** 🔒

**How We Protect You:**

**Account Security:**
• **Two-Factor Authentication (2FA)** - Extra layer of protection
• **Encrypted Data** - All information is encrypted
• **Secure Login** - Advanced authentication systems
• **Session Management** - Automatic logout for inactivity

**Transaction Security:**
• **Real-time Monitoring** - Detect suspicious activity instantly
• **Fraud Protection** - Advanced algorithms protect your money
• **Secure Transfers** - All transactions are encrypted
• **Transaction Limits** - Customizable spending limits

**Your Security Checklist:**
✅ Enable 2FA on your account
✅ Use a strong, unique password
✅ Never share your login credentials
✅ Monitor your accounts regularly
✅ Report suspicious activity immediately
✅ Keep your contact information updated

**Additional Features:**
• Virtual cards for online purchases
• KYC verification for enhanced security
• Transaction dispute system
• Real-time alerts for all activities

**Pro Tip:** Consider using virtual cards for online purchases - they're more secure than physical cards!

Would you like me to help you set up additional security features or explain any specific security measures?`;
  }
  
  // General Banking
  if (lowerMessage.includes('feature') || lowerMessage.includes('service') || lowerMessage.includes('what can')) {
    return `**Welcome to GlobalBank!** 🏦

Here's what we offer to help you manage your finances:

**Core Banking Features:**
✅ **Savings Accounts** - Tiered interest rates (4.5% - 6.0% p.a.)
✅ **Fixed Deposits** - High-yield investments (6.5% - 10.0% p.a.)
✅ **Virtual Cards** - Secure digital payments
✅ **Real-time Transfers** - Instant money movement
✅ **Transaction History** - Detailed financial tracking

**Advanced Features:**
✅ **KYC Verification** - Enhanced security and higher limits
✅ **Interest Calculators** - Plan your investments
✅ **Financial Dashboard** - Complete overview of your finances
✅ **Mobile Banking** - Bank anywhere, anytime
✅ **24/7 Support** - We're here when you need us

**Investment Options:**
• **Savings Accounts** - Flexible, liquid savings
• **Fixed Deposits** - Higher returns for longer terms
• **Interest Tiers** - Earn more as you save more

**Security Features:**
• Two-factor authentication
• Encrypted transactions
• Fraud protection
• Real-time monitoring

**Pro Tip:** Start with a savings account for flexibility, then consider fixed deposits for higher returns on money you won't need immediately!

What would you like to explore first? I can help you with any of these features!`;
  }
  
  // Interest Calculation
  if (lowerMessage.includes('calculate') || lowerMessage.includes('earn') || lowerMessage.includes('return')) {
    return `**Let me help you calculate potential earnings!** 📊

**Savings Account Earnings:**
• **$1,000 balance** at 5.5% = **$55/year** ($4.58/month)
• **$5,000 balance** at 6.0% = **$300/year** ($25/month)
• **$10,000 balance** at 6.0% = **$600/year** ($50/month)

**Fixed Deposit Earnings:**
• **$1,000 for 12 months** at 9.0% = **$90 interest**
• **$5,000 for 24 months** at 10.0% = **$1,000 interest**
• **$2,000 for 6 months** at 7.5% = **$75 interest**

**Quick Calculation Formula:**
\`\`\`
Interest = Principal * Rate * Time
Example: $1,000 * 9% * 1 year = $90
\`\`\`

**Pro Tips for Maximizing Returns:**
1. **Use Fixed Deposits** for money you won't need soon
2. **Maintain higher balances** to reach premium savings tiers
3. **Consider longer terms** for higher fixed deposit rates
4. **Compound interest** works in your favor over time

**Comparison Example:**
• $5,000 in savings (6.0%): $300/year
• $5,000 in fixed deposit (10.0%): $500/year
• **Difference: $200 more with fixed deposit!**

Would you like me to calculate earnings for a specific amount or help you choose the best option for your goals?`;
  }
  
  // General Help
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
    return `**I'm here to help!** 🤝

**What I can assist you with:**

**📊 Financial Planning:**
• Calculate potential earnings
• Compare savings vs fixed deposits
• Explain interest rates and tiers
• Help choose the right investment

**🏦 Banking Features:**
• How to create fixed deposits
• Understanding savings tiers
• Setting up virtual cards
• Managing your accounts

**🔒 Security:**
• Account protection tips
• Setting up 2FA
• Understanding security features
• Reporting issues

**💡 Financial Education:**
• Understanding interest rates
• Investment strategies
• Money management tips
• Banking best practices

**Quick Actions:**
• Ask about "fixed deposit rates"
• Say "calculate earnings" for interest calculations
• Type "security tips" for protection advice
• Use "savings tiers" to understand rates

**Pro Tip:** I can provide personalized advice based on your account information and financial goals!

What specific area would you like help with? I'm here to make banking easier for you!`;
  }
  
  // Default Response
  return `**Hello! I'm BankBugger AI, your personal banking assistant!** 🤖

I'm here to help you with all things banking at GlobalBank. Here's what I can do:

**💡 I can help you with:**
• **Fixed Deposits** - Learn about rates, create deposits, calculate earnings
• **Savings Accounts** - Understand tiers, interest rates, maximize returns
• **Security** - Account protection, fraud prevention, safety tips
• **Calculations** - Interest earnings, investment returns, comparisons
• **General Banking** - Features, services, account management

**🚀 Quick Start:**
Try asking me about:
• "What are the fixed deposit rates?"
• "How do I create a fixed deposit?"
• "Calculate earnings on $5,000"
• "Savings account interest tiers"
• "Security tips for my account"

**Pro Tip:** I provide detailed, helpful responses with examples and actionable advice - just like a real banking expert!

What would you like to know about today? I'm excited to help you make the most of your banking experience! 🏦`;
}

// AI Chat API
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { message, category = 'GENERAL_QUERY' } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user context (accounts, deposits, etc.)
    const userContext = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        accounts: true,
        fixedDeposits: {
          where: { status: 'ACTIVE' }
        }
      }
    });

    // Generate AI response
    const aiResponse = generateAIResponse(message, userContext);

    // Save interaction to database
    await prisma.aiInteraction.create({
      data: {
        userId: user.id,
        message,
        response: aiResponse,
        category: category as any
      }
    });

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Get chat history
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const interactions = await prisma.aiInteraction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalCount = await prisma.aiInteraction.count({
      where: { userId: user.id }
    });

    return NextResponse.json({
      interactions: interactions.map(interaction => ({
        id: interaction.id,
        message: interaction.message,
        response: interaction.response,
        category: interaction.category,
        createdAt: interaction.createdAt
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 