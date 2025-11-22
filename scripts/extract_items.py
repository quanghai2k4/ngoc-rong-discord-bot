#!/usr/bin/env python3
"""
Script để extract item data từ vibenro.sql và generate PostgreSQL migration
"""

import re
import json

def parse_mysql_insert(insert_line):
    """Parse MySQL INSERT statement thành list of tuples"""
    # Tìm VALUES (...)
    match = re.search(r'VALUES\s+(.+);', insert_line, re.DOTALL)
    if not match:
        return []
    
    values_part = match.group(1)
    
    # Parse từng row
    items = []
    # Regex để match một row: (...),(...),(...)
    # Cẩn thận với string có dấu phẩy bên trong
    pattern = r'\(([^)]+(?:\([^)]*\)[^)]*)*)\)'
    
    for match in re.finditer(pattern, values_part):
        row_data = match.group(1)
        # Parse các fields
        fields = []
        current_field = ''
        in_string = False
        escape_next = False
        
        for char in row_data:
            if escape_next:
                current_field += char
                escape_next = False
                continue
            
            if char == '\\':
                escape_next = True
                current_field += char
                continue
            
            if char == "'":
                in_string = not in_string
                current_field += char
                continue
            
            if char == ',' and not in_string:
                fields.append(current_field.strip())
                current_field = ''
                continue
            
            current_field += char
        
        # Add last field
        if current_field:
            fields.append(current_field.strip())
        
        items.append(fields)
    
    return items

def clean_value(val):
    """Clean và format giá trị"""
    val = val.strip()
    
    # NULL
    if val.upper() == 'NULL':
        return None
    
    # String (quoted)
    if val.startswith("'") and val.endswith("'"):
        # Unescape
        val = val[1:-1]
        val = val.replace("\\'", "'")
        val = val.replace("\\\\", "\\")
        return val
    
    # Number
    try:
        if '.' in val:
            return float(val)
        return int(val)
    except:
        return val

def main():
    print("Reading vibenro.sql...")
    
    with open('/home/merrill/workspace/nrodiscord/vibenro.sql', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find item_template INSERT statement
    pattern = r'INSERT INTO `item_template`.*?VALUES\s+(.+?);'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("ERROR: Không tìm thấy INSERT INTO `item_template`")
        return
    
    values_str = match.group(1)
    
    # Parse rows manually
    rows = []
    current_row = []
    current_value = ''
    in_string = False
    paren_level = 0
    
    i = 0
    while i < len(values_str):
        char = values_str[i]
        
        # Handle escape
        if char == '\\' and i + 1 < len(values_str):
            current_value += char + values_str[i + 1]
            i += 2
            continue
        
        # Handle string quotes
        if char == "'":
            in_string = not in_string
            current_value += char
            i += 1
            continue
        
        # If in string, just append
        if in_string:
            current_value += char
            i += 1
            continue
        
        # Handle parentheses
        if char == '(':
            paren_level += 1
            if paren_level == 1:
                # Start of new row
                current_row = []
                current_value = ''
                i += 1
                continue
            else:
                current_value += char
        elif char == ')':
            paren_level -= 1
            if paren_level == 0:
                # End of row
                if current_value.strip():
                    current_row.append(clean_value(current_value))
                rows.append(current_row)
                current_value = ''
                i += 1
                continue
            else:
                current_value += char
        elif char == ',' and paren_level == 1:
            # Field separator
            if current_value.strip():
                current_row.append(clean_value(current_value))
            current_value = ''
            i += 1
            continue
        else:
            current_value += char
        
        i += 1
    
    print(f"Parsed {len(rows)} items")
    
    # Column names từ CREATE TABLE
    columns = ['id', 'TYPE', 'gender', 'NAME', 'description', 'level', 'icon_id', 
               'part', 'is_up_to_up', 'power_require', 'gold', 'gem', 'head', 'body', 'leg']
    
    # Generate SQL output
    output_lines = []
    output_lines.append("-- Items extracted from vibenro.sql")
    output_lines.append("-- Total: {} items".format(len(rows)))
    output_lines.append("")
    output_lines.append("-- Clear existing seed data")
    output_lines.append("DELETE FROM items WHERE id < 10000;")
    output_lines.append("")
    
    # Map TYPE to item_type_id
    type_mapping = {
        0: 0,   # Armor
        1: 1,   # Pants  
        2: 2,   # Gloves
        3: 3,   # Boots
        4: 4,   # Radar
        5: 5,   # Amulet
        6: 6,   # Consumable
        7: 7,   # Book (skill)
        8: 8,   # Quest items (misc)
        9: 9,   # Gold (currency - skip)
        10: 10, # Gem (currency - skip)
        11: 11, # Misc
        12: 12, # Dragon Ball (quest)
        13: 13, # Bùa (charm/buff)
        14: 14, # Đá (gem/stone)
        15: 15, # Mảnh đá (fragment)
        16: 16, # Bình nước (potion)
        27: 6,  # Food (consumable)
    }
    
    # Filter và convert items
    converted_items = []
    
    for row in rows:
        if len(row) < 15:
            continue
        
        item_id = row[0]
        item_type = row[1]
        gender = row[2]
        name = row[3]
        desc = row[4]
        level = row[5]
        icon_id = row[6]
        gold_price = row[10]
        
        # Skip currency items (type 9, 10)
        if item_type in [9, 10]:
            continue
        
        # Map item type
        if item_type not in type_mapping:
            print(f"WARNING: Unknown item type {item_type} for item {item_id}: {name}")
            continue
        
        item_type_id = type_mapping[item_type]
        
        # Determine bonus stats based on item type and name
        hp_bonus = 0
        ki_bonus = 0
        attack_bonus = 0
        defense_bonus = 0
        speed_bonus = 0
        is_consumable = item_type in [6, 27]  # Type 6 hoặc 27
        
        # Áo (Armor) - Defense bonus
        if item_type == 0:
            # Parse defense từ gold price hoặc level
            if level <= 2:
                defense_bonus = 2 + level
            elif level <= 4:
                defense_bonus = 4 + level
            elif level <= 8:
                defense_bonus = 8 + level * 2
            else:
                defense_bonus = 15 + level * 3
        
        # Quần (Pants) - HP bonus
        elif item_type == 1:
            if level <= 2:
                hp_bonus = 20 + level * 10
            elif level <= 4:
                hp_bonus = 100 + level * 50
            elif level <= 8:
                hp_bonus = 200 + level * 100
            else:
                hp_bonus = 500 + level * 200
        
        # Găng (Gloves) - Attack bonus
        elif item_type == 2:
            if level <= 2:
                attack_bonus = 3 + level
            elif level <= 4:
                attack_bonus = 6 + level * 2
            elif level <= 8:
                attack_bonus = 10 + level * 4
            else:
                attack_bonus = 20 + level * 6
        
        # Giày (Boots) - KI bonus
        elif item_type == 3:
            if level <= 2:
                ki_bonus = 10 + level * 5
            elif level <= 4:
                ki_bonus = 20 + level * 10
            elif level <= 8:
                ki_bonus = 50 + level * 20
            else:
                ki_bonus = 100 + level * 40
        
        # Rada (Radar) - Crit/Speed
        elif item_type == 4:
            speed_bonus = 5 + level * 3
        
        # Consumables - HP/KI restore
        elif is_consumable:
            if 'Đậu thần' in name:
                hp_bonus = 50 * level
                ki_bonus = 50 * level
            elif 'cà chua' in name.lower() or 'cà rốt' in name.lower():
                hp_bonus = 20
                ki_bonus = 20
            elif 'nho' in name.lower():
                hp_bonus = 100
                ki_bonus = 100
        
        converted_items.append({
            'id': item_id,
            'name': name,
            'item_type_id': item_type_id,
            'description': desc,
            'hp_bonus': hp_bonus,
            'ki_bonus': ki_bonus,
            'attack_bonus': attack_bonus,
            'defense_bonus': defense_bonus,
            'speed_bonus': speed_bonus,
            'price': gold_price if gold_price else 0,
            'is_consumable': is_consumable,
            'required_level': level if level else 1
        })
    
    # Generate INSERT statements (batch insert)
    batch_size = 50
    for i in range(0, len(converted_items), batch_size):
        batch = converted_items[i:i + batch_size]
        
        output_lines.append("INSERT INTO items (id, name, item_type_id, description, hp_bonus, ki_bonus, attack_bonus, defense_bonus, speed_bonus, price, is_consumable, required_level) VALUES")
        
        values = []
        for item in batch:
            name_escaped = item['name'].replace("'", "''")
            desc_escaped = item['description'].replace("'", "''")
            is_cons_str = str(item['is_consumable']).upper()
            
            values.append(
                f"({item['id']}, '{name_escaped}', {item['item_type_id']}, "
                f"'{desc_escaped}', {item['hp_bonus']}, {item['ki_bonus']}, "
                f"{item['attack_bonus']}, {item['defense_bonus']}, {item['speed_bonus']}, "
                f"{item['price']}, {is_cons_str}, {item['required_level']})"
            )
        
        output_lines.append(',\n'.join(values) + ';')
        output_lines.append("")
    
    output_lines.append(f"-- Total items imported: {len(converted_items)}")
    
    # Write output
    output_file = '/home/merrill/workspace/nrodiscord/database/items_import.sql'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))
    
    print(f"Generated {output_file}")
    print(f"Total items to import: {len(converted_items)}")
    
    # Print summary by type
    print("\n=== Summary by Type ===")
    type_counts = {}
    for item in converted_items:
        t = item['item_type_id']
        type_counts[t] = type_counts.get(t, 0) + 1
    
    for type_id, count in sorted(type_counts.items()):
        print(f"Type {type_id}: {count} items")

if __name__ == '__main__':
    main()
