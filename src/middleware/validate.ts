/**
 * Validation middleware cho commands
 */

import { Message, ChatInputCommandInteraction } from 'discord.js';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { rateLimiterService } from '../services/RateLimiterService';
import { NoCharacterError, NoHPError } from '../utils/errors';
import { Character } from '../types';
import { logger } from '../utils/logger';

export interface ValidationResult {
  playerId: number;
  character: Character;
}

export interface RateLimitResult {
  allowed: boolean;
  message?: string;
  remainingPoints?: number;
}

/**
 * Check rate limit cho user
 */
export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    const result = await rateLimiterService.checkCommandLimit(userId);
    
    if (!result.allowed) {
      return {
        allowed: false,
        message: result.message || '⏱️ Bạn đã sử dụng quá nhiều lệnh! Vui lòng đợi.',
      };
    }

    // Warn user if close to limit
    if (result.remainingPoints && result.remainingPoints <= 2) {
      logger.debug(`User ${userId} gần đạt rate limit: ${result.remainingPoints} lệnh còn lại`);
    }

    return { 
      allowed: true,
      remainingPoints: result.remainingPoints,
    };
  } catch (error) {
    logger.error('Rate limit check error', error);
    return { allowed: true }; // Fail open on error
  }
}

/**
 * Check strict rate limit cho expensive commands (boss, shop)
 */
export async function checkStrictRateLimit(
  userId: string, 
  commandName: string
): Promise<RateLimitResult> {
  try {
    const result = await rateLimiterService.checkStrictLimit(userId, commandName);
    
    if (!result.allowed) {
      return {
        allowed: false,
        message: result.message || '⏱️ Lệnh này bị giới hạn! Vui lòng đợi.',
      };
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Strict rate limit check error', error);
    return { allowed: true };
  }
}

/**
 * Validate và load player + character cho slash commands
 */
export async function validateCharacter(
  interaction: ChatInputCommandInteraction
): Promise<ValidationResult> {
  const player = await PlayerService.findByDiscordId(interaction.user.id);
  if (!player) {
    throw new NoCharacterError(false);
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    throw new NoCharacterError(false);
  }

  return { playerId: player.id, character };
}

/**
 * Validate và load player + character cho prefix commands
 */
export async function validateCharacterPrefix(
  message: Message
): Promise<ValidationResult> {
  const player = await PlayerService.findByDiscordId(message.author.id);
  if (!player) {
    throw new NoCharacterError(true);
  }

  const character = await CharacterService.findByPlayerId(player.id);
  if (!character) {
    throw new NoCharacterError(true);
  }

  return { playerId: player.id, character };
}

/**
 * Validate character có đủ HP không
 */
export function validateHP(character: Character): void {
  if (character.hp <= 0) {
    throw new NoHPError();
  }
}

/**
 * Validate và load character với HP check (cho battle commands)
 */
export async function validateBattleReady(
  interaction: ChatInputCommandInteraction
): Promise<ValidationResult> {
  const result = await validateCharacter(interaction);
  validateHP(result.character);
  return result;
}

/**
 * Validate và load character với HP check cho prefix commands
 */
export async function validateBattleReadyPrefix(
  message: Message
): Promise<ValidationResult> {
  const result = await validateCharacterPrefix(message);
  validateHP(result.character);
  return result;
}

/**
 * Get hoặc create player cho start command
 */
export async function getOrCreatePlayer(discordId: string, username: string) {
  return await PlayerService.getOrCreate(discordId, username);
}
