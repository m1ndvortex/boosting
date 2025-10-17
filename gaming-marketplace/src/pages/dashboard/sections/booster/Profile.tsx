import React, { useState } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/discord/Button';
import './Profile.css';

export const Profile: React.FC = () => {
  const { state } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    bio: 'Experienced booster with 5+ years in WoW. Specializing in Mythic+ dungeons and raid content.',
    specializations: ['Mythic+ Dungeons', 'Raid Content', 'Leveling', 'Achievement Hunting'],
    availability: 'Evenings and weekends (EST)',
    languages: ['English', 'Spanish'],
    preferredGames: ['World of Warcraft'],
    completionRate: 98.5,
    averageRating: 4.8,
    totalOrders: 127
  });

  const handleSave = () => {
    // In a real app, this would save to the backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data if needed
  };

  const addSpecialization = () => {
    const newSpec = prompt('Enter new specialization:');
    if (newSpec && newSpec.trim()) {
      setProfileData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpec.trim()]
      }));
    }
  };

  const removeSpecialization = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="booster-profile">
      <div className="booster-profile__header">
        <h1 className="booster-profile__title">Booster Profile</h1>
        <p className="booster-profile__subtitle">
          Manage your booster profile and showcase your expertise
        </p>
      </div>

      <div className="booster-profile__content">
        <div className="booster-profile__main">
          <div className="booster-profile__section">
            <div className="booster-profile__section-header">
              <h2 className="booster-profile__section-title">Basic Information</h2>
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="booster-profile__user-info">
              <div className="booster-profile__avatar">
                <img
                  src={state.user?.avatar || '/default-avatar.png'}
                  alt={state.user?.username}
                  className="booster-profile__avatar-image"
                />
              </div>
              <div className="booster-profile__user-details">
                <h3 className="booster-profile__username">
                  {state.user?.username}#{state.user?.discriminator}
                </h3>
                <p className="booster-profile__email">{state.user?.email}</p>
                <div className="booster-profile__roles">
                  {state.user?.roles.map((role) => (
                    <span key={role.id} className="booster-profile__role-badge">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="booster-profile__section">
            <h2 className="booster-profile__section-title">Bio</h2>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                className="booster-profile__textarea"
                rows={4}
                placeholder="Tell clients about your experience and expertise..."
              />
            ) : (
              <p className="booster-profile__bio">{profileData.bio}</p>
            )}
          </div>

          <div className="booster-profile__section">
            <h2 className="booster-profile__section-title">Specializations</h2>
            <div className="booster-profile__specializations">
              {profileData.specializations.map((spec, index) => (
                <div key={index} className="booster-profile__specialization">
                  <span className="booster-profile__specialization-text">{spec}</span>
                  {isEditing && (
                    <button
                      onClick={() => removeSpecialization(index)}
                      className="booster-profile__remove-spec"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button
                  onClick={addSpecialization}
                  className="booster-profile__add-spec"
                >
                  + Add Specialization
                </button>
              )}
            </div>
          </div>

          <div className="booster-profile__section">
            <h2 className="booster-profile__section-title">Availability</h2>
            {isEditing ? (
              <input
                type="text"
                value={profileData.availability}
                onChange={(e) => setProfileData(prev => ({ ...prev, availability: e.target.value }))}
                className="booster-profile__input"
                placeholder="When are you typically available?"
              />
            ) : (
              <p className="booster-profile__availability">{profileData.availability}</p>
            )}
          </div>

          {isEditing && (
            <div className="booster-profile__actions">
              <Button variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="booster-profile__sidebar">
          <div className="booster-profile__stats-card">
            <h3 className="booster-profile__stats-title">Performance Stats</h3>
            
            <div className="booster-profile__stat">
              <div className="booster-profile__stat-label">Completion Rate</div>
              <div className="booster-profile__stat-value">{profileData.completionRate}%</div>
            </div>

            <div className="booster-profile__stat">
              <div className="booster-profile__stat-label">Average Rating</div>
              <div className="booster-profile__stat-value">
                {profileData.averageRating} ⭐
              </div>
            </div>

            <div className="booster-profile__stat">
              <div className="booster-profile__stat-label">Total Orders</div>
              <div className="booster-profile__stat-value">{profileData.totalOrders}</div>
            </div>
          </div>

          <div className="booster-profile__info-card">
            <h3 className="booster-profile__info-title">Languages</h3>
            <div className="booster-profile__languages">
              {profileData.languages.map((lang, index) => (
                <span key={index} className="booster-profile__language">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          <div className="booster-profile__info-card">
            <h3 className="booster-profile__info-title">Preferred Games</h3>
            <div className="booster-profile__games">
              {profileData.preferredGames.map((game, index) => (
                <span key={index} className="booster-profile__game">
                  {game}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};