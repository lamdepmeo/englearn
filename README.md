<h1 align="center">TalkBoostAI</h1>

English | [简体中文](./README_CN.md)

## 🌟 Introduction

TalkBoostAI is a web application that utilizes AI to help you improve your English speaking and conversation skills. It allows you to freely experience chatGPT's AI model.

## ✨ Demo

For the best demo experience, try [our site](https://talk.incircles.xyz/) directly :)

## 🚀 Features

- 💬 Converse with AI naturally, communicate without stress
- 🎙️ Voice input and output for immersive practice
- ⚡️ Freely experience chatGPT's AI model

## 👨‍🚀 Development

### Setup .env

In the project directory, create a file called .env.

### Setup database

https://supabase.com/partners/integrations/prisma

### Running the Application

```
pnpm install
pnpm dev
```

Open http://localhost:3000 to see the app.

## ▲ Deploy to Vercel

### 1) Prepare required environment variables

Create your local env from `.env.example`, then add the same values in Vercel Project Settings → Environment Variables:

- `JWT_SECRET`
- `DATABASE_URL`
- `DATABASE_DIRECT_URL`
- `OPENAI_API_KEY` (if using OpenAI)
- `OPENAI_API_PROXY` (optional)
- `AZURE_SECRET` / `AZURE_REGION` (if using Azure Speech)

Where to get these:

- `JWT_SECRET`: generate your own random secret (example: `openssl rand -base64 32`).
- `DATABASE_URL` / `DATABASE_DIRECT_URL`:
  - If using Vercel Postgres, copy from Project → Storage → Postgres → `.env` snippet.
  - If using Supabase/Neon/Railway, copy the connection string from that provider dashboard.
  - Use `?sslmode=require` for production connections.

### 2) Provision a PostgreSQL database

This project uses Prisma + Postgres. Make sure production DB is reachable from Vercel and TLS/SSL is enabled.

### 3) Configure Build/Install in Vercel

- Install Command: `pnpm install --frozen-lockfile`
- Build Command: `pnpm build`
- Output setting: keep default for Next.js
- Node.js Version: `18.x`

> `pnpm build` already runs `prisma generate && next build`.

If you see `ERR_INVALID_THIS` during `pnpm install`, make sure your project is using the pinned package manager/runtime from `package.json` (`pnpm@8.15.8` + Node `18.x`) and re-deploy without cache.

### 4) Run database migrations before/at first release

Recommended in CI/CD or a one-time release step:

```bash
pnpm prisma migrate deploy
```

### 5) Domain and runtime checks

- Add production domain in Vercel.
- Verify auth cookie behavior in production (HTTPS + `secure` cookie).
- Smoke test critical flows:
  - register/login/logout
  - AI chat
  - speech input/output

### 6) Security checklist before go-live

- Do not expose secrets to client bundles.
- Rotate all secrets after first deployment if they were shared in development.
- Enable Vercel monitoring/logging and set alerts for 5xx spikes.
