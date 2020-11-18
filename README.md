# Couscous Web

Sister repository at [bapatchirag/dbd-fuse](https://github.com/bapatchirag/dbd-fuse)

## What

-   This is a webserver.
-   Its meant to act as one part of a filesystem that you can work with in your system
-   This has a centralized MySQL server
-   This has a sharded MongoDB server
-   Files go into MongoDB
-   Metadata goes into MySQL
-   There's users
-   There's groups

### TL;DR

Run it and mount it to use it as a standard filesystem.

## TOC

- [Couscous Web](#couscous-web)
  - [What](#what)
    - [TL;DR](#tldr)
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

Open [http://localhost:3000](http://localhost:3000) (or 8081 if using docker) with your browser to see the result.

# Docker Compose

Note: Docker tucks the web server away into `8081`

## .env config

| Environment Variable | Description               |
| -------------------- | ------------------------- |
| MYSQL_PASSWORD       | mysql `couscous` password |
| MYSQL_ROOT_PASSWORD  | mysql `root` password     |
| ACCESS_TOKEN_SECRET  | JWT access token secret   |

## Portmap

| Port  | Application   |
| ----- | ------------- |
| 8081  | next          |
| 3306  | mysql         |
| 27017 | mongos        |
| 27018 | mongodb cfg1  |
| 27027 | mongo shard 1 |
| 27028 | mongo shard 2 |
