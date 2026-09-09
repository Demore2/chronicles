# How to Use the Email Integration Prompt

## Quick Start

1. **Copy the prompt** from `feedback-email-integration-prompt.md`
2. **Open Claude** in one of these ways:
   - VS Code with Claude extension (Ctrl+Shift+P → "Claude: Ask")
   - claude.ai in your browser
   - Any other Claude interface
3. **Paste the entire prompt** into the chat
4. **Claude will provide:**
   - Complete Supabase edge function code
   - Email template HTML
   - Step-by-step deployment instructions
   - Testing guide with curl examples
   - Configuration instructions

## What Claude Will Deliver

The response will include:

### 1. **Supabase Edge Function (`send-feedback-email`)**
   - TypeScript/JavaScript code that runs when feedback is inserted
   - Auto-detects user email from Supabase auth
   - Sends two emails: one to admin, one to user
   - Includes error handling and logging

### 2. **Email Templates**
   - HTML for admin notification (professional, organized)
   - HTML for user confirmation (friendly, welcoming)
   - Both formatted for email clients (Outlook, Gmail, Apple Mail)

### 3. **Deployment Steps**
   - Login to your Supabase dashboard
   - Create a new Edge Function from the provided code
   - Link it to trigger on `public.feedback` table inserts
   - Configure environment variables (admin email address)

### 4. **Testing Instructions**
   - Curl commands to test the function directly
   - Steps to submit feedback through your app and verify emails arrive
   - Where to check email logs if something fails

## Testing After Implementation

Once Claude provides the implementation:

1. **Deploy the edge function** to your Supabase project
2. **Open your app** and navigate to the Feedback modal (usually in Profile/Settings)
3. **Submit a bug report:**
   - Fill in a test message like: "Test bug report - this is a test"
   - Select "Bug" as the type
   - Click "Versturen" (Send)
   - You should see a success toast
4. **Check your email:**
   - businessdemore@gmail.com should receive a notification within 30 seconds
   - Your app's registered user email should receive a confirmation
5. **Submit an idea:**
   - Repeat the same process but select "Idea" instead of "Bug"
   - Verify both emails arrive correctly

## Troubleshooting

**Emails not arriving?**
- Check Supabase edge function logs in your dashboard
- Look for error messages or failures
- Verify the email service is properly configured in Supabase

**Email sending fails?**
- Supabase needs an email service configured (Resend, SendGrid, or AWS SES)
- This is configured in your Supabase project settings
- Claude's response will include configuration details

**Users not getting confirmation emails?**
- Verify users have valid email addresses in `auth.users` table
- Check that the auth email hasn't been blocked as spam
- Review the edge function logs for issues

## File Structure After Implementation

Your project structure should remain unchanged. The edge function lives in:
```
supabase/
  functions/
    send-feedback-email/
      index.ts          ← Created by deploying Claude's code
```

No changes needed to:
- `src/components/feedback-modal.tsx`
- `src/app/profiel/settings.tsx`
- Your app's existing code

The integration is **seamless and automatic** — once deployed, emails send whenever feedback is submitted.

## Next Steps

1. Get Claude's implementation following the prompt
2. Deploy the edge function
3. Test with a bug report and idea submission
4. Verify emails in both inbox and confirm delivery
5. You're done! The system now automatically notifies everyone

---

**Questions?** Reference the prompt for clarifications on the email flow, RLS policies, or technical details about how the integration works.
