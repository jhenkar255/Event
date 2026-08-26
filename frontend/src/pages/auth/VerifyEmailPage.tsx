import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DiyaIcon, MandalaCorner } from '../../components/layout/IndianMotifs';
import { CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();

  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing email verification token.');
      return;
    }

    const performVerification = async () => {
      try {
        const res = await verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Email verified successfully! Welcome to UtsavMitra.');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Verification token is invalid or has expired.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 relative">
      <div className="max-w-md w-full rounded-3xl bg-utsav-ivory dark:bg-utsav-maroon-950 border-2 border-utsav-gold/60 shadow-2xl p-6 sm:p-8 relative overflow-hidden space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute top-0 right-0 pointer-events-none opacity-20 dark:opacity-15">
          <MandalaCorner className="w-32 h-32" />
        </div>

        <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-utsav-maroon-800 to-utsav-maroon-900 border border-utsav-gold shadow-lg">
          <DiyaIcon className="w-10 h-10" />
        </div>

        <h1 className="font-heading text-2xl font-bold tracking-tight text-utsav-maroon-800 dark:text-utsav-gold">
          Email Verification
        </h1>

        {status === 'loading' && (
          <div className="py-6 space-y-3">
            <div className="w-8 h-8 border-4 border-utsav-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-gray-500">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h2 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">{message}</h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Your account is fully activated.</p>
            </div>
            <Link
              to="/login"
              className="w-full py-3.5 rounded-xl maroon-gradient-btn font-bold text-sm shadow-xl inline-flex items-center justify-center space-x-2 text-utsav-gold cursor-pointer"
            >
              <span>Proceed to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-300 dark:border-red-800 space-y-2">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />
              <h2 className="text-sm font-bold text-red-900 dark:text-red-200">Verification Failed</h2>
              <p className="text-xs text-red-700 dark:text-red-300">{message}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-utsav-maroon-800 dark:text-utsav-gold hover:underline"
            >
              <span>Go to Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
