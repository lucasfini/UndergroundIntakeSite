# Deployment Guide

## Database Setup

### Local Development (PostgreSQL with Docker)

1. **Start PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

2. **Update your `.env` file:**
   ```env
   DATABASE_URL="postgresql://underground:devpassword@localhost:5432/underground_intake"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Production Deployment

1. **Update Prisma schema** (should already be PostgreSQL):
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **Set production environment variables on your server:**
   ```env
   DATABASE_URL="postgresql://username:password@your-server:5432/your_database"
   ```

3. **Run migrations on production:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Build and deploy:**
   ```bash
   npm run build
   npm start
   ```

---

## Current Database Schema

Your database is configured for **PostgreSQL** in production.

### If You Want to Keep Using SQLite Locally:

**Pros:**
- ✅ No Docker required
- ✅ Faster setup
- ✅ Database file in your project

**Cons:**
- ❌ Different behavior than production
- ❌ Must remember to switch provider before deploying
- ❌ Some SQL differences between SQLite and PostgreSQL

### Switching Between SQLite and PostgreSQL

**For Local SQLite:**
1. Change `schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env`:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. Run: `npx prisma migrate dev`

**For Production PostgreSQL:**
1. Change `schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Update `.env` (or use production env vars):
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

3. Run: `npx prisma migrate deploy`

---

## Recommended Approach

**Use PostgreSQL locally** (with Docker) to match your production environment. This prevents deployment surprises.

### Quick Start with Docker:

```bash
# Start database
docker-compose up -d

# Check if running
docker ps

# Stop database
docker-compose down

# Stop and remove data (reset database)
docker-compose down -v
```

### Managing Multiple Environments:

Create these files:
- `.env` - Your current local environment (git-ignored)
- `.env.local` - Local development template
- `.env.production` - Production environment variables (on server only)
- `.env.example` - Public template for other developers

---

## Pre-Deployment Checklist

Before deploying to your server:

- [ ] Prisma schema uses `provider = "postgresql"`
- [ ] Production `DATABASE_URL` is set correctly on server
- [ ] All migrations are committed to git
- [ ] Run `npx prisma migrate deploy` on production
- [ ] Test database connection on production
- [ ] Environment variables are set on production server
- [ ] Azure AD redirect URIs include production URL

---

## Troubleshooting

### Error: "URL must start with postgresql://"
- Check that your Prisma schema has `provider = "postgresql"`
- Verify `DATABASE_URL` in your environment variables

### Error: "Can't reach database server"
- If using Docker: Check `docker ps` to see if PostgreSQL is running
- If production: Check connection string, firewall rules, and database credentials

### Migrations not applying
- Run `npx prisma migrate deploy` (production)
- Run `npx prisma migrate dev` (local development)
