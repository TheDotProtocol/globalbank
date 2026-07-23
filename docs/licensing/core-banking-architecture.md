# Core Banking Architecture

## Design principle

**General ledger first:** All money movement posts balanced journal entries before customer balances are updated.

## Chart of accounts

| Code | Name | Type |
|---|---|---|
| 1100 | Settlement Suspense | Asset |
| 1200 | Loans Receivable | Asset |
| 1210 | Allowance for Loan Losses | Asset |
| 2100 | Customer Deposits Control | Liability |
| 2101-{acct} | Customer sub-ledger | Liability |
| 2200 | Nostro Payable | Liability |
| 2300 | Safeguarded Customer Funds | Liability |
| 4100 | Fee Income | Revenue |
| 4200 | Interest Income | Revenue |
| 5100 | Interest Expense | Expense |
| 5200 | Loan Loss Provision | Expense |

## Posting flows

### Customer deposit (Stripe)
```
DR 2200 Nostro
CR 2101-{customer sub-ledger}
```

### Internal transfer
```
DR 2101-{source}
CR 2101-{destination}
```

### Loan disbursement
```
DR 1200 Loans Receivable
CR 2101-{customer sub-ledger}
```

## Reconciliation

Daily job: `POST /api/admin/reconciliation`

Compares:
- Σ customer `Account.balance`
- Σ customer sub-ledger GL balances
- Safeguarding account balances vs customer liabilities

## Implementation

- `src/lib/regulatory/post-journal.ts` — central posting engine
- `src/lib/regulatory/settlement-ledger.ts` — settlement records (legacy, being unified)
- `Account.subLedgerCode` — links customer account to GL
- `Account.holdAmount` — available = balance − hold

## Multi-jurisdiction

- `User.primaryJurisdiction` — BVI, LABUAN, THAILAND, INDIA
- `BankLicense` — per-jurisdiction licence status
- `SafeguardingAccount` — segregated funds per jurisdiction

## Audit trail

All admin and customer money actions logged to `audit_logs`.
