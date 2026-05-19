## 2026-05-19 15:00:00

### 限制管理弹窗最大高度与上下间距

- `views/genealogy.twig`：使用 `--manage-modal-gap: 24px` 统一遮罩内边距；弹窗 `max-height` 为 `100dvh/100vh` 减去双倍间距；面板与表格区域 `min-height: 0` + 内部滚动，避免超出视口

### commit message

```
style: 限制族谱管理弹窗高度并统一上下间距
```

## 2026-05-19 14:30:00

### 管理弹窗改为屏幕居中显示

- `views/genealogy.twig`：管理面板由右侧侧滑改为遮罩层 flex 居中；弹窗最大宽度 920px、圆角与缩放淡入动画；点击遮罩关闭，点击面板内容不关闭

### commit message

```
style: 族谱管理弹窗改为屏幕居中显示
```

## 2026-05-19 12:00:00

### 族谱成员增删改查管理

- 后端：扩展 `GenealogyService` 与 `/api/genealogy` 的 POST、PUT `/:id`、DELETE `/:id`；校验父辈存在、防环、有子辈禁止删除
- 校验：在 `genealogy.schema.ts` 定义 insert/modify/id 模型并注册到 `validation-schema.ts`
- 前端：族谱页搜索栏「清空」旁增加「管理」按钮，右侧侧滑面板支持列表筛选、新增、编辑、删除；保存/删除后 `refreshTree` 同步刷新 D3 族谱树

### commit message

```
feat: 族谱成员增删改查管理面板

- 补齐族谱 REST API 与父子关系业务校验
- 族谱页侧滑管理面板，操作后自动刷新关系图
```

## 2026-05-18 21:35:00

### 修复内置/种子 SQLite 已有表时 Drizzle 迁移报错

- 根因：`migrate()` 在 `__drizzle_migrations` 为空时会执行 `0000_init_genealogy.sql`；用户数据目录中的库若由 `Resources/app/data/db.sqlite3` 复制而来且已有 `genealogy` 但未写入迁移记录，会触发 `table already exists`
- `drizzle-sqlite/0000_init_genealogy.sql`：改为 `CREATE TABLE IF NOT EXISTS`，与已有种子库兼容，迁移仍可正常插入 journal

### commit message

```
fix: 初始迁移对已有 genealogy 表使用 IF NOT EXISTS

- 兼容 Electrobun 内置库种子到 userData 后补跑迁移的场景
```

## 2026-05-18 19:00:00

### 修复 Windows 上 `electrobun dev --watch` 监视路径 ENOENT

- 根因：`build.watch` 使用 `dir/**/*` 等形式时，Electrobun 会对字面路径 `dir\**` 调用 `fs.watch`，该路径在磁盘上不存在，在 Windows 上报 `ENOENT`
- `electrobun.config.ts`：改为只监视真实目录根路径（`views`、`public`、`config`、`drizzle-sqlite`、`.data`、`src`）
- `package.json`：新增 `predev`，在 `dev` 前创建 `.data`，避免克隆仓库后尚无该目录时监视失败

### commit message

```
fix: 修复 Windows 上 electrobun --watch 对 .data/** 的 ENOENT

- watch 改为目录根路径，避免 fs.watch 字面路径 **
- predev 确保 .data 目录存在
```

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

- 新增 `src/utils/app-path.ts`：通过 `Resources/app/config` 是否存在判断应用包环境，解析 `public`、`views` 路径
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
