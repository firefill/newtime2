// src/components/PostsPage.js
import React, { useEffect, useState } from 'react';

const Posts = ({ currentUser }) => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [showComments, setShowComments] = useState({});
  const [comments, setComments] = useState({});

  // Функция проверки возможности удаления поста
  const canDeletePost = (post, currentUser) => {
    if (!currentUser || !post) return false;
    // Приведение к числам для сравнения
    const postOwnerId = Number(post.userId);
    const currentUserId = Number(currentUser.id);
    console.log("Проверка удаления поста. post.userId =", postOwnerId, "currentUser.id =", currentUserId);
    if (postOwnerId === currentUserId) {
      console.log("Пост принадлежит текущему пользователю – удаление разрешено");
      return true;
    }
    let rolesArr = [];
    if (currentUser.roles) {
      try {
        rolesArr = JSON.parse(currentUser.roles);
      } catch (e) {
        console.error("Ошибка парсинга currentUser.roles:", e);
      }
    } else {
      rolesArr = [currentUser.role];
    }
    console.log("Роли текущего пользователя:", rolesArr);
    // Если пользователь имеет одну из технических ролей
    return rolesArr.includes("Администратор") || rolesArr.includes("Создатель");
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/posts', {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки постов:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (file) {
        formData.append('image', file);
      }
      const res = await fetch('http://localhost:5002/api/posts', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (res.ok) {
        const newPost = await res.json();
        setPosts(prev => [newPost, ...prev]);
        setContent('');
        setFile(null);
      } else {
        console.error("Ошибка при создании поста:", res.statusText);
      }
    } catch (error) {
      console.error("Ошибка при создании поста:", error);
    }
  };

  const handleDelete = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        console.error("Ошибка при удалении поста:", res.statusText);
      }
    } catch (error) {
      console.error("Ошибка при удалении поста:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${postId}/like`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json(); // { liked: true/false }
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              const newLikesCount = data.liked ? p.likesCount + 1 : p.likesCount - 1;
              return { ...p, likesCount: newLikesCount };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Ошибка лайка:", err);
    }
  };

  const toggleComments = async (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
    if (!comments[postId]) {
      try {
        const res = await fetch(`http://localhost:5002/api/posts/${postId}/comments`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          setComments(prev => ({ ...prev, [postId]: data }));
        }
      } catch (err) {
        console.error("Ошибка загрузки комментариев:", err);
      }
    }
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const commentText = commentInputs[postId];
    if (!commentText || commentText.trim() === '') return;
    try {
      const res = await fetch(`http://localhost:5002/api/posts/${postId}/comments`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => {
          const prevComments = prev[postId] || [];
          return { ...prev, [postId]: [...prevComments, newComment] };
        });
        setPosts(prev =>
          prev.map(p => {
            if (p.id === postId) {
              return { ...p, commentsCount: p.commentsCount + 1 };
            }
            return p;
          })
        );
        setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      }
    } catch (err) {
      console.error("Ошибка при создании комментария:", err);
    }
  };

  // Если данные загружаются, показываем сообщение
  if (loading) {
    return <div>Загрузка постов...</div>;
  }

  return (
    <div className="posts-page" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Страница постов</h2>
      <div className="create-post-form" style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Создать пост</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Текст поста:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="О чём ты думаешь?"
              style={{ width: '100%', height: '60px' }}
            />
          </div>
          <div>
            <label>Выбери картинку (необязательно):</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
            />
          </div>
          <button type="submit">Опубликовать</button>
        </form>
      </div>
      <div className="posts-list">
        {posts.length === 0 ? (
          <p>Постов нет.</p>
        ) : (
          posts.map(post => (
            <div key={post.id} className="post-item" style={{ marginBottom: '15px', border: '1px solid #ccc', padding: '10px' }}>
              <div className="post-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{post.authorNickname || 'Неизвестный автор'}</strong>
                <span className="post-date">{new Date(post.created_at).toLocaleString()}</span>
              </div>
              {post.imagePath && post.imagePath !== '' && (
                <div className="post-image" style={{ marginTop: '10px' }}>
                  <img src={`http://localhost:5002${post.imagePath}`} alt="Изображение поста" style={{ maxWidth: '100%' }} />
                </div>
              )}
              <div className="post-content" style={{ marginTop: '10px' }}>
                <p>{post.content}</p>
              </div>
              <div className="post-actions" style={{ marginTop: '10px' }}>
                <button onClick={() => handleLike(post.id)}>
                  Лайк ({post.likesCount})
                </button>
                <button onClick={() => toggleComments(post.id)}>
                  Комментировать ({post.commentsCount})
                </button>
                {canDeletePost(post, currentUser) && (
                  <button onClick={() => handleDelete(post.id)} style={{ color: 'red' }}>
                    Удалить
                  </button>
                )}
              </div>
              {showComments[post.id] && (
                <div className="comments-section" style={{ marginTop: '10px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                  <h4>Комментарии</h4>
                  {comments[post.id] && comments[post.id].length > 0 ? (
                    comments[post.id].map(comment => (
                      <div key={comment.id} className="comment-item" style={{ marginBottom: '5px' }}>
                        <strong>{comment.authorNickname}</strong>: {comment.content}
                        <div style={{ fontSize: '0.8em', color: '#777' }}>
                          {new Date(comment.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>Нет комментариев.</p>
                  )}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} style={{ marginTop: '10px' }}>
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Ваш комментарий..."
                      style={{ width: '80%', marginRight: '5px' }}
                    />
                    <button type="submit">Отправить</button>
                  </form>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Posts;