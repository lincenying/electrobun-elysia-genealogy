## 2026-05-18 17:43:18

### 按 global-01-elysia 规范重组后端目录

- Drizzle 表定义迁至 `src/db/schema/`（`drizzle.config.ts` 指向聚合 `index.ts`）
- 数据库入口统一为 `src/db/index.ts`（原 `db/bun-sqlite.ts`）；行数统计改用 Drizzle `count()`，避免手写 SQL
- 族谱业务迁至 `src/modules/genealogy/`（controller / service / schema / types）
- 原 `middleware/`、`schema/` 中 Elysia 相关迁至 `src/plugins/`（`access-logger`、`response-wrapper`、`validation-schema`、`elysia-schema-error`）
- 新增 `src/app.ts` 负责组装 Elysia；`src/index.ts` 仅负责启动与桌面窗口
- 更新 `README.md` 中的目录说明

### commit message

```
refactor: 按 Elysia 规范重组 db/modules/plugins 目录

- Drizzle schema 归入 src/db/schema，业务迁入 modules/genealogy
- 中间件与全局校验模型并入 plugins，抽取 app.ts
```

## 2026-05-18 14:30:00

### 修复 macOS 打包应用启动崩溃（launcher SIGSEGV / EnvMap.copy）

- 根因：对 `Contents/MacOS/launcher` 或整包 `.app` 执行 `codesign` 会使 Zig launcher 在 `process.EnvMap.copy` 时段错误
- 更新 `scripts/electrobun-macos-bundle.ts`：仅 ad-hoc 签名辅助二进制（bun、dylib 等），**禁止**签名 launcher 与整包
- 构建后自动检测 launcher 签名状态，若被误签则 `codesign --remove-signature` 恢复

### commit message

```
fix: 禁止签名 launcher，修复 macOS 应用启动 EnvMap.copy 崩溃

- 仅签名 bun/dylib 等辅助二进制，launcher 保持未签名
- 构建钩子自动检测并移除 launcher 误签
```

## 2026-05-18 14:05:00

### 修复打包应用图标禁止符号、无法打开（未签名）

- 新增 `scripts/electrobun-macos-bundle.ts`：postBuild（dev）/ postWrap（stable）自动 ad-hoc 签名
- ~~签名顺序含 launcher~~（已废弃：签名 launcher 会导致启动崩溃）
- stable 仅在 postWrap 签名自解压安装包（postBuild 时二进制尚未齐全）

### commit message

```
fix: 本地构建自动 ad-hoc 签名，修复 macOS 未签名应用无法打开

- dev/stable 构建钩子注入签名与中文 CFBundleDisplayName
```

## 2026-05-18 13:45:00

### 修复 build:stable 因中文应用名导致 Bun.Archive 失败

- `app.name` 改为 ASCII `TianJingYangCunZuPu`（Bun.Archive 不支持 tar 路径含中文，会报 `ArchiveHeaderError`）
- 新增 `scripts/electrobun-post-build.ts`：postBuild 写入 `CFBundleDisplayName=天井洋村族谱`（Dock/Finder 仍显示中文）
- `release.generatePatch: false`：本地无 `baseUrl` 时跳过增量 patch
- 新增 `build:stable` 脚本；stable 产物：`artifacts/stable-macos-x64-*.dmg`、`.tar.zst`、`update.json`

### commit message

```
fix: 修复 stable 构建 Bun.Archive 中文路径错误

- app.name 使用 ASCII，postBuild 注入中文 CFBundleDisplayName
- 本地 stable 构建禁用 generatePatch
```

## 2026-05-18 13:37:00

### 修复 electrobun build 因图标集无效导致构建失败

- 修复 `icon.iconset`：补全缺失的 `icon_32x32@2x.png`（64×64），将 `icon_512x512@2x.png` 调整为 1024×1024，并用 `sips` 统一各尺寸 PNG
- 说明：`electrobun build` 默认 `--env=dev`，产物为 `build/dev-macos-x64/天井洋村族谱-dev.app`，不会生成 `artifacts/` 或 DMG（DMG 需 `--env=stable|canary`）

### commit message

```
fix: 修复 macOS icon.iconset 无效导致 electrobun build 失败

- 补全 icon_32x32@2x 并修正 1024 图标尺寸
- dev 构建产物输出至 build/dev-macos-x64/*.app
```

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
