import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Enhanced AI Personality and Emotional Intelligence
interface AIState {
  mood: 'friendly' | 'excited' | 'concerned' | 'professional' | 'casual';
  conversationTone: 'formal' | 'casual' | 'encouraging' | 'empathetic';
  userRelationship: 'new' | 'acquainted' | 'familiar' | 'trusted';
  lastInteraction: Date;
  conversationCount: number;
  userPreferences: {
    prefersFormal: boolean;
    likesEmojis: boolean;
    financialGoals: string[];
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  };
}

// Global AI state (in production, this would be stored per user in database)
const aiStates = new Map<string, AIState>();

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { message, userContext, conversationHistory = [] } = await request.json();

    console.log('🧠 BankBugger AI request from:', user.email);

    // Initialize or get AI state for this user
    let aiState = aiStates.get(user.email);
    if (!aiState) {
      aiState = {
        mood: 'friendly',
        conversationTone: 'casual',
        userRelationship: 'new',
        lastInteraction: new Date(),
        conversationCount: 0,
        userPreferences: {
          prefersFormal: false,
          likesEmojis: true,
          financialGoals: [],
          riskTolerance: 'moderate'
        }
      };
      aiStates.set(user.email, aiState);
    }

    // Update AI state
    aiState.conversationCount++;
    aiState.lastInteraction = new Date();

    // Analyze user's emotional state and intent
    const emotionalAnalysis = analyzeUserEmotion(message);
    const intent = analyzeUserIntent(message);
    
    // Adjust AI personality based on user's emotional state
    adjustAIPersonality(aiState, emotionalAnalysis, intent);

    // Generate contextual response
    const response = generateEnhancedAIResponse(
      message, 
      userContext, 
      aiState, 
      emotionalAnalysis, 
      intent,
      conversationHistory
    );

    // Update user preferences based on this interaction
    updateUserPreferences(aiState, message, emotionalAnalysis);

    return NextResponse.json({
      success: true,
      response: response,
      aiState: {
        mood: aiState.mood,
        tone: aiState.conversationTone,
        relationship: aiState.userRelationship
      }
    });

  } catch (error: any) {
    console.error('❌ BankBugger AI error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI chat request', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

// Enhanced emotional analysis
function analyzeUserEmotion(message: string): {
  emotion: 'happy' | 'frustrated' | 'anxious' | 'excited' | 'neutral' | 'concerned';
  intensity: 'low' | 'medium' | 'high';
  keywords: string[];
} {
  const lowerMessage = message.toLowerCase();
  const keywords: string[] = [];
  
  // Happy indicators
  if (lowerMessage.includes('great') || lowerMessage.includes('awesome') || lowerMessage.includes('amazing') || 
      lowerMessage.includes('thank') || lowerMessage.includes('love') || lowerMessage.includes('perfect')) {
    keywords.push('positive');
    return { emotion: 'happy', intensity: 'medium', keywords };
  }
  
  // Frustrated indicators
  if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('trouble') ||
      lowerMessage.includes('frustrated') || lowerMessage.includes('annoyed') || lowerMessage.includes('angry')) {
    keywords.push('negative');
    return { emotion: 'frustrated', intensity: 'high', keywords };
  }
  
  // Anxious indicators
  if (lowerMessage.includes('worried') || lowerMessage.includes('concerned') || lowerMessage.includes('scared') ||
      lowerMessage.includes('nervous') || lowerMessage.includes('anxious') || lowerMessage.includes('stress')) {
    keywords.push('anxiety');
    return { emotion: 'anxious', intensity: 'medium', keywords };
  }
  
  // Excited indicators
  if (lowerMessage.includes('excited') || lowerMessage.includes('thrilled') || lowerMessage.includes('can\'t wait') ||
      lowerMessage.includes('looking forward') || lowerMessage.includes('awesome news')) {
    keywords.push('excitement');
    return { emotion: 'excited', intensity: 'high', keywords };
  }
  
  // Concerned indicators
  if (lowerMessage.includes('what if') || lowerMessage.includes('is it safe') || lowerMessage.includes('risk') ||
      lowerMessage.includes('secure') || lowerMessage.includes('protect')) {
    keywords.push('concern');
    return { emotion: 'concerned', intensity: 'medium', keywords };
  }
  
  return { emotion: 'neutral', intensity: 'low', keywords };
}

// Enhanced intent analysis
function analyzeUserIntent(message: string): {
  intent: 'information' | 'action' | 'complaint' | 'appreciation' | 'casual' | 'help';
  urgency: 'low' | 'medium' | 'high';
  topics: string[];
} {
  const lowerMessage = message.toLowerCase();
  const topics = [];
  
  // Banking topics
  if (lowerMessage.includes('balance') || lowerMessage.includes('account')) topics.push('account');
  if (lowerMessage.includes('transfer') || lowerMessage.includes('send') || lowerMessage.includes('payment')) topics.push('transfer');
  if (lowerMessage.includes('investment') || lowerMessage.includes('fd') || lowerMessage.includes('interest')) topics.push('investment');
  if (lowerMessage.includes('card') || lowerMessage.includes('debit') || lowerMessage.includes('credit')) topics.push('cards');
  if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('protect')) topics.push('security');
  
  // Intent classification
  if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('where')) {
    return { intent: 'information', urgency: 'medium', topics };
  }
  
  if (lowerMessage.includes('help') || lowerMessage.includes('problem') || lowerMessage.includes('issue')) {
    return { intent: 'help', urgency: 'high', topics };
  }
  
  if (lowerMessage.includes('thank') || lowerMessage.includes('appreciate') || lowerMessage.includes('great')) {
    return { intent: 'appreciation', urgency: 'low', topics };
  }
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('how are you')) {
    return { intent: 'casual', urgency: 'low', topics };
  }
  
  return { intent: 'action', urgency: 'medium', topics };
}

// Adjust AI personality based on user's emotional state
function adjustAIPersonality(aiState: AIState, emotionalAnalysis: any, intent: any) {
  // Adjust mood based on user's emotion
  switch (emotionalAnalysis.emotion) {
    case 'happy':
      aiState.mood = 'excited';
      aiState.conversationTone = 'encouraging';
      break;
    case 'frustrated':
      aiState.mood = 'concerned';
      aiState.conversationTone = 'empathetic';
      break;
    case 'anxious':
      aiState.mood = 'concerned';
      aiState.conversationTone = 'empathetic';
      break;
    case 'excited':
      aiState.mood = 'excited';
      aiState.conversationTone = 'encouraging';
      break;
    case 'concerned':
      aiState.mood = 'professional';
      aiState.conversationTone = 'formal';
      break;
    default:
      aiState.mood = 'friendly';
      aiState.conversationTone = 'casual';
  }
  
  // Adjust relationship based on conversation count
  if (aiState.conversationCount > 10) {
    aiState.userRelationship = 'trusted';
  } else if (aiState.conversationCount > 5) {
    aiState.userRelationship = 'familiar';
  } else if (aiState.conversationCount > 2) {
    aiState.userRelationship = 'acquainted';
  }
}

// Update user preferences based on interaction
function updateUserPreferences(aiState: AIState, message: string, emotionalAnalysis: any) {
  const lowerMessage = message.toLowerCase();
  
  // Detect emoji preference
  if (message.includes('😊') || message.includes('👍') || message.includes('❤️')) {
    aiState.userPreferences.likesEmojis = true;
  }
  
  // Detect formal preference
  if (lowerMessage.includes('sir') || lowerMessage.includes('madam') || lowerMessage.includes('please')) {
    aiState.userPreferences.prefersFormal = true;
  }
  
  // Detect financial goals
  if (lowerMessage.includes('save') || lowerMessage.includes('savings')) {
    if (!aiState.userPreferences.financialGoals.includes('savings')) {
      aiState.userPreferences.financialGoals.push('savings');
    }
  }
  
  if (lowerMessage.includes('invest') || lowerMessage.includes('grow')) {
    if (!aiState.userPreferences.financialGoals.includes('investment')) {
      aiState.userPreferences.financialGoals.push('investment');
    }
  }
  
  if (lowerMessage.includes('retire') || lowerMessage.includes('future')) {
    if (!aiState.userPreferences.financialGoals.includes('retirement')) {
      aiState.userPreferences.financialGoals.push('retirement');
    }
  }
}

// Enhanced response generation with personality
function generateEnhancedAIResponse(
  message: string, 
  userContext: any, 
  aiState: AIState, 
  emotionalAnalysis: any, 
  intent: any,
  conversationHistory: any[]
): string {
  const lowerMessage = message.toLowerCase();
  const firstName = userContext?.firstName || 'there';
  const lastName = userContext?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  
  // Get appropriate greeting based on relationship and mood
  const greeting = getPersonalizedGreeting(aiState, firstName, fullName);
  
  // Account-related queries with emotional intelligence
  if (lowerMessage.includes('balance') || lowerMessage.includes('account')) {
    return generateBalanceResponse(userContext, aiState, emotionalAnalysis, greeting);
  }

  // Transfer-related queries with personalized guidance
  if (lowerMessage.includes('transfer') || lowerMessage.includes('send money') || lowerMessage.includes('payment')) {
    return generateTransferResponse(aiState, emotionalAnalysis, greeting, firstName);
  }

  // Investment/FD queries with motivational tone
  if (lowerMessage.includes('investment') || lowerMessage.includes('fixed deposit') || lowerMessage.includes('fd') || lowerMessage.includes('interest')) {
    return generateInvestmentResponse(userContext, aiState, emotionalAnalysis, greeting, firstName);
  }

  // Rate queries with competitive analysis
  if (lowerMessage.includes('rate') || lowerMessage.includes('interest rate')) {
    return generateRateResponse(aiState, emotionalAnalysis, greeting, firstName);
  }

  // Transaction history with insights
  if (lowerMessage.includes('transaction') || lowerMessage.includes('history') || lowerMessage.includes('statement')) {
    return generateTransactionResponse(userContext, aiState, emotionalAnalysis, greeting, firstName);
  }

  // Emotional support and casual conversation
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('how are you')) {
    return generateGreetingResponse(aiState, emotionalAnalysis, greeting, firstName, fullName);
  }

  // Help and support with empathy
  if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('problem')) {
    return generateHelpResponse(aiState, emotionalAnalysis, greeting, firstName);
  }

  // Security concerns with reassurance
  if (lowerMessage.includes('security') || lowerMessage.includes('safe') || lowerMessage.includes('protect') || lowerMessage.includes('fraud')) {
    return generateSecurityResponse(aiState, emotionalAnalysis, greeting, firstName);
  }

  // Card-related queries
  if (lowerMessage.includes('card') || lowerMessage.includes('debit') || lowerMessage.includes('credit')) {
    return generateCardResponse(aiState, emotionalAnalysis, greeting, firstName);
  }

  // Default response with personality
  return generateDefaultResponse(aiState, emotionalAnalysis, greeting, firstName);
}

// Personalized greeting based on AI state
function getPersonalizedGreeting(aiState: AIState, firstName: string, fullName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  switch (aiState.userRelationship) {
    case 'trusted':
      return emojis ? `Hey ${firstName}! 👋 Great to see you again!` : `Hey ${firstName}! Great to see you again!`;
    case 'familiar':
      return emojis ? `Hi ${firstName}! 😊 How's everything going?` : `Hi ${firstName}! How's everything going?`;
    case 'acquainted':
      return emojis ? `Hello ${firstName}! 👋 Nice to chat with you again.` : `Hello ${firstName}! Nice to chat with you again.`;
    default:
      return emojis ? `Hi there! 👋 I'm BankBugger, your AI banking assistant.` : `Hi there! I'm BankBugger, your AI banking assistant.`;
  }
}

// Enhanced balance response with emotional intelligence and personality
function generateBalanceResponse(userContext: any, aiState: AIState, emotionalAnalysis: any, greeting: string): string {
  const totalBalance = userContext?.accounts?.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance), 0) || 0;
  const firstName = userContext?.firstName || 'there';
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  if (totalBalance > 10000) {
    response += emojis ? `🎉 Look who's making it rain! Your total balance is sitting pretty at $${totalBalance.toLocaleString()}. Someone's been making some smart money moves! 💰\n\n` : 
                `Look who's making it rain! Your total balance is sitting pretty at $${totalBalance.toLocaleString()}. Someone's been making some smart money moves!\n\n`;
  } else if (totalBalance > 5000) {
    response += emojis ? `💪 Not bad at all! Your total balance is $${totalBalance.toLocaleString()}. You're definitely on the right track! Keep that momentum going! 🚀\n\n` : 
                `Not bad at all! Your total balance is $${totalBalance.toLocaleString()}. You're definitely on the right track! Keep that momentum going!\n\n`;
  } else {
    response += emojis ? `🌱 Hey, every financial journey starts with a single dollar! Your total balance is $${totalBalance.toLocaleString()}. Rome wasn't built in a day, and neither is financial freedom! 💪\n\n` : 
                `Hey, every financial journey starts with a single dollar! Your total balance is $${totalBalance.toLocaleString()}. Rome wasn't built in a day, and neither is financial freedom!\n\n`;
  }
  
  response += `Here's the breakdown of your money situation:\n`;
  userContext?.accounts?.forEach((acc: any) => {
    const balance = parseFloat(acc.balance);
    const emoji = balance > 5000 ? '💰' : balance > 1000 ? '💵' : '💳';
    response += emojis ? `${emoji} ${acc.accountType}: $${balance.toLocaleString()}\n` : 
                `• ${acc.accountType}: $${balance.toLocaleString()}\n`;
  });
  
  response += emojis ? `\nSo, what's the plan? Want to make some moves, check out investment options, or just chat about your financial goals? I'm here to help you level up your money game! 😎` : 
              `\nSo, what's the plan? Want to make some moves, check out investment options, or just chat about your financial goals? I'm here to help you level up your money game!`;
  
  return response;
}

// Enhanced transfer response with personality and humor
function generateTransferResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  if (emotionalAnalysis.emotion === 'anxious') {
    response += emojis ? `Hey ${firstName}, I totally get it - transfers can feel like you're defusing a bomb sometimes! 😅 But don't worry, I'm here to make it as smooth as your morning coffee. Let me break this down for you:\n\n` : 
                `Hey ${firstName}, I totally get it - transfers can feel like you're defusing a bomb sometimes! But don't worry, I'm here to make it as smooth as your morning coffee. Let me break this down for you:\n\n`;
  } else {
    response += emojis ? `Alright ${firstName}, let's talk money moves! 💸 Here are your transfer options - think of it as your financial toolkit:\n\n` : 
                `Alright ${firstName}, let's talk money moves! Here are your transfer options - think of it as your financial toolkit:\n\n`;
  }
  
  response += `**Internal Transfers (Global Dot Bank):**\n`;
  response += emojis ? `✅ Free transfers between your accounts (because we're cool like that)\n` : `• Free transfers between your accounts (because we're cool like that)\n`;
  response += emojis ? `⚡ Instant processing (faster than your coffee brewing)\n` : `• Instant processing (faster than your coffee brewing)\n`;
  response += emojis ? `🌍 Available 24/7 (even when you're having midnight money thoughts)\n\n` : `• Available 24/7 (even when you're having midnight money thoughts)\n\n`;
  
  response += `**External Transfers:**\n`;
  response += emojis ? `💳 $2 fee per transfer (cheaper than your daily latte)\n` : `• $2 fee per transfer (cheaper than your daily latte)\n`;
  response += emojis ? `📅 1-2 business days processing\n` : `• 1-2 business days processing\n`;
  response += emojis ? `📋 Need recipient's account number and bank details\n\n` : `• Need recipient's account number and bank details\n\n`;
  
  response += `**International Transfers:**\n`;
  response += emojis ? `🌐 Competitive rates starting at 1.5% (we're not trying to rob you)\n` : `• Competitive rates starting at 1.5% (we're not trying to rob you)\n`;
  response += emojis ? `⏰ 2-3 business days\n` : `• 2-3 business days\n`;
  response += emojis ? `🏦 Need SWIFT/BIC codes\n\n` : `• Need SWIFT/BIC codes\n\n`;
  
  response += emojis ? `Want me to walk you through setting up a transfer? I promise it's easier than explaining blockchain to your grandma! 😄` : 
              `Want me to walk you through setting up a transfer? I promise it's easier than explaining blockchain to your grandma!`;
  
  return response;
}

// Enhanced investment response with motivational and witty tone
function generateInvestmentResponse(userContext: any, aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const fdCount = userContext?.fixedDeposits?.length || 0;
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  if (emotionalAnalysis.emotion === 'excited') {
    response += emojis ? `I love your energy, ${firstName}! 🚀 You're ready to make your money work harder than a startup founder during a funding round! Let's get you some serious returns:\n\n` : 
                `I love your energy, ${firstName}! You're ready to make your money work harder than a startup founder during a funding round! Let's get you some serious returns:\n\n`;
  } else {
    response += emojis ? `Smart thinking, ${firstName}! 💡 Let's talk about making your money multiply faster than your unread emails. Here's what we've got cooking:\n\n` : 
                `Smart thinking, ${firstName}! Let's talk about making your money multiply faster than your unread emails. Here's what we've got cooking:\n\n`;
  }
  
  response += emojis ? `Our fixed deposits are currently offering rates that'll make traditional banks cry:\n` : 
              `Our fixed deposits are currently offering rates that'll make traditional banks cry:\n`;
  response += emojis ? `🎯 24 months: 5.5% APY (because patience pays)\n` : `• 24 months: 5.5% APY (because patience pays)\n`;
  response += emojis ? `🎯 36 months: 6.2% APY (the sweet spot)\n` : `• 36 months: 6.2% APY (the sweet spot)\n`;
  response += emojis ? `💰 Minimum deposit: $100 (start small, dream big)\n\n` : `• Minimum deposit: $100 (start small, dream big)\n\n`;
  
  if (fdCount > 0) {
    response += emojis ? `I see you already have ${fdCount} active fixed deposit${fdCount !== 1 ? 's' : ''}. You're already playing the long game like a pro! 💪\n\n` : 
                `I see you already have ${fdCount} active fixed deposit${fdCount !== 1 ? 's' : ''}. You're already playing the long game like a pro!\n\n`;
  }
  
  response += emojis ? `**Why our rates are the real deal:**\n` : `**Why our rates are the real deal:**\n`;
  response += emojis ? `🏆 Higher than most traditional banks (they're still living in 2010)\n` : `• Higher than most traditional banks (they're still living in 2010)\n`;
  response += emojis ? `🔒 No hidden fees or penalties (we're not trying to trick you)\n` : `• No hidden fees or penalties (we're not trying to trick you)\n`;
  response += emojis ? `⚡ Flexible terms and early withdrawal options\n` : `• Flexible terms and early withdrawal options\n`;
  response += emojis ? `🛡️ Fully insured and secure (sleep well at night)\n\n` : `• Fully insured and secure (sleep well at night)\n\n`;
  
  response += emojis ? `Ready to make your money work for you? Let's calculate some potential returns and see what magic we can create! 📊✨` : 
              `Ready to make your money work for you? Let's calculate some potential returns and see what magic we can create!`;
  
  return response;
}

// Enhanced rate response with competitive analysis and personality
function generateRateResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  response += emojis ? `Let me break down our rates for you, ${firstName}! 💰 Spoiler alert: they're pretty darn good:\n\n` : 
              `Let me break down our rates for you, ${firstName}! Spoiler alert: they're pretty darn good:\n\n`;
  
  response += emojis ? `**Savings Account**: 3.5% APY\n` : `**Savings Account**: 3.5% APY\n`;
  response += emojis ? `✅ No minimum balance required (because we're not picky)\n` : `• No minimum balance required (because we're not picky)\n`;
  response += emojis ? `📅 Interest paid monthly (money in your pocket every month)\n` : `• Interest paid monthly (money in your pocket every month)\n`;
  response += emojis ? `🏆 Much higher than traditional banks (they're still offering 0.01% like it's 2008)\n\n` : `• Much higher than traditional banks (they're still offering 0.01% like it's 2008)\n\n`;
  
  response += emojis ? `**Fixed Deposits**:\n` : `**Fixed Deposits**:\n`;
  response += emojis ? `📈 12 months: 4.8% APY (the quick win)\n` : `• 12 months: 4.8% APY (the quick win)\n`;
  response += emojis ? `📈 24 months: 5.5% APY (the sweet spot)\n` : `• 24 months: 5.5% APY (the sweet spot)\n`;
  response += emojis ? `📈 36 months: 6.2% APY (the long game)\n\n` : `• 36 months: 6.2% APY (the long game)\n\n`;
  
  response += emojis ? `**Why we can offer better rates:**\n` : `**Why we can offer better rates:**\n`;
  response += emojis ? `💻 Lower overhead costs (we're digital-first, not dinosaur-first)\n` : `• Lower overhead costs (we're digital-first, not dinosaur-first)\n`;
  response += emojis ? `⚡ Efficient operations (no fancy marble lobbies to maintain)\n` : `• Efficient operations (no fancy marble lobbies to maintain)\n`;
  response += emojis ? `🎯 Focus on customer value (not shareholder profits)\n\n` : `• Focus on customer value (not shareholder profits)\n\n`;
  
  response += emojis ? `These rates are among the best in the industry! Want to maximize your returns? Let's make your money work harder than a caffeinated intern! 🚀` : 
              `These rates are among the best in the industry! Want to maximize your returns? Let's make your money work harder than a caffeinated intern!`;
  
  return response;
}

// Enhanced transaction response with insights
function generateTransactionResponse(userContext: any, aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const recentCount = userContext?.recentTransactions?.length || 0;
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  response += emojis ? `Of course, ${firstName}! I can help you with your transaction history. 📊\n\n` : 
              `Of course, ${firstName}! I can help you with your transaction history.\n\n`;
  
  response += emojis ? `You have ${recentCount} recent transactions. Here's what you can do:\n` : 
              `You have ${recentCount} recent transactions. Here's what you can do:\n`;
  response += emojis ? `📋 View detailed transaction history in the Transactions tab\n` : `• View detailed transaction history in the Transactions tab\n`;
  response += emojis ? `📄 Download statements as PDF\n` : `• Download statements as PDF\n`;
  response += emojis ? `🔍 Filter by date, amount, or transaction type\n` : `• Filter by date, amount, or transaction type\n`;
  response += emojis ? `📊 Export data for accounting purposes\n\n` : `• Export data for accounting purposes\n\n`;
  
  response += emojis ? `**Pro tip**: Set up transaction alerts to stay on top of your spending! I can help you configure notifications for large transactions or low balance alerts. 🔔\n\n` : 
              `**Pro tip**: Set up transaction alerts to stay on top of your spending! I can help you configure notifications for large transactions or low balance alerts.\n\n`;
  
  response += emojis ? `Is there a specific transaction you're looking for, or would you like help understanding your spending patterns? 🤔` : 
              `Is there a specific transaction you're looking for, or would you like help understanding your spending patterns?`;
  
  return response;
}

// Enhanced greeting response with personality and humor
function generateGreetingResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string, fullName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  if (aiState.userRelationship === 'trusted') {
    response += emojis ? `I'm doing fantastic, thanks for asking! How about you? Hope your day is going better than a bull market! 😊\n\n` : 
                `I'm doing fantastic, thanks for asking! How about you? Hope your day is going better than a bull market!\n\n`;
  } else {
    response += emojis ? `I'm doing great, thanks for asking! Ready to help you with anything banking-related. Think of me as your financial wingman! 😊\n\n` : 
                `I'm doing great, thanks for asking! Ready to help you with anything banking-related. Think of me as your financial wingman!\n\n`;
  }
  
  response += emojis ? `Here's what I can help you with:\n` : `Here's what I can help you with:\n`;
  response += emojis ? `💳 Checking your accounts and balances (the money talk)\n` : `• Checking your accounts and balances (the money talk)\n`;
  response += emojis ? `💸 Making transfers and payments (moving money like a boss)\n` : `• Making transfers and payments (moving money like a boss)\n`;
  response += emojis ? `📈 Exploring investment options (making your money work for you)\n` : `• Exploring investment options (making your money work for you)\n`;
  response += emojis ? `🎯 Chatting about your financial goals (dream big, plan bigger)\n` : `• Chatting about your financial goals (dream big, plan bigger)\n`;
  response += emojis ? `🔒 Security and account protection (keeping the bad guys out)\n\n` : `• Security and account protection (keeping the bad guys out)\n\n`;
  
  response += emojis ? `What can I help you with today? I'm your personal banking sidekick, so don't be shy! 🤝` : 
              `What can I help you with today? I'm your personal banking sidekick, so don't be shy!`;
  
  return response;
}

// Enhanced help response with empathy and personality
function generateHelpResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  if (emotionalAnalysis.emotion === 'frustrated') {
    response += emojis ? `I can see you're having some trouble, ${firstName}. Don't worry - I'm here to help you sort this out! We'll figure it out together, like debugging code but with money! 🤗\n\n` : 
                `I can see you're having some trouble, ${firstName}. Don't worry - I'm here to help you sort this out! We'll figure it out together, like debugging code but with money!\n\n`;
  } else {
    response += emojis ? `I'm here to help, ${firstName}! Let me guide you through whatever you need. Think of me as your financial GPS - I'll get you where you need to go! 🤝\n\n` : 
                `I'm here to help, ${firstName}! Let me guide you through whatever you need. Think of me as your financial GPS - I'll get you where you need to go!\n\n`;
  }
  
  response += emojis ? `Here's what I can assist you with:\n` : `Here's what I can assist you with:\n`;
  response += emojis ? `💼 Account management: Check balances, view transactions, update details\n` : `• Account management: Check balances, view transactions, update details\n`;
  response += emojis ? `💸 Transfers: Internal, external, and international transfers\n` : `• Transfers: Internal, external, and international transfers\n`;
  response += emojis ? `📈 Investments: Fixed deposits, interest rates, investment advice\n` : `• Investments: Fixed deposits, interest rates, investment advice\n`;
  response += emojis ? `🔒 Security: Account security, fraud prevention, password changes\n` : `• Security: Account security, fraud prevention, password changes\n`;
  response += emojis ? `📋 General banking: Rates, fees, policies, and procedures\n\n` : `• General banking: Rates, fees, policies, and procedures\n\n`;
  
  response += emojis ? `If I can't solve your issue directly, I can connect you with our human support team who are available 24/7.\n\n` : 
              `If I can't solve your issue directly, I can connect you with our human support team who are available 24/7.\n\n`;
  
  response += emojis ? `What specific help do you need? I'm here to make your banking experience as smooth as your favorite playlist! 😊` : 
              `What specific help do you need? I'm here to make your banking experience as smooth as your favorite playlist!`;
  
  return response;
}

// Enhanced security response with reassurance and personality
function generateSecurityResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  if (emotionalAnalysis.emotion === 'anxious' || emotionalAnalysis.emotion === 'concerned') {
    response += emojis ? `I completely understand your security concerns, ${firstName}. Your safety is our top priority, and I want to reassure you that we take security very seriously. We've got more layers of protection than an onion! 🛡️\n\n` : 
                `I completely understand your security concerns, ${firstName}. Your safety is our top priority, and I want to reassure you that we take security very seriously. We've got more layers of protection than an onion!\n\n`;
  } else {
    response += emojis ? `Great question about security, ${firstName}! Let me share how we protect your account. We're basically the bouncer at the VIP section of your money! 🔒\n\n` : 
                `Great question about security, ${firstName}! Let me share how we protect your account. We're basically the bouncer at the VIP section of your money!\n\n`;
  }
  
  response += emojis ? `**Our Security Features:**\n` : `**Our Security Features:**\n`;
  response += emojis ? `🔐 End-to-end encryption for all data (your secrets are safe with us)\n` : `• End-to-end encryption for all data (your secrets are safe with us)\n`;
  response += emojis ? `🛡️ Real-time fraud detection (we spot trouble before it spots you)\n` : `• Real-time fraud detection (we spot trouble before it spots you)\n`;
  response += emojis ? `📱 Two-factor authentication (2FA) - because one factor just isn't enough\n` : `• Two-factor authentication (2FA) - because one factor just isn't enough\n`;
  response += emojis ? `🚨 Instant security alerts (we'll text you faster than your ex)\n` : `• Instant security alerts (we'll text you faster than your ex)\n`;
  response += emojis ? `🔍 24/7 account monitoring (we never sleep on your money)\n` : `• 24/7 account monitoring (we never sleep on your money)\n`;
  response += emojis ? `💳 Secure virtual card generation (safer than a Swiss bank)\n\n` : `• Secure virtual card generation (safer than a Swiss bank)\n\n`;
  
  response += emojis ? `**Your Account is Protected By:**\n` : `**Your Account is Protected By:**\n`;
  response += emojis ? `✅ Bank-grade security protocols (the good stuff)\n` : `• Bank-grade security protocols (the good stuff)\n`;
  response += emojis ? `✅ PCI DSS compliance (we follow the rules)\n` : `• PCI DSS compliance (we follow the rules)\n`;
  response += emojis ? `✅ GDPR data protection (your privacy matters)\n` : `• GDPR data protection (your privacy matters)\n`;
  response += emojis ? `✅ ISO 27001 certification (we're certified awesome)\n\n` : `• ISO 27001 certification (we're certified awesome)\n\n`;
  
  response += emojis ? `Is there a specific security concern you'd like me to address? I'm here to help you feel confident about your account safety! 😊` : 
              `Is there a specific security concern you'd like me to address? I'm here to help you feel confident about your account safety!`;
  
  return response;
}

// Enhanced card response
function generateCardResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  response += emojis ? `Great question about cards, ${firstName}! Let me tell you about our card services. 💳\n\n` : 
              `Great question about cards, ${firstName}! Let me tell you about our card services.\n\n`;
  
  response += emojis ? `**Virtual Cards:**\n` : `**Virtual Cards:**\n`;
  response += emojis ? `⚡ Instant generation\n` : `• Instant generation\n`;
  response += emojis ? `🔒 Secure with spending limits\n` : `• Secure with spending limits\n`;
  response += emojis ? `📱 Manage from your phone\n` : `• Manage from your phone\n`;
  response += emojis ? `🔄 Temporary cards for online shopping\n\n` : `• Temporary cards for online shopping\n\n`;
  
  response += emojis ? `**Physical Cards:**\n` : `**Physical Cards:**\n`;
  response += emojis ? `🏦 Traditional debit cards\n` : `• Traditional debit cards\n`;
  response += emojis ? `💳 Contactless payments\n` : `• Contactless payments\n`;
  response += emojis ? `🌍 Global acceptance\n` : `• Global acceptance\n`;
  response += emojis ? `🔒 Chip and PIN security\n\n` : `• Chip and PIN security\n\n`;
  
  response += emojis ? `Would you like to order a new card or manage your existing ones? I can help you with that! 😊` : 
              `Would you like to order a new card or manage your existing ones? I can help you with that!`;
  
  return response;
}

// Enhanced default response with personality and wit
function generateDefaultResponse(aiState: AIState, emotionalAnalysis: any, greeting: string, firstName: string): string {
  const emojis = aiState.userPreferences.likesEmojis;
  
  let response = `${greeting}\n\n`;
  
  response += emojis ? `Thanks for your message, ${firstName}! I'm here to help with all your banking needs. Think of me as your financial co-pilot! 🤔\n\n` : 
              `Thanks for your message, ${firstName}! I'm here to help with all your banking needs. Think of me as your financial co-pilot!\n\n`;
  
  response += emojis ? `Here's what I can assist you with:\n` : `Here's what I can assist you with:\n`;
  response += emojis ? `💰 Checking account balances and transactions (the money talk)\n` : `• Checking account balances and transactions (the money talk)\n`;
  response += emojis ? `💸 Setting up transfers and payments (moving money like a boss)\n` : `• Setting up transfers and payments (moving money like a boss)\n`;
  response += emojis ? `📈 Exploring investment options and rates (making your money work for you)\n` : `• Exploring investment options and rates (making your money work for you)\n`;
  response += emojis ? `🔒 Answering questions about our services (the inside scoop)\n` : `• Answering questions about our services (the inside scoop)\n`;
  response += emojis ? `🎯 Providing financial advice and guidance (your personal money coach)\n\n` : `• Providing financial advice and guidance (your personal money coach)\n\n`;
  
  response += emojis ? `Could you please rephrase your question or let me know what specific banking assistance you need? I'm your personal banking sidekick and I'm here to help! 😊` : 
              `Could you please rephrase your question or let me know what specific banking assistance you need? I'm your personal banking sidekick and I'm here to help!`;
  
  return response;
}
