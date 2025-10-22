// Game and Realm Management Service for Multi-Wallet System

import type { GameDefinition, GameRealm } from '../types';
import { MULTI_WALLET_STORAGE_KEYS } from '../types';
import { StorageService } from './storage';
import { ErrorService, ErrorCode } from './errorService';

export class GameManagementService {
  private static initialized = false;

  // Initialize the service with default data
  static initialize(): void {
    if (this.initialized) return;

    try {
      // Initialize with default games if not present
      const existingGames = this.getAllGames();
      if (existingGames.length === 0) {
        this.seedDefaultData();
      }
      this.initialized = true;
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.initialize');
    }
  }

  // Game Operations

  /**
   * Create a new game
   */
  static async createGame(
    name: string, 
    slug: string, 
    icon: string, 
    adminId: string
  ): Promise<GameDefinition> {
    try {
      // Validate input
      if (!name?.trim() || !slug?.trim() || !adminId?.trim()) {
        throw ErrorService.createError(
          ErrorCode.VALIDATION_FAILED,
          { name, slug, adminId },
          'Name, slug, and admin ID are required'
        );
      }

      // Check for duplicate slug
      const existingGames = this.getAllGames();
      if (existingGames.some(game => game.slug === slug)) {
        throw ErrorService.createError(
          ErrorCode.VALIDATION_FAILED,
          { slug },
          'Game slug must be unique'
        );
      }

      const newGame: GameDefinition = {
        id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        icon: icon.trim() || '/icons/default-game.png',
        isActive: true,
        realms: [],
        createdAt: new Date()
      };

      existingGames.push(newGame);
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS, existingGames);

      return newGame;
    } catch (error) {
      throw ErrorService.handleError(error, 'GameManagementService.createGame');
    }
  }

  /**
   * Get all games
   */
  static getAllGames(): GameDefinition[] {
    try {
      const games = StorageService.getItem<GameDefinition[]>(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS) || [];
      // Ensure dates are properly parsed
      return games.map(game => ({
        ...game,
        createdAt: new Date(game.createdAt)
      }));
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getAllGames');
      return [];
    }
  }

  /**
   * Get active games only
   */
  static getActiveGames(): GameDefinition[] {
    try {
      return this.getAllGames().filter(game => game.isActive);
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getActiveGames');
      return [];
    }
  }

  /**
   * Get game by ID
   */
  static getGameById(gameId: string): GameDefinition | null {
    try {
      const games = this.getAllGames();
      return games.find(game => game.id === gameId) || null;
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getGameById');
      return null;
    }
  }

  /**
   * Update game
   */
  static async updateGame(
    gameId: string, 
    updates: Partial<GameDefinition>, 
    _adminId: string
  ): Promise<GameDefinition> {
    try {
      const games = this.getAllGames();
      const gameIndex = games.findIndex(game => game.id === gameId);

      if (gameIndex === -1) {
        throw ErrorService.createError(
          ErrorCode.OPERATION_FAILED,
          { gameId },
          'Game not found'
        );
      }

      // Validate slug uniqueness if being updated
      if (updates.slug && updates.slug !== games[gameIndex].slug) {
        const slugExists = games.some(game => 
          game.id !== gameId && game.slug === updates.slug
        );
        if (slugExists) {
          throw ErrorService.createError(
            ErrorCode.VALIDATION_FAILED,
            { slug: updates.slug },
            'Game slug must be unique'
          );
        }
      }

      // Apply updates
      const updatedGame = {
        ...games[gameIndex],
        ...updates,
        id: gameId, // Ensure ID cannot be changed
        createdAt: games[gameIndex].createdAt // Preserve creation date
      };

      games[gameIndex] = updatedGame;
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS, games);

      return updatedGame;
    } catch (error) {
      throw ErrorService.handleError(error, 'GameManagementService.updateGame');
    }
  }

  /**
   * Deactivate game (soft delete)
   */
  static async deactivateGame(gameId: string, adminId: string): Promise<GameDefinition> {
    try {
      return await this.updateGame(gameId, { isActive: false }, adminId);
    } catch (error) {
      throw ErrorService.handleError(error, 'GameManagementService.deactivateGame');
    }
  }

  // Realm Operations

  /**
   * Create a new realm within a game
   */
  static async createRealm(
    gameId: string, 
    realmName: string, 
    adminId: string
  ): Promise<GameRealm> {
    try {
      // Validate input
      if (!gameId?.trim() || !realmName?.trim() || !adminId?.trim()) {
        throw ErrorService.createError(
          ErrorCode.VALIDATION_FAILED,
          { gameId, realmName, adminId },
          'Game ID, realm name, and admin ID are required'
        );
      }

      // Get the game
      const game = this.getGameById(gameId);
      if (!game) {
        throw ErrorService.createError(
          ErrorCode.OPERATION_FAILED,
          { gameId },
          'Game not found'
        );
      }

      // Check for duplicate realm name within the game
      const existingRealms = this.getGameRealms(gameId);
      if (existingRealms.some(realm => 
        realm.realmName.toLowerCase() === realmName.trim().toLowerCase()
      )) {
        throw ErrorService.createError(
          ErrorCode.VALIDATION_FAILED,
          { gameId, realmName },
          'Realm name must be unique within the game'
        );
      }

      const newRealm: GameRealm = {
        id: `realm_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        gameId,
        gameName: game.name,
        realmName: realmName.trim(),
        displayName: `${realmName.trim()} Gold`,
        isActive: true,
        createdAt: new Date(),
        createdBy: adminId
      };

      // Add realm to the realms storage
      const allRealms = this.getAllRealms();
      allRealms.push(newRealm);
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS, allRealms);

      // Update the game's realms array
      game.realms.push(newRealm);
      await this.updateGame(gameId, { realms: game.realms }, adminId);

      return newRealm;
    } catch (error) {
      throw ErrorService.handleError(error, 'GameManagementService.createRealm');
    }
  }

  /**
   * Get all realms
   */
  static getAllRealms(): GameRealm[] {
    try {
      const realms = StorageService.getItem<GameRealm[]>(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS) || [];
      // Ensure dates are properly parsed
      return realms.map(realm => ({
        ...realm,
        createdAt: new Date(realm.createdAt)
      }));
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getAllRealms');
      return [];
    }
  }

  /**
   * Get all active realms
   */
  static getAllActiveRealms(): GameRealm[] {
    try {
      return this.getAllRealms().filter(realm => realm.isActive);
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getAllActiveRealms');
      return [];
    }
  }

  /**
   * Get realms for a specific game
   */
  static getGameRealms(gameId: string): GameRealm[] {
    try {
      return this.getAllRealms().filter(realm => realm.gameId === gameId);
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getGameRealms');
      return [];
    }
  }

  /**
   * Get active realms for a specific game
   */
  static getActiveGameRealms(gameId: string): GameRealm[] {
    try {
      return this.getGameRealms(gameId).filter(realm => realm.isActive);
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getActiveGameRealms');
      return [];
    }
  }

  /**
   * Get realm by ID
   */
  static getRealmById(realmId: string): GameRealm | null {
    try {
      const realms = this.getAllRealms();
      return realms.find(realm => realm.id === realmId) || null;
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getRealmById');
      return null;
    }
  }

  /**
   * Update realm
   */
  static async updateRealm(
    realmId: string, 
    updates: Partial<GameRealm>, 
    adminId: string
  ): Promise<GameRealm> {
    try {
      const allRealms = this.getAllRealms();
      const realmIndex = allRealms.findIndex(realm => realm.id === realmId);

      if (realmIndex === -1) {
        throw ErrorService.createError(
          ErrorCode.OPERATION_FAILED,
          { realmId },
          'Realm not found'
        );
      }

      const currentRealm = allRealms[realmIndex];

      // Validate realm name uniqueness within the game if being updated
      if (updates.realmName && updates.realmName !== currentRealm.realmName) {
        const gameRealms = this.getGameRealms(currentRealm.gameId);
        const nameExists = gameRealms.some(realm => 
          realm.id !== realmId && 
          realm.realmName.toLowerCase() === updates.realmName!.toLowerCase()
        );
        if (nameExists) {
          throw ErrorService.createError(
            ErrorCode.VALIDATION_FAILED,
            { realmName: updates.realmName },
            'Realm name must be unique within the game'
          );
        }
      }

      // Apply updates
      const updatedRealm = {
        ...currentRealm,
        ...updates,
        id: realmId, // Ensure ID cannot be changed
        gameId: currentRealm.gameId, // Ensure game ID cannot be changed
        createdAt: currentRealm.createdAt, // Preserve creation date
        createdBy: currentRealm.createdBy // Preserve creator
      };

      // Update display name if realm name changed
      if (updates.realmName) {
        updatedRealm.displayName = `${updates.realmName} Gold`;
      }

      allRealms[realmIndex] = updatedRealm;
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS, allRealms);

      // Update the game's realms array
      const game = this.getGameById(currentRealm.gameId);
      if (game) {
        const gameRealmIndex = game.realms.findIndex(r => r.id === realmId);
        if (gameRealmIndex !== -1) {
          game.realms[gameRealmIndex] = updatedRealm;
          await this.updateGame(game.id, { realms: game.realms }, adminId);
        }
      }

      return updatedRealm;
    } catch (error) {
      throw ErrorService.handleError(error, 'GameManagementService.updateRealm');
    }
  }

  /**
   * Deactivate realm (soft delete)
   */
  static async deactivateRealm(realmId: string, adminId: string): Promise<GameRealm> {
    try {
      return await this.updateRealm(realmId, { isActive: false }, adminId);
    } catch (error) {
      throw ErrorService.handleError(error, 'GameManagementService.deactivateRealm');
    }
  }

  // Data seeding and management

  /**
   * Seed default game and realm data for development
   */
  static seedDefaultData(): void {
    try {
      const defaultGames: GameDefinition[] = [
        {
          id: 'game_wow_default',
          name: 'World of Warcraft',
          slug: 'world-of-warcraft',
          icon: '/icons/wow.png',
          isActive: true,
          realms: [],
          createdAt: new Date()
        },
        {
          id: 'game_ff14_default',
          name: 'Final Fantasy XIV',
          slug: 'final-fantasy-xiv',
          icon: '/icons/ff14.png',
          isActive: true,
          realms: [],
          createdAt: new Date()
        },
        {
          id: 'game_gw2_default',
          name: 'Guild Wars 2',
          slug: 'guild-wars-2',
          icon: '/icons/gw2.png',
          isActive: true,
          realms: [],
          createdAt: new Date()
        }
      ];

      const defaultRealms: GameRealm[] = [
        // World of Warcraft realms
        {
          id: 'realm_wow_kazzak',
          gameId: 'game_wow_default',
          gameName: 'World of Warcraft',
          realmName: 'Kazzak',
          displayName: 'Kazzak Gold',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        },
        {
          id: 'realm_wow_stormrage',
          gameId: 'game_wow_default',
          gameName: 'World of Warcraft',
          realmName: 'Stormrage',
          displayName: 'Stormrage Gold',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        },
        {
          id: 'realm_wow_ragnaros',
          gameId: 'game_wow_default',
          gameName: 'World of Warcraft',
          realmName: 'Ragnaros',
          displayName: 'Ragnaros Gold',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        },
        {
          id: 'realm_wow_tichondrius',
          gameId: 'game_wow_default',
          gameName: 'World of Warcraft',
          realmName: 'Tichondrius',
          displayName: 'Tichondrius Gold',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        },
        // Final Fantasy XIV realms
        {
          id: 'realm_ff14_gilgamesh',
          gameId: 'game_ff14_default',
          gameName: 'Final Fantasy XIV',
          realmName: 'Gilgamesh',
          displayName: 'Gilgamesh Gil',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        },
        {
          id: 'realm_ff14_leviathan',
          gameId: 'game_ff14_default',
          gameName: 'Final Fantasy XIV',
          realmName: 'Leviathan',
          displayName: 'Leviathan Gil',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        },
        // Guild Wars 2 realms
        {
          id: 'realm_gw2_tarnished_coast',
          gameId: 'game_gw2_default',
          gameName: 'Guild Wars 2',
          realmName: 'Tarnished Coast',
          displayName: 'Tarnished Coast Gold',
          isActive: true,
          createdAt: new Date(),
          createdBy: 'system'
        }
      ];

      // Update games with their realms
      defaultGames[0].realms = defaultRealms.filter(r => r.gameId === 'game_wow_default');
      defaultGames[1].realms = defaultRealms.filter(r => r.gameId === 'game_ff14_default');
      defaultGames[2].realms = defaultRealms.filter(r => r.gameId === 'game_gw2_default');

      // Save to storage
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS, defaultGames);
      StorageService.setItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS, defaultRealms);

    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.seedDefaultData');
    }
  }

  /**
   * Clear all game and realm data (for testing/reset)
   */
  static clearAllData(): void {
    try {
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.GAME_DEFINITIONS);
      StorageService.removeItem(MULTI_WALLET_STORAGE_KEYS.GAME_REALMS);
      this.initialized = false;
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.clearAllData');
    }
  }

  /**
   * Get statistics about games and realms
   */
  static getStatistics(): {
    totalGames: number;
    activeGames: number;
    totalRealms: number;
    activeRealms: number;
    realmsPerGame: Record<string, number>;
  } {
    try {
      const games = this.getAllGames();
      const realms = this.getAllRealms();

      const realmsPerGame: Record<string, number> = {};
      games.forEach(game => {
        realmsPerGame[game.name] = realms.filter(r => r.gameId === game.id).length;
      });

      return {
        totalGames: games.length,
        activeGames: games.filter(g => g.isActive).length,
        totalRealms: realms.length,
        activeRealms: realms.filter(r => r.isActive).length,
        realmsPerGame
      };
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.getStatistics');
      return {
        totalGames: 0,
        activeGames: 0,
        totalRealms: 0,
        activeRealms: 0,
        realmsPerGame: {}
      };
    }
  }

  /**
   * Validate realm name uniqueness within a game
   */
  static validateRealmNameUnique(gameId: string, realmName: string, excludeRealmId?: string): boolean {
    try {
      const gameRealms = this.getGameRealms(gameId);
      return !gameRealms.some(realm => 
        realm.id !== excludeRealmId && 
        realm.realmName.toLowerCase() === realmName.toLowerCase()
      );
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.validateRealmNameUnique');
      return false;
    }
  }

  /**
   * Validate game slug uniqueness
   */
  static validateGameSlugUnique(slug: string, excludeGameId?: string): boolean {
    try {
      const games = this.getAllGames();
      return !games.some(game => 
        game.id !== excludeGameId && 
        game.slug === slug.toLowerCase()
      );
    } catch (error) {
      ErrorService.handleError(error, 'GameManagementService.validateGameSlugUnique');
      return false;
    }
  }
}