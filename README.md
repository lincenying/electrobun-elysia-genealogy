# 天井洋村族谱

基于 **Electrobun** 的桌面族谱应用：内嵌 **Elysia** 本地服务，使用 **BunSQLite + Drizzle ORM** 存储成员数据，通过 **D3.js** 交互式展示家族关系树。

## 功能特性

- **桌面应用**：Electrobun 原生窗口，开箱即用，无需单独启动浏览器
- **族谱可视化**：横向树形图，支持缩放、拖拽、节点点击
- **成员检索**：按姓名或 ID 搜索，高亮匹配节点
- **关系提示**：点击节点展示亲属关系说明（最多保留 3 条）
- **简介悬浮**：鼠标悬停显示成员 `desc` 简介
- **本地数据**：SQLite 本地存储，启动时自动执行 Drizzle 迁移
- **打包分发**：支持 macOS / Windows 构建；首次启动可将内置数据库种子到用户目录

## 技术栈

| 类别 | 技术 |
|------|------|
| 运行时 | [Bun](https://bun.sh) |
| 桌面壳 | [Electrobun](https://electrobun.dev) |
| Web 框架 | [Elysia](https://elysiajs.com) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| 数据库 | BunSQLite（开发 / 打包） |
| 模板 | Twig |
| 可视化 | D3.js v7（CDN） |
| 配置 | Convict + YAML |
| 日志 | Pino |

## 环境要求

- [Bun](https://bun.sh) ≥ 1.3
- macOS 或 Windows（与 Electrobun 构建目标一致）

## 快速开始

### 1. 安装依赖

```bash
bun install
```

### 2. 环境变量

项目根目录 `.env` 示例：

```env
NODE_ENV=development
```

Bun 会自动加载 `.env`。`NODE_ENV` 决定加载 `config/development.yaml` 或 `config/production.yaml`。

### 3. 数据库

开发环境数据库路径：`./.data/db.sqlite3`（目录不存在时会自动创建）。

应用启动时会自动执行 `drizzle-sqlite/` 下的迁移。如需根据 Schema 重新生成迁移文件：

```bash
bun run db:generate
```

### 4. 启动开发

```bash
bun run dev
```

等价于 `electrobun dev --watch`，会：

- 启动 Elysia 本地服务（默认端口见 `config/development.yaml`，当前为 `4000`）
- 打开 Electrobun 窗口并加载族谱页面
- 监听 `src/`、`views/`、`config/`、`public/` 等目录变更

仅启动（无 watch）：

```bash
bun run start
```

## 构建与发布

```bash
# 开发构建
bun run build

# 稳定版构建（含 macOS 签名 / DMG 等后处理脚本）
bun run build:stable
```

构建配置见 `electrobun.config.ts`：

| 配置项 | 值 |
|--------|-----|
| 应用显示名 | 天井洋村族谱 |
| Bundle ID | `com.teb.tianyoucun.zupu` |
| 构建产物名 | `TianJingYangCunZuPu`（路径须为 ASCII） |
| 入口 | `src/index.ts` |

打包时会复制 `config/`、`public/`、`views/`、`drizzle-sqlite/`、`.data/` 等资源。Electrobun 应用首次启动时，若用户数据目录数据库为空，会从内置库复制种子数据。

macOS 代码签名（可选）：

```bash
export ELECTROBUN_DEVELOPER_ID="Developer ID Application: ..."
# 并在 electrobun.config.ts 中将 build.mac.codesign 设为 true
```

## 访问地址

开发模式下服务默认监听 `http://0.0.0.0:4000`（以配置文件为准）：

| 路径 | 说明 |
|------|------|
| `/` | 族谱关系图页面（Twig + D3） |
| `/api/genealogy/lists/` | 成员列表 API |
| `/public/*` | 静态资源 |
| `/docs` | Swagger 文档（仅 `NODE_ENV=development` 时启用，需在 `src/index.ts` 取消注释） |

## API 说明

### 获取族谱成员列表

```
GET /api/genealogy/lists/
```

**响应示例**（经 `response-wrapper` 中间件包装）：

```json
{
  "code": 200,
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "继万",
      "parent": 0,
      "sex": null,
      "desc": "家族始祖，开创基业"
    }
  ],
  "message": ""
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 成员 ID |
| `name` | string | 姓名 |
| `parent` | number | 父辈 ID，`0` 表示根节点 |
| `sex` | string \| null | 性别 |
| `desc` | string \| null | 简介 |

## 数据模型

表名：`genealogy`

```sql
CREATE TABLE genealogy (
  id     INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name   TEXT NOT NULL,
  parent INTEGER NOT NULL,
  sex    TEXT,
  desc   TEXT
);
```

Schema 定义：`src/schema/bun-sqlite.ts`
数据访问：`src/models/sqlite/genealogy.model.ts`

## 项目结构

```text
.
├── config/                    # 环境配置（development.yaml / production.yaml）
├── drizzle-sqlite/            # SQLite 迁移文件
├── public/                    # 静态资源
├── views/
│   └── genealogy.twig         # 族谱页面（D3 可视化）
├── src/
│   ├── index.ts               # 应用入口（Elysia + Electrobun 窗口）
│   ├── config/                # Convict 配置加载
│   ├── controllers/           # 页面控制器
│   ├── db/                    # Drizzle + SQLite 初始化与迁移
│   ├── middleware/            # 访问日志、统一响应包装
│   ├── models/                # 数据访问层
│   ├── plugins/               # CORS、静态资源、Swagger 等
│   ├── routes/                # 页面路由与 API 路由
│   ├── schema/                # Drizzle 表定义、Elysia 校验 Schema
│   └── utils/                 # 日志、路径解析、缓存等
├── scripts/                   # Electrobun 构建辅助脚本
├── electrobun.config.ts       # 桌面应用构建配置
├── drizzle.config.ts          # Drizzle Kit 配置
└── package.json
```

路径别名：`~/*` → `./src/*`

## 配置说明

配置文件位于 `config/`，按 `server.nodeEnv` 加载对应 YAML。常用项：

```yaml
server:
  nodeEnv: development
  port: 4000
  host: 0.0.0.0

db:
  sqlite: ./.data/db.sqlite3

log:
  level: info

static:
  assetsPath: ./public
  prefix: /public
```

生产环境默认端口为 `4080`，见 `config/production.yaml`。

## 常用脚本

| 命令 | 说明 |
|------|------|
| `bun run dev` | 开发模式（watch + 桌面窗口） |
| `bun run start` | 启动开发（无 watch） |
| `bun run build` | 构建桌面应用 |
| `bun run build:stable` | 稳定版构建 |
| `bun run typecheck` | TypeScript 类型检查 |
| `bun run db:generate` | 根据 Schema 生成 Drizzle 迁移 |

## 开发说明

- 运行时统一使用 **Bun**，避免 Node 专有 API
- 业务按 **路由 → Model → DB** 分层；API 响应经 `response-wrapper` 统一格式
- 修改 Twig 模板后，`dev` 模式下会触发热重载
- 类型检查：`bun run typecheck`

## 许可证

MIT
