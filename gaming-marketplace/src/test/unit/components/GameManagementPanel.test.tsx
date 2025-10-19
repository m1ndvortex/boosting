import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { GameManagementPanel } from '@components/admin/GameManagementPanel';
import { GameManagementService } from '@services/gameManagementService';
import type { GameDefinition } from '@/types';

// Mock the GameManagementService
vi.mock('@services/gameManagementService', () => ({
  GameManagementService: {
    initialize: vi.fn(),
    getAllGames: vi.fn(),
    createGame: vi.fn(),
    updateGame: vi.fn(),
    deactivateGame: vi.fn(),
    validateGameSlugUnique: vi.fn()
  }
}));

// Mock the notification context
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('@contexts/NotificationContext', () => ({
  useNotifications: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError
  })
}));

describe('GameManagementPanel Component', () => {
  const mockGames: GameDefinition[] = [
    {
      id: 'game_1',
      name: 'World of Warcraft',
      slug: 'world-of-warcraft',
      icon: '/icons/wow.png',
      isActive: true,
      realms: [],
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'game_2',
      name: 'Final Fantasy XIV',
      slug: 'final-fantasy-xiv',
      icon: '/icons/ff14.png',
      isActive: false,
      realms: [],
      createdAt: new Date('2024-01-02')
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(GameManagementService.getAllGames).mockReturnValue(mockGames);
    vi.mocked(GameManagementService.validateGameSlugUnique).mockReturnValue(true);
  });

  it('should render the component with title and description', () => {
    render(<GameManagementPanel />);
    
    expect(screen.getByText('Game Management')).toBeInTheDocument();
    expect(screen.getByText('Manage games and their settings for the multi-wallet system')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add New Game' })).toBeInTheDocument();
  });

  it('should load and display games on mount', async () => {
    render(<GameManagementPanel />);
    
    await waitFor(() => {
      expect(GameManagementService.initialize).toHaveBeenCalled();
      expect(GameManagementService.getAllGames).toHaveBeenCalled();
    });

    expect(screen.getByText('World of Warcraft')).toBeInTheDocument();
    expect(screen.getByText('Final Fantasy XIV')).toBeInTheDocument();
    expect(screen.getByText('Existing Games (2)')).toBeInTheDocument();
  });

  it('should show create form when Add New Game is clicked', () => {
    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Game' }));
    
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Game Slug')).toBeInTheDocument();
    expect(screen.getByLabelText('Icon URL (Optional)')).toBeInTheDocument();
  });

  it('should auto-generate slug from game name', () => {
    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Game' }));
    
    const nameInput = screen.getByLabelText('Game Name');
    const slugInput = screen.getByLabelText('Game Slug');
    
    fireEvent.change(nameInput, { target: { value: 'Test Game Name!' } });
    
    expect(slugInput).toHaveValue('test-game-name');
  });

  it('should validate required fields', async () => {
    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Game' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create Game' }));
    
    await waitFor(() => {
      expect(screen.getByText('Game name is required')).toBeInTheDocument();
      expect(screen.getByText('Game slug is required')).toBeInTheDocument();
    });
  });

  it('should validate slug format', async () => {
    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Game' }));
    
    const nameInput = screen.getByLabelText('Game Name');
    const slugInput = screen.getByLabelText('Game Slug');
    
    fireEvent.change(nameInput, { target: { value: 'Test Game' } });
    fireEvent.change(slugInput, { target: { value: 'Invalid Slug!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Game' }));
    
    await waitFor(() => {
      expect(screen.getByText('Slug must contain only lowercase letters, numbers, and hyphens')).toBeInTheDocument();
    });
  });

  it('should create a new game successfully', async () => {
    const newGame: GameDefinition = {
      id: 'game_3',
      name: 'New Game',
      slug: 'new-game',
      icon: '/icons/default-game.png',
      isActive: true,
      realms: [],
      createdAt: new Date()
    };

    vi.mocked(GameManagementService.createGame).mockResolvedValue(newGame);

    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Game' }));
    
    fireEvent.change(screen.getByLabelText('Game Name'), { target: { value: 'New Game' } });
    fireEvent.change(screen.getByLabelText('Game Slug'), { target: { value: 'new-game' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Game' }));
    
    await waitFor(() => {
      expect(GameManagementService.createGame).toHaveBeenCalledWith(
        'New Game',
        'new-game',
        '/icons/default-game.png',
        'admin'
      );
      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Game Created',
        'New Game has been created successfully.'
      );
    });
  });

  it('should show edit form when Edit button is clicked', () => {
    render(<GameManagementPanel />);
    
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    
    expect(screen.getByText('Edit Game')).toBeInTheDocument();
    expect(screen.getByDisplayValue('World of Warcraft')).toBeInTheDocument();
    expect(screen.getByDisplayValue('world-of-warcraft')).toBeInTheDocument();
  });

  it('should show inactive status for deactivated games', () => {
    render(<GameManagementPanel />);
    
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should show activate button for inactive games', () => {
    render(<GameManagementPanel />);
    
    expect(screen.getByRole('button', { name: 'Activate' })).toBeInTheDocument();
  });

  it('should show deactivate button for active games', () => {
    render(<GameManagementPanel />);
    
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('should handle deactivation with confirmation', async () => {
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(true);

    const deactivatedGame = { ...mockGames[0], isActive: false };
    vi.mocked(GameManagementService.deactivateGame).mockResolvedValue(deactivatedGame);

    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to deactivate "World of Warcraft"? This will hide it from users but preserve all data.'
      );
      expect(GameManagementService.deactivateGame).toHaveBeenCalledWith('game_1', 'admin');
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('should cancel deactivation if user declines confirmation', async () => {
    // Mock window.confirm to return false
    const originalConfirm = window.confirm;
    window.confirm = vi.fn().mockReturnValue(false);

    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Deactivate' }));
    
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(GameManagementService.deactivateGame).not.toHaveBeenCalled();
    });

    // Restore original confirm
    window.confirm = originalConfirm;
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(GameManagementService.createGame).mockRejectedValue(new Error('Creation failed'));

    render(<GameManagementPanel />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Add New Game' }));
    fireEvent.change(screen.getByLabelText('Game Name'), { target: { value: 'Test Game' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create Game' }));
    
    await waitFor(() => {
      expect(mockShowError).toHaveBeenCalledWith(
        'Creation Failed',
        'Creation failed'
      );
    });
  });

  it('should show empty state when no games exist', () => {
    vi.mocked(GameManagementService.getAllGames).mockReturnValue([]);
    
    render(<GameManagementPanel />);
    
    expect(screen.getByText('No games found. Create your first game to get started.')).toBeInTheDocument();
  });
});