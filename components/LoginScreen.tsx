
import React, { useState } from 'react';
import { Group } from '../types';
import { BriefcaseIcon, UsersIcon } from './icons';

interface LoginScreenProps {
  onLogin: (name: string, groupId: string) => void;
  groups: Group[];
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, groups }) => {
  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState(groups[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(name, groupId);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <BriefcaseIcon className="w-16 h-16 mx-auto text-sky-500" />
          <h1 className="text-3xl font-bold text-slate-800 mt-4">團隊點子板</h1>
          <p className="text-slate-500 mt-2">加入一個群組以開始協作。</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-slate-700">你的名字</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入你的名字"
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>
          <div>
            <label htmlFor="group" className="text-sm font-medium text-slate-700">選擇群組</label>
            <select
              id="group"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
            >
              {groups.map((group) => (
                <option key={group.id} value={group.id}>{group.name}</option>
              ))}
              <option value="admin-access">--- 管理者介面 ---</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-transform transform hover:scale-105 disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none"
          >
            <UsersIcon className="w-5 h-5" />
            加入協作
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;