import React from 'react';

interface CardDesignProps {
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
  cardType: 'VIRTUAL' | 'DEBIT' | 'CREDIT';
  isPhysical?: boolean;
}

export default function CardDesign({ 
  cardNumber, 
  cardHolderName, 
  expiryDate, 
  cvv, 
  cardType,
  isPhysical = false 
}: CardDesignProps) {
  const formatCardNumber = (number: string) => {
    return number.replace(/(\d{4})/g, '$1 ').trim();
  };

  const getCardGradient = () => {
    switch (cardType) {
      case 'VIRTUAL':
        return 'from-purple-600 via-pink-600 to-red-600';
      case 'DEBIT':
        return 'from-blue-600 via-indigo-600 to-purple-600';
      case 'CREDIT':
        return 'from-emerald-600 via-teal-600 to-cyan-600';
      default:
        return 'from-gray-600 via-gray-700 to-gray-800';
    }
  };

  const getCardTypeLabel = () => {
    switch (cardType) {
      case 'VIRTUAL':
        return 'VIRTUAL CARD';
      case 'DEBIT':
        return 'DEBIT CARD';
      case 'CREDIT':
        return 'CREDIT CARD';
      default:
        return 'CARD';
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto">
      {/* Card Design */}
      <div className={`relative h-56 rounded-2xl bg-gradient-to-br ${getCardGradient()} p-6 text-white shadow-2xl overflow-hidden`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 bg-white rounded-full opacity-20"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-white rounded-full opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full opacity-10"></div>
        </div>

        {/* Card Header */}
        <div className="relative z-10 flex justify-between items-start mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold text-gray-800">GB</span>
            </div>
            <span className="text-sm font-medium opacity-90">Global Dot Bank</span>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">{getCardTypeLabel()}</div>
            {isPhysical && (
              <div className="text-xs opacity-75 mt-1">PHYSICAL</div>
            )}
          </div>
        </div>

        {/* Chip */}
        <div className="relative z-10 mb-6">
          <div className="w-12 h-9 bg-yellow-400 rounded-md flex items-center justify-center">
            <div className="w-8 h-5 bg-yellow-600 rounded-sm"></div>
          </div>
        </div>

        {/* Card Number */}
        <div className="relative z-10 mb-6">
          <div className="text-2xl font-mono font-bold tracking-wider">
            {formatCardNumber(cardNumber)}
          </div>
        </div>

        {/* Card Details */}
        <div className="relative z-10 flex justify-between items-end">
          <div>
            <div className="text-xs opacity-75 mb-1">CARD HOLDER</div>
            <div className="text-sm font-medium">{cardHolderName}</div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75 mb-1">EXPIRES</div>
            <div className="text-sm font-medium">{expiryDate}</div>
          </div>
        </div>

        {/* CVV (only show for virtual cards) */}
        {cardType === 'VIRTUAL' && (
          <div className="absolute bottom-4 right-6">
            <div className="text-xs opacity-75 mb-1">CVV</div>
            <div className="text-sm font-mono font-bold">{cvv}</div>
          </div>
        )}
      </div>

      {/* Physical Card Notice */}
      {isPhysical && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">i</span>
            </div>
            <div>
              <div className="text-sm font-medium text-blue-900">Physical Card Delivery</div>
              <div className="text-xs text-blue-700">
                Your physical card will be delivered to your registered address within 21 working days.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 