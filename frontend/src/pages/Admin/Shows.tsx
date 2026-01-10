import React from 'react';

const AdminShows: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Shows</h1>
      <p className="text-gray-600">Show management interface coming soon...</p>
      <p className="text-sm text-gray-500 mt-4">
        Use the API endpoints to manage shows: POST /api/v1/shows, PUT /api/v1/shows/:id
      </p>
    </div>
  );
};

export default AdminShows;
