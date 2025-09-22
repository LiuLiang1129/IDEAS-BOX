
import React, { useState, useEffect, useRef } from 'react';
import { Group, DiscussionTopic } from '../types';
import { GROUP_COLORS } from '../constants';
import { CogIcon, SaveIcon, LogoutIcon, PlusIcon, TrashIcon, ImageIcon } from './icons';

interface AdminViewProps {
  initialGroups: Group[];
  initialTopic: DiscussionTopic | null;
  onUpdateGroups: (groups: Group[]) => void;
  onUpdateTopic: (topic: DiscussionTopic) => void;
  onLogout: () => void;
}

const colorClasses: { [key: string]: string } = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
};

const AdminView: React.FC<AdminViewProps> = ({ initialGroups, initialTopic, onUpdateGroups, onUpdateTopic, onLogout }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicImagePreview, setTopicImagePreview] = useState<string | undefined>();
  const [showGroupsSaved, setShowGroupsSaved] = useState(false);
  const [showTopicSaved, setShowTopicSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGroups(JSON.parse(JSON.stringify(initialGroups))); // Deep copy to avoid direct mutation
  }, [initialGroups]);

  useEffect(() => {
    setTopicTitle(initialTopic?.title || '');
    setTopicDescription(initialTopic?.description || '');
    setTopicImagePreview(initialTopic?.imageUrl);
  }, [initialTopic]);

  const handleGroupNameChange = (id: string, newName: string) => {
    setGroups(groups.map(g => g.id === id ? { ...g, name: newName } : g));
  };

  const handleAddGroup = () => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: `新團隊 ${groups.length + 1}`,
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length]
    };
    setGroups([...groups, newGroup]);
  };

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };

  const handleSaveGroups = () => {
    onUpdateGroups(groups);
    setShowGroupsSaved(true);
    setTimeout(() => setShowGroupsSaved(false), 2000);
  };
  
  const handleTopicImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTopicImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveTopicImage = () => {
    setTopicImagePreview(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSaveTopic = () => {
    onUpdateTopic({ title: topicTitle, description: topicDescription, imageUrl: topicImagePreview });
    setShowTopicSaved(true);
    setTimeout(() => setShowTopicSaved(false), 2000);
  };
  
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <CogIcon className="w-8 h-8 text-sky-600"/>
            <h1 className="text-2xl font-bold text-slate-800">管理者介面</h1>
          </div>
          <button
            onClick={onLogout}
            title="登出"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            <LogoutIcon className="w-5 h-5" />
            登出
          </button>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Group Management */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-3">管理群組</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {groups.map((group) => (
              <div key={group.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                <span className={`w-3 h-3 rounded-full ${colorClasses[group.color] || 'bg-gray-500'}`}></span>
                <input
                  type="text"
                  value={group.name}
                  onChange={(e) => handleGroupNameChange(group.id, e.target.value)}
                  className="flex-grow px-3 py-2 bg-slate-100 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
                  aria-label={`Group name for ${group.name}`}
                />
                <button 
                  onClick={() => handleDeleteGroup(group.id)} 
                  className="p-2 text-slate-500 hover:bg-red-100 hover:text-red-600 rounded-full transition"
                  aria-label={`Delete ${group.name}`}
                >
                  <TrashIcon className="w-5 h-5"/>
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={handleAddGroup}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-sky-700 bg-sky-100 rounded-lg hover:bg-sky-200 transition"
            >
              <PlusIcon className="w-5 h-5"/>
              新增群組
            </button>
            <div className="flex items-center gap-3">
               {showGroupsSaved && <span className="text-sm text-green-600 animate-fade-in">已儲存！</span>}
               <button
                  onClick={handleSaveGroups}
                  className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
                >
                  <SaveIcon className="w-5 h-5"/>
                  儲存群組變更
               </button>
            </div>
          </div>
        </div>

        {/* Discussion Topic Management */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-xl font-semibold text-slate-700 border-b pb-3">設定討論主題</h2>
          <div>
            <label htmlFor="topic-title" className="text-sm font-medium text-slate-700">主題標題</label>
            <input
              id="topic-title"
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="例如：Q3 產品腦力激盪"
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          <div>
            <label htmlFor="topic-description" className="text-sm font-medium text-slate-700">主題說明</label>
            <textarea
              id="topic-description"
              rows={5}
              value={topicDescription}
              onChange={(e) => setTopicDescription(e.target.value)}
              placeholder="詳細說明這次腦力激盪的目標、背景和限制。"
              className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            />
          </div>
          
          {topicImagePreview && (
            <div className="relative">
              <img src={topicImagePreview} alt="Preview" className="w-full h-auto max-h-60 object-contain rounded-lg bg-slate-50 p-2 border" />
              <button
                type="button"
                onClick={handleRemoveTopicImage}
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition"
                aria-label="移除圖片"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleTopicImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
            >
              <ImageIcon className="w-5 h-5" />
              {topicImagePreview ? '更換圖片' : '新增圖片'}
            </button>
          </div>
          
          <div className="flex justify-end items-center pt-4 border-t">
            <div className="flex items-center gap-3">
              {showTopicSaved && <span className="text-sm text-green-600 animate-fade-in">已儲存！</span>}
              <button
                onClick={handleSaveTopic}
                className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition"
              >
                <SaveIcon className="w-5 h-5"/>
                儲存主題
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminView;