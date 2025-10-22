// Role Request Page for Clients

import React, { useState } from 'react';
import { RoleRequestForm } from '../../components/forms/RoleRequestForm';
import { RoleRequestList } from '../../components/forms/RoleRequestList';
import './RoleRequestPage.css';

export const RoleRequestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

  return (
    <div className="role-request-page">
      <div className="role-request-page-header">
        <h1>Role Requests</h1>
        <p>Apply for Advertiser or Team Advertiser roles to start offering services</p>
      </div>

      <div className="role-request-tabs">
        <button
          className={`role-request-tab ${activeTab === 'new' ? 'active' : ''}`}
          onClick={() => setActiveTab('new')}
        >
          <span className="tab-icon">📝</span>
          <span>New Request</span>
        </button>
        <button
          className={`role-request-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📋</span>
          <span>My Requests</span>
        </button>
      </div>

      <div className="role-request-content">
        {activeTab === 'new' ? <RoleRequestForm /> : <RoleRequestList />}
      </div>
    </div>
  );
};
