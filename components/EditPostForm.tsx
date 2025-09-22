
import React, { useState, useRef } from 'react';
import { Post } from '../types';
import { ImageIcon } from './icons';

interface EditPostFormProps {
  post: Post;
  onSave: (content: string, imageFile?: File | null) => void;
  onCancel: () => void;
  onViewImage: (imageUrl: string) => void;
}

const EditPostForm: React.FC<EditPostFormProps> = ({ post, onSave, onCancel, onViewImage }) => {
  const [content, setContent] = useState(post.content);
  // undefined: image unchanged, null: image removed, File: new image
  const [imageFile, setImageFile] = useState<File | undefined | null>();
  const [imagePreview, setImagePreview] = useState<string | undefined>(post.imageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
      setImageFile(null); // Signal removal
      setImagePreview(undefined);
      if(fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content, imageFile);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg space-y-4 h-full flex flex-col">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="分享你的點子..."
        rows={4}
        required
        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition flex-grow"
        aria-label="點子內容"
      />
      {imagePreview && (
        <div className="relative">
          <button
            type="button"
            onClick={() => onViewImage(imagePreview)}
            className="block w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="View image preview in full screen"
          >
            <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-40 object-contain rounded-lg pointer-events-none" />
          </button>
           <button 
             type="button" 
             onClick={handleRemoveImage}
             className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition"
             aria-label="移除圖片"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
      )}
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
            />
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-200 rounded-lg hover:bg-slate-300 transition"
            >
                <ImageIcon className="w-5 h-5" />
                {imagePreview ? '更換圖片' : '新增圖片'}
            </button>
        </div>
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2 font-semibold text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
                取消
            </button>
            <button
                type="submit"
                disabled={!content.trim()}
                className="flex items-center gap-2 px-5 py-2 font-semibold text-white bg-sky-600 rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
            >
                儲存
            </button>
        </div>
      </div>
    </form>
  );
};

export default EditPostForm;