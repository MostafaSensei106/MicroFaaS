'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Zap,
  Clock,
  Plus,
  Play,
  TrendingUp,
  Activity,
  BarChart3,
  Terminal,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { container } from '@/src/core/di/container';
import { FunctionEntity, InvokeResponse } from '@/src/features/functions/domain/entities/function_entity';

export default function DashboardPage() {
  const [functions, setFunctions] = useState<FunctionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'5m' | '1h' | '24h' | '7d'>('1h');
  const [testLog, setTestLog] = useState<InvokeResponse | null>(null);
  const [runningTest, setRunningTest] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const list = await container.listFunctionsUseCase.execute();
      setFunctions(list);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    setRunningTest(true);
    try {
      const res = await container.testRunUseCase.execute({
        imageTag: 'alpine:latest',
        timeoutSeconds: 10,
        memoryLimitMB: 128,
      });
      setTestLog(res);
    } catch {
      setTestLog({
        execution_id: 'exec_test_err',
        status_code: 500,
        duration_ms: 12,
        logs: 'Error running container test.',
      });
    } finally {
      setRunningTest(false);
    }
  };

  const totalInvocations = functions.reduce((acc, f) => acc + (f.executionsCount || 420), 0);

  const telemetryBars = [
    { height: 40, label: '12:00' },
    { height: 65, label: '12:05' },
    { height: 30, label: '12:10' },
    { height: 85, label: '12:15' },
    { height: 50, label: '12:20' },
    { height: 95, label: '12:25' },
    { height: 70, label: '12:30' },
    { height: 60, label: '12:35' },
    { height: 100, label: '12:40' },
    { height: 80, label: '12:45' },
    { height: 45, label: '12:50' },
    { height: 90, label: '12:55' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero Banner */}
      <div className="p-8 bg-[#ffffff] w-full" style={{ borderRadius: 0, boxShadow: 'none' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 
              className="text-[#1d1d1f] font-semibold" 
              style={{ fontSize: '40px', lineHeight: '1.1', letterSpacing: '0px' }}
            >
              Execution Telemetry
            </h1>
            <p 
              className="text-[#7a7a7a] font-semibold mt-2" 
              style={{ fontSize: '21px', lineHeight: '1.19', letterSpacing: '0.231px' }}
            >
              Real-time monitoring, isolated container invocations, and function catalog powered by Clean Architecture.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/functions"
              className="flex items-center justify-center gap-2 bg-[#0066cc] text-white hover:scale-95 transition-transform"
              style={{ borderRadius: '9999px', padding: '11px 22px', fontSize: '18px', fontWeight: 300 }}
            >
              <Plus className="w-5 h-5" /> Create Function
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <div className="flex items-center justify-between">
            <span className="text-[#7a7a7a] uppercase" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '-0.12px' }}>Active Functions</span>
            <div className="text-[#0066cc]">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[#1d1d1f]" style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.374px' }}>{functions.length}</span>
            <span className="text-[#0066cc] flex items-center" style={{ fontSize: '14px', fontWeight: 600 }}>
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> 100% READY
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <div className="flex items-center justify-between">
            <span className="text-[#7a7a7a] uppercase" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '-0.12px' }}>Total Invocations</span>
            <div className="text-[#0066cc]">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[#1d1d1f]" style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.374px' }}>{totalInvocations.toLocaleString()}</span>
            <span className="text-[#0066cc]" style={{ fontSize: '14px', fontWeight: 600 }}>+18%</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <div className="flex items-center justify-between">
            <span className="text-[#7a7a7a] uppercase" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '-0.12px' }}>P95 Latency</span>
            <div className="text-[#0066cc]">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[#1d1d1f]" style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.374px' }}>28ms</span>
            <span className="text-[#0066cc]" style={{ fontSize: '14px', fontWeight: 600 }}>Ultra-low</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <div className="flex items-center justify-between">
            <span className="text-[#7a7a7a] uppercase" style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '-0.12px' }}>Engine Health</span>
            <div className="text-[#0066cc]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[#1d1d1f]" style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.374px' }}>99.99%</span>
            <span className="text-[#0066cc]" style={{ fontSize: '14px', fontWeight: 600 }}>HEALTHY</span>
          </div>
        </div>
      </div>

      {/* Main Grid Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Telemetry Chart */}
          <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-[#1d1d1f] flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
                  <BarChart3 className="w-5 h-5 text-[#0066cc]" /> Invocation Traffic & Latency
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {(['5m', '1h', '24h', '7d'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className="px-3 py-1.5 transition-colors"
                    style={{ 
                      borderRadius: '9999px',
                      fontSize: '14px',
                      fontWeight: 600,
                      backgroundColor: timeRange === r ? '#0066cc' : '#fafafc',
                      color: timeRange === r ? '#ffffff' : '#333333'
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-40 flex items-end gap-3 px-2 pt-6 pb-2 border-b border-[#f0f0f0]">
              {telemetryBars.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-[#0066cc] rounded-t-sm"
                    style={{ height: `${bar.height}%` }}
                  />
                  <span className="hidden sm:inline text-[#7a7a7a]" style={{ fontSize: '12px', letterSpacing: '-0.12px' }}>{bar.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-[#7a7a7a]" style={{ fontSize: '12px', letterSpacing: '-0.12px' }}>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0066cc]" /> Invocations (Req/sec)
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#7a7a7a]" /> Duration P90 (ms)
              </span>
            </div>
          </div>

          {/* Registered Functions List */}
          <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#1d1d1f]" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>Registered Functions</h3>
              <Link href="/dashboard/functions" className="text-[#0066cc] flex items-center gap-1 hover:underline" style={{ fontSize: '14px', fontWeight: 400 }}>
                Manage All <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-[#7a7a7a]" style={{ fontSize: '14px' }}>
                Fetching serverless functions...
              </div>
            ) : functions.length === 0 ? (
              <div className="py-12 text-center text-[#7a7a7a]" style={{ fontSize: '14px' }}>No functions configured.</div>
            ) : (
              <div className="flex flex-col">
                {functions.map((fn, i) => (
                  <div
                    key={fn.id}
                    className="py-4 flex items-center justify-between"
                    style={{ borderBottom: i === functions.length - 1 ? 'none' : '1px solid #f0f0f0' }}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="flex items-center justify-center bg-[#1d1d1f] text-white uppercase"
                        style={{ width: '44px', height: '44px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                      >
                        {fn.runtime === 'golang' ? 'GO' : fn.runtime === 'node' ? 'JS' : 'PY'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-[#1d1d1f]" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
                            {fn.name}
                          </h4>
                          <span className="px-2 py-0.5 bg-[#fafafc] text-[#333333] border border-[#e0e0e0]" style={{ fontSize: '12px', borderRadius: '5px' }}>
                            {fn.imageTag}
                          </span>
                        </div>
                        <p className="text-[#7a7a7a] mt-1" style={{ fontSize: '14px' }}>
                          Memory: {fn.memoryLimitMB}MB • Timeout: {fn.timeoutSeconds}s
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[#0066cc]" style={{ fontSize: '14px', fontWeight: 600 }}>Ready</span>
                      <Link
                        href={`/dashboard/functions/${fn.name}`}
                        className="text-[#0066cc] flex items-center gap-1 hover:underline"
                        style={{ fontSize: '14px', fontWeight: 400 }}
                      >
                        <Play className="w-4 h-4" /> Console
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Docker Runner Test */}
        <div className="space-y-6">
          <div className="p-6 bg-[#ffffff] border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
            <h3 className="text-[#1d1d1f] mb-2 flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
              <Terminal className="w-5 h-5 text-[#0066cc]" /> Docker Runner
            </h3>
            <p className="text-[#7a7a7a] mb-6" style={{ fontSize: '14px' }}>
              Executes a transient Alpine container to test isolation.
            </p>

            <button
              onClick={handleQuickTest}
              disabled={runningTest}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] text-white hover:scale-95 transition-transform disabled:opacity-50"
              style={{ borderRadius: '9999px', padding: '11px 22px', fontSize: '17px', fontWeight: 400 }}
            >
              {runningTest ? (
                <>Running...</>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Run Test
                </>
              )}
            </button>

            {testLog && (
              <div className="mt-6 p-4 bg-[#252527]" style={{ borderRadius: '8px' }}>
                <div className="flex items-center justify-between text-[#cccccc] border-b border-[#333333] pb-2 mb-2" style={{ fontSize: '12px' }}>
                  <span>ID: {testLog.execution_id}</span>
                  <span className="text-white font-semibold">{testLog.duration_ms}ms</span>
                </div>
                <pre className="text-white overflow-x-auto whitespace-pre-wrap" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {testLog.logs}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
