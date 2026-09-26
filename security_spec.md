# Security Specification: MoneyTrack Firestore Rules

## 1. Data Invariants
- **Identity Isolation**: A user can only read, create, update, or delete their own user document, transactions, and budgets (`/users/{userId}/**`).
- **Owner Immutability**: On transactions and budgets, `userId` must equal `request.auth.uid` on write, and cannot be altered during updates.
- **Document Boundary Protection**: Path parameter `{userId}` must match `request.auth.uid`.
- **Type and Range Boundaries**:
  - `amount` must be a positive number (> 0) and <= 1,000,000,000.
  - `type` must strictly be either `'income'` or `'expense'`.
  - `date` must be a valid ISO date string formatted `YYYY-MM-DD`.
  - `month` must strictly match `YYYY-MM`.
  - `title` must be between 1 and 200 characters.
  - `category` must be between 1 and 100 characters.
  - `notes` if provided must be <= 1000 characters.
  - `paymentMethod` must be <= 50 characters.

## 2. The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Read**: Attempting to read another user's transactions without authentication.
2. **Cross-Tenant Document Read**: User A authenticated attempting to read `/users/userB/transactions/tx123`.
3. **Ghost Identity Write**: User A attempting to insert a transaction into `/users/userA/transactions/tx1` with `userId: "userB"`.
4. **Path Impersonation**: User A attempting to create transaction in `/users/userB/transactions/tx1` with `userId: "userA"`.
5. **Negative Amount Exploit**: Creating a transaction with `amount: -500`.
6. **Zero Amount Transaction**: Creating a transaction with `amount: 0`.
7. **Type Injection**: Creating a transaction with `type: "admin_override"` instead of "income" or "expense".
8. **Invalid Date Format Attack**: Supplying `date: "malicious_string_injection"`.
9. **Title Buffer Exhaustion**: Submitting a `title` string exceeding 200 characters (e.g. 50,000 bytes).
10. **Shadow Key Injection**: Updating an existing transaction with unauthorized injected fields like `{ isAudited: true }`.
11. **Owner Tampering on Update**: Updating a transaction and attempting to change `userId` from User A to User B.
12. **PII Directory Scrape**: Attempting to query the entire `/users` collection or another user's profile document.

## 3. Security Assertions
All 12 attacks are guaranteed to return `PERMISSION_DENIED` by strictly scoping Firestore rules under `/users/{userId}` where `request.auth.uid == userId`, enforcing strong regex and type checks on every field, and denying all root collection scans.
