import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, company, companySize, message } = body;

    if (!email || !company) {
      return NextResponse.json(
        { error: 'Email and company name are required' },
        { status: 400 }
      );
    }

    // Block personal email domains
    const blockedDomains = [
      'gmail.com', 'yahoo.com', 'yahoo.co.il', 'hotmail.com', 'outlook.com',
      'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'proton.me',
      'zoho.com', 'yandex.com', 'gmx.com', 'live.com', 'me.com',
      'msn.com', 'inbox.com', 'walla.co.il', 'walla.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain || blockedDomains.includes(domain)) {
      return NextResponse.json(
        { error: 'Please use a work email address' },
        { status: 400 }
      );
    }

    // Store in Supabase
    const { error } = await supabase
      .from('sales_inquiries')
      .insert({
        email,
        company,
        company_size: companySize || null,
        message: message || null,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Supabase insert error:', error);
      // Still return success to user - we don't want form to fail
      // if table doesn't exist yet. Log it and fix later.
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sales inquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}