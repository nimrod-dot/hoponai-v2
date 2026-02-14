import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export default async function SettingsPage() {
  const { userId } = await auth();
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('clerk_user_id', userId)
    .single();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
          Settings
        </h1>
        <p style={{ fontSize: 15, color: '#8B92A5' }}>
          Manage your account and organization.
        </p>
      </div>

      <div style={{ maxWidth: 600 }}>
        {/* Account */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2',
          padding: 28, marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1A1D26', marginBottom: 16 }}>
            Account
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: '#8B92A5', marginBottom: 2 }}>Name</div>
              <div style={{ fontSize: 15, color: '#1A1D26', fontWeight: 500 }}>
                {user?.full_name || 'Not set'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#8B92A5', marginBottom: 2 }}>Email</div>
              <div style={{ fontSize: 15, color: '#1A1D26', fontWeight: 500 }}>
                {user?.email || 'Not set'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#8B92A5', marginBottom: 2 }}>Role</div>
              <div style={{ fontSize: 15, color: '#1A1D26', fontWeight: 500 }}>
                {user?.role || 'Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2',
          padding: 28, marginBottom: 20,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1A1D26', marginBottom: 16 }}>
            Organization
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, color: '#8B92A5', marginBottom: 2 }}>Organization</div>
              <div style={{ fontSize: 15, color: '#1A1D26', fontWeight: 500 }}>
                {user?.organizations?.name || 'My Organization'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#8B92A5', marginBottom: 2 }}>Plan</div>
              <div style={{ fontSize: 15, color: '#1A1D26', fontWeight: 500 }}>
                {user?.organizations?.plan || 'Free Trial'}
              </div>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div style={{
          background: '#fff', borderRadius: 12, border: '1px solid #FEE2E2',
          padding: 28,
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#EF4444', marginBottom: 8 }}>
            Danger Zone
          </h2>
          <p style={{ fontSize: 14, color: '#8B92A5', marginBottom: 16 }}>
            Need to delete your account or organization? Contact support.
          </p>
          <a href="mailto:support@hoponai.com" style={{
            display: 'inline-block', padding: '8px 20px', borderRadius: 8,
            border: '1px solid #FCA5A5', color: '#EF4444', fontSize: 14,
            fontWeight: 600, textDecoration: 'none',
          }}>
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}