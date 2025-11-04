import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DataList({ endpoint, title }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get(endpoint);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`${endpoint}/${id}`);
        fetchData();
      } catch (err) {
        alert('Failed to delete item: ' + err.message);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="data-list">
      <h2>{title}</h2>
      {data.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="list-container">
          {data.map((item) => (
            <div key={item.id} className="list-item">
              <div className="item-content">
                <h3>{item.title || item.name || `Item ${item.id}`}</h3>
                {item.description && <p>{item.description}</p>}
                {item.email && <p>Email: {item.email}</p>}
                {item.content && <p>{item.content}</p>}
              </div>
              <div className="item-actions">
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <button className="btn btn-primary" onClick={fetchData}>
        Refresh
      </button>
    </div>
  );
}

export default DataList;