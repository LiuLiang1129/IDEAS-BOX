
import React, { useState } from 'react';
import { User, Group, Post, DiscussionTopic } from '../types';
import PostCard from './PostCard';
import CreatePostForm from './CreatePostForm';
import { PlusIcon, ChartBarIcon, LogoutIcon, DownloadIcon } from './icons';
import { exportGroupViewAsPDF } from '../utils/pdfExporter';

interface GroupViewProps {
  user: User;
  group: Group;
  posts: Post[];
  onCreatePost: (content: string, imageFile?: File) => void;
  onEditPost: (postId: string, content: string, imageFile?: File | null) => void;
  onDeletePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onVote: (postId: string) => void;
  onShowResults: () => void;
  onLogout: () => void;
  onViewImage: (imageUrl: string) => void;
  discussionTopic: DiscussionTopic | null;
  userVoteCount: number;
}

const GroupView: React.FC<GroupViewProps> = ({
  user,
  group,
  posts,
  onCreatePost,
  onEditPost,
  onDeletePost,
  onAddComment,
  onVote,
  onShowResults,
  onLogout,
  onViewImage,
  discussionTopic,
  userVoteCount
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const groupColorVariants = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-500', button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' },
      green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500', button: 'bg-green-600 hover:bg-green-700 focus:ring-green-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500', button: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' },
      red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500', button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500', button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' },
  };

  const colors = groupColorVariants[group.color as keyof typeof groupColorVariants] || groupColorVariants.blue;

  const topPostId = posts.length > 0 ? posts[0].id : null;
  
  const handleExportPDF = async () => {
    await exportGroupViewAsPDF(group, posts);
  };

  return (
    <div className={`min-h-screen ${colors.bg}`}>
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div>
                    <h1 className={`text-2xl font-bold ${colors.text}`}>{group.name}</h1>
                    <p className="text-sm text-slate-500">歡迎，{user.name}！ 您還有 {Math.max(0, 2 - userVoteCount)} 票可用。</p>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                     <button
                        onClick={onShowResults}
                        className={`hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ${colors.button} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition`}
                    >
                        <ChartBarIcon className="w-5 h-5"/> 查看結果
                    </button>
                    <button
                        onClick={handleExportPDF}
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition"
                        title="匯出為 PDF"
                    >
                       <DownloadIcon className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onLogout}
                        className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition"
                        title="登出"
                    >
                       <LogoutIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>

        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            {discussionTopic && (discussionTopic.title || discussionTopic.description || discussionTopic.imageUrl) && (
              <div className="mb-8 bg-white/70 p-6 rounded-xl shadow-md border animate-fade-in">
                {discussionTopic.imageUrl && (
                    <button
                        onClick={() => onViewImage(discussionTopic.imageUrl!)}
                        className="block w-full mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        aria-label="查看討論主題圖片"
                    >
                        <img
                            src={discussionTopic.imageUrl}
                            alt="討論主題"
                            className="w-full h-auto max-h-72 object-contain rounded-lg pointer-events-none"
                        />
                    </button>
                )}
                {discussionTopic.title && <h2 className="text-2xl font-bold text-slate-800">{discussionTopic.title}</h2>}
                {discussionTopic.description && <p className={`text-slate-600 whitespace-pre-wrap ${discussionTopic.title ? 'mt-2' : ''}`}>{discussionTopic.description}</p>}
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-slate-700">點子板</h2>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={`flex items-center gap-2 px-4 py-2 text-white font-semibold ${colors.button} rounded-full shadow-lg transform hover:scale-105 transition`}
                >
                    <PlusIcon className="w-5 h-5"/> {showCreateForm ? '關閉' : '新增點子'}
                </button>
            </div>
            
            {showCreateForm && (
                <div className="mb-8">
                    <CreatePostForm
                        onSubmit={(content, image) => {
                            onCreatePost(content, image);
                            setShowCreateForm(false);
                        }}
                        onViewImage={onViewImage}
                    />
                </div>
            )}
            
            {posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map(post => (
                        <PostCard 
                            key={post.id} 
                            post={post}
                            user={user}
                            onAddComment={onAddComment}
                            onVote={onVote}
                            onEditPost={onEditPost}
                            onDeletePost={onDeletePost}
                            onViewImage={onViewImage}
                            isTopPost={post.id === topPostId}
                            borderColor={colors.border}
                            canVote={userVoteCount < 2}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-slate-700">尚無任何點子！</h3>
                    <p className="text-slate-500 mt-2">成為第一個與團隊分享點子的人。</p>
                </div>
            )}
            <button
                onClick={onShowResults}
                className={`sm:hidden mt-8 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white ${colors.button} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition`}
            >
                <ChartBarIcon className="w-5 h-5"/> 查看所有結果
            </button>
        </main>
    </div>
  );
};

export default GroupView;
