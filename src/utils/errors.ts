/**
 * Custom error classes cho game
 */

export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

export class NoCharacterError extends GameError {
  constructor(usePrefix = false) {
    const message = usePrefix
      ? '❌ Bạn chưa có nhân vật! Sử dụng `zstart` để bắt đầu.'
      : '❌ Bạn chưa có nhân vật! Sử dụng `/start` để bắt đầu.';
    super(message);
    this.name = 'NoCharacterError';
  }
}

export class NoHPError extends GameError {
  constructor() {
    super('❌ Bạn đã hết HP! Hãy nghỉ ngơi để hồi phục. 💤');
    this.name = 'NoHPError';
  }
}

export class CharacterExistsError extends GameError {
  constructor(characterName: string) {
    super(`❌ Bạn đã có nhân vật **${characterName}** rồi! Sử dụng \`zprofile\` để xem thông tin.`);
    this.name = 'CharacterExistsError';
  }
}

export class NoMonstersError extends GameError {
  constructor(location?: string) {
    const message = location
      ? `❌ Không có quái vật nào phù hợp với level của bạn tại **${location}**!`
      : '❌ Không tìm thấy quái vật nào phù hợp với level của bạn!';
    super(message);
    this.name = 'NoMonstersError';
  }
}

export class TimeoutError extends GameError {
  constructor(action = 'thực hiện hành động') {
    super(`⏰ Đã hết thời gian ${action}! Vui lòng thử lại.`);
    this.name = 'TimeoutError';
  }
}
