# Security Specification

## Data Invariants
1. Users must exist before students or instructors can be linked to them.
2. Only admins can approve payments and change user roles.
3. Students can only see their own workouts and photos.
4. Instructors can see data of students they own (where `instructorId == auth.uid`).
5. Points can only be incremented, not decremented (except by admin).

## The Dirty Dozen (Attack Payloads)
1. **Identity Spoofing**: Student trying to read another student's workout.
2. **Privilege Escalation**: Student trying to update their own `role` to `admin`.
3. **State Shortcutting**: Instructor trying to approve their own payment status.
4. **Data Injection**: Sending a 1MB string as a notification title.
5. **Orphaned Writes**: Creating a student record for a non-existent UID.
6. **Unauthorized Batch**: Trying to increment points by 1 million in one go.
7. **Cross-Tenant Leak**: Instructor A reading messages sent to Instructor B.
8. **Shadow Field**: Adding `isVerified: true` to a profile update.
9. **Deletion of Wallet**: Malicious user trying to delete `plans` collection.
10. **Unauthenticated Write**: Trying to log a `system_log` without being signed in.
11. **PII Leak**: Guest user trying to list all user emails.
12. **Timestamp Fraud**: Setting `createdAt` to a date in 2030.

## Test Runner (Logic Check)
- Tests will verify that all above payloads return `PERMISSION_DENIED`.
- Tests will verify that Admins have total override.
- Tests will verify that relational gates (Master Gate) work for Instructor -> Student access.
