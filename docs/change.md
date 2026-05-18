## 2026-05-18 12:05:00

### 修复 Electrobun 打包后族谱接口返回空数据

- 更新 `electrobun.config.ts`：打包时复制 `.data` 到 `Resources/app/data`
- 更新 `src/db/bun-sqlite.ts`：首次启动或 userData 库无数据时，从内置 `data/db.sqlite3` 复制到 userData

### commit message

```
fix: 打包时复制内置 SQLite 并在首次启动时种子到 userData

- 将 .data/db.sqlite3 打入应用包
- userData 空库时自动从内置库恢复族谱数据
```

## 2026-05-18 11:52:00

### 修复 SQLite 缺少 genealogy 表（no such table）

- 使用 `drizzle-kit generate` 生成 `drizzle-sqlite/0000_init_genealogy.sql` 迁移
- 更新 `src/db/bun-sqlite.ts`：启动时通过 `drizzle-orm/bun-sqlite/migrator` 自动执行迁移
- 更新 `electrobun.config.ts`：将 `drizzle-sqlite` 复制到 `Resources/app` 供打包环境使用
- 新增 `package.json` 脚本 `db:generate`

### commit message

```
fix: 启动时自动执行 Drizzle 迁移创建 genealogy 表

- 生成并打包 drizzle-sqlite 迁移目录
- 开发环境与 Electrobun userData 数据库均自动建表
```

## 2026-05-18 11:48:00

### 修复 Electrobun 打包后找不到 public / views（ENOENT）

- 新增 `src/utils/app-path.ts`：通过 `Resources/app/config` 是否存在判断应用包环境，解析 `public`、`views`、`uploads` 路径
- 更新 `electrobun.config.ts`：复制 `public`、`views` 到 `Resources/app`
- 新增 `public/robots.txt`、`public/favicon.ico`
- 更新 `src/plugins/static.ts`、`src/index.ts`、`src/utils/index.ts`：使用 `resolveAppPath` 替代相对 cwd 路径
- 统一 `src/config/index.ts`、`src/db/bun-sqlite.ts` 的应用包检测逻辑

### commit message

```
fix: 修复 Electrobun 打包后 public 与 views 路径 ENOENT

- 复制静态资源与模板到 Resources/app 并统一路径解析
- 改用 cwd 检测应用包环境替代 argv0 判断
```

## 2026-05-18 11:40:00

### 修复 Electrobun 无法启动（Bundle failed）

- 升级 `electrobun` 至 `1.18.4-beta.3`（`1.16.0` CLI 使用 `bun build --app` 且无 HTML 入口，仅报 `Bundle failed`）
- 新增 `scripts/electrobun-alias-plugin.ts`，在打包时解析 `~/`、`@/` 路径别名
- 更新 `electrobun.config.ts`：注册 alias 插件、复制 `config` 目录到应用包
- 修复 `src/db/bun-sqlite.ts`：打包后 SQLite 使用 `Utils.paths.userData`
- 修复 `src/config/index.ts`：打包后从 `Resources/app/config` 加载配置

### commit message

```
fix: 修复 Electrobun dev 打包失败与 SQLite 路径问题

- 升级 electrobun 并添加路径别名打包插件
- 修正打包环境下配置与数据库文件路径
```
