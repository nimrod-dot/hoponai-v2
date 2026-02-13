import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { name, email, company, companySize, phone, message } = await req.json();

    // Validate required fields
    if (!name || !email || !company || !companySize) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save to database
    const { data, error } = await supabase
      .from('sales_inquiries')
      .insert([
        {
          name,
          email,
          company,
          company_size: companySize,
          phone,
          message,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save inquiry' },
        { status: 500 }
      );
    }

    // TODO: Send notification email to sales team
    // You can integrate with SendGrid, Resend, or your email service here

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Contact sales error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}