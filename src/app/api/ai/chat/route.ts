import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const POST = async (request: NextRequest) => {
  try {
    const { message, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simple AI response logic
    let response = '';
    
    if (message.toLowerCase().includes('balance') || message.toLowerCase().includes('account')) {
      response = "I can help you check your account balance and details. You can view your current balance, recent transactions, and account information in your dashboard. Is there anything specific about your account you'd like to know?";
    } else if (message.toLowerCase().includes('transfer') || message.toLowerCase().includes('send money')) {
      response = "I can assist you with money transfers. You can transfer funds between your accounts or to other Global Dot Bank customers. Please use the transfer feature in your dashboard for secure transactions.";
    } else if (message.toLowerCase().includes('card') || message.toLowerCase().includes('debit')) {
      response = "Your debit card is linked to your checking account and can be used for purchases and ATM withdrawals. You can view your card details and manage limits in the Cards section of your dashboard.";
    } else if (message.toLowerCase().includes('fixed deposit') || message.toLowerCase().includes('investment')) {
      response = "Fixed deposits are a great way to earn higher interest on your savings. You can open a new fixed deposit or view your existing ones in the Investments section. Current rates start at 5.5% APY.";
    } else if (message.toLowerCase().includes('security') || message.toLowerCase().includes('fraud')) {
      response = "Your account security is our top priority. We use advanced encryption and monitoring systems. If you notice any suspicious activity, please contact our security team immediately at security@globaldotbank.org.";
    } else if (message.toLowerCase().includes('help') || message.toLowerCase().includes('support')) {
      response = "I'm here to help! You can ask me about your account, transactions, cards, investments, or security. For urgent matters, contact our 24/7 support at +1-800-GLOBAL or support@globaldotbank.org.";
    } else {
      response = "Hello! I'm Bank Bugger AI, your personal banking assistant. I can help you with account information, transfers, card management, investments, and security questions. How can I assist you today?";
    }

    // Save interaction to database if userId is provided
    if (userId) {
      try {
        await prisma.aiInteraction.create({
          data: {
            userId,
            message,
            response,
            category: 'GENERAL_QUERY'
          }
        });
      } catch (error) {
        console.error('Error saving AI interaction:', error);
      }
    }

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
};
