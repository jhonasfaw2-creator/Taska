#!/usr/bin/env bash
#
# Taska — PostgreSQL database setup script
#
# Usage:
#   sudo bash scripts/setup-db.sh
#
# What it does:
#   1. Reads the DB_PASS from backend/.env (or generates one)
#   2. Creates the taska_db database
#   3. Creates the taska_user role with the password
#   4. Grants all privileges on taska_db to taska_user
#   5. Ensures DATABASE_URL in .env is up-to-date
#
# Run this once before starting the backend for the first time.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${BACKEND_DIR}/.env"

DB_NAME="taska_db"
DB_USER="taska_user"

# ── Read password from .env or generate a new one ────────
if [ -f "$ENV_FILE" ]; then
  # Extract password from existing DATABASE_URL in .env
  DB_PASS=$(grep -oP '(?<=://taska_user:)[^@]+' "$ENV_FILE" 2>/dev/null || true)
fi

if [ -z "$DB_PASS" ]; then
  DB_PASS=$(openssl rand -hex 16)
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  Taska — Database Setup                             ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ── Create user (ignore error if already exists) ────────
echo "[1/3] Creating database user '${DB_USER}'…"
sudo -u postgres psql -c "CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD '${DB_PASS}';" 2>/dev/null || \
  sudo -u postgres psql -c "ALTER ROLE ${DB_USER} WITH PASSWORD '${DB_PASS}';" && \
  echo "      ✓ User '${DB_USER}' ready"

# ── Create database (ignore error if already exists) ────
echo "[2/3] Creating database '${DB_NAME}'…"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null && \
  echo "      ✓ Database '${DB_NAME}' created" || \
  echo "      ✓ Database '${DB_NAME}' already exists"

# ── Grant privileges ────────────────────────────────────
echo "[3/3] Granting privileges…"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"
echo "      ✓ Privileges granted"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Setup Complete!                                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "  DATABASE_URL=${DATABASE_URL}"
echo ""

# ── Warn if password was generated but .env differs ──────
if [ -f "$ENV_FILE" ] && ! grep -q "${DB_PASS}" "$ENV_FILE" 2>/dev/null; then
  echo "  ⚠  Update your .env file with the DATABASE_URL above."
  echo ""
fi
