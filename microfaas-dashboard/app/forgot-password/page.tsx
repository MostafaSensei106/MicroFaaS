'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send, CheckCircle2, Cloud } from 'lucide-react';
import { container } from '@/src/core/di/container';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await container.forgotPasswordUseCase.execute({ email });
      setMessage(res.message);
      setSent(true);
    } catch {
      setMessage('Password reset link sent to ' + email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f5f5f7] text-[#1d1d1f] font-sans">
      <div className="w-full max-w-[460px]">
        <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] shadow-none p-[48px]">
          <Link href="/login" className="inline-flex items-center gap-2 text-[14px] font-[400] text-[#0066cc] hover:underline mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-[44px] h-[44px] rounded-full bg-[#0066cc] flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-[28px] font-[600] text-[#1d1d1f] tracking-[0.196px] leading-[1.14] mb-1">
              Reset Password
            </h2>
            <p className="text-[14px] font-[400] text-[#7a7a7a]">
              Enter your email to receive a recovery link.
            </p>
          </div>

          {sent ? (
            <div className="p-4 rounded-xl bg-[#f5f5f7] border border-[#e0e0e0] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#0066cc] shrink-0 mt-0.5" />
              <div>
                <p className="font-[600] text-[#1d1d1f] text-[14px]">Recovery Link Sent!</p>
                <p className="text-[14px] text-[#7a7a7a] mt-1">{message}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[12px] font-[600] text-[#1d1d1f] uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-[44px] pl-11 pr-4 rounded-full bg-white border border-[#e0e0e0] text-[#1d1d1f] text-[17px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[44px] rounded-full bg-[#0066cc] text-white text-[17px] font-[400] flex items-center justify-center gap-2 active:scale-[0.95] transition-transform disabled:opacity-50 disabled:active:scale-100 hover:bg-[#0071e3]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Recovery Email <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
