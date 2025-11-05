import React from 'react';
import { Link } from 'react-router-dom';

const PopularPostsWidget = () => {
  const popularPosts = [
    { id: 1, title: 'Getting Started with React Hooks', comments: 23 },
    { id: 2, title: 'The Future of Web Development', comments: 18 },
    { id: 3, title: '10 Productivity Tips for Developers', comments: 15 }
  ];

  return (
    <div className="widget popular-posts-widget">
      <h3>Popular Posts</h3>
      <div className="popular-posts-list">
        {popularPosts.map(post => (
          <div key={post.id} className="popular-post-item">
            <div className="popular-post-content">
              <h4>
                <Link to={`/post/${post.id}`} className="popular-post-title">
                  {post.title}
                </Link>
              </h4>
              <div className="popular-post-meta">
                <span className="comment-count">{post.comments} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PopularPostsWidget;
