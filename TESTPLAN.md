# KinTree End-to-End Test Plan

## 1. Purpose
This plan documents the primary user flows in KinTree and defines how each flow should be tested. It is designed to guide Playwright UI tests plus supporting API/integration checks.

## 2. Scope
Application areas covered:
- Authentication and account lifecycle
- Profile management and account security
- Family member management and relationship linking
- Tree visualization and shared tree workflows
- Family event dashboard
- Settings, help, and chat pages

## 3. Test Environments
- Client app: http://localhost:3000
- Server API: http://localhost:5000
- Auth/storage provider: Supabase

Baseline test users:
- User A: existing registered account with at least one family member
- User B: existing registered account not yet linked to User A
- User C: account with shared trees received
- User D: account with MFA enabled

## 4. Flow Catalog

### Flow 1: Register a New Account

Routes:
- /register
- /login

APIs touched:
- POST /api/auth/sync

Steps:
1. Open /register.
2. Fill required fields with valid values.
3. Submit Create Account.
4. Verify redirect to /login.

Expected results:
- Registration succeeds and account metadata is persisted.
- Login page loads after registration.

Negative coverage:
- Invalid email format rejected.
- Duplicate email returns visible error.

### Flow 2: Login with Email and Password

Routes:
- /login

Auth behavior:
- Optional remember-me (stores email in local storage)
- Optional MFA challenge for users with verified TOTP

Steps:
1. Open /login.
2. Enter valid credentials.
3. Submit Sign In.

Expected results:
- Successful users land on /.
- 'Remember me' restores saved email on next login screen load.

Negative coverage:
- Invalid credentials show error text.
- Protected routes redirect to /login if not authenticated.

### Flow 3: Login with MFA (TOTP)

Routes:
- /login

Auth behavior:
- If a verified TOTP factor exists, user must verify a 6-digit code.

Steps:
1. Login with valid username/password for MFA-enabled account.
2. Verify MFA challenge UI appears.
3. Enter valid TOTP code and submit.

Expected results:
- User is redirected to / after successful verification.

Negative coverage:
- Invalid code shows verification error and remains on MFA step.

### Flow 4: Password Reset and Update Password

Routes:
- /reset-password
- /update-password
- /login

Steps:
1. Open /reset-password and submit a valid email.
2. Follow reset link to /update-password.
3. Enter a valid new password and submit.
4. Re-authenticate at /login with new password.

Expected results:
- Reset request shows success message.
- Password update succeeds and redirects to /login.
- New password works for login.

### Flow 5: View Own Profile Data

Routes:
- /account/:id (own id)

APIs touched:
- GET /api/auth/user/email/:email
- GET /api/auth/user/:id

Steps:
1. Navigate to own account page.
2. Verify profile, personal info, and address sections render.

Expected results:
- Profile fields are populated from database values.
- Page loads without fallback errors.

### Flow 6: Edit Own Profile and Persist Changes

Routes:
- /account/:id

APIs touched:
- PUT /api/auth/profile
- POST /api/auth/upload-profile-picture

Steps:
1. Enter edit mode for profile/personal/address sections.
2. Update fields and save.
3. Refresh page.

Expected results:
- Saved values persist after refresh.
- Success feedback is shown.

Negative coverage:
- Oversized image upload rejected.
- Non-image upload rejected.

### Flow 7: Manage Account Security (MFA + Email Verification)

Routes:
- /account/:id (own account)

Steps:
1. Start authenticator setup.
2. Scan QR or use pending setup and enter TOTP code.
3. Verify authenticator status becomes enabled.
4. Disable authenticator and verify status toggles.
5. If email unverified, trigger resend verification email.

Expected results:
- MFA state transitions are correct and visible.
- Verification resend returns success status.

### Flow 8: Delete Account

Routes:
- /account/:id
- /login

APIs touched:
- DELETE /api/auth/remove/:id

Steps:
1. Open own account page.
2. Click Delete account.
3. Confirm deletion in modal.

Expected results:
- Account and related data are removed.
- User is logged out and redirected to /login.

Negative coverage:
- Backend failure surfaces user-visible error and keeps modal flow recoverable.

### Flow 9: View Family Directory and Open Member Profile

Routes:
- /family
- /account/:id

APIs touched:
- GET /api/family-members/user/:userId

Steps:
1. Open /family.
2. Search for a member by first/last name.
3. Sort list and verify ordering.
4. Open member profile with View link.

Expected results:
- Matching members appear in list.
- Navigation lands on target member profile.

### Flow 10: Add Existing User as Family Member

Routes:
- /tree (Add Family Member popup)
- /account/:id

APIs touched:
- GET /api/family-members/user/:userId
- GET /api/auth/users
- GET /api/family-members/active/:id
- POST /api/family-members
- POST /api/relationships

Steps:
1. Open tree page and launch Add Family Member popup.
2. Search and select an existing registered user.
3. Choose relationship type (and maternal/paternal side when required).
4. Submit add.

Expected results:
- New tree member record is created.
- Relationship record is created.
- User is redirected to selected member profile.

Negative coverage:
- Cannot add self.
- Cannot add a duplicate existing family member.

### Flow 11: Add Manual (Non-Registered) Family Member

Routes:
- /tree (Add Family Member popup)
- /account/:id

APIs touched:
- GET /api/family-members/active/:id
- POST /api/family-members
- POST /api/relationships

Steps:
1. In Add Family Member popup, switch to manual mode.
2. Enter member details and relationship.
3. Submit add.

Expected results:
- Member is created with no linked user account.
- Relationship is created.
- User can edit the family member.

### Flow 12: Remove Family Member.

Routes:
- /account/:id

APIs touched:
- GET /api/tree-info/:id
- GET /api/family-members/active/:id
- POST /api/family-members
- DELETE /api/relationships

Steps:
1. Open /family.
2. Click on a member's 'View' button to open their account details.
3. Submit and verify delete.

Expected results:
- Family member is removed from the tree and user's family page.
- Tree and member persist on failure with visible error message.

### Flow 13: Share Tree with Another Member

Routes:
- /tree/sharetree

APIs touched:
- GET /api/family-members/user/:userId
- GET /api/auth/users
- GET /api/tree-info/:id
- POST /api/share-trees/share

Steps:
1. Open share tree page.
2. Search/select a family member or send through email.
3. Submit share.

Expected results:
- Shared tree record is created.
- Email is sent if selected.
- Sender is redirected to home/dashboard.

Negative coverage:
- Missing required selected member or email blocks submit.

### Flow 14: View Incoming Shared Trees and Open One

Routes:
- /tree/viewsharedtrees
- /sharedtree/:id

APIs touched:
- GET /api/share-trees/receiver/:id
- GET /api/auth/users
- GET /api/share-trees/:id

Steps:
1. Login as receiving user.
2. Open shared trees list page.
3. Verify list includes incoming shares.
4. Click View Tree for a share.

Expected results:
- Receiver can navigate to shared tree view.
- Sender identity and tree content display.

### Flow 15: View Relationship Badge on Another User Profile

Routes:
- /account/:id (other user)

APIs touched:
- GET /api/relationships/between/:viewerId/:profileId

Steps:
1. Open profile of another user/family member.
2. Observe relationship tag.

Expected results:
- Relationship badge appears for linked members.
- Missing relationship returns neutral UI without crash.

### Flow 15A: Add Existing Profile to Tree Structure

Routes:
- /account/:id (other profile)
- /tree

APIs touched:
- GET /api/family-members/user/:userId
- GET /api/tree-info/:id
- PUT /api/tree-info/:id

Steps:
1. Open another profile not yet placed in your current tree structure.
2. Launch Add to Tree popup.
3. Search and choose an existing related member already in the tree.
4. Select relationship direction/type and submit.

Expected results:
- Selected profile is added into tree object with correct relationship edge.
- Navigating to /tree shows the newly linked profile.

Negative coverage:
- Prevent adding a profile already present in tree object.
- Show useful error if tree update fails.

### Flow 16: Event Dashboard CRUD

Routes:
- /
- /useractivitydash

APIs touched:
- GET /api/events/:auth_uid
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

Steps:
1. Open dashboard and create a new event.
2. Verify event appears in list.
3. Edit event and verify updates.
4. Delete event and verify removal.
5. Search by title/date and toggle sort order.

Expected results:
- CRUD operations persist correctly.
- Search and sort update list presentation as expected.

### Flow 17: Backup and Restore (Unimplemented)

Routes:
- Backend/API flow (UI trigger pending in Settings)

APIs touched:
- POST /api/backup/:id
- POST /api/backup/restore/:id

Steps:
1. Trigger backup for test user.
2. Mutate user family data.
3. Trigger restore.
4. Re-open family/tree views and verify restoration.

Expected results:
- Backup payload captures account-related records.
- Restore rehydrates prior data snapshot.

### Flow 17A: Merge Shared Tree Members and Assign Relationships (Unimplemented)

Routes:
- /sharedtree/:id

APIs touched:
- POST /api/share-trees/merge/:sharedTreeId
- POST /api/share-trees/assign-relationship

Steps:
1. Open a shared tree as the receiver.
2. Select shared members to merge into receiver base tree.
3. Submit merge request.
4. Assign relationship types to newly merged members.

Expected results:
- Merged members are persisted to receiver data.
- Relationship assignments are saved and reflected in tree/profile views.

Negative coverage:
- Empty merge selection is rejected.
- Invalid sharedTreeId returns handled error.

### Flow 18: Navigation and Informational Pages

Routes:
- /websitesettings
- /help
- /chat

Steps:
1. Open each route as authenticated user.
2. Verify core page sections load and navigation remains functional.

Expected results:
- Settings renders controls (including dark mode toggle).
- Help FAQ content is visible.
- Chat placeholder content is visible.

## 5. Cross-Cutting Assertions
Apply these checks in most UI flows:
- Auth guard behavior for protected routes
- User-friendly error messaging for failed API requests
- No console exceptions that break flow completion (crash)

## 6. Traceability Matrix (Route/API to Flow)
- Auth and account: Flows 1-8
- Family and profile viewing: Flows 9, 15
- Tree and membership: Flows 10-12
- Shared trees: Flows 13-14
- Events: Flow 16
- Backup/restore and shared merge operations: Flows 17-17A
- Support/settings placeholders: Flow 18
