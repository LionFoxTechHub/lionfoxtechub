# LionFox TechHub

A tech and support website advertising free high-performance VPS cloud servers.

## Live Site

Deployed on **Cloudflare Pages** at `https://lionfoxtechub.pages.dev` (or your custom domain).

## Features

- 🚀 Free VPS server promotion with **$300 in starter credits**
- ⚡ AMD-powered instances in **Germany 🇩🇪, Finland 🇫🇮, France 🇫🇷**
- ✈️ Telegram community integration
- 💵 Earn via PayPal after 30+ days of active usage
- 📱 Fully responsive, mobile-first design
- 🔒 Cloudflare security headers

## Key Links

| Resource | URL |
|---|---|
| Referral (Vultr) | https://www.vultr.com/?ref=9870139-9J |
| Telegram Group | https://t.me/cloudcomputingtestservers |

## Project Structure

```
lionfoxtechub/
├── index.html       # Main landing page
├── styles.css       # All styles
├── script.js        # Interactive behaviour (FAQ, copy links, animations)
├── _headers         # Cloudflare security headers
├── wrangler.toml    # Cloudflare Pages deployment config
└── README.md
```

## Deploy to Cloudflare Pages

### Option A – Cloudflare Dashboard (recommended)

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/).
2. Click **Create a project** → **Connect to Git**.
3. Select this repository (`LionFoxTechHub/lionfoxtechub`).
4. Set **Build command** to *(leave blank – it's a static site)*.
5. Set **Build output directory** to `/` (root).
6. Click **Save and Deploy**.

### Option B – Wrangler CLI

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy . --project-name lionfoxtechub
```

## Local Development

Simply open `index.html` in your browser — no build step needed.

```bash
# Optional: use a simple local server
npx serve .
```
