import { query } from '../database/db';
import { Character, CharacterRace } from '../types';

export class CharacterService {
  static async findByPlayerId(playerId: number): Promise<Character | null> {
    const result = await query(
      'SELECT * FROM characters WHERE player_id = $1',
      [playerId]
    );
    return result.rows[0] || null;
  }

  static async create(
    playerId: number,
    name: string,
    raceId: number
  ): Promise<Character> {
    const race = await this.getRaceById(raceId);
    if (!race) {
      throw new Error('Race not found');
    }

    const maxHp = 100 + race.hp_bonus;
    const maxKi = 100 + race.ki_bonus;
    const attack = 10 + race.attack_bonus;
    const defense = 10 + race.defense_bonus;

    const result = await query(
      `INSERT INTO characters 
       (player_id, race_id, name, max_hp, hp, max_ki, ki, attack, defense) 
       VALUES ($1, $2, $3, $4, $4, $5, $5, $6, $7) 
       RETURNING *`,
      [playerId, raceId, name, maxHp, maxKi, attack, defense]
    );
    return result.rows[0];
  }

  static async getAllRaces(): Promise<CharacterRace[]> {
    const result = await query('SELECT * FROM character_races ORDER BY id');
    return result.rows;
  }

  static async getRaceById(raceId: number): Promise<CharacterRace | null> {
    const result = await query(
      'SELECT * FROM character_races WHERE id = $1',
      [raceId]
    );
    return result.rows[0] || null;
  }

  static async updateStats(characterId: number, stats: Partial<Character>): Promise<void> {
    const fields = Object.keys(stats);
    const values = Object.values(stats);
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
    
    await query(
      `UPDATE characters SET ${setClause} WHERE id = $${fields.length + 1}`,
      [...values, characterId]
    );
  }

  static async addExperience(characterId: number, exp: number): Promise<Character> {
    const char = await query(
      'SELECT * FROM characters WHERE id = $1',
      [characterId]
    );
    
    if (!char.rows[0]) {
      throw new Error('Character not found');
    }

    const character = char.rows[0];
    let newExp = character.experience + exp;
    let newLevel = character.level;
    
    // Level up calculation (100 exp per level, increases by 50 each level)
    const expNeeded = 100 + (newLevel - 1) * 50;
    
    while (newExp >= expNeeded) {
      newExp -= expNeeded;
      newLevel++;
      
      // Increase stats on level up
      const newMaxHp = character.max_hp + 20;
      const newMaxKi = character.max_ki + 20;
      const newAttack = character.attack + 5;
      const newDefense = character.defense + 5;
      const newSpeed = character.speed + 3;

      await query(
        `UPDATE characters 
         SET level = $1, experience = $2, max_hp = $3, hp = $3, 
             max_ki = $4, ki = $4, attack = $5, defense = $6, speed = $7
         WHERE id = $8`,
        [newLevel, newExp, newMaxHp, newMaxKi, newAttack, newDefense, newSpeed, characterId]
      );

      character.level = newLevel;
      character.max_hp = newMaxHp;
      character.max_ki = newMaxKi;
      character.attack = newAttack;
      character.defense = newDefense;
      character.speed = newSpeed;
    }

    if (character.level === newLevel) {
      await query(
        'UPDATE characters SET experience = $1 WHERE id = $2',
        [newExp, characterId]
      );
    }

    const result = await query(
      'SELECT * FROM characters WHERE id = $1',
      [characterId]
    );
    return result.rows[0];
  }

  static async heal(characterId: number, hp: number, ki: number): Promise<void> {
    await query(
      `UPDATE characters 
       SET hp = LEAST(hp + $1, max_hp), 
           ki = LEAST(ki + $2, max_ki) 
       WHERE id = $3`,
      [hp, ki, characterId]
    );
  }
}
