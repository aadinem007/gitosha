# Client handoff checklist (Agency)

Use this when delivering a product built on Foundry to a client.

## Before go-live
- [ ] Production env vars set (Supabase, Razorpay Live, DATABASE_URL, SITE_URL)
- [ ] Auth redirect URLs match production domain
- [ ] Razorpay webhook pointed at production `/api/razorpay/webhook`
- [ ] Test one real small payment (or Live test) end-to-end
- [ ] Pricing copy and brand marks are client white-label (no Shipyard)
- [ ] Privacy / Terms links on client site if they collect data

## Access transfer
- [ ] Client owns the Vercel / hosting account (or invited as owner)
- [ ] Client owns Supabase project
- [ ] Client owns Razorpay merchant (or settlement account clarified)
- [ ] Secrets shared via password manager — not email/WhatsApp plain text
- [ ] Repo access transferred or mirrored to client GitHub org

## Docs for client
- [ ] How to change prices (`src/lib/pricing.ts`)
- [ ] How to deploy
- [ ] Who to contact for hosting emergencies

## Sign-off
Client name: __________  
Date: __________  
Accepted: __________
