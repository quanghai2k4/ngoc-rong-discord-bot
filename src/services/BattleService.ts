import { Character, Monster, Skill } from '../types';
import { query } from '../database/db';
import { CharacterService } from './CharacterService';
import { MonsterService } from './MonsterService';
import { SkillService } from './SkillService';

export interface MonsterInstance {
  monster: Monster;
  currentHp: number;
  isAlive: boolean;
  stunned: boolean;
}

export interface BattleResult {
  won: boolean;
  rounds: BattleRound[];
  monstersDefeated: number;
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
  monsterActions: string[];
  actions: string[]; // Thứ tự actions thực tế theo turn order
  characterHp: number;
  monsterStates: { name: string; hp: number; maxHp: number }[];
  characterKi: number;
}

interface CombatAction {
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  isStunned: boolean;
  skill?: Skill;
  text: string;
  targetsHit?: number; // Số lượng target bị đánh trúng (cho AoE)
}

interface Combatant {
  type: 'character' | 'monster';
  character?: Character;
  monsterInstance?: MonsterInstance;
  speed: number;
}

export class BattleService {
  static async battle(character: Character, monsters: Monster[]): Promise<BattleResult> {
    const rounds: BattleRound[] = [];
    let charHp = character.hp;
    let charKi = character.ki;
    let roundNumber = 0;
    let characterStunned = false;

    // Khởi tạo monster instances
    const monsterInstances: MonsterInstance[] = monsters.map(m => ({
      monster: m,
      currentHp: m.hp,
      isAlive: true,
      stunned: false,
    }));

    // Lấy skills của character và monsters
    const characterSkills = await SkillService.getCharacterSkills(character.id);
    const monsterSkillsMap = new Map<number, Skill[]>();
    for (const monsterInst of monsterInstances) {
      const skills = await SkillService.getMonsterSkills(monsterInst.monster.id);
      monsterSkillsMap.set(monsterInst.monster.id, skills);
    }

    while (charHp > 0 && monsterInstances.some(m => m.isAlive) && roundNumber < 50) {
      roundNumber++;

      // Reset stun status at start of round
      if (roundNumber > 1) {
        characterStunned = false;
        monsterInstances.forEach(m => { m.stunned = false; });
      }

      // Xác định turn order dựa trên speed
      const turnOrder = this.calculateTurnOrder(character, monsterInstances);
      
      const monsterActions: string[] = [];
      const actions: string[] = []; // Track actions theo thứ tự thực tế
      let characterAction: CombatAction | null = null;

      // Thực hiện các actions theo turn order
      for (const combatant of turnOrder) {
        if (combatant.type === 'character') {
          // Character turn
          if (characterStunned) {
            characterAction = {
              damage: 0,
              isCritical: false,
              isDodged: false,
              isStunned: true,
              text: '💤 *Bạn bị choáng! Không thể hành động*'
            };
            actions.push(characterAction.text);
          } else {
            const aliveMonsters = monsterInstances.filter(m => m.isAlive);
            if (aliveMonsters.length === 0) break;

            characterAction = await this.performCharacterAction(
              character,
              aliveMonsters,
              characterSkills,
              charKi
            );

            actions.push(characterAction.text);
            charKi = Math.max(0, charKi - (characterAction.skill?.ki_cost || 0));

            // Áp dụng damage
            if (characterAction.skill?.is_aoe) {
              // AoE: đánh tất cả quái còn sống
              for (const monsterInst of aliveMonsters) {
                monsterInst.currentHp -= characterAction.damage;
                if (monsterInst.currentHp <= 0) {
                  monsterInst.currentHp = 0;
                  monsterInst.isAlive = false;
                }

                // Check stun
                if (characterAction.skill && Math.random() * 100 < characterAction.skill.stun_chance) {
                  monsterInst.stunned = true;
                }
              }
            } else {
              // Single target: đánh quái có HP thấp nhất
              const target = aliveMonsters.sort((a, b) => a.currentHp - b.currentHp)[0];
              target.currentHp -= characterAction.damage;
              if (target.currentHp <= 0) {
                target.currentHp = 0;
                target.isAlive = false;
              }

              // Check stun
              if (characterAction.skill && Math.random() * 100 < characterAction.skill.stun_chance) {
                target.stunned = true;
              }
            }
          }
        } else if (combatant.monsterInstance) {
          // Monster turn
          const monsterInst = combatant.monsterInstance;
          
          if (!monsterInst.isAlive) continue;

          if (monsterInst.stunned) {
            const stunnedText = `💤 **${monsterInst.monster.name}** bị choáng! Không thể tấn công`;
            monsterActions.push(stunnedText);
            actions.push(stunnedText);
          } else {
            const monsterSkills = monsterSkillsMap.get(monsterInst.monster.id) || [];
            const monsterAction = await this.performMonsterAction(
              monsterInst.monster,
              character,
              monsterSkills
            );

            charHp -= monsterAction.damage;

            // Check stun
            if (monsterAction.skill && Math.random() * 100 < monsterAction.skill.stun_chance) {
              characterStunned = true;
            }

            monsterActions.push(monsterAction.text);
            actions.push(monsterAction.text);
          }
        }

        // Kiểm tra kết thúc battle
        if (charHp <= 0) break;
        if (monsterInstances.every(m => !m.isAlive)) break;
      }

      // Regen KI mỗi turn
      charKi = Math.min(character.max_ki, charKi + 10);

      // Lưu round
      rounds.push({
        round: roundNumber,
        characterAction: characterAction?.text || '',
        monsterActions,
        actions, // Thứ tự actions thực tế theo turn order
        characterHp: Math.max(0, charHp),
        monsterStates: monsterInstances.map(m => ({
          name: m.monster.name,
          hp: Math.max(0, m.currentHp),
          maxHp: m.monster.hp,
        })),
        characterKi: charKi,
      });

      // Break nếu battle kết thúc
      if (charHp <= 0 || monsterInstances.every(m => !m.isAlive)) {
        break;
      }
    }

    const won = monsterInstances.every(m => !m.isAlive) && charHp > 0;
    const characterDied = charHp <= 0;
    const monstersDefeated = monsterInstances.filter(m => !m.isAlive).length;

    let expGained = 0;
    let goldGained = 0;
    let itemsDropped: any[] = [];
    let leveledUp = false;
    let newLevel = character.level;

    if (won) {
      // Cộng dồn rewards từ tất cả quái bị đánh bại
      for (const monsterInst of monsterInstances) {
        if (!monsterInst.isAlive) {
          expGained += monsterInst.monster.experience_reward;
          goldGained += monsterInst.monster.gold_reward;

          // Check for item drops
          const drops = await MonsterService.getDrops(monsterInst.monster.id);
          for (const drop of drops) {
            if (Math.random() * 100 < drop.drop_rate) {
              itemsDropped.push(drop);
              await this.addItemToCharacter(character.id, drop.id, 1);
            }
          }

          // Log battle cho từng quái
          await query(
            `INSERT INTO battle_logs (character_id, monster_id, won, experience_gained, gold_gained) 
             VALUES ($1, $2, $3, $4, $5)`,
            [character.id, monsterInst.monster.id, true, monsterInst.monster.experience_reward, monsterInst.monster.gold_reward]
          );
        }
      }

      // Update character
      const updatedChar = await CharacterService.addExperience(character.id, expGained);
      leveledUp = updatedChar.level > character.level;
      newLevel = updatedChar.level;

      // Restore full HP and KI after battle
      await query(
        'UPDATE characters SET gold = gold + $1, hp = max_hp, ki = max_ki WHERE id = $2',
        [goldGained, character.id]
      );
    } else {
      // Character lost - penalty and restore HP/KI
      const goldLost = Math.floor(character.gold * 0.1);
      await query(
        'UPDATE characters SET gold = gold - $1, hp = max_hp, ki = max_ki WHERE id = $2',
        [goldLost, character.id]
      );

      // Log battle (chỉ log quái đầu tiên)
      if (monsterInstances.length > 0) {
        await query(
          `INSERT INTO battle_logs (character_id, monster_id, won, experience_gained, gold_gained) 
           VALUES ($1, $2, $3, 0, $4)`,
          [character.id, monsterInstances[0].monster.id, false, -goldLost]
        );
      }
    }

    return {
      won,
      rounds,
      monstersDefeated,
      expGained,
      goldGained,
      itemsDropped,
      characterDied,
      leveledUp,
      newLevel,
    };
  }

  private static calculateTurnOrder(
    character: Character,
    monsterInstances: MonsterInstance[]
  ): Combatant[] {
    const combatants: Combatant[] = [
      { type: 'character', character, speed: character.speed },
    ];

    for (const monsterInst of monsterInstances) {
      if (monsterInst.isAlive) {
        combatants.push({
          type: 'monster',
          monsterInstance: monsterInst,
          speed: monsterInst.monster.speed,
        });
      }
    }

    // Sắp xếp theo speed giảm dần
    return combatants.sort((a, b) => b.speed - a.speed);
  }

  private static async performCharacterAction(
    character: Character,
    aliveMonsters: MonsterInstance[],
    skills: Skill[],
    currentKi: number
  ): Promise<CombatAction> {
    // AI quyết định dùng skill hay không
    let selectedSkill: Skill | undefined;

    if (skills.length > 0) {
      const usableSkills = skills.filter(s => s.ki_cost <= currentKi);

      if (usableSkills.length > 0) {
        // 65% chance dùng skill nếu có
        if (Math.random() < 0.65) {
          // Ưu tiên skills mạnh hơn, ưu tiên AoE nếu có nhiều quái
          selectedSkill = usableSkills.sort((a, b) => {
            if (aliveMonsters.length > 1 && a.is_aoe !== b.is_aoe) {
              return a.is_aoe ? -1 : 1; // Ưu tiên AoE
            }
            return b.damage_multiplier - a.damage_multiplier;
          })[0];
        }
      }
    }

    // Chọn target để tính dodge (monsters không có dodge)
    const isDodged = false;
    const primaryTarget = aliveMonsters.sort((a, b) => a.currentHp - b.currentHp)[0];

    if (isDodged) {
      return {
        damage: 0,
        isCritical: false,
        isDodged: true,
        isStunned: false,
        text: `💨 Bạn tấn công nhưng bị né tránh!`
      };
    }

    // Calculate damage
    let baseDamage: number;
    let critChance = character.critical_chance || 5;
    let critMultiplier = character.critical_damage || 1.5;
    const avgDefense = aliveMonsters.reduce((sum, m) => sum + m.monster.defense, 0) / aliveMonsters.length;

    if (selectedSkill) {
      const skillDamage = character.attack * selectedSkill.damage_multiplier;
      const defenseReduction = avgDefense * (1 - selectedSkill.defense_break);
      baseDamage = skillDamage - Math.floor(defenseReduction * 0.5);
      critChance += selectedSkill.crit_bonus;
    } else {
      baseDamage = character.attack - Math.floor(avgDefense * 0.5);
    }

    const isCritical = Math.random() * 100 < critChance;
    if (isCritical) {
      baseDamage *= critMultiplier;
    }

    const variance = Math.random() * 0.2 + 0.9;
    const finalDamage = Math.max(1, Math.floor(baseDamage * variance));

    // Kiểm tra xem có quái nào chết không
    const targetsHit = selectedSkill?.is_aoe ? aliveMonsters.length : 1;
    let monstersKilled: string[] = [];

    if (selectedSkill?.is_aoe) {
      // AoE: check tất cả quái
      for (const monsterInst of aliveMonsters) {
        if (monsterInst.currentHp - finalDamage <= 0) {
          monstersKilled.push(monsterInst.monster.name);
        }
      }
    } else {
      // Single target: check primary target
      if (primaryTarget.currentHp - finalDamage <= 0) {
        monstersKilled.push(primaryTarget.monster.name);
      }
    }

    // Build text
    let text: string;

    if (selectedSkill) {
      const critText = isCritical ? ' 💥 **CHÍ MẠNG!**' : '';
      const stunText = selectedSkill.stun_chance > 0 ? ' 💫' : '';
      const skillEmoji = selectedSkill.description ? selectedSkill.description.split(' ')[0] : '⚡';
      
      if (selectedSkill.is_aoe && aliveMonsters.length > 1) {
        if (monstersKilled.length > 0) {
          text = `${skillEmoji} Bạn tung **${selectedSkill.name}** đánh **${targetsHit} quái**! Kết liễu **${monstersKilled.join(', ')}**!${critText}${stunText}`;
        } else {
          text = `${skillEmoji} Bạn tung **${selectedSkill.name}** đánh **${targetsHit} quái**! Mỗi quái nhận **\`${finalDamage}\`** sát thương!${critText}${stunText}`;
        }
      } else {
        const actionVerbs = ['tung ra', 'phóng', 'khai hỏa', 'giải phóng', 'bùng nổ'];
        const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
        if (monstersKilled.length > 0) {
          text = `${skillEmoji} Bạn ${verb} **${selectedSkill.name}**! Kết liễu **${monstersKilled[0]}**!${critText}${stunText}`;
        } else {
          text = `${skillEmoji} Bạn ${verb} **${selectedSkill.name}**! Gây **\`${finalDamage}\`** sát thương!${critText}${stunText}`;
        }
      }
    } else {
      const critText = isCritical ? ' 💥 **CHÍ MẠNG!**' : '';
      const attackTypes = ['⚔️ đánh thẳng', '👊 ra đòn', '🥊 tung đấm', '🦶 đá mạnh'];
      const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      if (monstersKilled.length > 0) {
        text = `${attackType} vào **${primaryTarget.monster.name}**! Kết liễu!${critText}`;
      } else {
        text = `${attackType} vào **${primaryTarget.monster.name}** gây **\`${finalDamage}\`** sát thương!${critText}`;
      }
    }

    return {
      damage: finalDamage,
      isCritical,
      isDodged: false,
      isStunned: false,
      skill: selectedSkill,
      text,
      targetsHit,
    };
  }

  private static async performMonsterAction(
    monster: Monster,
    defender: Character,
    skills: Skill[]
  ): Promise<CombatAction> {
    let selectedSkill: Skill | undefined;

    if (skills.length > 0) {
      // Monster có unlimited KI
      if (Math.random() < 0.65) {
        selectedSkill = skills.sort((a, b) => b.damage_multiplier - a.damage_multiplier)[0];
      }
    }

    const dodgeChance = defender.dodge_chance || 0;
    const isDodged = Math.random() * 100 < dodgeChance;

    if (isDodged) {
      return {
        damage: 0,
        isCritical: false,
        isDodged: true,
        isStunned: false,
        text: `💨 **${monster.name}** tấn công nhưng bị né tránh!`
      };
    }

    let baseDamage: number;
    let critChance = monster.critical_chance || 5;
    let critMultiplier = monster.critical_damage || 1.5;

    if (selectedSkill) {
      const skillDamage = monster.attack * selectedSkill.damage_multiplier;
      const defenseReduction = defender.defense * (1 - selectedSkill.defense_break);
      baseDamage = skillDamage - Math.floor(defenseReduction * 0.5);
      critChance += selectedSkill.crit_bonus;
    } else {
      baseDamage = monster.attack - Math.floor(defender.defense * 0.5);
    }

    const isCritical = Math.random() * 100 < critChance;
    if (isCritical) {
      baseDamage *= critMultiplier;
    }

    const variance = Math.random() * 0.2 + 0.9;
    const finalDamage = Math.max(1, Math.floor(baseDamage * variance));

    let text: string;
    if (selectedSkill) {
      const critText = isCritical ? ' 💥 **CHÍ MẠNG!**' : '';
      const stunText = selectedSkill.stun_chance > 0 ? ' 💫' : '';
      const skillEmoji = selectedSkill.description ? selectedSkill.description.split(' ')[0] : '⚡';
      
      const actionVerbs = ['tung ra', 'phóng', 'khai hỏa', 'giải phóng'];
      const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
      text = `${skillEmoji} **${monster.name}** ${verb} **${selectedSkill.name}**! Gây **\`${finalDamage}\`** sát thương!${critText}${stunText}`;
    } else {
      const critText = isCritical ? ' 💥 **CHÍ MẠNG!**' : '';
      const attackTypes = ['⚔️ đánh thẳng', '👊 ra đòn', '🥊 tung đấm', '🦶 đá mạnh'];
      const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)];
      text = `${attackType.split(' ')[0]} **${monster.name}** ${attackType.split(' ').slice(1).join(' ')} gây **\`${finalDamage}\`** sát thương!${critText}`;
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
