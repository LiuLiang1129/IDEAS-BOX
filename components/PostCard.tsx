
import React, { useState } from 'react';
import { Post, User } from '../types';
import { ThumbsUpIcon, CommentIcon, StarIcon, PencilIcon, TrashIcon } from './icons';
import EditPostForm from './EditPostForm';

interface PostCardProps {
  post: Post;
  user: User;
  onAddComment: (postId: string, commentText: string) => void;
  onVote: (postId: string) => void;
  onEditPost: (postId: string, content: string, imageFile?: File | null) => void;
  onDeletePost: (postId: string) => void;
  onViewImage: (imageUrl: string) => void;
  isTopPost: boolean;
  borderColor: string;
  canVote: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, user, onAddComment, onVote, onEditPost, onDeletePost, onViewImage, isTopPost, borderColor, canVote }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const hasVoted = post.votes.includes(user.name);
  const isAuthor = user.name === post.author;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleSaveEdit = (content: string, imageFile?: File | null) => {
    onEditPost(post.id, content, imageFile);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
        <EditPostForm
            post={post}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            onViewImage={onViewImage}
        />
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg flex flex-col transition-all duration-300 ${isTopPost ? `ring-4 ${borderColor.replace('border-', 'ring-')}` : 'hover:shadow-xl hover:-translate-y-1'}`}>
      {isTopPost && (
         <div className={`absolute -top-3 -right-3 bg-yellow-400 text-white p-2 rounded-full shadow-lg`}>
             <StarIcon className="w-6 h-6" />
         </div>
      )}

      {post.imageUrl && (
        <button 
          onClick={() => onViewImage(post.imageUrl!)} 
          className="block w-full h-48 rounded-t-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2" 
          aria-label="View post image in full screen"
        >
          <img src={post.imageUrl} alt="Post image" className="w-full h-full object-cover rounded-t-xl pointer-events-none" />
        </button>
      )}
      <div className="p-5 flex flex-col flex-grow">
        <p className="text-slate-600 mb-4 flex-grow">{post.content}</p>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">由 {post.author}</p>
      </div>
      
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => onVote(post.id)}
                    disabled={!hasVoted && !canVote}
                    className={`flex items-center space-x-1.5 text-sm font-semibold transition-colors ${hasVoted ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'} disabled:text-slate-400 disabled:cursor-not-allowed`}
                    aria-disabled={!hasVoted && !canVote}
                >
                    <ThumbsUpIcon className={`w-5 h-5 ${hasVoted ? 'fill-current' : ''}`} />
                    <span>{post.votes.length}</span>
                </button>
                <div className="flex items-center space-x-1.5 text-sm text-slate-500 font-semibold">
                    <CommentIcon className="w-5 h-5"/>
                    <span>{post.comments.length}</span>
                </div>
            </div>
             {isAuthor && (
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-sky-600 transition-colors"
                        aria-label="編輯點子"
                    >
                        <PencilIcon className="w-5 h-5" />
                        <span>編輯</span>
                    </button>
                    <button
                        onClick={() => onDeletePost(post.id)}
                        className="flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors"
                        aria-label="刪除點子"
                    >
                        <TrashIcon className="w-5 h-5" />
                        <span>刪除</span>
                    </button>
                </div>
            )}
        </div>
      </div>
      
      <div className="p-5 border-t border-slate-200">
        <div className="space-y-3 max-h-32 overflow-y-auto pr-2">
            {post.comments.map(comment => (
                <div key={comment.id} className="text-sm">
                    <span className="font-semibold text-slate-700">{comment.author}:</span>
                    <span className="text-slate-600 ml-1.5">{comment.text}</span>
                </div>
            ))}
        </div>
        <form onSubmit={handleCommentSubmit} className="mt-4 flex items-center space-x-2">
            <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="新增留言..."
                className="w-full text-sm px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300" disabled={!commentText.trim()}>
                送出
            </button>
        </form>
      </div>
    </div>
  );
};

export default PostCard;
