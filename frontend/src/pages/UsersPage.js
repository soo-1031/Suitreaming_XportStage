import React, { useState } from 'react';
import DataList from '../components/DataList';
import DataForm from '../components/DataForm';

function UsersPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const userFields = [
    { name: 'name', label: 'Name', required: true, placeholder: 'Enter user name' },
    { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
    { name: 'phone', label: 'Phone', placeholder: 'Enter phone number' },
    { name: 'role', label: 'Role', placeholder: 'e.g., Admin, User' }
  ];

  const handleSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="page users-page">
      <h1>User Management</h1>
      
      <div className="page-content">
        <div className="section">
          <DataForm 
            endpoint="/api/users"
            fields={userFields}
            onSuccess={handleSuccess}
            title="Add New User"
          />
        </div>
        
        <div className="section">
          <DataList 
            key={refreshKey}
            endpoint="/api/users" 
            title="All Users"
          />
        </div>
      </div>
    </div>
  );
}

export default UsersPage;