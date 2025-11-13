import { Character, Monster } from '../types';
import { query } from '../database/db';
import { CharacterService } from './CharacterService';
import { MonsterService } from './MonsterService';

export interface BattleResult {
  won: boolean;
  rounds: BattleRound[];
  expGained: number;
  goldGained: number;
  itemsDropped: any[];
  characterDied: boolean;
}

export interface BattleRound {
  round: number;
  characterAction: string;
  monsterAction: string;
  characterHp: number;
  monsterHp: number;
}

export class BattleService {
  static async battle(character: Character, monster: Monster): Promise<BattleResult> {
    const rounds: BattleRound[] = [];
    let charHp = character.hp;
    let monsterHp = monster.hp;
    let roundNumber = 0;

    while (charHp > 0 && monsterHp > 0 && roundNumber < 50) {
      roundNumber++;

      // Determine who attacks first based on speed
      const characterFirst = character.speed >= monster.speed;

      if (characterFirst) {
        // Character attacks
        const charDamage = this.calculateDamage(character.attack, monster.defense);
        monsterHp -= charDamage;

        const charAction = `Bạn tấn công gây ${charDamage} sát thương!`;
        
        if (monsterHp <= 0) {
          rounds.push({
            round: roundNumber,
            characterAction: charAction,
            monsterAction: `${monster.name} đã bị đánh bại!`,
            characterHp: charHp,
            monsterHp: 0,
          });
          break;
        }

        // Monster attacks
        const monsterDamage = this.calculateDamage(monster.attack, character.defense);
        charHp -= monsterDamage;

        rounds.push({
          round: roundNumber,
          characterAction: charAction,
          monsterAction: `${monster.name} phản công gây ${monsterDamage} sát thương!`,
          characterHp: charHp,
          monsterHp: monsterHp,
        });
      } else {
        // Monster attacks first
        const monsterDamage = this.calculateDamage(monster.attack, character.defense);
        charHp -= monsterDamage;

        const monsterAction = `${monster.name} tấn công gây ${monsterDamage} sát thương!`;

        if (charHp <= 0) {
          rounds.push({
            round: roundNumber,
            characterAction: 'Bạn đã bị đánh bại!',
            monsterAction: monsterAction,
            characterHp: 0,
            monsterHp: monsterHp,
          });
          break;
        }

        // Character attacks
        const charDamage = this.calculateDamage(character.attack, monster.defense);
        monsterHp -= charDamage;

        rounds.push({
          round: roundNumber,
          characterAction: `Bạn phản công gây ${charDamage} sát thương!`,
          monsterAction: monsterAction,
          characterHp: charHp,
          monsterHp: monsterHp,
        });
      }
    }

    const won = monsterHp <= 0 && charHp > 0;
    const characterDied = charHp <= 0;

    let expGained = 0;
    let goldGained = 0;
    let itemsDropped: any[] = [];

    if (won) {
      expGained = monster.experience_reward;
      goldGained = monster.gold_reward;

      // Update character
      await CharacterService.addExperience(character.id, expGained);
      await query(
        'UPDATE characters SET gold = gold + $1, hp = $2 WHERE id = $3',
        [goldGained, Math.max(1, charHp), character.id]
      );

      // Check for item drops
      const drops = await MonsterService.getDrops(monster.id);
      for (const drop of drops) {
        if (Math.random() * 100 < drop.drop_rate) {
          itemsDropped.push(drop);
          await this.addItemToCharacter(character.id, drop.id, 1);
        }
      }

      // Log battle
      await query(
        `INSERT INTO battle_logs (character_id, monster_id, won, experience_gained, gold_gained) 
         VALUES ($1, $2, $3, $4, $5)`,
        [character.id, monster.id, true, expGained, goldGained]
      );
    } else {
      // Character lost - penalty
      const goldLost = Math.floor(character.gold * 0.1);
      await query(
        'UPDATE characters SET gold = gold - $1, hp = 1 WHERE id = $2',
        [goldLost, character.id]
      );

      await query(
        `INSERT INTO battle_logs (character_id, monster_id, won, experience_gained, gold_gained) 
         VALUES ($1, $2, $3, 0, $4)`,
        [character.id, monster.id, false, -goldLost]
      );
    }

    return {
      won,
      rounds,
      expGained,
      goldGained,
      itemsDropped,
      characterDied,
    };
  }

  private static calculateDamage(attack: number, defense: number): number {
    const baseDamage = attack - Math.floor(defense * 0.5);
    const variance = Math.random() * 0.2 + 0.9; // 90% - 110%
    return Math.max(1, Math.floor(baseDamage * variance));
  }

  private static async addItemToCharacter(
    characterId: number,
    itemId: number,
    quantity: number
  ): Promise<void> {
    const existing = await query(
      'SELECT * FROM character_items WHERE character_id = $1 AND item_id = $2',
      [characterId, itemId]
    );

    if (existing.rows.length > 0) {
      await query(
        'UPDATE character_items SET quantity = quantity + $1 WHERE character_id = $2 AND item_id = $3',
        [quantity, characterId, itemId]
      );
    } else {
      await query(
        'INSERT INTO character_items (character_id, item_id, quantity) VALUES ($1, $2, $3)',
        [characterId, itemId, quantity]
      );
    }
  }
}
