# 📘 Hướng Dẫn Sử Dụng Swagger/OpenAPI

## 🎯 Mục Đích

File `openapi.yaml` là OpenAPI Specification (Swagger) 3.0 cho Discord bot. Swagger cung cấp:

✅ **Interactive API Documentation** với UI đẹp  
✅ **Try it out** - Test API trực tiếp  
✅ **Auto-generated code** từ spec  
✅ **Standard format** được công nhận toàn cầu  

---

## 🚀 Cách 1: Xem Online (Nhanh Nhất)

### Swagger Editor (Recommended)

1. Truy cập: https://editor.swagger.io
2. Click **File** → **Import file**
3. Chọn file `openapi.yaml`
4. Ngay lập tức thấy UI interactive!

**Hoặc copy-paste:**
```bash
# Copy nội dung file
cat openapi.yaml | xclip -selection clipboard  # Linux
cat openapi.yaml | pbcopy                      # macOS

# Paste vào https://editor.swagger.io
```

### Swagger UI Online Viewer

Truy cập: https://petstore.swagger.io

Nhập URL (nếu file đã push lên GitHub):
```
https://raw.githubusercontent.com/YOUR_USERNAME/nrodiscord/main/openapi.yaml
```

---

## 🖥️ Cách 2: Chạy Local với Swagger UI

### Option A: Docker (Đơn giản nhất)

```bash
# Chạy Swagger UI container
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/app/openapi.yaml \
  -v $(pwd)/openapi.yaml:/app/openapi.yaml \
  swaggerapi/swagger-ui

# Mở browser: http://localhost:8080
```

### Option B: NPM Package

```bash
# Install swagger-ui-express
npm install --save-dev swagger-ui-express js-yaml

# Tạo file server.js
cat > swagger-server.js << 'EOF'
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');

const app = express();
const port = 3000;

// Load OpenAPI spec
const openapiSpec = yaml.load(fs.readFileSync('./openapi.yaml', 'utf8'));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.listen(port, () => {
  console.log(`📘 Swagger UI: http://localhost:${port}/api-docs`);
});
EOF

# Chạy server
node swagger-server.js

# Mở browser: http://localhost:3000/api-docs
```

### Option C: VS Code Extension

1. Cài extension: **Swagger Viewer**
2. Mở file `openapi.yaml`
3. Click icon "Preview Swagger" ở góc phải trên
4. Preview ngay trong VS Code!

---

## 📖 Cách Sử Dụng Swagger UI

### 1. **Xem Tổng Quan**

Khi mở Swagger UI, bạn sẽ thấy:

```
┌─────────────────────────────────────┐
│  Ngọc Rồng Discord Bot API v1.0.0  │
├─────────────────────────────────────┤
│  📂 Character Management            │
│     POST /commands/start            │
│     GET  /commands/profile          │
│  📂 Combat & Hunting                │
│     POST /commands/hunt             │
│     POST /commands/boss             │
│  📂 Inventory & Equipment           │
│  📂 Shop & Economy                  │
│  📂 Skills & Progression            │
│  📂 Quests                          │
│  📂 Special Features                │
│  📂 Leaderboard                     │
└─────────────────────────────────────┘
```

### 2. **Xem Chi Tiết Command**

Click vào command (ví dụ: `POST /commands/hunt`):

```yaml
POST /commands/hunt - Săn quái vật
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Description:
  Săn quái vật để kiếm EXP, vàng và items.
  
  Aliases: zhunt, zsan, zdanhquai
  Rate Limit: 3 giây cooldown
  
  Battle Mechanics:
    • Turn-based combat
    • Damage formula: baseDamage = ATK - (DEF * 0.5)
    • Critical chance: 5% base
    • Critical multiplier: 1.5x

Parameters:
  user_id (string, required): Discord user ID
  quantity (integer, optional): 1-5 monsters

Responses:
  ✅ 200 - Battle results
  ⛔ 429 - Rate limited
```

### 3. **Test API với "Try it out"**

```
┌─────────────────────────────────────┐
│  Try it out                   [▼]  │
├─────────────────────────────────────┤
│  user_id: 123456789012345678        │
│  quantity: 3                        │
│                                     │
│         [Execute]                   │
└─────────────────────────────────────┘

Response:
{
  "won": true,
  "monsters_defeated": 3,
  "exp_gained": 360,
  "gold_gained": 150,
  "items_dropped": [...]
}
```

### 4. **Xem Request/Response Examples**

Mỗi endpoint có examples:

```json
// Example 1: Saiyan character
{
  "success": true,
  "character": {
    "id": 1,
    "name": "Goku",
    "race": "Saiyan",
    "level": 1,
    "hp": 150,
    "attack": 35
  }
}

// Example 2: Error - Character exists
{
  "error": "CHARACTER_EXISTS",
  "message": "Bạn đã có nhân vật rồi!"
}
```

---

## 🔍 Use Cases Cụ Thể

### Use Case 1: Developer Mới Muốn Hiểu `/hunt` Command

```
1. Mở Swagger UI
2. Tìm "Combat & Hunting" section
3. Click "POST /commands/hunt"
4. Đọc:
   ✓ Description: Săn quái để kiếm EXP
   ✓ Parameters: user_id (required), quantity (optional 1-5)
   ✓ Rate limit: 3 giây
   ✓ Battle mechanics: Damage formula, crit, dodge
   ✓ Responses: 200 (success), 429 (rate limit)
5. Click "Try it out" để test
6. Nhập user_id, quantity → Execute
7. Thấy response example
```

### Use Case 2: QA Muốn Test `/buy` Command

```
1. Swagger UI → "Shop & Economy"
2. POST /commands/buy
3. Xem "Errors" section:
   • INSUFFICIENT_GOLD
   • LEVEL_REQUIREMENT_NOT_MET
   • RACE_REQUIREMENT_NOT_MET
   • INVENTORY_FULL
4. Test cases cần cover:
   ✓ Happy path: Đủ gold, đủ level → Success
   ✓ Error: Không đủ gold → 400 error
   ✓ Error: Level thấp → 400 error
   ✓ Edge case: Inventory đầy → 400 error
```

### Use Case 3: Frontend Developer Cần Integrate

```typescript
// Swagger UI cho thấy exact request format:

// Request
POST /commands/buy
Content-Type: application/json

{
  "user_id": "123456789012345678",
  "item_id": 101,
  "quantity": 1
}

// Response 200 OK
{
  "success": true,
  "item": {
    "id": 101,
    "name": "Kiếm Z",
    "attack_bonus": 50
  },
  "total_cost": 1000,
  "remaining_gold": 500
}

// Response 400 Error
{
  "error": "INSUFFICIENT_GOLD",
  "message": "Bạn không đủ vàng! Cần 1000💰, hiện có 500💰"
}

// → Copy exact format này vào code
```

---

## 🎨 Swagger UI Features

### 1. **Schemas Section**

Xem tất cả data models:

```yaml
Components → Schemas:
  ├─ Character
  │   ├─ id: integer
  │   ├─ name: string
  │   ├─ race: enum [Saiyan, Namek, Earthling]
  │   ├─ level: integer
  │   └─ stats: {...}
  ├─ Item
  ├─ Skill
  ├─ BattleResponse
  └─ ErrorResponse
```

### 2. **Tags (Categories)**

Filter commands theo category:
- Character Management
- Combat & Hunting
- Inventory & Equipment
- Shop & Economy
- Skills & Progression
- Quests
- Special Features
- Leaderboard
- Admin

### 3. **Error Codes**

Mỗi endpoint list tất cả error codes:

```
200 ✅ Success
400 ⚠️  Bad Request (validation errors)
404 ❌ Not Found (character/item not found)
409 🔒 Conflict (already exists)
429 ⏱️  Rate Limited
500 💥 Server Error
```

---

## 📊 So Sánh với Markdown Docs

| Feature | Markdown | Swagger/OpenAPI |
|---------|----------|-----------------|
| **Interactive UI** | ❌ | ✅ Beautiful UI |
| **Try it out** | ❌ | ✅ Test directly |
| **Auto-complete** | ❌ | ✅ Schema validation |
| **Code generation** | ❌ | ✅ Auto-gen SDKs |
| **Standard format** | ❌ | ✅ Industry standard |
| **Searchable** | ⚠️ Manual | ✅ Built-in search |
| **Versioning** | ⚠️ Manual | ✅ Built-in versioning |
| **Easy to read** | ✅ | ✅ |

---

## 🛠️ Advanced Usage

### 1. **Generate Client SDK**

```bash
# Install OpenAPI Generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript SDK
openapi-generator-cli generate \
  -i openapi.yaml \
  -g typescript-axios \
  -o ./sdk/typescript

# Generate Python SDK
openapi-generator-cli generate \
  -i openapi.yaml \
  -g python \
  -o ./sdk/python
```

### 2. **Validate OpenAPI Spec**

```bash
# Install validator
npm install -g @apidevtools/swagger-cli

# Validate
swagger-cli validate openapi.yaml
# ✅ openapi.yaml is valid
```

### 3. **Convert to Postman Collection**

```bash
# Install converter
npm install -g openapi-to-postmanv2

# Convert
openapi2postmanv2 -s openapi.yaml -o postman_collection.json

# Import vào Postman → có ngay collection để test!
```

### 4. **Integrate vào Documentation Site**

```bash
# Docusaurus
npm install docusaurus-plugin-openapi-docs

# MkDocs
pip install mkdocs-openapi-plugin

# Add openapi.yaml vào docs folder
```

---

## 💡 Tips & Best Practices

### ✅ DO:

1. **Luôn validate spec** trước khi commit:
   ```bash
   swagger-cli validate openapi.yaml
   ```

2. **Sử dụng examples** cho tất cả responses:
   ```yaml
   examples:
     success:
       value: { ... }
     error:
       value: { ... }
   ```

3. **Document tất cả error codes** rõ ràng

4. **Dùng `$ref`** để tránh duplicate:
   ```yaml
   schema:
     $ref: '#/components/schemas/Character'
   ```

### ❌ DON'T:

1. Không hardcode URLs (dùng `servers` section)
2. Không bỏ qua `description` fields
3. Không copy-paste schemas (dùng `$ref`)
4. Không forget update version khi thay đổi

---

## 🔗 Resources

**Online Tools:**
- Swagger Editor: https://editor.swagger.io
- Swagger UI: https://petstore.swagger.io
- OpenAPI Generator: https://openapi-generator.tech

**Documentation:**
- OpenAPI Spec: https://swagger.io/specification/
- Best Practices: https://swagger.io/resources/articles/best-practices-in-api-documentation/

**VS Code Extensions:**
- Swagger Viewer
- OpenAPI (Swagger) Editor
- YAML Language Support

---

## 🎯 Tóm Tắt

```bash
# Quick Start (3 bước):

# 1. Copy file openapi.yaml
cat openapi.yaml | pbcopy

# 2. Mở Swagger Editor
open https://editor.swagger.io

# 3. Paste và xem magic! ✨
```

**Lợi ích:**
- ✅ Interactive documentation
- ✅ Test API trực tiếp
- ✅ Auto-generate SDKs
- ✅ Standard format
- ✅ Beautiful UI
- ✅ Easy integration

Swagger > Markdown cho API documentation! 🚀
