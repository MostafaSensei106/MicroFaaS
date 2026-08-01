'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Plus,
  Search,
  Play,
  AlertCircle,
  X,
  Layers,
} from 'lucide-react';
import { container } from '@/src/core/di/container';
import { FunctionEntity } from '@/src/features/functions/domain/entities/function_entity';

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<FunctionEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRuntime, setSelectedRuntime] = useState<string>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [funcName, setFuncName] = useState('');
  const [runtime, setRuntime] = useState('golang');
  const [imageTag, setImageTag] = useState('microfaas/sample-func:latest');
  const [timeoutSec, setTimeoutSec] = useState(30);
  const [memoryMB, setMemoryMB] = useState(128);
  const [envVarsText, setEnvVarsText] = useState('{\n  "ENV": "production"\n}');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
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

  const handleCreateFunction = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    let parsedEnv = {};
    try {
      if (envVarsText.trim()) {
        parsedEnv = JSON.parse(envVarsText);
      }
    } catch {
      setCreateError('Environment variables must be valid JSON.');
      setCreating(false);
      return;
    }

    try {
      await container.createFunctionUseCase.execute({
        name: funcName,
        runtime,
        imageTag,
        timeoutSeconds: Number(timeoutSec),
        memoryLimitMB: Number(memoryMB),
        envVars: parsedEnv,
      });

      setShowCreateModal(false);
      setFuncName('');
      fetchFunctions();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create function.');
    } finally {
      setCreating(false);
    }
  };

  const filteredFunctions = functions.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.imageTag.toLowerCase().includes(search.toLowerCase());
    const matchesRuntime = selectedRuntime === 'all' || f.runtime === selectedRuntime;
    return matchesSearch && matchesRuntime;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[#1d1d1f] font-semibold" style={{ fontSize: '40px', lineHeight: '1.1', letterSpacing: '0px' }}>
            Function Directory
          </h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-[#0066cc] text-white hover:scale-95 transition-transform"
          style={{ borderRadius: '9999px', padding: '11px 22px', fontSize: '18px', fontWeight: 300 }}
        >
          <Plus className="w-5 h-5" /> Create Function
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#ffffff] border border-[#e0e0e0] flex flex-col md:flex-row gap-4 items-center justify-between" style={{ borderRadius: '18px', boxShadow: 'none' }}>
        <div className="relative w-full md:w-80">
          <Search className="w-5 h-5 text-[#7a7a7a] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search function or image..."
            className="w-full pl-11 pr-4 bg-[#fafafc] text-[#333333] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] transition-colors"
            style={{ borderRadius: '9999px', padding: '11px 16px 11px 44px', fontSize: '17px' }}
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {['all', 'golang', 'node', 'python', 'alpine'].map((rt) => (
            <button
              key={rt}
              onClick={() => setSelectedRuntime(rt)}
              className="px-4 py-2 transition-colors"
              style={{
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: selectedRuntime === rt ? '#0066cc' : '#fafafc',
                color: selectedRuntime === rt ? '#ffffff' : '#333333',
                textTransform: 'capitalize'
              }}
            >
              {rt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-[#7a7a7a]" style={{ fontSize: '17px' }}>
          Loading function registry...
        </div>
      ) : filteredFunctions.length === 0 ? (
        <div className="p-12 text-center text-[#7a7a7a]">
          <Box className="w-12 h-12 text-[#e0e0e0] mx-auto mb-3" />
          <p className="text-[#1d1d1f] font-semibold" style={{ fontSize: '17px' }}>No functions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFunctions.map((fn) => (
            <div
              key={fn.id}
              className="group p-6 bg-[#ffffff] border border-[#e0e0e0] flex flex-col justify-between transition-transform hover:-translate-y-0.5 hover:border-[#0066cc]"
              style={{ borderRadius: '18px', boxShadow: 'none' }}
            >
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="flex items-center justify-center bg-[#1d1d1f] text-white uppercase"
                    style={{ width: '44px', height: '44px', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}
                  >
                    {fn.runtime === 'golang' ? 'GO' : fn.runtime === 'node' ? 'JS' : 'PY'}
                  </div>
                  <div>
                    <h3 className="text-[#1d1d1f]" style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.374px' }}>{fn.name}</h3>
                  </div>
                </div>

                <div className="space-y-2 text-[#7a7a7a] mb-6" style={{ fontSize: '14px' }}>
                  <div className="flex items-center justify-between">
                    <span>Image:</span>
                    <span className="text-[#1d1d1f] truncate max-w-[180px]">{fn.imageTag}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Memory:</span>
                    <span className="text-[#1d1d1f]">{fn.memoryLimitMB} MB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Timeout:</span>
                    <span className="text-[#1d1d1f]">{fn.timeoutSeconds}s</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#f0f0f0]">
                <Link
                  href={`/dashboard/functions/${fn.name}`}
                  className="text-[#0066cc] flex items-center justify-center gap-2 hover:underline"
                  style={{ fontSize: '17px', fontWeight: 400 }}
                >
                  <Play className="w-4 h-4" /> Console
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-[#ffffff] w-full max-w-lg p-8 space-y-6 border border-[#e0e0e0]" style={{ borderRadius: '18px', boxShadow: 'none' }}>
            <div className="flex items-center justify-between border-b border-[#f0f0f0] pb-4">
              <h3 className="text-[#1d1d1f]" style={{ fontSize: '28px', fontWeight: 600 }}>
                Register New Function
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#7a7a7a] hover:text-[#1d1d1f] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {createError && (
              <div className="p-3 text-[#1d1d1f] bg-[#f5f5f7] border border-[#e0e0e0] flex items-center gap-2" style={{ borderRadius: '8px', fontSize: '14px' }}>
                <AlertCircle className="w-5 h-5 text-[#0066cc]" />
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateFunction} className="space-y-4">
              <div>
                <label className="block text-[#1d1d1f] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>Function Name</label>
                <input
                  type="text"
                  required
                  value={funcName}
                  onChange={(e) => setFuncName(e.target.value)}
                  placeholder="payment-webhook"
                  className="w-full bg-[#fafafc] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] text-[#1d1d1f] transition-colors"
                  style={{ borderRadius: '9999px', padding: '11px 16px', fontSize: '17px' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1d1d1f] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>Runtime</label>
                  <select
                    value={runtime}
                    onChange={(e) => setRuntime(e.target.value)}
                    className="w-full bg-[#fafafc] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] text-[#1d1d1f] transition-colors"
                    style={{ borderRadius: '9999px', padding: '11px 16px', fontSize: '17px' }}
                  >
                    <option value="golang">Go</option>
                    <option value="node">Node.js</option>
                    <option value="python">Python</option>
                    <option value="alpine">Alpine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#1d1d1f] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>Image Tag</label>
                  <input
                    type="text"
                    required
                    value={imageTag}
                    onChange={(e) => setImageTag(e.target.value)}
                    placeholder="alpine:latest"
                    className="w-full bg-[#fafafc] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] text-[#1d1d1f] transition-colors"
                    style={{ borderRadius: '9999px', padding: '11px 16px', fontSize: '17px' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1d1d1f] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>Memory (MB)</label>
                  <input
                    type="number"
                    value={memoryMB}
                    onChange={(e) => setMemoryMB(Number(e.target.value))}
                    className="w-full bg-[#fafafc] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] text-[#1d1d1f] transition-colors"
                    style={{ borderRadius: '9999px', padding: '11px 16px', fontSize: '17px' }}
                  />
                </div>
                <div>
                  <label className="block text-[#1d1d1f] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>Timeout (s)</label>
                  <input
                    type="number"
                    value={timeoutSec}
                    onChange={(e) => setTimeoutSec(Number(e.target.value))}
                    className="w-full bg-[#fafafc] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] text-[#1d1d1f] transition-colors"
                    style={{ borderRadius: '9999px', padding: '11px 16px', fontSize: '17px' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1d1d1f] mb-2" style={{ fontSize: '14px', fontWeight: 600 }}>Environment Variables (JSON)</label>
                <textarea
                  rows={3}
                  value={envVarsText}
                  onChange={(e) => setEnvVarsText(e.target.value)}
                  className="w-full bg-[#fafafc] border border-[#e0e0e0] focus:outline-none focus:border-[#0066cc] text-[#1d1d1f] transition-colors"
                  style={{ borderRadius: '18px', padding: '16px', fontSize: '14px', fontFamily: 'monospace' }}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-transparent text-[#0066cc] border border-[#0066cc] hover:scale-95 transition-transform"
                  style={{ borderRadius: '9999px', padding: '11px 22px', fontSize: '18px', fontWeight: 400 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-[#0066cc] text-white hover:scale-95 transition-transform disabled:opacity-50"
                  style={{ borderRadius: '9999px', padding: '11px 22px', fontSize: '18px', fontWeight: 300 }}
                >
                  {creating ? 'Deploying...' : 'Deploy Function'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
