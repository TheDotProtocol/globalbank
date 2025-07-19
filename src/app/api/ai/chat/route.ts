import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

// Mock AI responses for common banking queries
const MOCK_RESPONSES = {
  default: "Hello! I'm Bank Bugger, your AI banking assistant. How can I help you today? I can assist with account inquiries, transaction explanations, financial advice, and more!",
  
  balance: "I can help you check your account balance. You can view your current balance in the dashboard overview section, or click on any account to see detailed information including transaction history.",
  
  transfer: "To make a transfer, you can use the 'Send Money' feature in the Quick Actions section. Make sure you have the recipient's account details and sufficient funds in your account.",
  
  card: "I can help you with card-related queries. You can create virtual cards, check card status, or report lost/stolen cards through the dashboard. Virtual cards are great for online shopping security!",
  
  security: "Your security is our top priority! Always keep your login credentials secure, never share your card details, and enable two-factor authentication if available. Report any suspicious activity immediately.",
  
  investment: "For investment advice, I recommend consulting with a financial advisor. However, I can help explain different investment options like fixed deposits, which you can set up through the dashboard.",
  
  fees: "Our fee structure is transparent and competitive. Most basic transactions are free, while premium services may have nominal charges. You can check specific fees in the account details section.",
  
  support: "For immediate assistance, you can contact our customer support team. I'm here to help with general queries, but for account-specific issues, our human support team is available 24/7."
};

function getMockResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('balance') || lowerMessage.includes('money') || lowerMessage.includes('account')) {
    return MOCK_RESPONSES.balance;
  }
  if (lowerMessage.includes('transfer') || lowerMessage.includes('send') || lowerMessage.includes('payment')) {
    return MOCK_RESPONSES.transfer;
  }
  if (lowerMessage.includes('card') || lowerMessage.includes('credit') || lowerMessage.includes('debit')) {
    return MOCK_RESPONSES.card;
  }
  if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('protect')) {
    return MOCK_RESPONSES.security;
  }
  if (lowerMessage.includes('invest') || lowerMessage.includes('deposit') || lowerMessage.includes('savings')) {
    return MOCK_RESPONSES.investment;
  }
  if (lowerMessage.includes('fee') || lowerMessage.includes('charge') || lowerMessage.includes('cost')) {
    return MOCK_RESPONSES.fees;
  }
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('contact')) {
    return MOCK_RESPONSES.support;
  }
  
  return MOCK_RESPONSES.default;
}

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

    // Use mock response instead of OpenAI
    const aiResponse = getMockResponse(message);

    return NextResponse.json({
      response: aiResponse,
      category
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
});
