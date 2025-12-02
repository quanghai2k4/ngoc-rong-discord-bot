import { XPService } from '../src/services/XPService';

describe('XPService', () => {
  describe('calculateRequiredXP', () => {
    test('nên tính đúng XP cần cho level 1->2', () => {
      const requiredXP = XPService.calculateRequiredXP(1);
      expect(requiredXP).toBe(100);
    });

    test('nên tính đúng XP cần cho level 10->11', () => {
      const requiredXP = XPService.calculateRequiredXP(10);
      // 100 * (10 ^ 1.8) = 100 * 63.095... ≈ 6309
      expect(requiredXP).toBeGreaterThan(6000);
      expect(requiredXP).toBeLessThan(7000);
    });

    test('nên tính đúng XP cần cho level 50->51', () => {
      const requiredXP = XPService.calculateRequiredXP(50);
      // 100 * (50 ^ 1.8) ≈ 114,325
      expect(requiredXP).toBeGreaterThan(100000);
      expect(requiredXP).toBeLessThan(120000);
    });

    test('XP tăng theo level (scaling)', () => {
      const xp1 = XPService.calculateRequiredXP(1);
      const xp10 = XPService.calculateRequiredXP(10);
      const xp50 = XPService.calculateRequiredXP(50);
      
      expect(xp10).toBeGreaterThan(xp1);
      expect(xp50).toBeGreaterThan(xp10);
    });
  });

  describe('calculateTotalXPForLevel', () => {
    test('nên trả về 0 cho level 1', () => {
      const totalXP = XPService.calculateTotalXPForLevel(1);
      expect(totalXP).toBe(0);
    });

    test('nên tính đúng tổng XP để đạt level 2', () => {
      const totalXP = XPService.calculateTotalXPForLevel(2);
      expect(totalXP).toBe(100); // Chỉ cần XP của level 1->2
    });

    test('nên tính đúng tổng XP để đạt level 3', () => {
      const totalXP = XPService.calculateTotalXPForLevel(3);
      const xp1to2 = XPService.calculateRequiredXP(1);
      const xp2to3 = XPService.calculateRequiredXP(2);
      expect(totalXP).toBe(xp1to2 + xp2to3);
    });

    test('tổng XP nên tăng dần', () => {
      const total10 = XPService.calculateTotalXPForLevel(10);
      const total20 = XPService.calculateTotalXPForLevel(20);
      const total50 = XPService.calculateTotalXPForLevel(50);
      
      expect(total20).toBeGreaterThan(total10);
      expect(total50).toBeGreaterThan(total20);
    });
  });

  describe('calculateActivityXP', () => {
    test('nên tính XP cho hunt với multiplier 1.0', () => {
      const baseXP = 100;
      const level = 10;
      const huntXP = XPService.calculateActivityXP('hunt', baseXP, level);
      
      // Level 10: multiplier = 1 + (10 * 0.02) = 1.2
      // Expected: 100 * 1.0 * 1.2 = 120
      expect(huntXP).toBe(120);
    });

    test('nên tính XP cho boss với multiplier 3.0', () => {
      const baseXP = 100;
      const level = 10;
      const bossXP = XPService.calculateActivityXP('boss', baseXP, level);
      
      // Expected: 100 * 3.0 * 1.2 = 360
      expect(bossXP).toBe(360);
    });

    test('nên tính XP cho quest với multiplier 2.0', () => {
      const baseXP = 100;
      const level = 10;
      const questXP = XPService.calculateActivityXP('quest', baseXP, level);
      
      // Expected: 100 * 2.0 * 1.2 = 240
      expect(questXP).toBe(240);
    });

    test('nên tính XP cho daily_quest với multiplier 1.5', () => {
      const baseXP = 100;
      const level = 10;
      const dailyXP = XPService.calculateActivityXP('daily_quest', baseXP, level);
      
      // Expected: 100 * 1.5 * 1.2 = 180
      expect(dailyXP).toBe(180);
    });

    test('XP nên scale với level của player', () => {
      const baseXP = 100;
      const xpLevel1 = XPService.calculateActivityXP('hunt', baseXP, 1);
      const xpLevel50 = XPService.calculateActivityXP('hunt', baseXP, 50);
      
      // Level 50 nên nhận nhiều XP hơn level 1
      expect(xpLevel50).toBeGreaterThan(xpLevel1);
    });

    test('Boss XP nên cao hơn hunt XP với cùng base', () => {
      const baseXP = 100;
      const level = 20;
      const huntXP = XPService.calculateActivityXP('hunt', baseXP, level);
      const bossXP = XPService.calculateActivityXP('boss', baseXP, level);
      
      expect(bossXP).toBeGreaterThan(huntXP);
      expect(bossXP).toBe(huntXP * 3); // Boss multiplier = 3x hunt
    });
  });
});
