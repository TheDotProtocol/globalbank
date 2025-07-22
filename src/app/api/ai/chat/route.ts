import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { message, userContext } = await request.json();

    console.log('🔍 AI chat request from:', user.email);

    // Enhanced system prompt for conversational banking
    const systemPrompt = `You are a friendly, knowledgeable virtual banker for Global Dot Bank. Your name is Alex, and you're here to provide personalized banking assistance.

Key Guidelines:
1. Be conversational and natural - like talking to a real banker
2. Use the customer's first name when appropriate
3. Provide specific, actionable advice based on their account data
4. Be knowledgeable about banking products, rates, and services
5. Offer cross-selling suggestions when relevant
6. Explain complex financial concepts in simple terms
7. Be empathetic and understanding of financial concerns

Banking Knowledge:
- Current Savings Account Rate: 3.5% APY (higher than most traditional banks)
- Fixed Deposit Rates: 5.5% for 24 months, 6.2% for 36 months
- Transfer fees: Free for internal transfers, $2 for external transfers
- Minimum balance: No minimum required for savings accounts
- Mobile banking: Available 24/7 with real-time notifications

User Context: ${JSON.stringify(userContext)}

Remember: You're not just an AI - you're their personal banker who cares about their financial success. Be warm, professional, and genuinely helpful.`;

    // Enhanced user prompt with context
    const userPrompt = `Customer Message: "${message}"

Please respond as their personal banker, using their account information when relevant. Be conversational, helpful, and provide specific advice based on their situation.`;

    // For now, we'll use a simple response system
    // In production, this would integrate with OpenAI or another AI service
    const response = generateAIResponse(message, userContext, systemPrompt);

    return NextResponse.json({
      success: true,
      response: response
    });

  } catch (error: any) {
    console.error('❌ AI chat error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI chat request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

function generateAIResponse(message: string, userContext: any, systemPrompt: string): string {
  const lowerMessage = message.toLowerCase();
  const firstName = userContext?.firstName || 'there';

  // Account-related queries
  if (lowerMessage.includes('balance') || lowerMessage.includes('account')) {
    const totalBalance = userContext?.accounts?.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance), 0) || 0;
    return `Hey ${firstName}! 👋 I can see your total account balance is $${totalBalance.toLocaleString()}. 

Your accounts are looking great! 💰 Here's a quick breakdown:
${userContext?.accounts?.map((acc: any) => `• ${acc.accountType}: $${parseFloat(acc.balance).toLocaleString()}`).join('\n')}

Is there anything specific about your accounts you'd like to know? I can help you with transfers, setting up new accounts, or even optimizing your savings strategy!`;
  }

  // Transfer-related queries
  if (lowerMessage.includes('transfer') || lowerMessage.includes('send money') || lowerMessage.includes('payment')) {
    return `Great question, ${firstName}! 💸 I can help you with transfers. Here are your options:

**Internal Transfers (Global Dot Bank):**
• Free transfers between your accounts
• Instant processing
• Available 24/7

**External Transfers:**
• $2 fee per transfer
• 1-2 business days processing
• Need recipient's account number and bank details

**International Transfers:**
• Competitive rates starting at 1.5%
• 2-3 business days
• Need SWIFT/BIC codes

Would you like me to walk you through setting up a transfer? I can also help you find the best option for your specific needs!`;
  }

  // Investment/FD queries
  if (lowerMessage.includes('investment') || lowerMessage.includes('fixed deposit') || lowerMessage.includes('fd') || lowerMessage.includes('interest')) {
    const fdCount = userContext?.fixedDeposits?.length || 0;
    return `Excellent question about investments, ${firstName}! 📈 

Our fixed deposits are currently offering some of the best rates in the market:
• **24 months**: 5.5% APY
• **36 months**: 6.2% APY
• **Minimum deposit**: $100

I can see you have ${fdCount} active fixed deposit${fdCount !== 1 ? 's' : ''}. That's a smart move for growing your wealth! 💪

**Why our rates are better:**
• Higher than most traditional banks (they typically offer 1-3%)
• No hidden fees or penalties
• Flexible terms and early withdrawal options
• Fully insured and secure

Would you like to explore opening a new fixed deposit? I can help you calculate potential returns or compare different terms!`;
  }

  // General banking questions
  if (lowerMessage.includes('rate') || lowerMessage.includes('interest rate')) {
    return `Hey ${firstName}! 💰 Let me break down our competitive rates for you:

**Savings Account**: 3.5% APY
• No minimum balance required
• Interest paid monthly
• Much higher than traditional banks (they usually offer 0.01-0.5%)

**Fixed Deposits**:
• 12 months: 4.8% APY
• 24 months: 5.5% APY  
• 36 months: 6.2% APY

**Why we can offer better rates:**
• Lower overhead costs (digital-first approach)
• Efficient operations
• Focus on customer value

These rates are among the best in the industry! Would you like me to help you maximize your returns?`;
  }

  // Transaction history
  if (lowerMessage.includes('transaction') || lowerMessage.includes('history') || lowerMessage.includes('statement')) {
    const recentCount = userContext?.recentTransactions?.length || 0;
    return `Of course, ${firstName}! 📊 I can help you with your transaction history.

You have ${recentCount} recent transactions. You can:
• View detailed transaction history in the Transactions tab
• Download statements as PDF
• Filter by date, amount, or transaction type
• Export data for accounting purposes

**Pro tip**: Set up transaction alerts to stay on top of your spending! I can help you configure notifications for large transactions or low balance alerts.

Is there a specific transaction you're looking for, or would you like help understanding your spending patterns?`;
  }

  // General greeting or casual conversation
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('how are you')) {
    return `Hey ${firstName}! 👋 I'm doing great, thanks for asking! 

I'm here to help you with anything banking-related - whether it's checking your accounts, making transfers, exploring investment options, or just chatting about your financial goals. 

How can I assist you today? I'm your personal banker, so don't hesitate to ask anything! 😊`;
  }

  // Help or support
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
    return `I'm here to help, ${firstName}! 🤝 

I can assist you with:
• **Account management**: Check balances, view transactions, update details
• **Transfers**: Internal, external, and international transfers
• **Investments**: Fixed deposits, interest rates, investment advice
• **Security**: Account security, fraud prevention, password changes
• **General banking**: Rates, fees, policies, and procedures

If I can't solve your issue directly, I can connect you with our human support team who are available 24/7.

What specific help do you need? I'm here to make your banking experience as smooth as possible!`;
  }

  // Default response for unrecognized queries
  return `Thanks for your message, ${firstName}! 🤔 

I'm here to help with all your banking needs. I can assist with:
• Checking account balances and transactions
• Setting up transfers and payments
• Exploring investment options and rates
• Answering questions about our services
• Providing financial advice and guidance

Could you please rephrase your question or let me know what specific banking assistance you need? I'm your personal banker and I'm here to help! 😊`;
}
