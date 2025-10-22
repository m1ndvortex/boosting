// Role Request Form Component for Clients

import React, { useState } from 'react';
import type { RoleRequestFormData } from '../../types';
import { useRoleRequests } from '../../contexts/RoleRequestContext';
import { useNotifications } from '../notifications/NotificationSystem';
import './RoleRequestForm.css';

export const RoleRequestForm: React.FC = () => {
  const { createRequest, state } = useRoleRequests();
  const { addNotification } = useNotifications();

  const [formData, setFormData] = useState<RoleRequestFormData>({
    requestedRole: 'advertiser',
    reason: '',
    experience: '',
    idCardFile: null,
  });

  const [fileName, setFileName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle text input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          idCardFile: 'Please upload a valid image (JPEG, PNG, WEBP) or PDF file',
        }));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors(prev => ({
          ...prev,
          idCardFile: 'File size must be less than 5MB',
        }));
        return;
      }

      setFormData(prev => ({ ...prev, idCardFile: file }));
      setFileName(file.name);
      setErrors(prev => ({ ...prev, idCardFile: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.reason.trim()) {
      newErrors.reason = 'Please explain why you want this role';
    } else if (formData.reason.trim().length < 50) {
      newErrors.reason = 'Please provide at least 50 characters';
    }

    if (!formData.idCardFile) {
      newErrors.idCardFile = 'ID card/verification document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createRequest(formData);

      addNotification({
        type: 'success',
        title: 'Request Submitted',
        message: `Your ${formData.requestedRole === 'advertiser' ? 'Advertiser' : 'Team Advertiser'} role request has been submitted successfully!`,
      });

      // Reset form
      setFormData({
        requestedRole: 'advertiser',
        reason: '',
        experience: '',
        idCardFile: null,
      });
      setFileName('');
      setErrors({});
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Failed to submit request',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="role-request-form-container">
      <div className="role-request-form-header">
        <h2>Request Service Provider Role</h2>
        <p>
          Apply to become an Advertiser or Team Advertiser to start offering gaming services on
          our platform.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="role-request-form">
        {/* Role Selection */}
        <div className="form-group">
          <label htmlFor="requestedRole">
            Requested Role <span className="required">*</span>
          </label>
          <select
            id="requestedRole"
            name="requestedRole"
            value={formData.requestedRole}
            onChange={handleInputChange}
            className="form-select"
            disabled={isSubmitting}
          >
            <option value="advertiser">Advertiser (Individual Services)</option>
            <option value="team_advertiser">Team Advertiser (Team Services)</option>
          </select>
          <small className="form-help">
            {formData.requestedRole === 'advertiser'
              ? 'Create and manage your own services'
              : 'Create and manage services as part of a team'}
          </small>
        </div>

        {/* Reason */}
        <div className="form-group">
          <label htmlFor="reason">
            Why do you want this role? <span className="required">*</span>
          </label>
          <textarea
            id="reason"
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className={`form-textarea ${errors.reason ? 'error' : ''}`}
            placeholder="Explain why you want to become a service provider and what you plan to offer..."
            rows={5}
            disabled={isSubmitting}
            minLength={50}
            maxLength={1000}
          />
          <div className="form-footer">
            <small className={`char-count ${formData.reason.length < 50 ? 'warning' : ''}`}>
              {formData.reason.length}/1000 characters (minimum 50)
            </small>
            {errors.reason && <small className="form-error">{errors.reason}</small>}
          </div>
        </div>

        {/* Experience (Optional) */}
        <div className="form-group">
          <label htmlFor="experience">Experience & Background (Optional)</label>
          <textarea
            id="experience"
            name="experience"
            value={formData.experience || ''}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Share your gaming experience, previous work, or relevant background..."
            rows={4}
            disabled={isSubmitting}
            maxLength={500}
          />
          <small className="form-help">
            {formData.experience?.length || 0}/500 characters
          </small>
        </div>

        {/* ID Card Upload */}
        <div className="form-group">
          <label htmlFor="idCardFile">
            Verification Document (ID Card, Driver's License, etc.){' '}
            <span className="required">*</span>
          </label>
          <div className="file-upload-container">
            <input
              type="file"
              id="idCardFile"
              name="idCardFile"
              onChange={handleFileChange}
              accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
              className="file-input"
              disabled={isSubmitting}
            />
            <label htmlFor="idCardFile" className="file-upload-label">
              <span className="file-upload-icon">📄</span>
              <span className="file-upload-text">
                {fileName || 'Choose file or drag here'}
              </span>
            </label>
          </div>
          <small className="form-help">
            Accepted formats: JPEG, PNG, WEBP, PDF (Max 5MB)
          </small>
          {errors.idCardFile && <small className="form-error">{errors.idCardFile}</small>}
        </div>

        {/* Privacy Notice */}
        <div className="privacy-notice">
          <p>
            <strong>🔒 Privacy Notice:</strong> Your personal information and documents will be
            kept confidential and only used for verification purposes. We comply with data
            protection regulations.
          </p>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || state.loading}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>

        {/* Error message */}
        {state.error && <div className="form-error-message">{state.error}</div>}
      </form>
    </div>
  );
};
