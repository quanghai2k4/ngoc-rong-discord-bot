import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command } from '../index';
import { PlayerService } from '../services/PlayerService';
import { CharacterService } from '../services/CharacterService';
import { MonsterService } from '../services/MonsterService';
import { BattleService } from '../services/BattleService';

export const huntCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('hunt')
    .setDescription('Đi săn quái vật để kiếm kinh nghiệm và vàng'),

  async execute(interaction) {
    await interaction.deferReply();

    const player = await PlayerService.findByDiscordId(interaction.user.id);
    if (!player) {
      await interaction.editReply('❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.');
      return;
    }

    const character = await CharacterService.findByPlayerId(player.id);
    if (!character) {
      await interaction.editReply('❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.');
      return;
    }

    if (character.hp <= 0) {
      await interaction.editReply('❌ Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục. 💤');
      return;
    }

    // Spawn 1-3 monsters
    const minLevel = Math.max(1, character.level - 2);
    const maxLevel = character.level + 3;
    const monsters = await MonsterService.spawnMonsters(minLevel, maxLevel);

    if (monsters.length === 0) {
      await interaction.editReply('❌ Không tìm thấy quái vật nào phù hợp với level của bạn!');
      return;
    }

    // Build start message
    const startEmbed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('⚔️ Bắt đầu chiến đấu!')
      .setDescription(
        monsters.length === 1
          ? `Bạn gặp **${monsters[0].name}** (Level **\`${monsters[0].level}\`**)`
          : `⚠️ Bạn bị bao vây bởi **${monsters.length} quái vật**!`
      );

    // Thêm thông tin từng quái
    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      startEmbed.addFields({
        name: `${i + 1}. ${monster.name} (Lv.${monster.level})`,
        value: `❤️ HP: **\`${monster.hp}\`** • ⚔️ ATK: **\`${monster.attack}\`** • 🛡️ DEF: **\`${monster.defense}\`**`,
        inline: false
      });
    }

    startEmbed.setFooter({ text: '⏳ Đang chiến đấu...' });

    await interaction.editReply({ embeds: [startEmbed] });

    // Simulate battle
    setTimeout(async () => {
      const result = await BattleService.battle(character, monsters);

      let battleLog = '';
      
      // Show only key rounds
      const importantRounds = result.rounds.filter((round, index) => 
        index === 0 || 
        index >= result.rounds.length - 3 || 
        round.characterHp < character.max_hp * 0.3 ||
        round.monsterStates.some(m => m.hp < m.maxHp * 0.3 && m.hp > 0)
      );

      for (const round of importantRounds.slice(0, 5)) {
        battleLog += `╭─ **Hiệp ${round.round}**\n`;
        battleLog += `│ ${round.characterAction}\n`;
        
        // Monster actions
        for (const monAction of round.monsterActions) {
          battleLog += `│ ${monAction}\n`;
        }
        
        // HP bars
        const charHpPerc = Math.max(0, Math.floor((round.characterHp / character.max_hp) * 5));
        const charHpBar = '█'.repeat(charHpPerc) + '░'.repeat(5 - charHpPerc);
        battleLog += `│ ❤️ Bạn: ${charHpBar} \`${round.characterHp}/${character.max_hp}\`\n`;
        
        // Monster HP bars
        for (const monState of round.monsterStates) {
          const monHpPerc = Math.max(0, Math.floor((monState.hp / monState.maxHp) * 5));
          const monHpBar = '█'.repeat(monHpPerc) + '░'.repeat(5 - monHpPerc);
          const status = monState.hp === 0 ? '💀' : '🔥';
          battleLog += `│ ${status} ${monState.name}: ${monHpBar} \`${monState.hp}/${monState.maxHp}\`\n`;
        }
        
        battleLog += `╰─────\n\n`;
      }

      if (importantRounds.length < result.rounds.length) {
        battleLog += `*...và ${result.rounds.length - importantRounds.length} hiệp khác*\n\n`;
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(result.won ? '#00FF00' : '#FF0000')
        .setTitle(result.won ? '🎉 CHIẾN THẮNG!' : '💀 THẤT BẠI!')
        .addFields({
          name: '⚔️ Diễn biến trận đấu',
          value: battleLog,
          inline: false
        })
        .setFooter({ text: `Số hiệp: ${result.rounds.length} | Quái hạ: ${result.monstersDefeated}/${monsters.length}` });

      if (result.won) {
        resultEmbed.addFields({
          name: '🎁 Phần thưởng',
          value: `🎯 EXP: **\`+${result.expGained}\`** • 💰 Vàng: **\`+${result.goldGained}\`**`,
          inline: false
        });

        if (result.itemsDropped.length > 0) {
          let itemsList = '';
          for (const item of result.itemsDropped) {
            itemsList += `• **${item.name}**\n`;
          }
          resultEmbed.addFields({
            name: '📦 Vật phẩm rơi',
            value: itemsList,
            inline: false
          });
        }
      } else {
        resultEmbed.addFields({
          name: '💔 Hậu quả',
          value: '*Bạn mất 10% vàng*',
          inline: false
        });
      }

      await interaction.editReply({ embeds: [resultEmbed] });

      // Gửi tin nhắn level up riêng nếu có
      if (result.won && result.leveledUp) {
        const levelUpEmbed = new EmbedBuilder()
          .setColor('#FFD700')
          .setTitle('✨ LEVEL UP! ✨')
          .setDescription(`🎊 Chúc mừng! Bạn đã lên **Level \`${result.newLevel}\`**!`)
          .addFields({
            name: '📈 Tăng chỉ số',
            value: '```diff\n+ HP & KI: +20\n+ ATK & DEF: +5\n+ SPD: +3\n```',
            inline: false
          })
          .setFooter({ text: 'HP và KI đã được hồi phục đầy!' })
          .setTimestamp();

        await interaction.followUp({ embeds: [levelUpEmbed] });
      }
    }, 2000);
  },
};
