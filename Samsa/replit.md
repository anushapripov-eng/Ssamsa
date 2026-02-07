# replit.md

## Overview
This is a Node.js web application built with Express.js that serves as a mobile-first food delivery system with Telegram notification integration.

## User Preferences
- Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Framework
- **Express.js 4.x** serves as the web framework.
- The server runs on port 5000 and serves static files from the `dist` directory.
- Body parsing is handled via `body-parser`.
- CORS is enabled.

### Data Storage
- **File-based storage** using `orders.json` for order persistence.

### Notification System
- **Telegram Bot Integration** for order notifications.
- Uses environment variables:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID_1`
  - `TELEGRAM_CHAT_ID_2` (optional)

### API Endpoints
- `POST /api/order` - Processes orders and sends Telegram notifications.
- `GET /api/test-telegram` - Tests Telegram integration.

### Frontend
- **Mobile-first UI** built with Bootstrap 5.
- Single-page application (SPA) logic in `dist/index.html`.
- App-like design with bottom navigation and quick checkout.

## Environment Variables Required
- `TELEGRAM_BOT_TOKEN` - Telegram bot API token.
- `TELEGRAM_CHAT_ID_1` - Primary Telegram chat ID for notifications.
