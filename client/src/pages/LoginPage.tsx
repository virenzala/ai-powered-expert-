import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Globe, Sparkles, Lock, Mail } from 'lucide-react';
import api from '../services/api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('admin@exportflow.com');
  const [password, setPassword] = useState<string>('password123');
  const [loading, setLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        showToast(`Welcome back, ${res.data.user.name}!`, 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      showToast('Authentication failed', 'error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-600/30">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">ExportFlow</h1>
          <p className="text-xs text-slate-400">AI-Powered Export Outreach Automation System</p>
        </div>

        {/* Demo Credentials Quick Switcher Banner */}
        <div className="p-3 bg-blue-950/40 border border-blue-900/50 rounded-xl text-xs space-y-1.5 text-slate-300">
          <p className="font-semibold text-blue-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Demo Login Credentials:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@exportflow.com');
                setPassword('password123');
              }}
              className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[11px] hover:bg-slate-700 font-mono"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('manager@exportflow.com');
                setPassword('password123');
              }}
              className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[11px] hover:bg-slate-700 font-mono"
            >
              Manager
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('sales@exportflow.com');
                setPassword('password123');
              }}
              className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[11px] hover:bg-slate-700 font-mono"
            >
              Sales
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            Sign In to Dashboard
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Need an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-semibold">
            Register Demo Account
          </Link>
        </div>
      </div>
    </div>
  );
};
