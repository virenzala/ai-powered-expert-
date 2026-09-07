import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Globe } from 'lucide-react';
import api from '../services/api';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<string>('Sales');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        showToast('Registration successful!', 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast('Registration failed', 'error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.jpg"
            alt="ExportFlow Logo"
            className="w-16 h-16 rounded-2xl object-cover border border-blue-500/30 shadow-xl shadow-blue-600/30 mx-auto"
          />
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-xs text-slate-400">Join ExportFlow Outreach Engine</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email Address *" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password *" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Select
            label="Account Role *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { label: 'Admin (Full Controls)', value: 'Admin' },
              { label: 'Manager (Approvals & Campaigns)', value: 'Manager' },
              { label: 'Sales User (Outreach & Drafts)', value: 'Sales' },
            ]}
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
