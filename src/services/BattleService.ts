import { Character, Monster, Skill } from '../types';
import { query } from '../database/db';
import { CharacterService } from './CharacterService';
import { MonsterService } from './MonsterService';
import { SkillService } from './SkillService';

export interface BattleResult {
  won: boolean;
  rounds: BattleRound[];
  expGained: number;
  goldGained: number;
  itemsDropped: any[];
  characterDied: boolean;
  leveledUp: boolean;
  newLevel?: number;
}

export interface BattleRound {
  round: number;
  characterAction: string;
  monsterAction: string;
  characterHp: number;
  monsterHp: number;
  characterKi: number;
}

interface CombatAction {
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  isStunned: boolean;
  skill?: Skill;
  text: string;
}

export class BattleService {
  static async battle(character: Character, monster: Monster): Promise<BattleResult> {
    const rounds: BattleRound[] = [];
    let charHp = character.hp;
    let charKi = character.ki;
    let monsterHp = monster.hp;
    let roundNumber = 0;
    let monsterStunned = false;
    let characterStunned = false;

    // Lấy skills của character và monster
    const characterSkills = await SkillService.getCharacterSkills(character.id);
    const monsterSkills = await SkillService.getMonsterSkills(monster.id);

    while (charHp > 0 && monsterHp > 0 && roundNumber < 50) {
      roundNumber++;

      // Reset stun status at start of round
      if (roundNumber > 1) {
        if (monsterStunned) monsterStunned = false;
        if (characterStunned) characterStunned = false;
      }

      // Determine who attacks first based on speed
      const characterFirst = character.speed >= monster.speed;

      let charAction: CombatAction;
      let monsterAction: CombatAction;

      if (characterFirst) {
        // Character attacks
        if (characterStunned) {
          charAction = {
            damage: 0,
            isCritical: false,
            isDodged: false,
            isStunned: true,
            text: '💤 *Bạn bị choáng! Không thể hành động*'
          };
        } else {
          charAction = await this.performAction(
            character,
            monster,
            characterSkills,
            charKi,
            'character'
          );
          charKi = Math.max(0, charKi - (charAction.skill?.ki_cost || 0));
          monsterHp -= charAction.damage;

          // Check for stun
          if (charAction.skill && Math.random() * 100 < charAction.skill.stun_chance) {
            monsterStunned = true;
          }
        }

        if (monsterHp <= 0) {
          rounds.push({
            round: roundNumber,
            characterAction: charAction.text,
            monsterAction: `💀 **${monster.name}** đã bị đánh bại!`,
            characterHp: charHp,
            monsterHp: 0,
            characterKi: charKi,
          });
          break;
        }

        // Monster attacks
        if (monsterStunned) {
          monsterAction = {
            damage: 0,
            isCritical: false,
            isDodged: false,
            isStunned: true,
            text: `💤 **${monster.name}** bị choáng! Không thể phản công`
          };
        } else {
          monsterAction = await this.performAction(
            monster,
            character,
            monsterSkills,
            999, // Monsters have unlimited KI
            'monster'
          );
          charHp -= monsterAction.damage;

          // Check for stun
          if (monsterAction.skill && Math.random() * 100 < monsterAction.skill.stun_chance) {
            characterStunned = true;
          }
        }

        rounds.push({
          round: roundNumber,
          characterAction: charAction.text,
          monsterAction: monsterAction.text,
          characterHp: charHp,
          monsterHp: monsterHp,
          characterKi: charKi,
        });
      } else {
        // Monster attacks first
        if (monsterStunned) {
          monsterAction = {
            damage: 0,
            isCritical: false,
            isDodged: false,
            isStunned: true,
            text: `💤 **${monster.name}** bị choáng! Không thể tấn công`
          };
        } else {
          monsterAction = await this.performAction(
            monster,
            character,
            monsterSkills,
            999,
            'monster'
          );
          charHp -= monsterAction.damage;

          if (monsterAction.skill && Math.random() * 100 < monsterAction.skill.stun_chance) {
            characterStunned = true;
          }
        }

        if (charHp <= 0) {
          rounds.push({
            round: roundNumber,
            characterAction: '💀 *Bạn đã bị đánh bại!*',
            monsterAction: monsterAction.text,
            characterHp: 0,
            monsterHp: monsterHp,
            characterKi: charKi,
          });
          break;
        }

        // Character attacks
        if (characterStunned) {
          charAction = {
            damage: 0,
            isCritical: false,
            isDodged: false,
            isStunned: true,
            text: '💤 *Bạn bị choáng! Không thể phản công*'
          };
        } else {
          charAction = await this.performAction(
            character,
            monster,
            characterSkills,
            charKi,
            'character'
          );
          charKi = Math.max(0, charKi - (charAction.skill?.ki_cost || 0));
          monsterHp -= charAction.damage;

          if (charAction.skill && Math.random() * 100 < charAction.skill.stun_chance) {
            monsterStunned = true;
          }
        }

        rounds.push({
          round: roundNumber,
          characterAction: charAction.text,
          monsterAction: monsterAction.text,
          characterHp: charHp,
          monsterHp: monsterHp,
          characterKi: charKi,
        });
      }

      // Regen KI mỗi turn
      charKi = Math.min(character.max_ki, charKi + 10);
    }

    const won = monsterHp <= 0 && charHp > 0;
    const characterDied = charHp <= 0;

    let expGained = 0;
    let goldGained = 0;
    let itemsDropped: any[] = [];
    let leveledUp = false;
    let newLevel = character.level;

    if (won) {
      expGained = monster.experience_reward;
      goldGained = monster.gold_reward;

      // Update character
      const updatedChar = await CharacterService.addExperience(character.id, expGained);
      leveledUp = updatedChar.level > character.level;
      newLevel = updatedChar.level;

      // Restore full HP and KI after battle
      await query(
        'UPDATE characters SET gold = gold + $1, hp = max_hp, ki = max_ki WHERE id = $2',
        [goldGained, character.id]
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
      // Character lost - penalty and restore HP/KI
      const goldLost = Math.floor(character.gold * 0.1);
      await query(
        'UPDATE characters SET gold = gold - $1, hp = max_hp, ki = max_ki WHERE id = $2',
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
      leveledUp,
      newLevel,
    };
  }

  private static async performAction(
    attacker: Character | Monster,
    defender: Character | Monster,
    skills: Skill[],
    currentKi: number,
    type: 'character' | 'monster'
  ): Promise<CombatAction> {
    // AI quyết định dùng skill hay không
    let selectedSkill: Skill | undefined;

    if (skills.length > 0) {
      // Lọc skills có thể dùng (đủ KI)
      const usableSkills = skills.filter(s => s.ki_cost <= currentKi);

      if (usableSkills.length > 0) {
        // 40% chance dùng skill nếu có
        if (Math.random() < 0.4) {
          // Ưu tiên skills mạnh hơn
          selectedSkill = usableSkills.sort((a, b) => b.damage_multiplier - a.damage_multiplier)[0];
        }
      }
    }

    // Check dodge
    const dodgeChance = (defender as any).dodge_chance || 0;
    const isDodged = Math.random() * 100 < dodgeChance;

    if (isDodged) {
      const name = type === 'character' ? 'Bạn' : (attacker as Monster).name;
      return {
        damage: 0,
        isCritical: false,
        isDodged: true,
        isStunned: false,
        text: `💨 ${name} tấn công nhưng bị né tránh!`
      };
    }

    // Calculate damage
    let baseDamage: number;
    let critChance = (attacker as any).critical_chance || 5;
    let critMultiplier = (attacker as any).critical_damage || 1.5;

    if (selectedSkill) {
      // Skill damage
      const skillDamage = attacker.attack * selectedSkill.damage_multiplier;
      const defenseReduction = defender.defense * (1 - selectedSkill.defense_break);
      baseDamage = skillDamage - Math.floor(defenseReduction * 0.5);
      critChance += selectedSkill.crit_bonus;
    } else {
      // Normal attack
      baseDamage = attacker.attack - Math.floor(defender.defense * 0.5);
    }

    // Check critical
    const isCritical = Math.random() * 100 < critChance;
    if (isCritical) {
      baseDamage *= critMultiplier;
    }

    // Variance
    const variance = Math.random() * 0.2 + 0.9; // 90% - 110%
    const finalDamage = Math.max(1, Math.floor(baseDamage * variance));

    // Build text
    let text: string;
    const name = type === 'character' ? 'Bạn' : `**${(attacker as Monster).name}**`;

    if (selectedSkill) {
      const critText = isCritical ? ' 💥 **CHÍ MẠNG!**' : '';
      const stunText = selectedSkill.stun_chance > 0 ? ' 💫' : '';
      
      // Lấy emoji từ description của skill (ký tự đầu tiên nếu là emoji)
      const skillEmoji = selectedSkill.description ? selectedSkill.description.split(' ')[0] : '⚡';
      
      // Tạo mô tả động dựa vào loại skill
      if (selectedSkill.skill_type === 'attack') {
        const actionVerbs = [
          'tung ra', 'phóng', 'khai hỏa', 'giải phóng', 'bùng nổ',
          'tấn công bằng', 'sử dụng', 'phát động'
        ];
        const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
        text = `${skillEmoji} ${name} ${verb} **${selectedSkill.name}**! Gây **\`${finalDamage}\`** sát thương!${critText}${stunText}`;
      } else if (selectedSkill.skill_type === 'heal') {
        text = `💚 ${name} sử dụng **${selectedSkill.name}**! Hồi phục **\`${selectedSkill.heal_amount}\`** HP!`;
      } else if (selectedSkill.skill_type === 'buff') {
        text = `⭐ ${name} kích hoạt **${selectedSkill.name}**! Sức mạnh tăng vọt!${critText}`;
      } else {
        text = `${skillEmoji} ${name} tung **${selectedSkill.name}**! Gây **\`${finalDamage}\`** sát thương!${critText}`;
      }
    } else {
      const critText = isCritical ? ' 💥 **CHÍ MẠNG!**' : '';
      const attackTypes = [
        '⚔️ đánh thẳng',
        '👊 ra đòn',
        '🥊 tung đấm', 
        '🦶 đá mạnh',
        '⚔️ vung kiếm',
        '👊 phản công'
      ];
      const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      text = `${attackType.split(' ')[0]} ${name} ${attackType.split(' ').slice(1).join(' ')} gây **\`${finalDamage}\`** sát thương!${critText}`;
    }

    return {
      damage: finalDamage,
      isCritical,
      isDodged: false,
      isStunned: false,
      skill: selectedSkill,
      text,
    };
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
