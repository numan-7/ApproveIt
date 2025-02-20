// Import Supabase Edge Runtime definitions
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Handle incoming requests
Deno.serve(async (req) => {
  try {
    // Load environment variables
    const SUPABASE_URL = Deno.env.get('URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY')!;
    const MAILJET_API_KEY = Deno.env.get('MAILJET_API_KEY')!;
    const MAILJET_SECRET_KEY = Deno.env.get('MAILJET_SECRET_KEY')!;

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !MAILJET_API_KEY ||
      !MAILJET_SECRET_KEY
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables' }),
        { status: 500 }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Parse request body
    const { approvers, requester } = await req.json();

    if (!approvers || !Array.isArray(approvers)) {
      return new Response(
        JSON.stringify({ error: 'Invalid approvers format' }),
        { status: 400 }
      );
    }

    // Extract emails from approvers array
    const emails = approvers.map((a) => a.email);

    // Query Supabase to find registered users
    const { data: registeredUsers, error: userCheckError } = await supabase
      .from('users')
      .select('email')
      .in('email', emails);

    if (userCheckError) {
      return new Response(JSON.stringify({ userCheckError }), { status: 500 });
    }

    // Find unregistered users
    const registeredEmails = registeredUsers.map((u) => u.email);
    const unregisteredApprovers = approvers.filter(
      (a) => !registeredEmails.includes(a.email)
    );

    if (unregisteredApprovers.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No new users to invite' }),
        { status: 200 }
      );
    }

    // Prepare email requests
    const emailRequests = unregisteredApprovers.map((approver) => {
      return fetch('https://api.mailjet.com/v3.1/send', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${MAILJET_API_KEY}:${MAILJET_SECRET_KEY}`)}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: 'email@approveit.dev', Name: 'ApproveIt' },
              To: [{ Email: approver.email, Name: approver.name }],
              TemplateID: 6743401,
              TemplateLanguage: true,
              Subject: 'You have been invited!',
              Variables: {
                details: {
                  approver: approver.email,
                  requestor: requester,
                },
              },
            },
          ],
        }),
      });
    });

    // Send all emails concurrently and collect responses
    const responses = await Promise.all(emailRequests);
    const responseBodies = await Promise.all(
      responses.map((res) => res.json())
    );

    return new Response(
      JSON.stringify({ message: 'Invites sent', responses: responseBodies }),
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
