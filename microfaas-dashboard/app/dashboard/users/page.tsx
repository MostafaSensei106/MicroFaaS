'use client';

import React, { useEffect, useState } from 'react';
import { Users, Trash2, Search } from 'lucide-react';
import { container } from '@/src/core/di/container';
import { UserProfile } from '@/src/features/users/domain/repositories/user_repository';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await container.getUsersUseCase.execute();
      setUsers(list);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'developer' | 'viewer') => {
    try {
      await container.updateUserRoleUseCase.execute(userId, newRole);
      fetchUsers();
    } catch {
      // Handled
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this operator?')) {
      try {
        await container.deleteUserUseCase.execute(userId);
        fetchUsers();
      } catch {
        // Handled
      }
    }
  };

  const filteredUsers = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-[24px] max-w-7xl mx-auto font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Banner */}
      <div>
        <h1 
          className="flex items-center gap-2"
          style={{ fontSize: '28px', fontWeight: 600, color: '#1d1d1f', lineHeight: 1.14, letterSpacing: '0.196px' }}
        >
          Access & Identity
        </h1>
        <p 
          className="mt-1"
          style={{ fontSize: '17px', fontWeight: 400, color: '#7a7a7a', lineHeight: 1.47, letterSpacing: '-0.374px' }}
        >
          Manage operator accounts, access roles, and Firebase FCM tokens.
        </p>
      </div>

      {/* Search */}
      <div 
        className="p-4 bg-white flex items-center justify-between"
        style={{ borderRadius: '18px', border: '1px solid #e0e0e0', boxShadow: 'none' }}
      >
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#7a7a7a' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search operator name or email..."
            className="w-full pl-10 pr-4 outline-none"
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
      </div>

      {/* Users Table */}
      <div 
        className="bg-white overflow-hidden"
        style={{ borderRadius: '18px', border: '1px solid #e0e0e0', boxShadow: 'none' }}
      >
        {loading ? (
          <div className="py-16 text-center" style={{ color: '#7a7a7a', fontSize: '17px' }}>
            <div className="w-8 h-8 border-3 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#e0e0e0', borderTopColor: '#0066cc', borderWidth: '3px', borderStyle: 'solid' }} />
            Loading user directory...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-16 text-center" style={{ color: '#7a7a7a', fontSize: '17px' }}>No operators found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ backgroundColor: '#f5f5f7' }}>
                <tr>
                  <th className="px-6 py-4 uppercase" style={{ fontSize: '12px', fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.12px' }}>Operator</th>
                  <th className="px-6 py-4 uppercase" style={{ fontSize: '12px', fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.12px' }}>Role Tier</th>
                  <th className="px-6 py-4 uppercase" style={{ fontSize: '12px', fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.12px' }}>Status</th>
                  <th className="px-6 py-4 uppercase" style={{ fontSize: '12px', fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.12px' }}>FCM Push Token</th>
                  <th className="px-6 py-4 uppercase" style={{ fontSize: '12px', fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.12px' }}>Registered</th>
                  <th className="px-6 py-4 uppercase text-right" style={{ fontSize: '12px', fontWeight: 600, color: '#7a7a7a', letterSpacing: '-0.12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0f0]">
                {filteredUsers.map((usr) => (
                  <tr key={usr.id} className="transition-colors hover:bg-[#f5f5f7]" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div 
                        className="w-[44px] h-[44px] rounded-full flex items-center justify-center font-semibold text-white uppercase shrink-0"
                        style={{ backgroundColor: '#0066cc', fontSize: '18px' }}
                      >
                        {usr.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: '17px', fontWeight: 600, color: '#1d1d1f', letterSpacing: '-0.374px', margin: 0 }}>{usr.name}</p>
                        <p style={{ fontSize: '14px', fontWeight: 400, color: '#7a7a7a', letterSpacing: '-0.224px', margin: 0 }}>{usr.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={usr.role}
                        onChange={(e) =>
                          handleRoleChange(usr.id, e.target.value as 'admin' | 'developer' | 'viewer')
                        }
                        className="px-3 outline-none appearance-none"
                        style={{ 
                          height: '32px',
                          borderRadius: '9999px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e0e0e0',
                          fontSize: '14px',
                          color: '#1d1d1f',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="admin">Administrator</option>
                        <option value="developer">Developer</option>
                        <option value="viewer">Auditor</option>
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <span 
                        style={{ 
                          fontSize: '14px', 
                          fontWeight: 400, 
                          color: usr.status.toLowerCase() === 'active' ? '#0066cc' : '#7a7a7a',
                          backgroundColor: 'transparent'
                        }}
                      >
                        {usr.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono">
                      {usr.fcmToken ? (
                        <span 
                          className="truncate max-w-[150px] inline-block" 
                          title={usr.fcmToken}
                          style={{ fontSize: '14px', color: usr.status.toLowerCase() === 'active' ? '#0066cc' : '#7a7a7a' }}
                        >
                          Active ({usr.fcmToken.substring(0, 10)}...)
                        </span>
                      ) : (
                        <span style={{ fontSize: '14px', color: '#7a7a7a' }}>Unregistered</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span style={{ fontSize: '14px', color: '#7a7a7a' }}>
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(usr.id)}
                        className="p-2 rounded transition-colors group"
                        title="Delete Operator"
                      >
                        <Trash2 className="w-5 h-5 text-[#7a7a7a] group-hover:text-[#ff3b30]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
