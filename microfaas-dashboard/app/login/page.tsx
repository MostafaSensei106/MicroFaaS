'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/features/auth/presentation/context/AuthContext';
import {
  Cloud,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  User as UserIcon,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, error, clearError, isLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@microfaas.io');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'developer' | 'viewer'>('developer');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch {
      // Context error
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register({ name, email, password, role: selectedRole });
      router.push('/dashboard');
    } catch {
      // Context error
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f5f5f7] text-[#1d1d1f] font-sans">
      <div className="w-full max-w-[460px] p-4 md:p-0">
        <div className="bg-[#ffffff] rounded-[18px] border border-[#e0e0e0] shadow-none p-[48px]">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-[44px] h-[44px] rounded-full bg-[#0066cc] flex items-center justify-center mb-4">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[28px] font-[600] text-[#1d1d1f] tracking-[0.196px] leading-[1.14] mb-1">
              MicroFaaS
            </h1>
            <p className="text-[14px] font-[400] text-[#7a7a7a]">
              Sign in to manage your serverless functions
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 rounded-full bg-[#f5f5f7] mb-6">
            <button
              onClick={() => {
                setActiveTab('login');
                clearError();
              }}
              className={`flex-1 py-2 rounded-full text-[14px] font-[600] transition-colors ${
                activeTab === 'login'
                  ? 'bg-[#0066cc] text-white'
                  : 'text-[#0066cc] bg-transparent hover:bg-[#e0e0e0]/50'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                clearError();
              }}
              className={`flex-1 py-2 rounded-full text-[14px] font-[600] transition-colors ${
                activeTab === 'register'
                  ? 'bg-[#0066cc] text-white'
                  : 'text-[#0066cc] bg-transparent hover:bg-[#e0e0e0]/50'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Demo account filler */}
          <div className="mb-6 p-3 rounded-xl bg-[#f5f5f7] flex items-center justify-between">
            <span className="text-[12px] text-[#7a7a7a]">Quick fill</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setEmail('admin@microfaas.io'); setPassword('password123'); }}
                className="px-3 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#e0e0e0] text-[#333333] text-[12px] font-[400] transition-colors border border-[#e0e0e0]"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('dev@microfaas.io'); setPassword('password123'); }}
                className="px-3 py-1.5 rounded-[11px] bg-[#fafafc] hover:bg-[#e0e0e0] text-[#333333] text-[12px] font-[400] transition-colors border border-[#e0e0e0]"
              >
                Developer
              </button>
            </div>
          </div>

          {/* Error Notification */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-[14px] flex items-start gap-2">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-[400]">{error}</p>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[12px] font-[600] text-[#1d1d1f] uppercase tracking-wide">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-[12px] font-[400] text-[#0066cc] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[44px] pl-11 pr-4 rounded-full bg-white border border-[#e0e0e0] text-[#1d1d1f] text-[17px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[44px] rounded-full bg-[#0066cc] text-white text-[17px] font-[400] flex items-center justify-center gap-2 mt-6 active:scale-[0.95] transition-transform disabled:opacity-50 disabled:active:scale-100 hover:bg-[#0071e3]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-[600] text-[#1d1d1f] uppercase tracking-wide mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Apple Appleseed"
                    className="w-full h-[44px] pl-11 pr-4 rounded-full bg-white border border-[#e0e0e0] text-[#1d1d1f] text-[17px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                  />
                </div>
              </div>

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

              <div>
                <label className="block text-[12px] font-[600] text-[#1d1d1f] uppercase tracking-wide mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[44px] pl-11 pr-4 rounded-full bg-white border border-[#e0e0e0] text-[#1d1d1f] text-[17px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-[600] text-[#1d1d1f] uppercase tracking-wide mb-2">
                  Role
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'developer', title: 'Developer' },
                    { id: 'admin', title: 'Admin' },
                    { id: 'viewer', title: 'Viewer' },
                  ].map((role) => (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id as typeof selectedRole)}
                      className={`flex-1 py-2 rounded-full text-center cursor-pointer transition-colors border ${
                        selectedRole === role.id
                          ? 'bg-[#0066cc] text-white border-[#0066cc]'
                          : 'bg-[#fafafc] text-[#333333] border-[#e0e0e0] hover:bg-[#e0e0e0]/50'
                      }`}
                    >
                      <span className="text-[14px] font-[400]">{role.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[44px] rounded-full bg-[#0066cc] text-white text-[17px] font-[400] flex items-center justify-center gap-2 mt-6 active:scale-[0.95] transition-transform disabled:opacity-50 disabled:active:scale-100 hover:bg-[#0071e3]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <p className="text-[12px] text-[#7a7a7a] font-[400]">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
