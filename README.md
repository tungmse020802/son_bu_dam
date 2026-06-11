# son_bu_dam

## Deploy on Vercel

This project is configured for Vercel with:

- Vite React frontend built to `dist`
- Express API exposed through `api/[...path].ts`
- JSON-file storage instead of an external database
- SPA fallback configured in `vercel.json`

Use these Vercel project settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Required environment variables:

```env
SESSION_SECRET=replace-with-a-long-random-production-secret
ADMIN_EMAILS=admin@example.com
APP_BASE_URL=https://your-vercel-domain.vercel.app
PAYOS_MOCK=true
```

The server stores local development data in `data/db.json`. On Vercel it uses `/tmp/svam-db.json`, which is temporary serverless storage and can be reset by redeploys or cold starts. This is suitable for a free demo, not durable production data.

Dashboard access requires an authenticated user whose email is listed in `ADMIN_EMAILS`.

For real PayOS payments, set:

```env
PAYOS_MOCK=false
PAYOS_CLIENT_ID=...
PAYOS_API_KEY=...
PAYOS_CHECKSUM_KEY=...
PAYOS_RETURN_URL=https://your-vercel-domain.vercel.app/checkout/success
PAYOS_CANCEL_URL=https://your-vercel-domain.vercel.app/checkout/cancel
PAYOS_WEBHOOK_URL=https://your-vercel-domain.vercel.app/api/payments/payos/webhook
```

Leave `VITE_API_BASE_URL` unset when frontend and API are deployed in the same Vercel project.
