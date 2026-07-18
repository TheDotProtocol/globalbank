'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Eye, EyeOff, Lock, Unlock, Settings } from 'lucide-react';
import DashboardPageShell from '@/components/layout/DashboardPageShell';

interface Card {
  id: string;
  cardNumber: string;
  cardType: string;
  status: string;
  expiryDate: string;
  cvv: string;
  isVirtual: boolean;
  isActive: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  createdAt: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCardDetails, setShowCardDetails] = useState<{ [key: string]: boolean }>({});
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    cardType: 'DEBIT',
    isVirtual: false,
    dailyLimit: 1000,
    monthlyLimit: 10000,
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cards', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestForm),
      });

      if (response.ok) {
        setShowRequestForm(false);
        fetchCards();
        setRequestForm({
          cardType: 'DEBIT',
          isVirtual: false,
          dailyLimit: 1000,
          monthlyLimit: 10000,
        });
      }
    } catch (error) {
      console.error('Error requesting card:', error);
    }
  };

  const toggleCardDetails = (cardId: string) => {
    setShowCardDetails((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const toggleCardStatus = async (cardId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        fetchCards();
      }
    } catch (error) {
      console.error('Error updating card status:', error);
    }
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const maskCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/\d(?=\d{4})/g, '*');
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'dashboard-badge dashboard-badge-success';
      case 'PENDING':
        return 'dashboard-badge dashboard-badge-warning';
      case 'BLOCKED':
        return 'dashboard-badge dashboard-badge-danger';
      default:
        return 'dashboard-badge';
    }
  };

  return (
    <DashboardPageShell
      activeTab="cards"
      title="Cards"
      subtitle="Manage your debit and credit cards"
      headerExtra={
        <button
          onClick={() => setShowRequestForm(true)}
          className="btn-primary dashboard-header-btn"
        >
          <Plus className="h-4 w-4" />
          Request Card
        </button>
      }
    >
      {loading ? (
        <div className="dashboard-card">
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading cards...</p>
          </div>
        </div>
      ) : (
        <>
          {showRequestForm && (
            <div className="dashboard-card dashboard-card-spaced">
              <h2 className="dashboard-card-title">Request New Card</h2>
              <form onSubmit={handleRequestCard} className="dashboard-form">
                <div className="dashboard-form-grid">
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Card Type</label>
                    <select
                      value={requestForm.cardType}
                      onChange={(e) =>
                        setRequestForm({ ...requestForm, cardType: e.target.value })
                      }
                      className="dashboard-input"
                    >
                      <option value="DEBIT">Debit Card</option>
                      <option value="CREDIT">Credit Card</option>
                    </select>
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Card Format</label>
                    <select
                      value={requestForm.isVirtual ? 'virtual' : 'physical'}
                      onChange={(e) =>
                        setRequestForm({
                          ...requestForm,
                          isVirtual: e.target.value === 'virtual',
                        })
                      }
                      className="dashboard-input"
                    >
                      <option value="physical">Physical Card</option>
                      <option value="virtual">Virtual Card</option>
                    </select>
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Daily Limit ($)</label>
                    <input
                      type="number"
                      value={requestForm.dailyLimit}
                      onChange={(e) =>
                        setRequestForm({
                          ...requestForm,
                          dailyLimit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="dashboard-input"
                      min="100"
                      max="10000"
                    />
                  </div>
                  <div className="dashboard-form-group">
                    <label className="dashboard-label">Monthly Limit ($)</label>
                    <input
                      type="number"
                      value={requestForm.monthlyLimit}
                      onChange={(e) =>
                        setRequestForm({
                          ...requestForm,
                          monthlyLimit: parseInt(e.target.value) || 0,
                        })
                      }
                      className="dashboard-input"
                      min="1000"
                      max="100000"
                    />
                  </div>
                </div>
                <div className="dashboard-form-actions">
                  <button type="submit" className="btn-primary">
                    Submit Request
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="dashboard-card-grid">
            {cards.map((card) => (
              <div key={card.id} className="dashboard-card dashboard-card-item">
                <div className="dashboard-card-item-header">
                  <div className="dashboard-card-item-icon">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div className="dashboard-card-item-meta">
                    <h3 className="dashboard-card-item-title">
                      {card.cardType} Card
                      {card.isVirtual && (
                        <span className="dashboard-badge dashboard-badge-info">Virtual</span>
                      )}
                    </h3>
                    <span className={getStatusClass(card.status)}>{card.status}</span>
                  </div>
                  <div className="dashboard-card-item-actions">
                    <button
                      onClick={() => toggleCardDetails(card.id)}
                      className="dashboard-icon-btn"
                      title={showCardDetails[card.id] ? 'Hide details' : 'Show details'}
                    >
                      {showCardDetails[card.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleCardStatus(card.id, card.isActive)}
                      className="dashboard-icon-btn"
                      title={card.isActive ? 'Block card' : 'Activate card'}
                    >
                      {card.isActive ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4" />
                      )}
                    </button>
                    <button className="dashboard-icon-btn" title="Card settings">
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="dashboard-card-number">
                  {showCardDetails[card.id]
                    ? formatCardNumber(card.cardNumber)
                    : maskCardNumber(card.cardNumber)}
                </div>

                <div className="dashboard-card-details-row">
                  <div>
                    <span className="dashboard-detail-label">Expires</span>
                    <span className="dashboard-detail-value">{card.expiryDate}</span>
                  </div>
                  <div>
                    <span className="dashboard-detail-label">CVV</span>
                    <span className="dashboard-detail-value">
                      {showCardDetails[card.id] ? card.cvv : '***'}
                    </span>
                  </div>
                </div>

                <div className="dashboard-card-limits">
                  <div>
                    <span className="dashboard-detail-label">Daily Limit</span>
                    <span className="dashboard-detail-value">
                      ${card.dailyLimit.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="dashboard-detail-label">Monthly Limit</span>
                    <span className="dashboard-detail-value">
                      ${card.monthlyLimit.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {cards.length === 0 && !showRequestForm && (
            <div className="dashboard-card dashboard-empty-state">
              <div className="dashboard-empty-icon">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="dashboard-empty-title">No Cards Yet</h3>
              <p className="dashboard-empty-text">
                You haven&apos;t requested any cards yet. Start by requesting your first card.
              </p>
              <button
                onClick={() => setShowRequestForm(true)}
                className="btn-primary"
              >
                Request Your First Card
              </button>
            </div>
          )}
        </>
      )}
    </DashboardPageShell>
  );
}
