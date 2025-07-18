import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, userId, conversationHistory = [] } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Message and userId are required' },
        { status: 400 }
      );
    }

    // Get user's account information for context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        accounts: {
          include: {
            transactions: {
              take: 5,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Build context from user's banking data
    const accountInfo = user.accounts.map(account => ({
      type: account.accountType,
      balance: account.balance,
      currency: account.currency,
      recentTransactions: account.transactions.length
    }));

    // Create system prompt with banking context
    const systemPrompt = `You are Bank Bugger, an AI banking assistant for Global Bank. You help users with:

1. Account inquiries and balance checks
2. Transaction explanations and history
3. Banking procedures and how-to guides
4. Financial advice and education
5. Security tips and fraud prevention
6. Investment guidance
7. Card and payment issues

User Context:
- Name: ${user.firstName} ${user.lastName}
- Email: ${user.email}
- KYC Status: ${user.kycStatus}
- Accounts: ${accountInfo.length} account(s)
${accountInfo.map(acc => `  - ${acc.type} account: ${acc.balance} ${acc.currency} (${acc.recentTransactions} recent transactions)`).join('\n')}

Guidelines:
- Be helpful, friendly, and professional
- Provide accurate banking information
- If asked about specific transactions, refer to their recent activity
- For security-sensitive operations, guide them to proper channels
- Keep responses concise but informative
- Use emojis sparingly but appropriately
- If you don't know something specific about their account, suggest they check their dashboard or contact support

Current conversation context: ${conversationHistory.length} previous messages`;

    // Prepare conversation for OpenAI
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      { role: 'user' as const, content: message }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || 'Sorry, I couldn\'t process your request.';

    // Save interaction to database
    await prisma.aiInteraction.create({
      data: {
        userId,
        message,
        response,
        category: 'GENERAL'
      }
    });

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in AI chat:', error);
    
    // Fallback response if OpenAI fails
    const fallbackResponse = `I'm sorry, I'm having trouble connecting to my AI services right now. Here are some things you can do:

1. Check your account balance and transactions in your dashboard
2. For urgent matters, contact our support team
3. Try asking your question again in a moment

If this persists, please contact our customer service.`;

    return NextResponse.json({
      response: fallbackResponse,
      timestamp: new Date().toISOString()
    });
  }
}

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