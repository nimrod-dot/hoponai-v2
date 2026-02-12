'use client';

import { useState, useEffect } from 'react';

export default function TeamPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    const res = await fetch('/api/teams/members');
    const data = await res.json();
    setMembers(data.members || []);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (res.ok) {
        setMessage('Invite sent!');
        setInviteEmail('');
        fetchMembers();
      } else {
        const err = await res.json();
        setMessage(err.error || 'Failed to send invite');
      }
    } catch {
      setMessage('Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1 style={{
        fontSize: 28, fontWeight: 700, color: '#1A1D26',
        fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 32,
      }}>
        Team
      </h1>

      {/* Invite form */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '24px',
        border: '1px solid #E8ECF2', marginBottom: 32,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1A1D26', marginBottom: 16 }}>
          Invite Team Member
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#4A5168', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 8,
                border: '1px solid #E8ECF2', fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#4A5168', display: 'block', marginBottom: 6 }}>
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              style={{
                padding: '10px 14px', borderRadius: 8,
                border: '1px solid #E8ECF2', fontSize: 14,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                background: '#fff',
              }}
            >
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleInvite}
            disabled={loading || !inviteEmail}
            style={{
              padding: '10px 24px', borderRadius: 8,
              border: 'none', background: '#0EA5E9', color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              opacity: loading || !inviteEmail ? 0.5 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Invite'}
          </button>
        </div>
        {message && (
          <p style={{ fontSize: 13, color: message.includes('sent') ? '#10B981' : '#EF4444', marginTop: 12 }}>
            {message}
          </p>
        )}
      </div>

      {/* Members list */}
      <div style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid #E8ECF2', overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8F9FC' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#4A5168' }}>Name</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#4A5168' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#4A5168' }}>Role</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: 13, fontWeight: 600, color: '#4A5168' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m.id} style={{ borderTop: '1px solid #E8ECF2' }}>
                <td style={{ padding: '14px 20px', fontSize: 14, color: '#1A1D26' }}>
                  {m.full_name || '-'}
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14, color: '#4A5168' }}>
                  {m.email}
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    borderRadius: 20, background: m.role === 'owner' ? '#FEF3C7' : '#E0F2FE',
                    color: m.role === 'owner' ? '#92400E' : '#0369A1',
                  }}>
                    {m.role}
                  </span>
                </td>
                <td style={{ padding: '14px 20px', fontSize: 14, color: '#10B981' }}>
                  Active
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}