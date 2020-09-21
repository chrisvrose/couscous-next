# Couscous Web

## TOC
- [Couscous Web](#couscous-web)
  - [TOC](#toc)
  - [Getting Started](#getting-started)
- [Docker Compose](#docker-compose)
  - [.env config](#env-config)
  - [Portmap](#portmap)

## Getting Started
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

Development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Docker Compose

## .env config

|Var|Desc|
|---|----|
|MYSQL_PASSWORD|mysql `couscous` password|
|MYSQL_ROOT_PASSWORD|mysql `root` password|
|ACCESS_TOKEN_SECRET|JWT access token secret|
|`TBD`|`TBD`|


## Portmap

|Port|Application|
|---|---|
|8081|next|
|3306|mysql|
|27017|mongos|
|27018|mongodb cfg1|
