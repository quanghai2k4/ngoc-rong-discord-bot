import { query } from '../database/db';
import { Item } from '../types';

export interface ShopItem extends Item {
  item_type_name: string;
}

export class ShopService {
  /**
   * Lấy tất cả item types để hiển thị menu shop
   */
  static async getItemTypes(): Promise<Array<{ id: number; name: string; description: string }>> {
    const result = await query(
      'SELECT id, name, description FROM item_types ORDER BY id'
    );
    return result.rows;
  }

  /**
   * Lấy danh sách items theo type (phân trang)
   */
  static async getItemsByType(typeId: number, page: number = 1, limit: number = 10): Promise<{
    items: ShopItem[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    // Lấy tổng số items
    const countResult = await query(
      'SELECT COUNT(*) FROM items WHERE item_type_id = $1',
      [typeId]
    );
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // Lấy items với phân trang
    const result = await query(
      `SELECT i.*, it.name as item_type_name 
       FROM items i
       JOIN item_types it ON i.item_type_id = it.id
       WHERE i.item_type_id = $1
       ORDER BY i.required_level, i.id
       LIMIT $2 OFFSET $3`,
      [typeId, limit, offset]
    );

    return {
      items: result.rows,
      total,
      totalPages,
      currentPage: page
    };
  }

  /**
   * Lấy tất cả items (cho shop tổng hợp)
   */
  static async getAllItems(page: number = 1, limit: number = 10): Promise<{
    items: ShopItem[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;

    const countResult = await query('SELECT COUNT(*) FROM items');
    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    const result = await query(
      `SELECT i.*, it.name as item_type_name 
       FROM items i
       JOIN item_types it ON i.item_type_id = it.id
       ORDER BY i.item_type_id, i.required_level, i.id
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return {
      items: result.rows,
      total,
      totalPages,
      currentPage: page
    };
  }

  /**
   * Lấy thông tin item theo ID
   */
  static async getItemById(itemId: number): Promise<ShopItem | null> {
    const result = await query(
      `SELECT i.*, it.name as item_type_name 
       FROM items i
       JOIN item_types it ON i.item_type_id = it.id
       WHERE i.id = $1`,
      [itemId]
    );
    return result.rows[0] || null;
  }

  /**
   * Mua item từ shop
   */
  static async buyItem(
    characterId: number,
    itemId: number,
    quantity: number = 1
  ): Promise<{ success: boolean; message: string; newGold?: number }> {
    try {
      // Lấy thông tin character
      const charResult = await query(
        'SELECT gold, level FROM characters WHERE id = $1',
        [characterId]
      );
      
      if (charResult.rows.length === 0) {
        return { success: false, message: 'Không tìm thấy nhân vật!' };
      }

      const character = charResult.rows[0];

      // Lấy thông tin item
      const item = await this.getItemById(itemId);
      if (!item) {
        return { success: false, message: 'Item không tồn tại!' };
      }

      // Kiểm tra level yêu cầu
      if (character.level < item.required_level) {
        return { 
          success: false, 
          message: `Cần level ${item.required_level} để mua ${item.name}!` 
        };
      }

      const totalPrice = item.price * quantity;

      // Kiểm tra đủ vàng
      if (character.gold < totalPrice) {
        return { 
          success: false, 
          message: `Không đủ vàng! Cần ${totalPrice} vàng, bạn có ${character.gold} vàng.` 
        };
      }

      // Trừ vàng
      await query(
        'UPDATE characters SET gold = gold - $1 WHERE id = $2',
        [totalPrice, characterId]
      );

      // Thêm item vào inventory
      await query(
        `INSERT INTO character_items (character_id, item_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (character_id, item_id)
         DO UPDATE SET quantity = character_items.quantity + $3`,
        [characterId, itemId, quantity]
      );

      const newGold = character.gold - totalPrice;

      return {
        success: true,
        message: `Đã mua ${quantity}x ${item.name} với giá ${totalPrice} vàng!`,
        newGold
      };
    } catch (error) {
      console.error('Error buying item:', error);
      return { success: false, message: 'Có lỗi xảy ra khi mua item!' };
    }
  }

  /**
   * Bán item từ inventory (giá = 50% giá mua)
   */
  static async sellItem(
    characterId: number,
    itemId: number,
    quantity: number = 1
  ): Promise<{ success: boolean; message: string; newGold?: number }> {
    try {
      // Kiểm tra có item trong inventory không
      const inventoryResult = await query(
        'SELECT quantity FROM character_items WHERE character_id = $1 AND item_id = $2',
        [characterId, itemId]
      );

      if (inventoryResult.rows.length === 0 || inventoryResult.rows[0].quantity < quantity) {
        return { success: false, message: 'Không có đủ item để bán!' };
      }

      // Lấy giá item
      const item = await this.getItemById(itemId);
      if (!item) {
        return { success: false, message: 'Item không tồn tại!' };
      }

      const sellPrice = Math.floor(item.price * 0.5); // Bán = 50% giá gốc
      const totalGold = sellPrice * quantity;

      // Trừ item từ inventory
      const newQuantity = inventoryResult.rows[0].quantity - quantity;
      if (newQuantity <= 0) {
        // Xóa item khỏi inventory nếu hết
        await query(
          'DELETE FROM character_items WHERE character_id = $1 AND item_id = $2',
          [characterId, itemId]
        );
      } else {
        // Giảm số lượng
        await query(
          'UPDATE character_items SET quantity = $1 WHERE character_id = $2 AND item_id = $3',
          [newQuantity, characterId, itemId]
        );
      }

      // Cộng vàng
      const goldResult = await query(
        'UPDATE characters SET gold = gold + $1 WHERE id = $2 RETURNING gold',
        [totalGold, characterId]
      );

      return {
        success: true,
        message: `Đã bán ${quantity}x ${item.name} với giá ${totalGold} vàng!`,
        newGold: goldResult.rows[0].gold
      };
    } catch (error) {
      console.error('Error selling item:', error);
      return { success: false, message: 'Có lỗi xảy ra khi bán item!' };
    }
  }

  /**
   * Tính giá bán của item (50% giá mua)
   */
  static getSellPrice(buyPrice: number): number {
    return Math.floor(buyPrice * 0.5);
  }
}
