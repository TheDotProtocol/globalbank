'use client';

import React, { useState } from 'react';
import { Card } from '@prisma/client';

interface CardDisplayProps {
  card: Card;
  showDetails?: boolean;
}

export default function CardDisplay({ card, showDetails = false }: CardDisplayProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCVV, setShowCVV] = useState(false);

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const getCardBrandColor = () => {
    switch (card.cardBrand) {
      case 'VISA':
        return 'from-blue-600 to-blue-800';
      case 'MASTERCARD':
        return 'from-orange-500 to-red-600';
      case 'AMEX':
        return 'from-green-600 to-green-800';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getCardBrandLogo = () => {
    switch (card.cardBrand) {
      case 'VISA':
        return '💳';
      case 'MASTERCARD':
        return '💳';
      case 'AMEX':
        return '💳';
      default:
        return '💳';
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card Container */}
      <div 
        className={`relative w-full h-56 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of Card */}
        <div className={`absolute w-full h-full rounded-xl shadow-2xl bg-gradient-to-br ${getCardBrandColor()} p-6 text-white backface-hidden`}>
          {/* Card Header */}
          <div className="flex justify-between items-start mb-8">
            <div className="text-2xl font-bold">{getCardBrandLogo()}</div>
            <div className="text-sm font-medium">{card.cardType}</div>
          </div>

          {/* Card Number */}
          <div className="mb-6">
            <div className="text-sm text-blue-100 mb-2">Card Number</div>
            <div className="text-xl font-mono tracking-wider">
              {formatCardNumber(card.cardNumber)}
            </div>
          </div>

          {/* Card Details */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-sm text-blue-100 mb-1">Card Holder</div>
              <div className="font-medium">GLOBAL DOT BANK</div>
            </div>
            <div>
              <div className="text-sm text-blue-100 mb-1">Expires</div>
              <div className="font-medium">{formatExpiry(card.expiryMonth, card.expiryYear)}</div>
            </div>
          </div>

          {/* Chip */}
          <div className="absolute bottom-6 left-6 w-12 h-8 bg-yellow-400 rounded-md"></div>
        </div>

        {/* Back of Card */}
        <div className={`absolute w-full h-full rounded-xl shadow-2xl bg-gradient-to-br ${getCardBrandColor()} p-6 text-white backface-hidden rotate-y-180`}>
          {/* Magnetic Stripe */}
          <div className="w-full h-12 bg-black rounded-t-xl mb-6"></div>

          {/* Signature Panel */}
          <div className="w-full h-16 bg-gray-200 rounded mb-4 flex items-center justify-end pr-4">
            <div className="text-black font-mono text-sm">
              {showCVV ? card.cvv : '***'}
            </div>
          </div>

          {/* CVV */}
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-blue-100 mb-1">CVV</div>
              <div className="font-mono">
                {showCVV ? card.cvv : '***'}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowCVV(!showCVV);
              }}
              className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-all"
            >
              {showCVV ? 'Hide' : 'Show'} CVV
            </button>
          </div>

          {/* Card Info */}
          <div className="mt-6 text-center">
            <div className="text-sm text-blue-100">Global Dot Bank</div>
            <div className="text-xs text-blue-100">Customer Service: +1-800-GLOBAL</div>
          </div>
        </div>
      </div>

      {/* Card Info Panel */}
      {showDetails && (
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Card Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Card Type:</span>
              <span className="font-medium">{card.cardType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Brand:</span>
              <span className="font-medium">{card.cardBrand}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${card.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {card.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Limit:</span>
              <span className="font-medium">${card.dailyLimit?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Monthly Limit:</span>
              <span className="font-medium">${card.monthlyLimit?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-gray-600">
        Click card to flip • {showCVV ? 'CVV visible' : 'CVV hidden'}
      </div>
    </div>
  );
} 