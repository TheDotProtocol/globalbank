'use client';

import React, { useState } from 'react';
import { CreditCard, Eye, EyeOff, Copy, Check, RotateCw } from 'lucide-react';

interface VirtualCardProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  cardType: 'VISA' | 'MASTERCARD' | 'VIRTUAL';
  isActive: boolean;
  onToggleActive?: () => void;
  onRegenerateCVV?: () => void;
}

export default function VirtualCard({
  cardNumber,
  cardholderName,
  expiryDate,
  cvv,
  cardType,
  isActive,
  onToggleActive,
  onRegenerateCVV
}: VirtualCardProps) {
  const [showCVV, setShowCVV] = useState(false);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const formatCardNumber = (number: string) => {
    if (showCardNumber) {
      return number.replace(/(\d{4})/g, '$1 ').trim();
    }
    return number.replace(/\d(?=\d{4})/g, '*');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getCardTypeIcon = () => {
    switch (cardType) {
      case 'VISA':
        return (
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
            VISA
          </div>
        );
      case 'MASTERCARD':
        return (
          <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
            MC
          </div>
        );
      default:
        return (
          <div className="bg-gray-600 text-white px-2 py-1 rounded text-xs font-bold">
            VC
          </div>
        );
    }
  };

  const getCardGradient = () => {
    switch (cardType) {
      case 'VISA':
        return 'from-blue-600 to-blue-800';
      case 'MASTERCARD':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Card Container */}
      <div className="relative perspective-1000">
        <div
          className={`relative w-full h-56 transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front of Card */}
          <div className={`absolute w-full h-full rounded-xl shadow-lg bg-gradient-to-br ${getCardGradient()} text-white p-6 backface-hidden`}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span className="font-semibold">Virtual Card</span>
              </div>
              {getCardTypeIcon()}
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-200">Card Number</span>
                <button
                  onClick={() => setShowCardNumber(!showCardNumber)}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-mono tracking-wider">
                  {formatCardNumber(cardNumber)}
                </span>
                <button
                  onClick={() => copyToClipboard(cardNumber)}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <span className="text-xs text-gray-200 block mb-1">Cardholder Name</span>
                <span className="text-sm font-semibold">{cardholderName}</span>
              </div>
              <div>
                <span className="text-xs text-gray-200 block mb-1">Expires</span>
                <span className="text-sm font-semibold">{expiryDate}</span>
              </div>
            </div>

            {/* Flip Button */}
            <button
              onClick={() => setIsFlipped(true)}
              className="absolute bottom-4 right-4 text-gray-200 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Back of Card */}
          <div className={`absolute w-full h-full rounded-xl shadow-lg bg-gradient-to-br ${getCardGradient()} text-white p-6 backface-hidden rotate-y-180`}>
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-6 h-6" />
                <span className="font-semibold">Virtual Card</span>
              </div>
              {getCardTypeIcon()}
            </div>

            <div className="bg-black h-12 mb-6"></div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-200">CVV</span>
                <button
                  onClick={() => setShowCVV(!showCVV)}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  {showCVV ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-mono tracking-wider">
                  {showCVV ? cvv : '***'}
                </span>
                <button
                  onClick={() => copyToClipboard(cvv)}
                  className="text-gray-200 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-gray-200 mb-4">
              <p>For online transactions only</p>
              <p>Not valid for ATM withdrawals</p>
            </div>

            {/* Flip Back Button */}
            <button
              onClick={() => setIsFlipped(false)}
              className="absolute bottom-4 right-4 text-gray-200 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Card Controls */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-900">Card Status</h3>
            <p className="text-sm text-gray-600">
              {isActive ? 'Active and ready to use' : 'Card is disabled'}
            </p>
          </div>
          <button
            onClick={onToggleActive}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isActive ? 'Disable' : 'Enable'}
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onRegenerateCVV}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Regenerate CVV
          </button>
          <button
            onClick={() => copyToClipboard(cardNumber)}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Copy Card Number
          </button>
        </div>

        {/* Security Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Security Notice</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This is a virtual card for online transactions only</li>
            <li>• Never share your CVV with anyone</li>
            <li>• Use only on trusted websites</li>
            <li>• Monitor transactions regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Card Generation Component
export function CardGenerator({ onGenerate }: { onGenerate: (cardData: any) => void }) {
  const [cardType, setCardType] = useState<'VISA' | 'MASTERCARD' | 'VIRTUAL'>('VIRTUAL');
  const [cardholderName, setCardholderName] = useState('');
  const [loading, setLoading] = useState(false);

  const generateCard = async () => {
    if (!cardholderName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardType,
          cardholderName: cardholderName.trim()
        })
      });

      if (response.ok) {
        const cardData = await response.json();
        onGenerate(cardData);
      }
    } catch (error) {
      console.error('Failed to generate card:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Virtual Card</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Type
          </label>
          <select
            value={cardType}
            onChange={(e) => setCardType(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="VIRTUAL">Virtual Card</option>
            <option value="VISA">Visa Virtual</option>
            <option value="MASTERCARD">Mastercard Virtual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Enter cardholder name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={generateCard}
          disabled={loading || !cardholderName.trim()}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? 'Generating...' : 'Generate Card'}
        </button>
      </div>
    </div>
  );
} 