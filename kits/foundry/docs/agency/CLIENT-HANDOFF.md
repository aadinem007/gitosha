# Client handoff checklist (Agency)

Use this when delivering a product built on Foundry to a client.

## Before go-live
- [ ] Production env vars set (Supabase, Xflow, DATABASE_URL, SITE_URL)
- [ ] Auth redirect URLs match production domain
- [ ] Xflow webhook pointed at production `/api/xflow/webhook`
- [ ] Test one real small payment (or Live test) end-to-end
- [ ] Pricing copy and brand marks are client white-label (no Gitosha)
- [ ] Privacy / Terms links on client site if they collect data

## Access transfer
- [ ] Client owns the Vercel / hosting account (or invited as owner)
- [ ] Client owns Supabase project
- [ ] Client owns Xflow account (or settlement account clarified)
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
