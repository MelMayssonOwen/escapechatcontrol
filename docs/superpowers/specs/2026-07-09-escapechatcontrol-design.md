# escapechatcontrol.com — design spec (2026-07-09)

## What

English-language, nonpartisan, fact-checked guide + living tracker for the EU Chat Control
news cycle. Launch this week while the July 9 vote is hot; built-in second cycle in
September 2026 when CSAR ("Chat Control 2.0") trilogue resumes.

Approved by Mel: domain escapechatcontrol.com · scope = guide + tracker + email capture ·
standalone brand, "built by Mel" footer credit linking his X.

## Positioning (the moat)

Every competitor is either advocacy with no how-to (fightchatcontrol.eu, stopscanningme.eu),
stale generic how-to (privacyguides article, securechatguide), or practical-but-French and
politically coded (exitchatcontrol.org). We win on: **current + honest + practical + English**.

Hard rule: NO false claims. The site says what actually passed (voluntary CC 1.0 extension,
314-vs-361 rejection failure, E2EE carve-out amendment, CC 2.0 still in trilogue, September
next fight). The "claims we must not make" list from research is binding for all copy.
Credibility anchors cited: EFF, EDRi, Patrick Breyer, Signal, The Register, netzpolitik,
Euronews, Consilium. Never co-brand with exitchatcontrol.org/Aurea.

## Site structure (single page + one API endpoint)

1. **Hero** — "314 MEPs voted to kill Chat Control. It passed anyway." Sub: what that
   actually means, and how to get your chats off the scanned internet. Last-updated stamp.
2. **What just happened** — 60-second timeline: Mar 2026 rejection → derogation lapses Apr →
   Council revival Jul 2 → Rule 170 urgency trick Jul 7 (331–304) → Jul 9 vote (314 reject,
   needed 361) → E2EE carve-out passed (369) → extended to Apr 2028 → CC 2.0 resumes Sept.
3. **Who scans? (tracker)** — the product seed. Status table: Scanning today (Gmail,
   Facebook Messenger, Instagram DM, Snapchat, Skype, iCloud Mail, Xbox) / Exempt-E2EE
   (WhatsApp, Signal, iMessage) / Would exit rather than comply (Signal, Threema stance,
   Tuta suing) / date-stamped, updated weekly.
4. **What works vs. what's theater** — the honest table nobody else has. VPN/Tor/sideloading/
   GrapheneOS = theater *for client-side scanning specifically* (scanning ships inside the
   app, pre-encryption); switching provider = what works.
5. **The Escape Ladder** — 5 steps, honest effort estimates: (1) minutes: leave the services
   scanning today → Signal + Proton/Tuta; (2) afternoon: SimpleX, consistency;
   (3) weekend: deGoogle/GrapheneOS (labelled as different-threat, not CSS);
   (4) ongoing: metadata discipline; (5) weeks: self-host Matrix/XMPP.
6. **Email capture** — "One email when an app's status changes, and before the September
   vote. Nothing else." POST /api/subscribe → Resend Audience (existing infra pattern).
7. **Sources + footer** — all primary links, nonpartisan statement, "built by
   [Mel](x.com/…)" credit, GitHub-style last-updated.

## Tech

Static HTML/CSS/vanilla JS + tiny Node server (subscribe endpoint + static serving),
mirroring the sheetfolk-storefront pattern (Dockerfile, port 80, Coolify deploy, env:
RESEND_API_KEY, RESEND_AUDIENCE_ID, OPS_ALERT_EMAIL). No framework, no build step.
OG image + meta for X link cards. Site must read fast, cite everything, look serious
(not activist-meme).

## X article

Long-form post draft (Mel approves before posting; timetopost personal-org check first).
Hook: the 314-vs-361 near-miss + honest correction of the panic + "your Gmail is already
scanned, your Signal isn't — yet" + ladder + link. No em/en dashes per house style.

## Monetization (later, not launch)

Disclosed Proton (40% annual) + Tuta (25% recurring) affiliate links inside tracker rows;
Signal/Mullvad stay unpaid credibility anchors. $9 family-migration PDF after traffic.
Embeddable status badge for backlinks (GTM playbook: steal backlinks).

## Launch checklist

Register domain (Mel) → build → Codex cold review (standing pref) → deploy on Coolify →
X article + HN ("Show HN" tool-framing, not activism) + r/privacy (human gate).
