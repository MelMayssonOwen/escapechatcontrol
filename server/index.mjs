/**
 * escapechatcontrol.com — static site + subscribe endpoint.
 *
 * POST /api/subscribe {email} → Resend Audience contact. The audience is the
 * whole product at this stage (see docs/superpowers/specs/): one email when a
 * tracker status changes or the September CSAR fight moves. No other use.
 *
 * Privacy posture is part of the brand: no analytics, no raw email addresses
 * in logs, static files served from an in-memory cache built at boot (which
 * also means no runtime filesystem access and no symlink surprises).
 */
import { createServer } from "node:http";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join, extname, relative } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "site");
const PORT = Number(process.env.PORT || 80);
// True when deployed behind Coolify's reverse proxy (compose sets it); only
// then is x-forwarded-for trustworthy. Locally, use the socket address.
const TRUST_PROXY = process.env.TRUST_PROXY === "1";

const resendApiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
  ".webmanifest": "application/manifest+json",
};

// Boot-time static cache: the whole site is a few hundred KB.
const FILES = new Map();
(function load(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) { load(full); continue; }
    if (!st.isFile()) continue;
    const rel = "/" + relative(SITE, full).split("\\").join("/");
    FILES.set(rel, { body: readFileSync(full), type: MIME[extname(full)] || "application/octet-stream" });
  }
})(SITE);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Per-IP throttle + a global hourly cap: the endpoint creates contacts in a
// third-party service, so neither one client nor a botnet gets to hammer it.
const hits = new Map();
let globalWindowStart = Date.now();
let globalCount = 0;
const GLOBAL_PER_HOUR = 120;

function clientIp(req) {
  if (TRUST_PROXY) {
    const xff = req.headers["x-forwarded-for"];
    if (xff) {
      // The rightmost entry is the one our own proxy appended; everything
      // left of it is client-supplied and spoofable.
      const parts = xff.split(",").map((s) => s.trim()).filter(Boolean);
      if (parts.length) return parts[parts.length - 1];
    }
  }
  return req.socket.remoteAddress || "?";
}

function throttled(ip) {
  const now = Date.now();
  if (now - globalWindowStart > 3_600_000) { globalWindowStart = now; globalCount = 0; }
  if (globalCount >= GLOBAL_PER_HOUR) return true;
  const list = (hits.get(ip) || []).filter((t) => t > now - 60_000);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear();
  return list.length > 5;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "POST" && url.pathname === "/api/subscribe") {
    if (throttled(clientIp(req))) return send(res, 429, { error: "Too many attempts. Wait a minute." });

    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 4096) req.destroy(); });
    req.on("end", async () => {
      let email, honeypot;
      try {
        const parsed = JSON.parse(raw);
        email = parsed?.email?.trim()?.toLowerCase();
        honeypot = parsed?.website;
      } catch { /* fall through */ }
      // Bots fill the hidden field; tell them it worked and do nothing.
      if (honeypot) return send(res, 200, { ok: true });
      if (!email || !EMAIL_RE.test(email) || email.length > 254) {
        return send(res, 400, { error: "That does not look like an email address." });
      }
      if (!resend || !audienceId) {
        console.error("[subscribe] misconfigured: missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
        return send(res, 500, { error: "Subscriptions are down right now. Try again later." });
      }
      try {
        globalCount++;
        const { error } = await resend.contacts.create({ email, audienceId, unsubscribed: false });
        // Resend returns an error for duplicates on some plans; a repeat
        // subscriber is a success from the visitor's point of view.
        if (error && !/already|exists|duplicate/i.test(error.message || "")) {
          console.error("[subscribe] resend error:", error);
          return send(res, 502, { error: "Could not subscribe you. Try again in a moment." });
        }
        console.log("[subscribe] ok (+1 contact)");
        return send(res, 200, { ok: true });
      } catch (err) {
        console.error("[subscribe] error:", err);
        return send(res, 502, { error: "Could not subscribe you. Try again in a moment." });
      }
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "method not allowed" });

  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  const file = FILES.get(path);
  if (!file) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("not found");
  }
  res.writeHead(200, {
    "Content-Type": file.type,
    "Cache-Control": path === "/index.html" ? "no-cache" : "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  res.end(req.method === "HEAD" ? undefined : file.body);
});

server.listen(PORT, () => console.log(`escapechatcontrol listening on :${PORT} (${FILES.size} files cached)`));
