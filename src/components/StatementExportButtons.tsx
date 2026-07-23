'use client';

import React, { useState } from 'react';
import { FileText, FileSpreadsheet } from 'lucide-react';
import { fetchAndExportStatement } from '@/lib/statement-export';

interface StatementExportButtonsProps {
  days?: number;
  className?: string;
}

export default function StatementExportButtons({ days = 365, className = '' }: StatementExportButtonsProps) {
  const [loading, setLoading] = useState<'pdf' | 'csv' | null>(null);

  const handleExport = async (format: 'pdf' | 'csv') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(format);
    try {
      await fetchAndExportStatement(token, format, days);
    } catch (error) {
      console.error('Statement export failed:', error);
      alert('Failed to generate statement. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => handleExport('pdf')}
        disabled={loading !== null}
        className="btn-secondary dashboard-header-btn"
      >
        <FileText className="h-4 w-4" />
        {loading === 'pdf' ? 'Generating…' : 'Statement (PDF)'}
      </button>
      <button
        type="button"
        onClick={() => handleExport('csv')}
        disabled={loading !== null}
        className="btn-secondary dashboard-header-btn"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {loading === 'csv' ? 'Generating…' : 'Statement (CSV)'}
      </button>
    </div>
  );
}
