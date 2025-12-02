import { SenzuService } from '../src/services/SenzuService';

// Mock database query function
jest.mock('../src/database/db', () => ({
  query: jest.fn(),
}));

import { query } from '../src/database/db';
const mockQuery = query as jest.MockedFunction<typeof query>;

describe('SenzuService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSenzuConfig', () => {
    test('nên trả về config cho level hợp lệ', async () => {
      const mockConfig = {
        level: 1,
        upgrade_cost: 0,
        production_time: 60,
        beans_per_harvest: 1,
        bean_hp_restore: 50,
        bean_ki_restore: 50,
        required_character_level: 1,
      };

      mockQuery.mockResolvedValue({ rows: [mockConfig] } as any);

      const config = await SenzuService.getSenzuConfig(1);
      
      expect(config).toEqual(mockConfig);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM senzu_upgrade_config WHERE level = $1',
        [1]
      );
    });

    test('nên trả về null nếu level không tồn tại', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      const config = await SenzuService.getSenzuConfig(999);
      
      expect(config).toBeNull();
    });
  });

  describe('getAllSenzuConfigs', () => {
    test('nên trả về tất cả configs theo thứ tự level', async () => {
      const mockConfigs = [
        { level: 1, upgrade_cost: 0, production_time: 60 },
        { level: 2, upgrade_cost: 5000, production_time: 50 },
        { level: 3, upgrade_cost: 15000, production_time: 45 },
      ];

      mockQuery.mockResolvedValue({ rows: mockConfigs } as any);

      const configs = await SenzuService.getAllSenzuConfigs();
      
      expect(configs).toEqual(mockConfigs);
      expect(configs).toHaveLength(3);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM senzu_upgrade_config ORDER BY level ASC'
      );
    });
  });

  describe('canHarvest', () => {
    test('nên cho phép harvest nếu đủ thời gian', async () => {
      const pastTime = new Date(Date.now() - 61 * 60 * 1000); // 61 minutes ago
      
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            senzu_level: 1,
            senzu_last_harvest: pastTime,
          }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            level: 1,
            production_time: 60,
            beans_per_harvest: 1,
          }],
        } as any);

      const result = await SenzuService.canHarvest(1);
      
      expect(result.canHarvest).toBe(true);
      expect(result.minutesRemaining).toBe(0);
      expect(result.beansReady).toBe(1);
    });

    test('nên không cho phép harvest nếu chưa đủ thời gian', async () => {
      const recentTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            senzu_level: 1,
            senzu_last_harvest: recentTime,
          }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            level: 1,
            production_time: 60,
            beans_per_harvest: 1,
          }],
        } as any);

      const result = await SenzuService.canHarvest(1);
      
      expect(result.canHarvest).toBe(false);
      expect(result.minutesRemaining).toBeGreaterThan(0);
      expect(result.beansReady).toBe(0);
    });

    test('nên throw error nếu character không tồn tại', async () => {
      mockQuery.mockResolvedValue({ rows: [] } as any);

      await expect(SenzuService.canHarvest(999)).rejects.toThrow('Character not found');
    });
  });

  describe('harvest', () => {
    test('nên harvest thành công nếu đủ thời gian', async () => {
      const pastTime = new Date(Date.now() - 61 * 60 * 1000);
      
      // Mock canHarvest checks
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ senzu_level: 1, senzu_last_harvest: pastTime }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ level: 1, production_time: 60, beans_per_harvest: 2 }],
        } as any)
        // Mock harvest update
        .mockResolvedValueOnce({
          rows: [{ senzu_beans: 5 }],
        } as any);

      const result = await SenzuService.harvest(1);
      
      expect(result.success).toBe(true);
      expect(result.beansHarvested).toBe(2);
      expect(result.totalBeans).toBe(5);
      expect(result.message).toContain('Thu hoạch thành công');
    });

    test('nên thất bại nếu chưa đủ thời gian', async () => {
      const recentTime = new Date(Date.now() - 30 * 60 * 1000);
      
      mockQuery
        .mockResolvedValueOnce({
          rows: [{ senzu_level: 1, senzu_last_harvest: recentTime }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{ level: 1, production_time: 60, beans_per_harvest: 1 }],
        } as any);

      const result = await SenzuService.harvest(1);
      
      expect(result.success).toBe(false);
      expect(result.beansHarvested).toBe(0);
      expect(result.message).toContain('chưa sẵn sàng');
    });
  });

  describe('upgrade', () => {
    test('nên upgrade thành công nếu đủ điều kiện', async () => {
      mockQuery
        // Get character info
        .mockResolvedValueOnce({
          rows: [{
            senzu_level: 1,
            gold: 10000,
            level: 10,
          }],
        } as any)
        // Get next config
        .mockResolvedValueOnce({
          rows: [{
            level: 2,
            upgrade_cost: 5000,
            required_character_level: 5,
            production_time: 50,
            beans_per_harvest: 2,
          }],
        } as any)
        // Update character
        .mockResolvedValueOnce({
          rows: [{ senzu_level: 2 }],
        } as any);

      const result = await SenzuService.upgrade(1);
      
      expect(result.success).toBe(true);
      expect(result.newLevel).toBe(2);
      expect(result.message).toContain('Nâng cấp');
    });

    test('nên thất bại nếu đã max level', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          senzu_level: 10,
          gold: 100000,
          level: 50,
        }],
      } as any);

      const result = await SenzuService.upgrade(1);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('cấp tối đa');
    });

    test('nên thất bại nếu không đủ vàng', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            senzu_level: 1,
            gold: 1000,
            level: 10,
          }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            level: 2,
            upgrade_cost: 5000,
            required_character_level: 5,
          }],
        } as any);

      const result = await SenzuService.upgrade(1);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('Không đủ vàng');
    });

    test('nên thất bại nếu character level chưa đủ', async () => {
      mockQuery
        .mockResolvedValueOnce({
          rows: [{
            senzu_level: 1,
            gold: 10000,
            level: 3,
          }],
        } as any)
        .mockResolvedValueOnce({
          rows: [{
            level: 2,
            upgrade_cost: 5000,
            required_character_level: 5,
          }],
        } as any);

      const result = await SenzuService.upgrade(1);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain('level');
    });
  });
});
