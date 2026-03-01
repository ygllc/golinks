import Bun from 'bun';
// Bun automatically parses this as a JS object at compile/run time
import shortcuts from './shortcuts.toml'; 

/**
 * Maps the TOML structure into a flat Map for high-speed lookups.
 * This handles both the full paths (mymileage/github) and shorthands (mm/gh).
 */
function loadLinks(): Map<string, string> {
  const finalMap = new Map<string, string>();
  const keyToUrl = new Map<string, string>();
  
  const data = shortcuts as any;

  // Pass 1: Destinations (Links section)
// Pass 1: Destinations (Links section)
if (data.Links) {
  for (const section of Object.values(data.Links)) {
    for (const [path, entry] of Object.entries(section as any) as Array<[string, any]>) {
      if (entry.link) {
        // Ensure the link starts with http or https
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

  // Pass 2: Aliases (Keys section)
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

// Initialize the links map
let links = loadLinks();

Bun.serve({
  port: 80,
  hostname: "127.0.0.1",
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    // Standardize path: remove slashes and lowercase it
    const path = url.pathname.replace(/^\/|\/$/g, "").toLowerCase();

    // The 'reload' command now just re-runs the map logic
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

    return new Response(`<h1>Shortcut 'go/${path}' not found</h1>`, { 
      status: 404, 
      headers: { "Content-Type": "text/html" } 
    });
  },
});

console.log("⚡ Bun Go-Link server running at go/, use 'go/reload' refresh links from shortcuts.toml, and go/example for testing.");