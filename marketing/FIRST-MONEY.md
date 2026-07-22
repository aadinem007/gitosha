# FIRST MONEY — today's only playbook

Brand: **Gitosha** — Know what to build. Then ship it.  
Live site: **https://gitosha.vercel.app**  
Checkout: **https://gitosha.vercel.app/pricing**

This file beats every other marketing doc today. Do the gates, then sell.
Do not open Reddit until Live money can hit your bank.

---

## Exact product to sell first

**Sell a one-time payment — not a Vault subscription.**

| Priority | Product | Price | Why first |
|---|---|---|---|
| **1 (today)** | **Foundry Solo** | **₹9,999** one-time | No Razorpay plan IDs. Checkout works once Live keys + webhook are live. Highest ₹ per close. |
| **1b** | **Launch Bundle** | **₹14,999** one-time | Same path. Solo + 12 months Operator. Pitch if they want research + kit. |
| Later | Vault Operator | ₹999/mo | Needs Live subscription **plans** created (`npm run setup-razorpay`) after Live keys. |

**Recommendation:** message for **Foundry Solo ₹9,999**. Offer Bundle only if they ask for research + scaffold together.

---

## Gate 0 — human-only (do this BEFORE any DM)

Real ₹ cannot land on test keys.

1. Open `marketing/RAZORPAY-LIVE-5MIN.md`
2. Finish Live KYC → Live API keys → Vercel env → webhook → Redeploy
3. Confirm webhook URL exactly:

```
https://gitosha.vercel.app/api/razorpay/webhook
```

Events: `payment.captured`, `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`

4. Self-buy Foundry Solo once with ₹1 test? No — use a real small Live payment or Razorpay Live payment test flow, then refund if needed. Prefer: ask one warm contact to buy, you refund if anything breaks.

When Live is green, go to Action 1.

---

## Action 1 — message 10 warm contacts (fastest ₹)

**Who (pick 10, not strangers):**

1. College / school friends who talked about startups  
2. Discord / college WhatsApp people building side projects  
3. Anyone who asked you “what should I build?”  
4. Freelancers / studio friends who rebuild SaaS for clients  
5. Founders you already know personally (not cold LinkedIn)

**Rule:** personal first line (“remember when you said…”) + one paste below.  
Send 10 today. Stop after 10. Follow up once tomorrow if silent.

### Message A — WhatsApp (default — Foundry Solo)

```
Bhai — short ask, no spam.

I shipped Gitosha. Production Next.js + Razorpay SaaS starter (Foundry Solo) is live — ₹9,999 one-time, zip after payment.

Checkout: https://gitosha.vercel.app/pricing

If you're about to rebuild auth + billing again, this saves weeks. If not, ignore. If you know one person shipping right now, forward this.
```

### Message B — WhatsApp (Bundle if they want ideas + kit)

```
Yaar — I built Gitosha: honest scored SaaS ideas + a ship-ready Foundry kit.

Launch Bundle is ₹14,999 one-time (Foundry Solo + 12 months Vault):
https://gitosha.vercel.app/pricing

Free scoreboard if you just want to browse: https://gitosha.vercel.app
No pressure — only if you're actually building this month.
```

### Message C — X / Instagram DM

```
Hey — built Gitosha (idea scoring + Next.js/Razorpay kit). Foundry Solo ₹9,999 one-time:

https://gitosha.vercel.app/pricing

If you're shipping this month and don't want to rewire billing, worth 2 mins. Else ignore.
```

### Message D — follow-up (24h later, one time)

```
Quick bump — checkout still live if useful: https://gitosha.vercel.app/pricing
Foundry Solo ₹9,999. Happy to walk you through the zip after payment.
```

---

## Action 2 — only after 10 DMs are sent

Paste Indie Hackers / Reddit / X from `marketing/launch-posts.md` or `marketing/TODAY-MAKE-MONEY.md`.  
Warm DMs print money faster than public posts today.

---

## After they pay — what you send them

Checkout shows the license key on screen. Then paste:

```
Payment received. Two links:

1) Download Foundry zip: https://gitosha.vercel.app/license
   (same email + license key from the success screen)

2) Vault (magic link): https://gitosha.vercel.app/login
   then open https://gitosha.vercel.app/vault

Stuck? Reply with a screenshot — same-day unblock.
```

**Foundry Solo / Bundle:** zip via `/license`. Vault access is unlocked by webhook fulfillment.  
**Vault-only (later):** magic link login → `/vault`. No zip.

---

## Links cheat-sheet

| What | URL |
|---|---|
| Home | https://gitosha.vercel.app |
| Pricing / checkout | https://gitosha.vercel.app/pricing |
| License download | https://gitosha.vercel.app/license |
| Login | https://gitosha.vercel.app/login |
| Vault | https://gitosha.vercel.app/vault |
| Webhook (Razorpay dashboard) | https://gitosha.vercel.app/api/razorpay/webhook |
| Live keys guide | `marketing/RAZORPAY-LIVE-5MIN.md` |

---

## Order for today (do not rearrange)

1. Finish Live Razorpay (`RAZORPAY-LIVE-5MIN.md`)  
2. Redeploy Vercel  
3. Send 10 warm messages (Message A)  
4. Sit on replies — help every buyer through `/license`  
5. Only then post publicly  

First sale target: **one Foundry Solo at ₹9,999**. That is first money.
