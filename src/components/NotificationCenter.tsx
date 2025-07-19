'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="w-6 h-6" />
      </button>
    </div>
  );
}
