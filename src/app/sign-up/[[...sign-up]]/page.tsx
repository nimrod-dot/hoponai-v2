export const dynamic = 'force-dynamic';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFBFD',
    }}>
      <SignUp
        appearance={{
          elements: {
            rootBox: { width: '100%', maxWidth: 440 },
            card: {
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              borderRadius: '16px',
            },
            formButtonPrimary: {
              background: '#0EA5E9',
              '&:hover': { background: '#0284C7' },
            },
          },
        }}
      />
    </div>
  );
}