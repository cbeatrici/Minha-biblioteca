# Security Specification & Test Scenarios

## 1. Data Invariants
- Each user profile (`/users/{userId}`) can only be created, read, updated, or deleted by the owner whose `request.auth.uid == userId`.
- User notebooks (`/users/{userId}/notebooks/{notebookId}`) can only be accessed or modified by the user themselves (`request.auth.uid == userId`).
- Notebooks cannot be created or updated with a mismatched `userId` attribute (`incoming().userId == userId && incoming().userId == request.auth.uid`).
- Unauthenticated requests are rejected for all read and write operations.
- Data from one account can never bleed into or be read by another account, preventing data mixing across accounts and devices.

## 2. Tested Threat Scenarios ("Dirty Dozen" Payloads)
1. **Unauthenticated Read:** Attempting to read `/users/user123` with no auth -> Rejected.
2. **Unauthenticated Write:** Attempting to write `/users/user123` with no auth -> Rejected.
3. **Cross-Tenant Notebook Read:** User A attempting to get `/users/userB/notebooks/nb1` -> Rejected.
4. **Cross-Tenant Notebook List:** User A attempting to list `/users/userB/notebooks` -> Rejected.
5. **Cross-Tenant Notebook Write:** User A attempting to create `/users/userB/notebooks/nb1` -> Rejected.
6. **Cross-Tenant Notebook Delete:** User A attempting to delete `/users/userB/notebooks/nb1` -> Rejected.
7. **Identity Spoofing in Payload:** User A writes to `/users/userA/notebooks/nb1` with `userId: "userB"` -> Rejected.
8. **Invalid Path Injection:** Notebook ID with special characters (`nb!@#$%^&*`) -> Rejected by `isValidId`.
9. **Missing Mandatory Fields:** Notebook created without required `id`, `userId`, or `title` -> Rejected.
10. **Oversized Title Bomb:** Notebook created with title length exceeding 500 characters -> Rejected.
11. **User Profile Tampering:** User A attempting to update `/users/userB` profile -> Rejected.
12. **Global Root Tampering:** Attempting to write to root collections or undeclared endpoints -> Rejected by catch-all rule.
