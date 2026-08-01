'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Terminal,
  Send,
  Code2,
  Activity,
  Settings,
} from 'lucide-react';
import { container } from '@/src/core/di/container';
import { FunctionEntity, InvokeResponse } from '@/src/features/functions/domain/entities/function_entity';

export default function FunctionDetailsPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const funcName = resolvedParams.name;

  const [fn, setFn] = useState<FunctionEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'test' | 'code' | 'trace' | 'config'>('test');
  const [payloadText, setPayloadText] = useState('{\n  "event": "order.created",\n  "amount": 149.99,\n  "currency": "USD"\n}');
  const [invoking, setInvoking] = useState(false);
  const [executionResult, setExecutionResult] = useState<InvokeResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadFunction();
  }, [funcName]);

  const loadFunction = async () => {
    setLoading(true);
    try {
      const found = await container.getFunctionByNameUseCase.execute(funcName);
      if (found) {
        setFn(found);
      } else {
        setFn({
          id: 'fn_' + funcName,
          name: funcName,
          runtime: 'golang',
          imageTag: 'microfaas/' + funcName + ':latest',
          envVars: { ENVIRONMENT: 'production', LOG_LEVEL: 'info' },
          timeoutSeconds: 30,
          memoryLimitMB: 128,
          status: 'ready',
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleInvoke = async () => {
    setInvoking(true);
    setErrorMsg(null);
    setExecutionResult(null);

    let payloadObj = {};
    try {
      if (payloadText.trim()) {
        payloadObj = JSON.parse(payloadText);
      }
    } catch {
      setErrorMsg('Payload must be valid JSON.');
      setInvoking(false);
      return;
    }

    try {
      const res = await container.invokeFunctionUseCase.execute({
        name: funcName,
        payload: payloadObj,
      });
      setExecutionResult(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invocation failed.');
    } finally {
      setInvoking(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-[#7a7a7a]" style={{ fontSize: '17px' }}>
        Loading Console...
      </div>
    );
  }

  const codeSample = fn?.runtime === 'golang' 
    ? `package main\n\nimport (\n\t"fmt"\n\t"os"\n)\n\nfunc main() {\n\tmessage := os.Getenv("MESSAGE")\n\tif message == "" {\n\t\tmessage = "Hello from MicroFaaS Go Lambda!"\n\t}\n\tfmt.Printf("{\\"status\\":\\"success\\", \\"message\\":\\"%s\\"}\\n", message)\n}`
    : `// Node.js Lambda Handler\nexports.handler = async (event) => {\n  const payload = JSON.parse(event || '{}');\n  console.log('Processing event:', payload);\n\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: "Processed successfully" }),\n  };\n};`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Link
        href="/dashboard/functions"
        className="inline-flex items-center gap-2 text-[#0066cc] hover:underline transition"
        style={{ fontSize: '17px' }}
      >
        <ArrowLeft className="w-5 h-5" /> Back to Directory
      </Link>

      {/* Function Spec Banner */}
      <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ borderRadius: '18px', boxShadow: 'none' }}>
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center justify-center bg-[#1d1d1f] text-white uppercase"
            style={{ width: '48px', height: '48px', borderRadius: '8px', fontSize: '17px', fontWeight: 600 }}
          >
            {fn?.runtime === 'golang' ? 'GO' : fn?.runtime === 'node' ? 'JS' : 'PY'}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-[#1d1d1f]" style={{ fontSize: '28px', fontWeight: 600, lineHeight: '1.14', letterSpacing: '0.196px' }}>{fn?.name}</h1>
              <span className="bg-[#0066cc] text-white" style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600 }}>
                READY
              </span>
            </div>
            <p className="text-[#7a7a7a]" style={{ fontSize: '14px' }}>
              Docker Image: {fn?.imageTag}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[#7a7a7a] border-t md:border-t-0 md:border-l border-[#f0f0f0] pt-4 md:pt-0 md:pl-6">
          <div>
            <span className="block mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>Memory Limit</span>
            <span className="text-[#1d1d1f]" style={{ fontSize: '17px' }}>{fn?.memoryLimitMB} MB</span>
          </div>
          <div>
            <span className="block mb-1" style={{ fontSize: '12px', fontWeight: 600 }}>Timeout</span>
            <span className="text-[#1d1d1f]" style={{ fontSize: '17px' }}>{fn?.timeoutSeconds}s</span>
          </div>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="flex items-center gap-2 border-b border-[#f0f0f0] pb-2">
        {[
          { id: 'test', label: 'Test & Invoke', icon: Play },
          { id: 'code', label: 'Source Code', icon: Code2 },
          { id: 'trace', label: 'Execution Traces', icon: Activity },
          { id: 'config', label: 'Configuration & Envs', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className="flex items-center gap-2 transition-colors"
              style={{
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: isActive ? '#0066cc' : '#fafafc',
                color: isActive ? '#ffffff' : '#333333',
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Test */}
      {activeTab === 'test' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] space-y-4" style={{ borderRadius: '18px', boxShadow: 'none' }}>
            <h3 className="text-[#1d1d1f] flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
              <Send className="w-5 h-5 text-[#0066cc]" /> Trigger Event Payload
            </h3>
            <p className="text-[#7a7a7a]" style={{ fontSize: '14px' }}>
              Pass JSON payload to endpoint: <code className="text-[#1d1d1f]">POST /api/v1/invoke/{funcName}</code>
            </p>

            {errorMsg && (
              <div className="p-3 text-[#1d1d1f] bg-[#f5f5f7] border border-[#e0e0e0]" style={{ borderRadius: '8px', fontSize: '14px' }}>
                {errorMsg}
              </div>
            )}

            <div>
              <textarea
                rows={8}
                value={payloadText}
                onChange={(e) => setPayloadText(e.target.value)}
                className="w-full p-4 bg-[#252527] text-white focus:outline-none"
                style={{ borderRadius: '8px', fontSize: '14px', fontFamily: 'monospace' }}
              />
            </div>

            <button
              onClick={handleInvoke}
              disabled={invoking}
              className="w-full flex items-center justify-center gap-2 bg-[#0066cc] text-white hover:scale-95 transition-transform disabled:opacity-50"
              style={{ borderRadius: '9999px', padding: '11px 22px', fontSize: '17px', fontWeight: 400 }}
            >
              {invoking ? (
                <>Spawning Container...</>
              ) : (
                <>
                  <Play className="w-4 h-4" /> Execute
                </>
              )}
            </button>
          </div>

          <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] space-y-4" style={{ borderRadius: '18px', boxShadow: 'none' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[#1d1d1f] flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
                <Terminal className="w-5 h-5 text-[#0066cc]" /> Standard Execution Logs
              </h3>
              {executionResult && (
                <span className="text-[#7a7a7a]" style={{ fontSize: '14px' }}>
                  {executionResult.duration_ms} ms
                </span>
              )}
            </div>

            {!executionResult ? (
              <div className="h-72 bg-[#f5f5f7] flex flex-col items-center justify-center text-[#7a7a7a] text-center" style={{ borderRadius: '8px', fontSize: '14px' }}>
                <Terminal className="w-8 h-8 mb-2 text-[#cccccc]" />
                Click "Execute" to run container sandbox.
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f5f5f7] text-[#1d1d1f]" style={{ borderRadius: '8px', fontSize: '14px' }}>
                  <span className="text-[#7a7a7a]">Execution ID:</span>
                  <span className="font-semibold">{executionResult.execution_id}</span>
                  <span className="text-[#7a7a7a]">Exit Code:</span>
                  <span className={executionResult.status_code === 0 ? 'text-[#0066cc]' : 'text-[#1d1d1f]'}>
                    {executionResult.status_code}
                  </span>
                </div>

                <div className="p-4 bg-[#252527] h-60 overflow-y-auto" style={{ borderRadius: '8px' }}>
                  <pre className="text-white whitespace-pre-wrap" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {executionResult.logs}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Code */}
      {activeTab === 'code' && (
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] space-y-4" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <h3 className="text-[#1d1d1f] flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
            <Code2 className="w-5 h-5 text-[#0066cc]" /> Function Code ({fn?.runtime})
          </h3>
          <div className="p-4 bg-[#252527] overflow-x-auto" style={{ borderRadius: '8px' }}>
            <pre className="text-white leading-relaxed" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
              {codeSample}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 3: Trace */}
      {activeTab === 'trace' && (
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] space-y-6" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <h3 className="text-[#1d1d1f] flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
            <Activity className="w-5 h-5 text-[#0066cc]" /> Performance Trace
          </h3>

          <div className="space-y-6" style={{ fontSize: '14px' }}>
            <div className="space-y-2">
              <div className="flex justify-between text-[#7a7a7a]">
                <span>1. Docker Sandbox Boot</span>
                <span className="text-[#1d1d1f]">14 ms</span>
              </div>
              <div className="w-full bg-[#f5f5f7] h-2 rounded-full overflow-hidden">
                <div className="bg-[#0066cc] h-full" style={{ width: '40%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[#7a7a7a]">
                <span>2. Environment Injection</span>
                <span className="text-[#1d1d1f]">3 ms</span>
              </div>
              <div className="w-full bg-[#f5f5f7] h-2 rounded-full overflow-hidden">
                <div className="bg-[#7a7a7a] h-full" style={{ width: '10%', marginLeft: '40%' }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[#7a7a7a]">
                <span>3. Code Logic Execution</span>
                <span className="text-[#ff3b30]">18 ms</span>
              </div>
              <div className="w-full bg-[#f5f5f7] h-2 rounded-full overflow-hidden">
                <div className="bg-[#ff3b30] h-full" style={{ width: '45%', marginLeft: '50%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Config */}
      {activeTab === 'config' && (
        <div className="p-6 bg-[#ffffff] border border-[#e0e0e0] space-y-6" style={{ borderRadius: '18px', boxShadow: 'none' }}>
          <h3 className="text-[#1d1d1f] flex items-center gap-2" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>
            <Settings className="w-5 h-5 text-[#0066cc]" /> Environment Variables
          </h3>

          <div className="space-y-3" style={{ fontSize: '14px' }}>
            {Object.entries(fn?.envVars || {}).map(([key, val]) => (
              <div key={key} className="p-4 bg-[#f5f5f7] flex justify-between items-center" style={{ borderRadius: '8px' }}>
                <span className="text-[#7a7a7a] font-mono">{key}</span>
                <span className="text-[#1d1d1f] font-mono font-semibold">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
