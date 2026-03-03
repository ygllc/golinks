import Bun from 'bun';
import shortcuts from './shortcuts.toml';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function loadLinks(): Map<string, string> {
  const finalMap = new Map<string, string>();
  const keyToUrl = new Map<string, string>();
  
  const data = shortcuts as any;

  if (data.Links) {
    for (const section of Object.values(data.Links)) {
      for (const [path, entry] of Object.entries(section as any) as Array<[string, any]>) {
        if (entry.link) {
          let cleanLink = entry.link.trim();
          if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
            cleanLink = `https://${cleanLink}`;
          }

          finalMap.set(path.toLowerCase(), cleanLink);
          if (entry.key) keyToUrl.set(entry.key, cleanLink);
        }
      }
    }
  }

  if (data.Keys) {
    for (const section of Object.values(data.Keys)) {
      for (const [internalKey, alias] of Object.entries(section as any)) {
        const url = keyToUrl.get(internalKey);
        if (url && typeof alias === "string") {
          finalMap.set(alias.toLowerCase(), url);
        }
      }
    }
  }
  return finalMap;
}

function generate404Page(path: string, shortcutsList: Array<{ shortcut: string; url: string }>): string {
  const template = readFileSync(join(__dirname, '404.html'), 'utf-8');
  
  return template
    .replace('{{REQUESTED_PATH}}', path)
    .replace('{{SHORTCUTS_JSON}}', JSON.stringify(shortcutsList));
}

let links = loadLinks();

Bun.serve({
  port: 80,
  hostname: "127.0.0.1",
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/|\/$/g, "").toLowerCase();

    if (path === "reload") {
      links = loadLinks(); 
      return new Response("♻️ All Full-Paths and Aliases Refreshed!");
    }

    const target = links.get(path);
    if (target) {
      console.log(`🚀 Redirect: go/${path} -> ${target}`);
      return new Response(null, {
        status: 302,
        headers: { "Location": target },
      });
    }

    const shortcutsList = Array.from(links.entries()).map(([key, url]) => ({
      shortcut: key,
      url
    }));

    return new Response(generate404Page(path, shortcutsList), { 
      status: 404, 
      headers: { "Content-Type": "text/html" } 
    });
  },
});

console.log("⚡ Bun Go-Link server running at go/, use 'go/reload' refresh links from shortcuts.toml, and go/example for testing.");
