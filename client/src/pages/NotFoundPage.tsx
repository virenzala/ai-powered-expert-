import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { AlertTriangle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
      <AlertTriangle className="w-16 h-16 text-amber-500" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-sm">The page or export module you requested does not exist or has been relocated.</p>
      <Link to="/dashboard">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
};
