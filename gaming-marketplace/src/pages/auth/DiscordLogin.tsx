import React, { useState } from 'react';
import { useAuth, getMockDiscordUsers } from '../../contexts/AuthContext';
import { Button } from '../../components/discord/Button';
import { Modal } from '../../components/discord/Modal';
import './DiscordLogin.css';

export const DiscordLogin: React.FC = () => {
  const { state, login, clearError } = useAuth();
  const [showUserSelection, setShowUserSelection] = useState(false);
  const mockUsers = getMockDiscordUsers();

  const handleDiscordLogin = () => {
    setShowUserSelection(true);
    clearError();
  };

  const handleUserSelect = async (userId: string) => {
    setShowUserSelection(false);
    await login(userId);
  };

  const handleCloseModal = () => {
    setShowUserSelection(false);
    clearError();
  };

  return (
    <div className="discord-login">
      <div className="discord-login__container">
        <div className="discord-login__header">
          <div className="discord-login__logo">
            <svg
              width="124"
              height="34"
              viewBox="0 0 124 34"
              className="discord-logo"
            >
              <g fill="currentColor">
                <path d="M26.0015 6.9529C24.0021 6.03845 21.8787 5.37198 19.6623 5C19.3833 5.48048 19.0733 6.13144 18.8563 6.64292C16.4989 6.30193 14.1585 6.30193 11.8336 6.64292C11.6166 6.13144 11.2911 5.48048 11.0276 5C8.79575 5.37198 6.67235 6.03845 4.6869 6.9529C0.672601 12.8736 -0.41235 18.6548 0.130124 24.3585C2.79599 26.2959 5.36889 27.4739 7.89682 28.2489C8.51679 27.4119 9.07477 26.5129 9.55525 25.5675C8.64079 25.2265 7.77283 24.808 6.93587 24.312C7.15286 24.1571 7.36986 23.9866 7.57135 23.8161C12.6241 26.1255 18.0789 26.1255 23.0915 23.8161C23.293 23.9866 23.51 24.1571 23.727 24.312C22.8746 24.808 22.0221 25.2265 21.1077 25.5675C21.5882 26.5129 22.1462 27.4119 22.7661 28.2489C25.2941 27.4739 27.867 26.2959 30.5328 24.3585C31.1692 17.7559 29.4563 12.0212 26.0015 6.9529ZM10.2527 20.8402C8.73376 20.8402 7.48849 19.4608 7.48849 17.7714C7.48849 16.082 8.70276 14.7026 10.2527 14.7026C11.8026 14.7026 13.0169 16.082 13.0169 17.7714C13.0169 19.4608 11.8026 20.8402 10.2527 20.8402ZM20.4373 20.8402C18.9183 20.8402 17.6731 19.4608 17.6731 17.7714C17.6731 16.082 18.8873 14.7026 20.4373 14.7026C21.9872 14.7026 23.2015 16.082 23.2015 17.7714C23.2015 19.4608 21.9872 20.8402 20.4373 20.8402Z" />
              </g>
            </svg>
          </div>
          <h1 className="discord-login__title">Gaming Marketplace</h1>
          <p className="discord-login__subtitle">
            Connect with Discord to access the gaming services marketplace
          </p>
        </div>

        <div className="discord-login__content">
          <div className="discord-login__card">
            <div className="discord-login__card-header">
              <h2>Welcome to Gaming Marketplace</h2>
              <p>Sign in with your Discord account to get started</p>
            </div>

            <div className="discord-login__card-body">
              {state.error && (
                <div className="discord-login__error">
                  <span className="discord-login__error-icon">⚠️</span>
                  {state.error}
                </div>
              )}

              <Button
                variant="primary"
                size="large"
                onClick={handleDiscordLogin}
                disabled={state.loading}
                className="discord-login__button"
              >
                {state.loading ? (
                  <>
                    <div className="discord-login__spinner" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="discord-login__button-icon"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                    Continue with Discord
                  </>
                )}
              </Button>

              <div className="discord-login__info">
                <p>
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Selection Modal */}
      {showUserSelection && (
        <Modal
          isOpen={showUserSelection}
          onClose={handleCloseModal}
          title="Select Discord Account"
        >
          <div className="discord-login__user-selection">
            <p className="discord-login__selection-subtitle">
              Choose a Discord account to simulate login:
            </p>
            <div className="discord-login__user-list">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  className="discord-login__user-item"
                  onClick={() => handleUserSelect(user.id)}
                >
                  <div className="discord-login__user-avatar">
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.username}&background=7289da&color=fff&size=40`}
                      alt={user.username}
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.username}&background=7289da&color=fff&size=40`;
                      }}
                    />
                  </div>
                  <div className="discord-login__user-info">
                    <div className="discord-login__user-name">
                      {user.username}
                      <span className="discord-login__user-discriminator">
                        #{user.discriminator}
                      </span>
                    </div>
                    <div className="discord-login__user-email">
                      {user.email}
                    </div>
                  </div>
                  <div className="discord-login__user-arrow">→</div>
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};