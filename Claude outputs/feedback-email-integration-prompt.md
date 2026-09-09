# Supabase Email Integration Prompt for Feedback System

Paste this entire prompt into Claude (VS Code, claude.ai, or any Claude interface) to implement email forwarding for the feedback system.

---

## Task: Implement Email Notifications for Feedback Submissions

I have a React Native (Expo) history learning app with a feedback system. Currently, when users submit bug reports or ideas through a modal (`FeedbackModal` in `src/components/feedback-modal.tsx`), the data is saved to a Supabase table (`public.feedback`) but **no email notifications are sent**.

### Current Feedback System Architecture

**Component:** `src/components/feedback-modal.tsx`
- Collects bug reports and ideas from authenticated users
- Submits to Supabase via: `await supabase.from('feedback').insert({ user_id: user.id, soort, bericht, app_versie, platform })`
- `soort` field is either `'bug'` or `'idee'`
- Currently shows only a success/failure toast to the user

**Supabase Table:** `public.feedback`
```
Columns:
  - id (UUID, primary key)
  - user_id (UUID, foreign key to auth.users)
  - soort (text: 'bug' or 'idee')
  - bericht (text, max 2000 characters)
  - app_versie (text)
  - platform (text: 'ios', 'android', or 'web')
  - created_at (timestamp)

RLS: Users can insert and read only their own feedback
```

**Admin Email:** businessdemore@gmail.com (configured in `src/app/profiel/settings.tsx`)

### Requirements

1. **Create a Supabase Edge Function** (`send-feedback-email`) that:
   - Triggers automatically when a new row is inserted into `public.feedback`
   - Sends an **admin notification email** to businessdemore@gmail.com containing:
     - Feedback type (Bug or Idea) as a clear label
     - User ID who submitted it
     - Message content
     - App version and platform
     - Timestamp
     - A link/reference to view in Supabase dashboard if possible
   - Sends a **user confirmation email** to the user's email address (from `auth.users.email`) containing:
     - Confirmation that their feedback was received
     - A summary of what they submitted
     - Estimated response time or next steps
   - Includes error handling: if email sending fails, log the error but don't block the feedback insertion
   - Uses Supabase's built-in email service (sendgrid integration or similar)

2. **Admin Email Template** should:
   - Clearly distinguish between Bug Reports and Ideas with different styling/emojis
   - Include all submission details
   - Be professional and organized
   - Include formatted message content (handle long text with wrapping)

3. **User Confirmation Email Template** should:
   - Be friendly and welcoming
   - Confirm receipt of their feedback
   - Thank them for contributing
   - Include their feedback type and message (so they know we got it)

4. **Testing Instructions:**
   - After implementation, I need to be able to submit a bug report through the app's FeedbackModal
   - Submit an idea through the app's FeedbackModal
   - Verify both arrive in the businessdemore@gmail.com inbox
   - Verify the user receives a confirmation email (or provide instructions on where to find logs)

### Implementation Steps

1. **Set up Supabase Edge Function:**
   - Create a new edge function in your Supabase project named `send-feedback-email`
   - Configure it to trigger on `INSERT` events from the `public.feedback` table
   - Set up environment variables if needed (admin email, email service credentials)

2. **Implement Email Logic:**
   - Use Supabase's email service (resend.com integration, sendgrid, or built-in)
   - Create two email templates: admin notification and user confirmation
   - Handle user lookup: get user's email from `auth.users` table using `user_id`
   - Format feedback data for email display

3. **Error Handling:**
   - Log failures to Supabase logs or a dedicated error table
   - Don't let email failures block the feedback insertion
   - Add retry logic if possible (exponential backoff)

4. **Testing:**
   - Provide clear instructions on how to test locally/in production
   - Include curl examples or function invocation examples if needed
   - Document where to check email delivery logs

### Code References

The app uses:
- **Supabase Client:** `import { supabase } from '@/lib/supabase'`
- **Auth Store:** `import { useAuthStore } from '@/store/auth-store'` (contains `user` with `id` and `email`)
- **Constants:** `SUPPORT_EMAIL = 'businessdemore@gmail.com'` is in `src/app/profiel/settings.tsx`
- **Type for Feedback:** `soort: 'bug' | 'idee'`

### Deliverables

1. Complete Supabase edge function code (`send-feedback-email`)
2. Email template HTML for admin notifications
3. Email template HTML for user confirmations
4. Step-by-step setup instructions to deploy this to the Supabase project
5. Testing instructions and curl/function invocation examples
6. Configuration guide (environment variables, email service setup)
7. Logging/debugging guide for monitoring email delivery

---

## Additional Context

- **App Type:** Expo Router (React Native), running on iOS/Android/Web
- **Backend:** Supabase (PostgreSQL, Auth, Functions, Edge Functions)
- **Email Service:** Supabase built-in email (resend.com or sendgrid integration)
- **App Version:** Accessible via `import { APP_VERSIE } from '@/constants/app-info'`
- **Platform Detection:** `Platform.OS` from react-native

Once implemented, the complete email flow should be:
1. User fills out feedback modal
2. Feedback is inserted into `public.feedback` table
3. Edge function triggers automatically
4. Admin email sent to businessdemore@gmail.com
5. User confirmation email sent to user's registered email
6. User sees success toast (existing behavior)

**Goal:** When a user submits a bug or idea, both the admin and the user receive email notifications without the user needing to know this is happening.
