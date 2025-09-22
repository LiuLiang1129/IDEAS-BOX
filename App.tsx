
import React, { useState, useCallback, useMemo } from 'react';
import { AppView, User, Post, Group, Comment, DiscussionTopic } from './types';
import LoginScreen from './components/LoginScreen';
import GroupView from './components/GroupView';
import ResultsView from './components/ResultsView';
import AdminView from './components/AdminView';
import ImageModal from './components/ImageModal';
import ConfirmationModal from './components/ConfirmationModal';

const DUMMY_GROUPS_DATA: Group[] = [
  { id: 'group-1', name: 'Alpha 團隊', color: 'blue' },
  { id: 'group-2', name: 'Bravo 團隊', color: 'green' },
  { id: 'group-3', name: 'Charlie 團隊', color: 'purple' },
  { id: 'group-4', name: 'Delta 團隊', color: 'red' },
  { id: 'group-5', name: 'Echo 團隊', color: 'yellow' },
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.LOGIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [groups, setGroups] = useState<Group[]>(DUMMY_GROUPS_DATA);
  const [discussionTopic, setDiscussionTopic] = useState<DiscussionTopic | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleViewImage = useCallback((imageUrl: string) => {
    setViewingImage(imageUrl);
  }, []);

  const handleCloseImage = useCallback(() => {
    setViewingImage(null);
  }, []);

  const handleLogin = useCallback((name: string, groupId: string) => {
    if (name.trim() && groupId) {
      if (groupId === 'admin-access') {
        setCurrentUser({ name, groupId: 'admin' });
        setView(AppView.ADMIN);
      } else {
        setCurrentUser({ name, groupId });
        setView(AppView.GROUP);
      }
    }
  }, []);

  const handleCreatePost = useCallback((content: string, imageFile?: File) => {
    if (!currentUser) return;

    const createPost = (imageUrl?: string) => {
        const newPost: Post = {
            id: `post-${Date.now()}-${Math.random()}`,
            author: currentUser.name,
            groupId: currentUser.groupId,
            content,
            imageUrl,
            comments: [],
            votes: [],
        };
        setPosts(prevPosts => [newPost, ...prevPosts]);
    };
    
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            createPost(reader.result as string);
        };
        reader.readAsDataURL(imageFile);
    } else {
        createPost();
    }
  }, [currentUser]);

    const handleEditPost = useCallback((postId: string, newContent: string, newImageFile?: File | null) => {
    if (!currentUser) return;

    const updatePostState = (imageUrl?: string | null) => {
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId && post.author === currentUser.name) {
            const updatedPost = { ...post, content: newContent };
            if (typeof imageUrl !== 'undefined') {
              updatedPost.imageUrl = imageUrl === null ? undefined : imageUrl;
            }
            return updatedPost;
          }
          return post;
        })
      );
    };

    if (newImageFile) { // A new file is selected
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePostState(reader.result as string);
      };
      reader.readAsDataURL(newImageFile);
    } else if (newImageFile === null) { // Image is explicitly removed
      updatePostState(null);
    } else { // Image is unchanged (newImageFile is undefined)
      updatePostState(); // Call with undefined, so imageUrl is not touched
    }
  }, [currentUser]);

  const handleDeletePost = useCallback((postId: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (post && post.author === currentUser.name) {
        setPostToDelete(postId);
    }
  }, [currentUser, posts]);

  const handleConfirmDelete = useCallback(() => {
    if (!currentUser || !postToDelete) return;
    
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postToDelete));
    setPostToDelete(null);
  }, [currentUser, postToDelete]);

  const handleCancelDelete = useCallback(() => {
      setPostToDelete(null);
  }, []);

  const handleAddComment = useCallback((postId: string, commentText: string) => {
    if (!currentUser) return;
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const newComment: Comment = {
            id: `comment-${Date.now()}`,
            author: currentUser.name,
            text: commentText,
          };
          return { ...post, comments: [...post.comments, newComment] };
        }
        return post;
      })
    );
  }, [currentUser]);

  const handleVote = useCallback((postId: string) => {
    if (!currentUser) return;

    setPosts(prevPosts => {
      const targetPost = prevPosts.find(p => p.id === postId);
      if (!targetPost) {
        return prevPosts;
      }
      
      const hasVoted = targetPost.votes.includes(currentUser.name);

      if (hasVoted) {
        // Unvote is always allowed
        return prevPosts.map(p =>
          p.id === postId
            ? { ...p, votes: p.votes.filter(voter => voter !== currentUser.name) }
            : p
        );
      } else {
        // Vote
        const currentUserVoteCount = prevPosts.filter(
          p => p.groupId === currentUser.groupId && p.votes.includes(currentUser.name)
        ).length;

        if (currentUserVoteCount >= 2) {
          alert('每人最多只能投兩票。');
          return prevPosts;
        }
        
        return prevPosts.map(p =>
          p.id === postId
            ? { ...p, votes: [...p.votes, currentUser.name] }
            : p
        );
      }
    });
  }, [currentUser]);

  const handleShowResults = useCallback(() => setView(AppView.RESULTS), []);
  const handleBackToGroup = useCallback(() => setView(AppView.GROUP), []);
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setView(AppView.LOGIN);
  }, []);
  
  const handleUpdateGroups = useCallback((updatedGroups: Group[]) => {
    setGroups(updatedGroups);
  }, []);

  const handleUpdateDiscussionTopic = useCallback((topic: DiscussionTopic) => {
    setDiscussionTopic(topic);
  }, []);

  const currentGroup = useMemo(() => 
    groups.find(g => g.id === currentUser?.groupId), 
  [groups, currentUser]);
  
  const currentGroupPosts = useMemo(() => 
    posts.filter(p => p.groupId === currentUser?.groupId).sort((a,b) => b.votes.length - a.votes.length),
  [posts, currentUser]);

  const userVoteCount = useMemo(() => {
    if (!currentUser) return 0;
    return posts.filter(p => p.groupId === currentUser.groupId && p.votes.includes(currentUser.name)).length;
  }, [posts, currentUser]);


  const renderContent = () => {
    switch (view) {
      case AppView.ADMIN:
        return (
          <AdminView
            initialGroups={groups}
            initialTopic={discussionTopic}
            onUpdateGroups={handleUpdateGroups}
            onUpdateTopic={handleUpdateDiscussionTopic}
            onLogout={handleLogout}
          />
        );
      case AppView.GROUP:
        if (currentUser && currentGroup) {
          return (
            <GroupView
              user={currentUser}
              group={currentGroup}
              posts={currentGroupPosts}
              onCreatePost={handleCreatePost}
              onEditPost={handleEditPost}
              onDeletePost={handleDeletePost}
              onAddComment={handleAddComment}
              onVote={handleVote}
              onShowResults={handleShowResults}
              onLogout={handleLogout}
              onViewImage={handleViewImage}
              discussionTopic={discussionTopic}
              userVoteCount={userVoteCount}
            />
          );
        }
        // Fallback to login if something is wrong
        setView(AppView.LOGIN);
        return null;
      case AppView.RESULTS:
        return (
          <ResultsView
            posts={posts}
            groups={groups}
            onBack={handleBackToGroup}
            onViewImage={handleViewImage}
          />
        );
      case AppView.LOGIN:
      default:
        return <LoginScreen onLogin={handleLogin} groups={groups} />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <main>{renderContent()}</main>
      {viewingImage && <ImageModal imageUrl={viewingImage} onClose={handleCloseImage} />}
      <ConfirmationModal
        isOpen={postToDelete !== null}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="確定要刪除這則點子嗎？"
        message="此操作無法復原。"
      />
    </div>
  );
};

export default App;
