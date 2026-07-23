# AML / CFT Program Outline

**Entity:** Global Dot Bank (BVI → Labuan expansion)  
**MLRO:** To be appointed (record in `/admin/licensing`)

## 1. Customer identification (CDD)

- **Retail onboarding:** Sumsub WebSDK (level: `basic`) + identity verification
- **Fallback:** Manual document upload + admin review (`/admin/kyc`)
- **PEP / RCA:** Customer risk rating on `User.pepStatus`, `User.riskRating`
- **Periodic review:** `User.lastKycReviewAt` — refresh every 12–24 months (high risk: 6 months)

## 2. Sanctions screening

- **Onboarding:** Screen name against sanctions lists (`src/lib/aml/sanctions.ts`)
- **Transactions:** Full AML screen on transfers (`src/lib/aml/screening.ts`)
- **Production:** Integrate OpenSanctions or ComplyAdvantage via `SANCTIONS_API_URL` + `SANCTIONS_API_KEY`

## 3. Transaction monitoring

- Rule-based engine: high amount, structuring, velocity, high-risk countries
- Fraud scoring: `src/lib/aml/fraud-detection.ts`
- Auto CTR when amount ≥ `CTR_THRESHOLD_USD` (default 10,000)

## 4. Case management

- AML cases: `/admin/aml-cases`
- Status workflow: OPEN → INVESTIGATING → ESCALATED → SAR_FILED → CLOSED
- Sanctions hits: auto CRITICAL priority, block transactions

## 5. Reporting

| Report | Trigger | System |
|---|---|---|
| CTR | Threshold transaction | Auto draft in `regulatory_reports` |
| SAR/STR | Compliance escalation | `/admin/regulatory` |
| Monthly AML | Calendar | Manual export (future automation) |

## 6. Training

- Annual AML training for all staff
- Enhanced training for front office & compliance
- Record attendance (HR system — outside platform)

## 7. Record keeping

- KYC records: 5+ years post relationship end (jurisdiction-specific)
- Transaction records: audit log + GL entries
- AML cases: immutable case history

## 8. Regulator contact

- **BVI FSC:** STR submission per FSC AML regulations
- **Labuan FSA:** Align with AMLATFA reporting when Labuan entity live
