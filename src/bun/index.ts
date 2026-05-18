/* eslint-disable node/prefer-global/process */
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { Database } from 'bun:sqlite'
import { BrowserWindow } from 'electrobun'
import { Elysia, t } from 'elysia'

const PORT = 8787
const HOST = '127.0.0.1' as const

const dataDir = join(process.cwd(), 'data')
mkdirSync(dataDir, { recursive: true })
const db = new Database(join(dataDir, 'demo.sqlite'), { create: true })

db.run(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`)

interface ItemRow { id: number, text: string, created_at: string }

function listItems(): ItemRow[] {
    return db.query('SELECT id, text, created_at FROM items ORDER BY id DESC').all() as ItemRow[]
}

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Elysia + SQLite</title>
  <style>
    :root { font-family: system-ui, sans-serif; background: #0f1419; color: #e7ecf3; }
    body { max-width: 520px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.25rem; font-weight: 600; }
    form { display: flex; gap: 0.5rem; margin: 1rem 0; }
    input { flex: 1; padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #2a3544; background: #1a2332; color: inherit; }
    button { padding: 0.5rem 1rem; border-radius: 8px; border: none; background: #3b82f6; color: #fff; font-weight: 500; cursor: pointer; }
    button:hover { background: #2563eb; }
    ul { list-style: none; padding: 0; margin: 0; }
    li { padding: 0.65rem 0; border-bottom: 1px solid #243044; font-size: 0.95rem; }
    small { color: #8b9cb3; display: block; margin-top: 0.25rem; font-size: 0.75rem; }
    .err { color: #f87171; font-size: 0.875rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <h1>Electrobun · Elysia · bun:sqlite</h1>
  <p>主进程内嵌本地 HTTP，WebView 与 API 同源。</p>
  <form id="f">
    <input name="text" placeholder="添加一条记录…" autocomplete="off" />
    <button type="submit">添加</button>
  </form>
  <p id="err" class="err" hidden></p>
  <ul id="list"></ul>
  <script>
    const list = document.getElementById("list");
    const err = document.getElementById("err");
    async function load() {
      err.hidden = true;
      const r = await fetch("/api/items");
      const data = await r.json();
      list.innerHTML = data.map(
        (i) => "<li>" + escapeHtml(i.text) + "<small>#" + i.id + " · " + i.created_at + "</small></li>"
      ).join("");
    }
    function escapeHtml(s) {
      return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }
    document.getElementById("f").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const text = (fd.get("text") || "").trim();
      if (!text) return;
      err.hidden = true;
      const r = await fetch("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) {
        err.textContent = "提交失败";
        err.hidden = false;
        return;
      }
      e.target.reset();
      load();
    });
    load();
  </script>
</body>
</html>`

new Elysia()
    .get('/', () => new Response(indexHtml, { headers: { 'content-type': 'text/html; charset=utf-8' } }))
    .get('/api/items', () => listItems())
    .post(
        '/api/items',
        ({ body }) => {
            db.run('INSERT INTO items (text) VALUES (?)', [body.text])
            return { items: listItems() }
        },
        { body: t.Object({ text: t.String({ minLength: 1 }) }) },
    )
    .listen({ port: PORT, hostname: HOST })

// eslint-disable-next-line no-new
new BrowserWindow({
    title: 'Elysia + SQLite 示例',
    frame: { x: 120, y: 120, width: 560, height: 720 },
    url: `http://${HOST}:${PORT}/`,
})
