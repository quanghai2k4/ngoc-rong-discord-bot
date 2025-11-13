import { query } from '../database/db';
import { Player } from '../types';

export class PlayerService {
  static async findByDiscordId(discordId: string): Promise<Player | null> {
    const result = await query(
      'SELECT id, discord_id, username, created_at, last_login FROM players WHERE discord_id = $1',
      [discordId]
    );
    return result.rows[0] || null;
  }

  static async create(discordId: string, username: string): Promise<Player> {
    const result = await query(
      'INSERT INTO players (discord_id, username) VALUES ($1, $2) RETURNING id, discord_id, username, created_at, last_login',
      [discordId, username]
    );
    return result.rows[0];
  }

  static async updateLastLogin(discordId: string): Promise<void> {
    await query(
      'UPDATE players SET last_login = CURRENT_TIMESTAMP WHERE discord_id = $1',
      [discordId]
    );
  }

  static async getOrCreate(discordId: string, username: string): Promise<Player> {
    let player = await this.findByDiscordId(discordId);
    if (!player) {
      player = await this.create(discordId, username);
    } else {
      await this.updateLastLogin(discordId);
    }
    return player;
  }
}
