import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import { RealmManagementPanel } from '../../../components/admin/RealmManagementPanel';
import { GameManagementService } from '../../../services/gameManagementService';
import type { GameDefinition, GameRealm } from '../../../types';

// Mock the GameManagementService
vi.mock('../../../services/gameManagementService', () => ({
  GameManagementService: {
    initialize: vi.fn(),
    getGameById: vi.fn(),
    getGameRealms: vi.fn(),
    createRealm: vi.fn(),
    updateRealm: vi.fn(),
    deactivateRealm: vi.fn(),
    validateRealmNameUnique: vi.fn()
  }
}));

// Mock the notification context
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('../../../contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}));

describe('RealmManagementPanel Component', () => {
  const mockGame: GameDefinition = {
    id: 'game_1',
    name: 'World of Warcraft',
    slug: 'world-of-warcraft',
    icon: '/icons/wow.png',
    isActive: true,
    realms: [],
    createdAt: new Date('2024-01-01')
  };

  const mockRealms: GameRealm[] = [
    {
      id: 'realm_1',
      gameId: 'game_1',
      gameName: 'World of Warcraft',
      realmName: 'Kazzak',
      displayName: 'Kazzak Gold',
      isActive: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'admin'
    },
    {
      id: 'realm_2',
      gameId: 'game_1',
      gameName: 'World of Warcraft',
      realmName: 'Stormrage',
      displayName: 'Stormrage Gold',
      isActive: false,
      createdAt: new Date('2024-01-02'),
      createdBy: 'admin'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GameManagementService.getGameById).mockReturnValue(mockGame);
    vi.mocked(GameManagementService.getGameRealms).mockReturnValue(mockRealms);
    vi.mocked(GameManagementService.validateRealmNameUnique).mockReturnValue(true);
  });

  it('should render the component with game title and description', () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    expect(screen.getByText('Realm Management - World of Warcraft')).toBeInTheDocument();
    expect(screen.getByText('Manage realms for World of Warcraft. Each realm represents a server or world within the game.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add New Realm' })).toBeInTheDocument();
  });

  it('should load and display realms on mount', async () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    await waitFor(() => {
      expect(GameManagementService.initialize).toHaveBeenCalled();
      expect(GameManagementService.getGameById).toHaveBeenCalledWith('game_1');
      expect(GameManagementService.getGameRealms).toHaveBeenCalledWith('game_1');
    });

    expect(screen.getByText('Kazzak')).toBeInTheDocument();
    expect(screen.getByText('Stormrage')).toBeInTheDocument();
    expect(screen.getByText('Realms (2)')).toBeInTheDocument();
  });

  it('should show error when game is not found', () => {
    vi.mocked(GameManagementService.getGameById).mockReturnValue(null);
    
    render(<RealmManagementPanel gameId="invalid_game" />);
    
    expect(screen.getByText('Game not found. Please select a valid game.')).toBeInTheDocument();
  });

  it('should show create form when Add New Realm is clicked', () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Realm' }));
    
    expect(screen.getByText('Create New Realm')).toBeInTheDocument();
    expect(screen.getByLabelText('Realm Name')).toBeInTheDocument();
  });

  it('should validate required realm name', async () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Realm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Realm' }));
    
    await waitFor(() => {
      expect(screen.getByText('Realm name is required')).toBeInTheDocument();
    });
  });

  it('should validate realm name length', async () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Realm' }));
    
    const nameInput = screen.getByLabelText('Realm Name');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Realm' }));
    
    await waitFor(() => {
      expect(screen.getByText('Realm name must be at least 2 characters')).toBeInTheDocument();
    });
  });

  it('should validate realm name uniqueness', async () => {
    vi.mocked(GameManagementService.validateRealmNameUnique).mockReturnValue(false);
    
    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Realm' }));
    
    const nameInput = screen.getByLabelText('Realm Name');
    fireEvent.change(nameInput, { target: { value: 'Kazzak' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Realm' }));
    
    await waitFor(() => {
      expect(screen.getByText('This realm name already exists in this game')).toBeInTheDocument();
    });
  });

  it('should create a new realm successfully', async () => {
    const newRealm: GameRealm = {
      id: 'realm_3',
      gameId: 'game_1',
      gameName: 'World of Warcraft',
      realmName: 'Ragnaros',
      displayName: 'Ragnaros Gold',
      isActive: true,
      createdAt: new Date(),
      createdBy: 'admin'
    };

    vi.mocked(GameManagementService.createRealm).mockResolvedValue(newRealm);

    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Realm' }));
    
    fireEvent.change(screen.getByLabelText('Realm Name'), { target: { value: 'Ragnaros' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Realm' }));
    
    await waitFor(() => {
      expect(GameManagementService.createRealm).toHaveBeenCalledWith(
        'game_1',
        'Ragnaros',
        'admin'
      );
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Realm Created',
        'Ragnaros has been created successfully.'
      );
    });
  });

  it('should show edit form when Edit button is clicked', () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByText('Edit Realm')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kazzak')).toBeInTheDocument();
  });

  it('should show inactive status for deactivated realms', () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should show activate button for inactive realms', () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument();
  });

  it('should show deactivate button for active realms', () => {
    render(<RealmManagementPanel gameId="game_1" />);
    
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('should handle deactivation with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    const deactivatedRealm = { ...mockRealms[0], isActive: false };
    vi.mocked(GameManagementService.deactivateRealm).mockResolvedValue(deactivatedRealm);

    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to deactivate "Kazzak"? This will hide it from users but preserve all data.'
      );
      expect(GameManagementService.deactivateRealm).toHaveBeenCalledWith('realm_1', 'admin');
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('should show empty state when no realms exist', () => {
    vi.mocked(GameManagementService.getGameRealms).mockReturnValue([]);
    
    render(<RealmManagementPanel gameId="game_1" />);
    
    expect(screen.getByText('No realms found for World of Warcraft. Create your first realm to get started.')).toBeInTheDocument();
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(GameManagementService.createRealm).mockRejectedValue(new Error('Creation failed'));

    render(<RealmManagementPanel gameId="game_1" />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Realm' }));
    fireEvent.change(screen.getByLabelText('Realm Name'), { target: { value: 'Test Realm' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Realm' }));
    
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Creation Failed',
        'Creation failed'
      );
    });
  });
});