# ─── PERCEPTA Production Dockerfile ──────────────────────────────────────────
# Smart India Hackathon 2026 | SIH26171 | ISRO
# On-Device Visual Perception for Light-weight Browser Agents
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-slim

# Install system deps for Playwright Chromium
RUN apt-get update && apt-get install -y \
    wget curl gnupg ca-certificates \
    libglib2.0-0 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
    libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 \
    libxfixes3 libxrandr2 libgbm1 libasound2 \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ── Install backend dependencies ──────────────────────────────────────────────
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# ── Install and build frontend ─────────────────────────────────────────────────
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build
# Output: frontend/dist/

# ── Copy rest of source ────────────────────────────────────────────────────────
COPY backend/ ./backend/
COPY browser/ ./browser/
COPY vision/ ./vision/
COPY benchmark/ ./benchmark/
COPY demo-site/ ./demo-site/

# ── Install Playwright Chromium (CPU headless) ─────────────────────────────────
RUN cd backend && npx playwright install chromium --with-deps

# ── Environment ───────────────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Single entrypoint — backend serves the built frontend + all APIs
CMD ["node", "backend/server.js"]
