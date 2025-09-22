
import React, { useMemo } from 'react';
import { Post, Group } from '../types';
import { TrophyIcon, ArrowLeftIcon, DownloadIcon } from './icons';
import { exportResultsViewAsPDF } from '../utils/pdfExporter';

interface ResultsViewProps {
  posts: Post[];
  groups: Group[];
  onBack: () => void;
  onViewImage: (imageUrl: string) => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ posts, groups, onBack, onViewImage }) => {
  const topPostsByGroup = useMemo(() => {
    const sortedPosts: { [key: string]: Post[] } = {};
    posts.forEach(post => {
      if (!sortedPosts[post.groupId]) {
        sortedPosts[post.groupId] = [];
      }
      sortedPosts[post.groupId].push(post);
    });

    const topPosts: (Post | null)[] = groups.map(group => {
      const groupPosts = sortedPosts[group.id] || [];
      if (groupPosts.length === 0) return null;
      
      return groupPosts.reduce((top, current) => 
        current.votes.length > top.votes.length ? current : top
      );
    });
    
    return topPosts;
  }, [posts, groups]);

  const handleExportPDF = async () => {
    await exportResultsViewAsPDF(groups, topPostsByGroup);
  };

  const groupColorVariants = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', ring: 'focus:ring-blue-500' },
      green: { bg: 'bg-green-100', text: 'text-green-800', ring: 'focus:ring-green-500' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', ring: 'focus:ring-purple-500' },
      red: { bg: 'bg-red-100', text: 'text-red-800', ring: 'focus:ring-red-500' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', ring: 'focus:ring-yellow-500' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-200">
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold transition-colors">
                    <ArrowLeftIcon className="w-5 h-5"/>
                    返回群組
                </button>
                 <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition">
                    <DownloadIcon className="w-5 h-5"/>
                    匯出為 PDF
                </button>
            </div>
        </header>
        <main className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <TrophyIcon className="w-16 h-16 mx-auto text-yellow-500"/>
                <h1 className="text-4xl font-extrabold text-slate-800 mt-4">最佳點子</h1>
                <p className="text-slate-500 mt-2 max-w-2xl mx-auto">這裡是各團隊腦力激盪會議中得票最高的點子。</p>
            </div>
            
            <div className="space-y-10">
                {groups.map((group, index) => {
                    const topPost = topPostsByGroup[index];
                    const colors = groupColorVariants[group.color as keyof typeof groupColorVariants] || groupColorVariants.blue;

                    return (
                        <div key={group.id}>
                            <h2 className={`text-2xl font-bold mb-4 pb-2 border-b-2 ${colors.text} border-current/30`}>{group.name}</h2>
                            {topPost ? (
                                <div className={`grid grid-cols-1 md:grid-cols-5 gap-6 p-6 rounded-xl shadow-lg ${colors.bg}`}>
                                    {topPost.imageUrl && (
                                        <div className="md:col-span-2">
                                             <button
                                              onClick={() => onViewImage(topPost.imageUrl!)}
                                              className={`block w-full h-full rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-4 ${colors.ring}`}
                                              aria-label="View top post image in full screen"
                                            >
                                              <img src={topPost.imageUrl} alt="Top post" className="w-full h-full object-cover rounded-lg pointer-events-none" />
                                            </button>
                                        </div>
                                    )}
                                    <div className={topPost.imageUrl ? 'md:col-span-3' : 'md:col-span-5'}>
                                        <p className="text-lg text-slate-700 mb-4">{topPost.content}</p>
                                        <div className="text-sm text-slate-500">
                                            <p><span className="font-semibold">作者：</span> {topPost.author}</p>
                                            <p className="font-semibold">{topPost.votes.length} 票</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`p-6 text-center rounded-xl ${colors.bg} text-slate-600`}>
                                    此群組尚未提交任何點子。
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </main>
    </div>
  );
};

export default ResultsView;