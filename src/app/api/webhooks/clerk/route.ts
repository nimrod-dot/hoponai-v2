import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Verification failed', { status: 400 });
  }

  const supabase = createServerClient();

  switch (evt.type) {
    case 'user.created': {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(' ');

      // Create organization for the user
      const { data: org } = await supabase
        .from('organizations')
        .insert({
          name: fullName ? `${fullName}'s Organization` : 'My Organization',
          slug: `org-${id.slice(-8)}`,
        })
        .select()
        .single();

      // Create user record
      await supabase.from('users').insert({
        clerk_user_id: id,
        org_id: org?.id,
        email: email || '',
        full_name: fullName || null,
        avatar_url: image_url || null,
        role: 'owner',
      });

      break;
    }

    case 'user.updated': {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data;
      const email = email_addresses[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(' ');

      await supabase
        .from('users')
        .update({
          email: email || '',
          full_name: fullName || null,
          avatar_url: image_url || null,
        })
        .eq('clerk_user_id', id);

      break;
    }

    case 'user.deleted': {
      const { id } = evt.data;
      await supabase.from('users').delete().eq('clerk_user_id', id as string);
      break;
    }
  }

  return new Response('OK', { status: 200 });
}