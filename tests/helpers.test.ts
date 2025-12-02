import {
  formatNumber,
  formatCompactNumber,
  formatCooldown,
  createProgressBar,
  randomInt,
  randomElement,
  shuffleArray,
  rollCritical,
  rollDodge,
  truncateText,
  expForNextLevel,
} from '../src/utils/helpers';

describe('Helper Functions', () => {
  describe('formatNumber', () => {
    test('nên format số với dấu phẩy', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(999)).toBe('999');
    });

    test('nên xử lý số âm', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
    });
  });

  describe('formatCompactNumber', () => {
    test('nên format số nhỏ hơn 1000 bình thường', () => {
      expect(formatCompactNumber(999)).toBe('999');
      expect(formatCompactNumber(500)).toBe('500');
    });

    test('nên format số nghìn (K)', () => {
      expect(formatCompactNumber(1000)).toBe('1K');
      expect(formatCompactNumber(5500)).toBe('5.5K');
      expect(formatCompactNumber(10000)).toBe('10K');
    });

    test('nên format số triệu (M)', () => {
      expect(formatCompactNumber(1000000)).toBe('1M');
      expect(formatCompactNumber(2500000)).toBe('2.5M');
    });

    test('nên format số tỷ (B)', () => {
      expect(formatCompactNumber(1000000000)).toBe('1B');
      expect(formatCompactNumber(3500000000)).toBe('3.5B');
    });
  });

  describe('formatCooldown', () => {
    test('nên format giây', () => {
      expect(formatCooldown(1000)).toBe('1s');
      expect(formatCooldown(5000)).toBe('5s');
      expect(formatCooldown(5500)).toBe('5.5s');
    });

    test('nên format phút', () => {
      expect(formatCooldown(60000)).toBe('1m');
      expect(formatCooldown(120000)).toBe('2m');
      expect(formatCooldown(90000)).toBe('1m30s');
    });
  });

  describe('createProgressBar', () => {
    test('nên tạo progress bar đầy', () => {
      const bar = createProgressBar(100, 100, 10, true);
      expect(bar).toContain('100%');
      expect(bar).toContain('██████████');
    });

    test('nên tạo progress bar nửa', () => {
      const bar = createProgressBar(50, 100, 10, true);
      expect(bar).toContain('50%');
      expect(bar).toContain('█████');
      expect(bar).toContain('░░░░░');
    });

    test('nên tạo progress bar rỗng', () => {
      const bar = createProgressBar(0, 100, 10, true);
      expect(bar).toContain('0%');
      expect(bar).toContain('░░░░░░░░░░');
    });

    test('nên xử lý current > max', () => {
      const bar = createProgressBar(150, 100, 10, true);
      expect(bar).toContain('100%'); // Capped at 100%
    });

    test('nên ẩn percentage nếu showPercentage = false', () => {
      const bar = createProgressBar(50, 100, 10, false);
      expect(bar).not.toContain('%');
    });
  });

  describe('randomInt', () => {
    test('nên trả về số trong range', () => {
      for (let i = 0; i < 100; i++) {
        const num = randomInt(1, 10);
        expect(num).toBeGreaterThanOrEqual(1);
        expect(num).toBeLessThanOrEqual(10);
      }
    });

    test('nên trả về chính số đó nếu min === max', () => {
      expect(randomInt(5, 5)).toBe(5);
    });
  });

  describe('randomElement', () => {
    test('nên trả về phần tử trong array', () => {
      const arr = [1, 2, 3, 4, 5];
      for (let i = 0; i < 20; i++) {
        const elem = randomElement(arr);
        expect(arr).toContain(elem);
      }
    });

    test('nên trả về null cho array rỗng', () => {
      expect(randomElement([])).toBeNull();
    });
  });

  describe('shuffleArray', () => {
    test('nên giữ nguyên độ dài array', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.length).toBe(arr.length);
    });

    test('nên giữ nguyên các phần tử (chỉ thay đổi thứ tự)', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(arr);
      expect(shuffled.sort()).toEqual(arr.sort());
    });

    test('không nên thay đổi array gốc', () => {
      const arr = [1, 2, 3, 4, 5];
      const original = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(original);
    });
  });

  describe('rollCritical', () => {
    test('nên trả về true nếu crit chance = 100', () => {
      expect(rollCritical(100)).toBe(true);
    });

    test('nên trả về false nếu crit chance = 0', () => {
      expect(rollCritical(0)).toBe(false);
    });

    test('nên trả về boolean', () => {
      const result = rollCritical(50);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('rollDodge', () => {
    test('nên trả về true nếu dodge chance = 100', () => {
      expect(rollDodge(100)).toBe(true);
    });

    test('nên trả về false nếu dodge chance = 0', () => {
      expect(rollDodge(0)).toBe(false);
    });

    test('nên trả về boolean', () => {
      const result = rollDodge(50);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('truncateText', () => {
    test('không nên truncate nếu text ngắn hơn maxLength', () => {
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    test('nên truncate và thêm ... nếu text dài hơn', () => {
      const truncated = truncateText('Hello World Test', 10);
      expect(truncated).toBe('Hello W...');
      expect(truncated.length).toBe(10);
    });

    test('nên xử lý text trống', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('expForNextLevel', () => {
    test('nên tính đúng XP cho level 1->2', () => {
      expect(expForNextLevel(1)).toBe(100); // 100 + (1-1)*50 = 100
    });

    test('nên tính đúng XP cho level 5->6', () => {
      expect(expForNextLevel(5)).toBe(300); // 100 + (5-1)*50 = 300
    });

    test('nên tính đúng XP cho level 10->11', () => {
      expect(expForNextLevel(10)).toBe(550); // 100 + (10-1)*50 = 550
    });

    test('XP cần thiết nên tăng tuyến tính', () => {
      const xp1 = expForNextLevel(1);
      const xp2 = expForNextLevel(2);
      const xp3 = expForNextLevel(3);
      
      expect(xp2 - xp1).toBe(50);
      expect(xp3 - xp2).toBe(50);
    });
  });
});
