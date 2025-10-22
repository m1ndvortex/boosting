import React, { useState } from 'react';
import { TeamService } from '../../services/teamService';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import type { Team } from '../../types';
import './TeamCreationForm.css';

interface TeamCreationFormProps {
  onTeamCreated: (team: Team) => void;
  onCancel: () => void;
}

export const TeamCreationForm: React.FC<TeamCreationFormProps> = ({
  onTeamCreated,
  onCancel
}) => {
  const { state: authState } = useAuth();
  const { refreshWorkspaces } = useWorkspace();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error('Team name is required');
      }

      if (formData.name.length < 3) {
        throw new Error('Team name must be at least 3 characters');
      }

      if (formData.name.length > 50) {
        throw new Error('Team name must be less than 50 characters');
      }

      // Create team
      const team = TeamService.createTeam({
        name: formData.name.trim(),
        description: formData.description.trim(),
        leaderId: authState.user.id
      });

      // Refresh workspaces to include new team
      refreshWorkspaces();

      onTeamCreated(team);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  return (
    <div className="team-creation-form">
      <div className="team-creation-form__header">
        <h3>Create New Team</h3>
        <p>Create a team to collaborate with other advertisers and manage services together.</p>
      </div>

      <form onSubmit={handleSubmit} className="team-creation-form__form">
        <div className="team-creation-form__field">
          <label htmlFor="teamName" className="team-creation-form__label">
            Team Name *
          </label>
          <input
            id="teamName"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="team-creation-form__input"
            placeholder="Enter team name"
            maxLength={50}
            disabled={isSubmitting}
          />
          <div className="team-creation-form__field-hint">
            {formData.name.length}/50 characters
          </div>
        </div>

        <div className="team-creation-form__field">
          <label htmlFor="teamDescription" className="team-creation-form__label">
            Description
          </label>
          <textarea
            id="teamDescription"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="team-creation-form__textarea"
            placeholder="Describe your team's focus and goals (optional)"
            rows={3}
            maxLength={200}
            disabled={isSubmitting}
          />
          <div className="team-creation-form__field-hint">
            {formData.description.length}/200 characters
          </div>
        </div>

        {error && (
          <div className="team-creation-form__error">
            {error}
          </div>
        )}

        <div className="team-creation-form__actions">
          <button
            type="button"
            onClick={onCancel}
            className="team-creation-form__button team-creation-form__button--secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="team-creation-form__button team-creation-form__button--primary"
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};