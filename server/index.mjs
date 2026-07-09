/**
 * escapechatcontrol.com — static site + subscribe endpoint.
 *
 * POST /api/subscribe {email} → Resend Audience contact. The audience is the
 * whole product at this stage (see docs/superpowers/specs/): one email when a
 * tracker status changes or the September CSAR fight moves. No other use.
 */
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, join, extname, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";

const SITE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "site");
const PORT = Number(process.env.PORT || 80);

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Naive per-IP throttle: the endpoint creates contacts in a third-party
// service, so it must not be free to hammer.
const hits = new Map();
function throttled(ip) {
  const now = Date.now();
  const windowStart = now - 60_000;
  const list = (hits.get(ip) || []).filter((t) => t > windowStart);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 10_000) hits.clear();
  return list.length > 5;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "POST" && url.pathname === "/api/subscribe") {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "?";
    if (throttled(ip)) return send(res, 429, { error: "Too many attempts. Wait a minute." });

    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 4096) req.destroy(); });
    req.on("end", async () => {
      let email;
      try { email = JSON.parse(raw)?.email?.trim()?.toLowerCase(); } catch { /* fall through */ }
      if (!email || !EMAIL_RE.test(email) || email.length > 254) {
        return send(res, 400, { error: "That does not look like an email address." });
      }
      if (!resend || !audienceId) {
        console.error("[subscribe] misconfigured: missing RESEND_API_KEY or RESEND_AUDIENCE_ID");
        return send(res, 500, { error: "Subscriptions are down right now. Try again later." });
      }
      try {
        const { error } = await resend.contacts.create({ email, audienceId, unsubscribed: false });
        // Resend returns an error for duplicates on some plans; a repeat
        // subscriber is a success from the visitor's point of view.
        if (error && !/already|exists|duplicate/i.test(error.message || "")) {
          console.error("[subscribe] resend error:", error);
          return send(res, 502, { error: "Could not subscribe you. Try again in a moment." });
        }
        console.log(`[subscribe] ok: ${email}`);
        return send(res, 200, { ok: true });
      } catch (err) {
        console.error("[subscribe] error:", err);
        return send(res, 502, { error: "Could not subscribe you. Try again in a moment." });
      }
    });
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "method not allowed" });

  let path = normalize(url.pathname).replace(/^(\.\.[/\\])+/, "");
  if (path === "/" || path === "") path = "/index.html";
  const file = join(SITE, path);
  if (!file.startsWith(SITE) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("not found");
  }
  const type = MIME[extname(file)] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": path === "/index.html" ? "no-cache" : "public, max-age=86400",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  });
  res.end(req.method === "HEAD" ? undefined : readFileSync(file));
});

server.listen(PORT, () => console.log(`escapechatcontrol listening on :${PORT}`));
