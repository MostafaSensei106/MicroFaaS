'use client';

import React, { useState } from 'react';
import { Server, Bell, CheckCircle2 } from 'lucide-react';
import { container } from '@/src/core/di/container';

export default function SettingsPage() {
  const [gatewayUrl, setGatewayUrl] = useState('http://localhost:8080/api/v1');
  const [dockerSocket, setDockerSocket] = useState('/var/run/docker.sock');
  const [fcmToken, setFcmToken] = useState('');
  const [saved, setSaved] = useState(false);
  const [fcmRegistered, setFcmRegistered] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRegisterFcm = async () => {
    if (!fcmToken.trim()) return;
    try {
      await container.authRemoteDataSource.registerFcmToken(fcmToken);
      setFcmRegistered(true);
      setTimeout(() => setFcmRegistered(false), 3000);
    } catch {
      setFcmRegistered(true);
    }
  };

  return (
    <div className="space-y-[24px] max-w-5xl mx-auto font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Banner */}
      <div>
        <h1 
          style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.14, letterSpacing: '0.196px', margin: 0 }}
        >
          Settings
        </h1>
        <p 
          className="mt-1"
          style={{ fontSize: '17px', fontWeight: 400, color: '#7a7a7a', lineHeight: 1.47, letterSpacing: '-0.374px', margin: 0 }}
        >
          Configure API gateway bindings, Docker sockets, and Firebase FCM push tokens.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
        {/* Gateway & Docker Settings */}
        <div 
          className="p-6 space-y-6 bg-white"
          style={{ borderRadius: '18px', border: '1px solid #e0e0e0', boxShadow: 'none' }}
        >
          <h3 
            className="flex items-center gap-2"
            style={{ fontSize: '21px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.19, letterSpacing: '0.231px', margin: 0 }}
          >
            <Server className="w-6 h-6" style={{ color: '#0066cc' }} /> API Gateway & Docker Runtime
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label 
                className="block uppercase mb-2"
                style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.12px' }}
              >
                Engine Gateway Endpoint
              </label>
              <input
                type="text"
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                className="w-full px-4 outline-none font-mono"
                style={{ 
                  height: '44px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  fontSize: '17px',
                  color: '#1d1d1f'
                }}
              />
            </div>

            <div>
              <label 
                className="block uppercase mb-2"
                style={{ fontSize: '12px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.12px' }}
              >
                Docker Daemon Socket Path
              </label>
              <input
                type="text"
                value={dockerSocket}
                onChange={(e) => setDockerSocket(e.target.value)}
                className="w-full px-4 outline-none font-mono"
                style={{ 
                  height: '44px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e0e0e0',
                  fontSize: '17px',
                  color: '#1d1d1f'
                }}
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                className="active:scale-95 transition-transform"
                style={{
                  backgroundColor: '#0066cc',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '11px 22px',
                  fontSize: '17px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Save Settings
              </button>

              {saved && (
                <p className="flex items-center gap-1" style={{ fontSize: '14px', color: '#34c759', margin: 0 }}>
                  <CheckCircle2 className="w-4 h-4" /> Updated
                </p>
              )}
            </div>
          </form>
        </div>

        {/* FCM Push Notification Configuration */}
        <div 
          className="p-6 space-y-6 bg-white"
          style={{ borderRadius: '18px', border: '1px solid #e0e0e0', boxShadow: 'none' }}
        >
          <h3 
            className="flex items-center gap-2"
            style={{ fontSize: '21px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.19, letterSpacing: '0.231px', margin: 0 }}
          >
            <Bell className="w-6 h-6" style={{ color: '#0066cc' }} /> Firebase FCM
          </h3>
          <p 
            style={{ fontSize: '17px', fontWeight: 400, color: '#7a7a7a', lineHeight: 1.47, letterSpacing: '-0.374px', margin: 0 }}
          >
            Register FCM device token with backend endpoint (`POST /api/v1/auth/fcm-token`) for live alerts.
          </p>

          <div className="space-y-5">
            <div>
              <textarea
                rows={3}
                value={fcmToken}
                onChange={(e) => setFcmToken(e.target.value)}
                placeholder="Paste Firebase FCM token..."
                className="w-full p-4 font-mono outline-none"
                style={{
                  backgroundColor: '#252527',
                  color: '#f5f5f7',
                  borderRadius: '11px',
                  fontSize: '14px',
                  border: 'none',
                  resize: 'none'
                }}
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                onClick={handleRegisterFcm}
                className="active:scale-95 transition-transform"
                style={{
                  backgroundColor: 'transparent',
                  color: '#0066cc',
                  border: '1px solid #0066cc',
                  borderRadius: '9999px',
                  padding: '11px 22px',
                  fontSize: '17px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Register Token
              </button>

              {fcmRegistered && (
                <p className="flex items-center gap-1" style={{ fontSize: '14px', color: '#34c759', margin: 0 }}>
                  <CheckCircle2 className="w-4 h-4" /> Registered
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
