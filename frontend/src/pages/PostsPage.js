import React, { useState } from 'react';
import DataList from '../components/DataList';
import DataForm from '../components/DataForm';

function PostsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const postFields = [
    { name: 'title', label: 'Title', required: true, placeholder: 'Enter post title' },
    { name: 'author', label: 'Author', required: true, placeholder: 'Author name' },
    { name: 'content', label: 'Content', type: 'textarea', required: true, placeholder: 'Write your post content here...' },
    { name: 'tags', label: 'Tags', placeholder: 'e.g., tech, news, tutorial' }
  ];

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="page posts-page">
      <h1>Posts Management</h1>
      
      <div className="page-content">
        <div className="section">
          <DataForm 
            endpoint="/api/posts"
            fields={postFields}
            onSuccess={handleSuccess}
            title="Create New Post"
          />
        </div>
        
        <div className="section">
          <DataList 
            key={refreshKey}
            endpoint="/api/posts" 
            title="All Posts"
          />
        </div>
      </div>
    </div>
  );
}

export default PostsPage;