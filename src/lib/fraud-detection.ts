interface FraudPattern {
  id: string;
  type: 'transaction' | 'login' | 'card' | 'kyc';
  riskScore: number;
  description: string;
  timestamp: Date;
  userId?: string;
  data: any;
}

class AdvancedFraudDetection {
  private fraudPatterns: FraudPattern[] = [];
  private riskThresholds = {
    HIGH: 0.8,
    MEDIUM: 0.5,
    LOW: 0.2
  };

  async detectTransactionFraud(transaction: any, user: any): Promise<{
    isFraudulent: boolean;
    riskScore: number;
    reasons: string[];
    action: 'ALLOW' | 'BLOCK' | 'REVIEW';
  }> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // Amount-based analysis
    if (transaction.amount > 10000) {
      riskScore += 0.3;
      riskFactors.push('High amount transaction');
    }

    if (transaction.amount < 1) {
      riskScore += 0.2;
      riskFactors.push('Suspiciously low amount');
    }

    // Time-based analysis
    const hour = new Date(transaction.timestamp).getHours();
    if (hour >= 2 && hour <= 6) {
      riskScore += 0.3;
      riskFactors.push('Unusual transaction time');
    }

    // Location analysis
    if (transaction.location && !this.isKnownLocation(user.id, transaction.location)) {
      riskScore += 0.4;
      riskFactors.push('Unusual location');
    }

    // Velocity analysis
    const recentTransactions = this.getRecentTransactions(user.id, 1);
    if (recentTransactions.length > 5) {
      riskScore += 0.4;
      riskFactors.push('High transaction velocity');
    }

    riskScore = Math.min(1, Math.max(0, riskScore));

    let action: 'ALLOW' | 'BLOCK' | 'REVIEW' = 'ALLOW';
    if (riskScore >= this.riskThresholds.HIGH) {
      action = 'BLOCK';
    } else if (riskScore >= this.riskThresholds.MEDIUM) {
      action = 'REVIEW';
    }

    if (riskScore > this.riskThresholds.LOW) {
      this.logFraudPattern({
        id: Math.random().toString(36).substr(2, 9),
        type: 'transaction',
        riskScore,
        description: `Suspicious transaction: ${riskFactors.join(', ')}`,
        timestamp: new Date(),
        userId: user.id,
        data: { transaction, riskFactors }
      });
    }

    return {
      isFraudulent: riskScore >= this.riskThresholds.HIGH,
      riskScore,
      reasons: riskFactors,
      action
    };
  }

  async detectLoginFraud(loginData: any, user: any): Promise<{
    isFraudulent: boolean;
    riskScore: number;
    reasons: string[];
    action: 'ALLOW' | 'BLOCK' | 'REVIEW';
  }> {
    const riskFactors: string[] = [];
    let riskScore = 0;

    // IP address analysis
    if (!this.isKnownIP(user.id, loginData.ipAddress)) {
      riskScore += 0.4;
      riskFactors.push('Unknown IP address');
    }

    // Device fingerprint analysis
    if (!this.isKnownDevice(user.id, loginData.deviceFingerprint)) {
      riskScore += 0.5;
      riskFactors.push('Unknown device');
    }

    // Time-based analysis
    const hour = new Date(loginData.timestamp).getHours();
    if (hour < 6 || hour > 23) {
      riskScore += 0.3;
      riskFactors.push('Unusual login time');
    }

    // Failed attempts
    const failedAttempts = this.getFailedLoginAttempts(user.id, 1);
    if (failedAttempts.length > 3) {
      riskScore += 0.4;
      riskFactors.push('Multiple failed login attempts');
    }

    riskScore = Math.min(1, Math.max(0, riskScore));

    let action: 'ALLOW' | 'BLOCK' | 'REVIEW' = 'ALLOW';
    if (riskScore >= this.riskThresholds.HIGH) {
      action = 'BLOCK';
    } else if (riskScore >= this.riskThresholds.MEDIUM) {
      action = 'REVIEW';
    }

    return {
      isFraudulent: riskScore >= this.riskThresholds.HIGH,
      riskScore,
      reasons: riskFactors,
      action
    };
  }

  private isKnownLocation(userId: string, location: string): boolean {
    // Implementation would check user's known locations
    return true; // Placeholder
  }

  private isKnownIP(userId: string, ipAddress: string): boolean {
    // Implementation would check user's known IPs
    return true; // Placeholder
  }

  private isKnownDevice(userId: string, deviceFingerprint: string): boolean {
    // Implementation would check user's known devices
    return true; // Placeholder
  }

  private getRecentTransactions(userId: string, hours: number): any[] {
    // Implementation would fetch from database
    return [];
  }

  private getFailedLoginAttempts(userId: string, hours: number): any[] {
    // Implementation would fetch from database
    return [];
  }

  private logFraudPattern(pattern: FraudPattern): void {
    this.fraudPatterns.push(pattern);
  }

  getFraudPatterns(): FraudPattern[] {
    return this.fraudPatterns;
  }
}

export const fraudDetection = new AdvancedFraudDetection(); 