'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, MessageCircle, Heart, Brain, Zap, Shield } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  aiState?: {
    mood: 'friendly' | 'excited' | 'concerned' | 'professional' | 'casual';
    tone: 'formal' | 'casual' | 'encouraging' | 'empathetic';
    relationship: 'new' | 'acquainted' | 'familiar' | 'trusted';
  };
}

interface BankBuggerAIProps {
  userId: string;
  className?: string;
}

export default function BankBuggerAI({ userId, className = '' }: BankBuggerAIProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🟢 Hello, I\'m BankBugger — your AI banking sidekick with attitude.\n\nNeed to check your balance, decode your transactions, plot your next big investment, or just chat about why your coffee costs more than your ETF gains? I\'ve got you.\n\nBuilt by the minds behind Global Dot Bank and The Dot Protocol Co., Ltd and powered by OpenAI and Cursor V0, I\'m here to make banking feel less like paperwork and more like power moves.\n\nLet\'s make your money smarter. What can I bug for you today?',
      timestamp: new Date(),
      aiState: {
        mood: 'friendly',
        tone: 'casual',
        relationship: 'new'
      }
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [aiMood, setAiMood] = useState<'friendly' | 'excited' | 'concerned' | 'professional' | 'casual'>('friendly');
  const [aiRelationship, setAiRelationship] = useState<'new' | 'acquainted' | 'familiar' | 'trusted'>('new');
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update AI mood based on latest message
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.aiState) {
      setAiMood(lastMessage.aiState.mood);
      setAiRelationship(lastMessage.aiState.relationship);
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setShowTypingIndicator(true);

    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Add the authorization header
        },
        body: JSON.stringify({
          message: userMessage.content,
          userId,
          conversationHistory: messages.slice(-10) // Send last 10 messages for context
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          aiState: data.aiState
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date(),
        aiState: {
          mood: 'concerned',
          tone: 'empathetic',
          relationship: aiRelationship
        }
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setShowTypingIndicator(false);
    }
  };

  // Helper function to handle quick actions
  const handleQuickAction = (action: string) => {
    setInput(action);
    // Trigger submission directly instead of creating a synthetic event
    handleSubmitDirectly(action);
  };

  // Direct submission handler for quick actions
  const handleSubmitDirectly = async (action: string) => {
    if (!action.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: action,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: action,
          userId,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        aiState: data.aiState
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update AI state
      if (data.aiState) {
        setAiMood(data.aiState.mood);
        setAiRelationship(data.aiState.relationship);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get AI mood indicator
  const getMoodIndicator = () => {
    switch (aiMood) {
      case 'excited':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'concerned':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'professional':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'casual':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      default:
        return <Brain className="w-4 h-4 text-green-500" />;
    }
  };

  // Get relationship indicator
  const getRelationshipIndicator = () => {
    switch (aiRelationship) {
      case 'trusted':
        return '🤝 Trusted Friend';
      case 'familiar':
        return '😊 Familiar';
      case 'acquainted':
        return '👋 Acquainted';
      default:
        return '👋 New';
    }
  };

  // Get mood-based greeting
  const getMoodGreeting = () => {
    switch (aiMood) {
      case 'excited':
        return 'Excited to help! 🚀';
      case 'concerned':
        return 'Here to support you! 🤗';
      case 'professional':
        return 'Ready to assist! 💼';
      case 'casual':
        return 'What\'s up? 😊';
      default:
        return 'How can I help? 😊';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
      >
        {isOpen ? (
          <MessageCircle className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6" />
            <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            {/* Notification dot for new features */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col animate-in slide-in-from-bottom-2 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bot className="w-8 h-8" />
                  <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">BankBugger AI</h3>
                  <p className="text-blue-100 text-sm flex items-center space-x-2">
                    {getMoodIndicator()}
                    <span>{getMoodGreeting()}</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-blue-200">{getRelationshipIndicator()}</div>
                <div className="text-xs text-blue-200">Enhanced AI</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        {message.aiState ? getMoodIndicator() : <Bot className="w-4 h-4 text-blue-500" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className={`text-xs ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                        {message.role === 'assistant' && message.aiState && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-400">
                              {message.aiState.mood === 'excited' && '🚀'}
                              {message.aiState.mood === 'concerned' && '🤗'}
                              {message.aiState.mood === 'professional' && '💼'}
                              {message.aiState.mood === 'casual' && '😊'}
                              {message.aiState.mood === 'friendly' && '😊'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {showTypingIndicator && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    {getMoodIndicator()}
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-600">BankBugger is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 pt-2 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Check Balance", action: "What's my current balance?" },
                  { label: "Transfer Money", action: "How do I transfer money?" },
                  { label: "Investment Options", action: "What investment options do you have?" },
                  { label: "Interest Rates", action: "What are your current interest rates?" },
                  { label: "Security Info", action: "How secure is my account?" },
                  { label: "Help Me", action: "I need help with something" }
                ].map((quickAction) => (
                  <button
                    key={quickAction.label}
                    onClick={() => handleQuickAction(quickAction.action)}
                    className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                  >
                    {quickAction.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about banking..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all duration-200"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white p-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Enhanced AI with emotional intelligence</span>
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>BankBugger v2.0</span>
              </span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Quick Actions Component
export function QuickActions({ onAction }: { onAction: (action: string) => void }) {
  const quickActions = [
    { label: "Check Balance", action: "What's my current balance?" },
    { label: "Transfer Money", action: "How do I transfer money?" },
    { label: "Investment Options", action: "What investment options do you have?" },
    { label: "Interest Rates", action: "What are your current interest rates?" },
    { label: "Security Info", action: "How secure is my account?" },
    { label: "Help Me", action: "I need help with something" }
  ];

  return (
    <div className="grid grid-cols-2 gap-2 mt-4">
      {quickActions.map((quickAction) => (
        <button
          key={quickAction.label}
          onClick={() => onAction(quickAction.action)}
          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
        >
          {quickAction.label}
        </button>
      ))}
    </div>
  );
}
