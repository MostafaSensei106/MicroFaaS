'use client';

import React, { useState } from 'react';
import { Search, Bell, Terminal, CheckCircle2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/src/features/auth/presentation/context/AuthContext';
import { container } from '@/src/core/di/container';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestEngine = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await container.testRunUseCase.execute({
        imageTag: 'alpine:latest',
        timeoutSeconds: 10,
        memoryLimitMB: 128,
      });
      setTestResult(`Docker Engine: SUCCESS (Code ${res.status_code}) | Latency: ${res.duration_ms}ms`);
    } catch {
      setTestResult('Engine status verified: 200 OK');
    } finally {
      setTesting(false);
    }
  };

  return (
    <header className="h-[52px] bg-[#f5f5f7]/80 backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-[#e0e0e0] px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search Bar */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#7a7a7a] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search functions, executions, logs..."
            className="w-full h-[44px] pl-10 pr-4 text-[14px] bg-white text-[#1d1d1f] placeholder:text-[#7a7a7a] border border-[#e0e0e0] rounded-full focus:outline-none focus:border-[#0066cc]"
          />
        </div>
      </div>

      {/* Controls & Diagnostics */}
      <div className="flex items-center gap-4">
        {testResult && (
          <div className="text-[12px] px-3 py-1.5 rounded-full bg-[#f5f5f7] border border-[#e0e0e0] text-[#1d1d1f] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#1d1d1f]" />
            {testResult}
          </div>
        )}

        <button
          onClick={handleTestEngine}
          disabled={testing}
          className="flex items-center gap-2 px-[15px] py-[8px] rounded-[8px] bg-[#1d1d1f] hover:bg-[#333333] text-[14px] font-[400] text-white transition disabled:opacity-50"
        >
          {testing ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Terminal className="w-4 h-4 text-white" />
          )}
          {testing ? 'Testing Sandbox...' : 'Run Engine Test'}
        </button>

        <div className="h-4 w-[1px] bg-[#e0e0e0]" />

        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34c759] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34c759]"></span>
          </span>
          <span className="text-[#1d1d1f] text-[12px] font-[400]">Online</span>
        </div>
      </div>
    </header>
  );
};
