// Shared CSS for every locale — extracted verbatim from the original
// hand-authored site/index.html, plus a small addition for the language
// switcher. Translators never touch this file; only content/i18n/*.mjs
// changes per locale.
export const PAGE_CSS = `
:root{
  --paper:#FAFAF7; --ink:#14181D; --muted:#5B6470; --rule:#D8DAD2;
  --doc-blue:#1B4FA0; --alert:#C63D1D; --safe:#1E7A46; --warn:#8A6D1F;
  --mono:ui-monospace,"SF Mono","Cascadia Mono",Menlo,Consolas,monospace;
  --serif:Georgia,"Times New Roman",serif;
  --sans:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{--paper:#12151A; --ink:#E8E8E2; --muted:#9BA3AD; --rule:#2A2F37; --doc-blue:#6E9FE8; --alert:#E86A47; --safe:#4CAF7A; --warn:#C9A94E;}
}
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}
body{background:var(--paper);color:var(--ink);font-family:var(--sans);font-size:17px;line-height:1.65;-webkit-font-smoothing:antialiased;overflow-x:clip}
a{color:var(--doc-blue);text-decoration-thickness:1px;text-underline-offset:2px}
a:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--doc-blue);outline-offset:2px}
.wrap{max-width:720px;margin:0 auto;padding:0 20px}
.wrap-wide{max-width:960px;margin:0 auto;padding:0 20px}

/* document header */
.dochead{border-bottom:2px solid var(--ink);padding:14px 0;font-family:var(--mono);font-size:12px;letter-spacing:.04em}
.dochead .wrap-wide{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.dochead .stamp{color:var(--muted)}
.dochead strong{font-weight:700}

/* language switcher */
.langswitch{font-family:var(--mono);font-size:12px;letter-spacing:.02em;display:flex;gap:10px;flex-wrap:wrap}
.langswitch a{text-decoration:none;border-bottom:1px solid transparent}
.langswitch a:hover{border-bottom-color:currentColor}
.langswitch span[aria-current]{font-weight:700;color:var(--ink)}

/* hero */
.hero{padding:72px 0 56px;border-bottom:1px solid var(--rule)}
.eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--doc-blue);margin-bottom:18px}
h1{font-family:var(--serif);font-weight:700;font-size:clamp(34px,6vw,54px);line-height:1.12;letter-spacing:-.01em;max-width:17ch}
.hero .sub{margin-top:22px;font-size:19px;color:var(--muted);max-width:56ch}
.hero .sub strong{color:var(--ink)}

/* the roll-call ledger — signature element */
.ledger{margin-top:44px;border:1px solid var(--ink);padding:22px 24px;max-width:640px}
.ledger .row{display:flex;justify-content:space-between;align-items:baseline;font-family:var(--mono);font-size:13px;flex-wrap:wrap;column-gap:12px}
.ledger .row + .row{margin-top:6px}
.ledger .n{font-size:28px;font-weight:700}
.ledger .n.alert{color:var(--alert)}
.bar{position:relative;height:14px;background:transparent;border:1px solid var(--ink);margin:16px 0 8px}
.bar .fill{position:absolute;inset:0;width:calc(314/720*100%);background:var(--ink);animation:tally 1.4s cubic-bezier(.2,.7,.2,1)}
@keyframes tally{from{width:0}}
.bar .threshold{position:absolute;top:-7px;bottom:-7px;left:calc(361/720*100%);width:0;border-left:2px dashed var(--alert)}
.bar .threshold::after{content:"361 needed";position:absolute;top:-20px;left:6px;font-family:var(--mono);font-size:11px;color:var(--alert);white-space:nowrap}
.ledger .gap{font-family:var(--mono);font-size:12px;color:var(--muted)}
.ledger .gap strong{color:var(--alert)}
@media (prefers-reduced-motion: reduce){.bar .fill{animation:none}}

/* sections */
section{padding:56px 0;border-bottom:1px solid var(--rule)}
.seclabel{font-family:var(--mono);font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
h2{font-family:var(--serif);font-size:clamp(24px,3.6vw,32px);line-height:1.2;margin-bottom:20px;max-width:24ch}
p + p{margin-top:14px}
.note{font-size:14px;color:var(--muted);border-left:3px solid var(--rule);padding-left:14px;margin-top:18px}
.mono{font-family:var(--mono)}

/* timeline */
.timeline{list-style:none;margin-top:8px}
.timeline li{display:grid;grid-template-columns:118px 1fr;gap:16px;padding:13px 0;border-top:1px solid var(--rule)}
.timeline .d{font-family:var(--mono);font-size:13px;color:var(--doc-blue);padding-top:2px;white-space:nowrap}
.timeline .d.next{color:var(--alert)}
.timeline p{font-size:15.5px}
@media(max-width:540px){.timeline li{grid-template-columns:1fr;gap:2px}}

/* status table */
table{width:100%;border-collapse:collapse;font-size:15px;margin-top:10px}
th{font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;text-align:left;color:var(--muted);padding:10px 12px 8px;border-bottom:2px solid var(--ink)}
td{padding:11px 12px;border-bottom:1px solid var(--rule);vertical-align:top}
td:first-child{font-weight:600;white-space:nowrap}
.chip{display:inline-block;font-family:var(--mono);font-size:11px;letter-spacing:.05em;padding:3px 8px;border:1px solid;white-space:nowrap}
.chip.scan{color:var(--alert);border-color:var(--alert)}
.chip.exempt{color:var(--safe);border-color:var(--safe)}
.chip.exit{color:var(--doc-blue);border-color:var(--doc-blue)}
.chip.watch{color:var(--warn);border-color:var(--warn)}
.tscroll{overflow-x:auto}
.verified{font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:10px}

/* works vs theater */
.verdict td:nth-child(2){font-family:var(--mono);font-size:12px;white-space:nowrap}
.v-works{color:var(--safe);font-weight:700}
.v-partial{color:var(--warn);font-weight:700}
.v-theater{color:var(--alert);font-weight:700}

/* ladder */
.ladder{list-style:none;counter-reset:step;margin-top:6px}
.ladder li{counter-increment:step;display:grid;grid-template-columns:56px 1fr;gap:18px;padding:20px 0;border-top:1px solid var(--rule)}
.ladder li::before{content:counter(step,decimal-leading-zero);font-family:var(--mono);font-size:24px;font-weight:700;color:var(--doc-blue)}
.ladder h3{font-size:17px;margin-bottom:4px}
.ladder .effort{font-family:var(--mono);font-size:12px;color:var(--muted);margin-bottom:8px}
.ladder p{font-size:15.5px}
@media(max-width:540px){.ladder li{grid-template-columns:36px 1fr;gap:12px}.ladder li::before{font-size:18px}}

/* subscribe */
.subscribe{background:var(--ink);color:var(--paper)}
.subscribe h2,.subscribe .seclabel{color:inherit}
.subscribe .seclabel{color:color-mix(in srgb,var(--paper) 60%,transparent)}
.subscribe p{max-width:52ch}
.subform{display:flex;gap:10px;margin-top:24px;max-width:480px;flex-wrap:wrap}
.subform input{flex:1;min-width:220px;padding:12px 14px;font-size:16px;font-family:var(--mono);background:transparent;border:1px solid color-mix(in srgb,var(--paper) 50%,transparent);color:inherit}
.subform input::placeholder{color:color-mix(in srgb,var(--paper) 45%,transparent)}
.subform button{padding:12px 22px;font-size:15px;font-weight:700;background:var(--paper);color:var(--ink);border:none;cursor:pointer}
.subform button:hover{opacity:.9}
.submsg{font-family:var(--mono);font-size:13px;margin-top:12px;min-height:1.4em}

/* sources & footer */
.sources ol{padding-left:22px;font-size:14px;color:var(--muted)}
.sources li{margin-top:6px}
footer{padding:32px 0 48px;font-size:14px;color:var(--muted)}
footer .wrap-wide{display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}
`;
