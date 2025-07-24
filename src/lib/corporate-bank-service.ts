import { prisma } from '@/lib/prisma';

export interface CorporateBankTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  reference: string;
  userId: string;
  accountId: string;
  corporateBankId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
}

export class CorporateBankService {
  private static instance: CorporateBankService;
  private kBankAccount: any = null;

  private constructor() {}

  public static getInstance(): CorporateBankService {
    if (!CorporateBankService.instance) {
      CorporateBankService.instance = new CorporateBankService();
    }
    return CorporateBankService.instance;
  }

  /**
   * Get or initialize the K Bank corporate account
   */
  private async getKBankAccount() {
    if (this.kBankAccount) {
      return this.kBankAccount;
    }

    this.kBankAccount = await prisma.corporateBank.findFirst({
      where: {
        OR: [
          { bankName: 'K Bank' },
          { bankName: 'Kasikorn Bank' }
        ],
        isActive: true
      }
    });

    if (!this.kBankAccount) {
      throw new Error('K Bank corporate account not found or inactive');
    }

    return this.kBankAccount;
  }

  /**
   * Route a transaction through the K Bank corporate account
   */
  async routeTransactionThroughKBank(
    userId: string,
    accountId: string,
    type: 'CREDIT' | 'DEBIT',
    amount: number,
    description: string,
    reference: string
  ): Promise<CorporateBankTransaction> {
    const kBank = await this.getKBankAccount();

    console.log(`🏦 Routing ${type} transaction through K Bank:`, {
      amount,
      description,
      reference,
      kBankId: kBank.id
    });

    // Create bank transfer record
    const bankTransfer = await prisma.bankTransfer.create({
      data: {
        corporateBankId: kBank.id,
        fromAccountId: type === 'DEBIT' ? accountId : null,
        toAccountNumber: type === 'CREDIT' ? await this.getAccountNumber(accountId) : '198-1-64757-9',
        toAccountName: type === 'CREDIT' ? await this.getAccountHolderName(accountId) : 'The Dotprotocol Co., Ltd',
        amount: amount,
        currency: 'THB',
        transferType: type === 'CREDIT' ? 'INBOUND' : 'OUTBOUND',
        status: 'COMPLETED',
        reference: `KBANK-${reference}`,
        description: `${type} transaction: ${description}`,
        fee: kBank.transferFee,
        netAmount: type === 'CREDIT' ? amount - kBank.transferFee : amount + kBank.transferFee,
        processedAt: new Date()
      }
    });

    console.log(`✅ Bank transfer created:`, bankTransfer.id);

    return {
      id: bankTransfer.id,
      type,
      amount,
      description,
      reference: bankTransfer.reference,
      userId,
      accountId,
      corporateBankId: kBank.id,
      status: 'COMPLETED',
      createdAt: bankTransfer.createdAt
    };
  }

  /**
   * Process a credit transaction (money coming into user account)
   */
  async processCreditTransaction(
    userId: string,
    accountId: string,
    amount: number,
    description: string,
    reference: string
  ) {
    console.log(`💰 Processing CREDIT transaction:`, { amount, description, reference });

    // Route through K Bank (money flows from K Bank to user account)
    const kBankTransaction = await this.routeTransactionThroughKBank(
      userId,
      accountId,
      'CREDIT',
      amount,
      description,
      reference
    );

    // Create the actual transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'CREDIT',
        amount: amount,
        description: `${description} (via K Bank)`,
        reference: reference,
        status: 'COMPLETED',
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountNumber: '198-1-64757-9',
        destinationAccountNumber: await this.getAccountNumber(accountId),
        sourceAccountHolder: 'The Dotprotocol Co., Ltd',
        destinationAccountHolder: await this.getAccountHolderName(accountId),
        transferFee: 0, // Fee already deducted in K Bank transaction
        netAmount: amount
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    console.log(`✅ CREDIT transaction completed:`, transaction.id);
    return transaction;
  }

  /**
   * Process a debit transaction (money going out of user account)
   */
  async processDebitTransaction(
    userId: string,
    accountId: string,
    amount: number,
    description: string,
    reference: string
  ) {
    console.log(`💸 Processing DEBIT transaction:`, { amount, description, reference });

    // Route through K Bank (money flows from user account to K Bank)
    const kBankTransaction = await this.routeTransactionThroughKBank(
      userId,
      accountId,
      'DEBIT',
      amount,
      description,
      reference
    );

    // Create the actual transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'DEBIT',
        amount: amount,
        description: `${description} (via K Bank)`,
        reference: reference,
        status: 'COMPLETED',
        transferMode: 'EXTERNAL_TRANSFER',
        sourceAccountNumber: await this.getAccountNumber(accountId),
        destinationAccountNumber: '198-1-64757-9',
        sourceAccountHolder: await this.getAccountHolderName(accountId),
        destinationAccountHolder: 'The Dotprotocol Co., Ltd',
        transferFee: 0, // Fee already added in K Bank transaction
        netAmount: amount
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    console.log(`✅ DEBIT transaction completed:`, transaction.id);
    return transaction;
  }

  /**
   * Get account number for a given account ID
   */
  private async getAccountNumber(accountId: string): Promise<string> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { accountNumber: true }
    });
    return account?.accountNumber || 'Unknown';
  }

  /**
   * Get account holder name for a given account ID
   */
  private async getAccountHolderName(accountId: string): Promise<string> {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });
    return account ? `${account.user.firstName} ${account.user.lastName}` : 'Unknown';
  }

  /**
   * Get K Bank transaction summary
   */
  async getKBankSummary() {
    const kBank = await this.getKBankAccount();
    
    const transfers = await prisma.bankTransfer.findMany({
      where: { corporateBankId: kBank.id },
      orderBy: { createdAt: 'desc' }
    });

    const totalInbound = transfers
      .filter(t => t.transferType === 'INBOUND')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalOutbound = transfers
      .filter(t => t.transferType === 'OUTBOUND')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalFees = transfers.reduce((sum, t) => sum + Number(t.fee), 0);

    return {
      kBankAccount: kBank,
      totalTransfers: transfers.length,
      totalInbound,
      totalOutbound,
      totalFees,
      netFlow: totalInbound - totalOutbound,
      recentTransfers: transfers.slice(0, 10)
    };
  }
}

// Export singleton instance
export const corporateBankService = CorporateBankService.getInstance(); 