# Ascent & Abyss — Multiplayer Snakes & Ladders

A minimalist, architectural multiplayer "Snakes and Ladders" web application designed for instant, serverless deployment on **GitHub Pages**.

Built with modern web technologies:
- **Zero-Backend Peer-to-Peer Networking**: Real-time multiplayer powered by **WebRTC via PeerJS** (using public STUN/PeerJS signaling).
- **Procedural Sound Engine**: Synthesized in real time using the **Web Audio API** — no audio assets to download or host.
- **Dynamic QR Code Engine**: Room creation generates high-contrast QR codes and shareable deep links; peers can scan using their device camera or enter Room IDs.
- **10x10 Boustrophedon Grid**: Mathematical snake-path layout from Tile 1 (START) to Tile 100 (FINISH) with dynamic SVG snakes & ladders curves and exact bounce-back rules.
- **Minimalist Aesthetic**: Clean typography, dark & minimal light themes, tactile 3D kinetic dice, and floating reaction emotes.
- **Pass & Play / Solo vs AI Bots**: Play locally on a single smartphone or laptop with friends or AI opponents without needing a second device.

---

## 🚀 How to Deploy Directly to GitHub Pages

Because this application runs entirely client-side with WebRTC and CDN-ready assets, it requires **zero custom servers** and costs **$0** to host forever on GitHub Pages.

### Method 1: Automated GitHub Actions (Recommended)

This repository includes a ready-to-use GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. **Create a new repository** on GitHub (e.g. `snakes-and-ladders`).
2. **Push your code to GitHub**:
   ```bash
   # Initialize git repository
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "feat: Initial commit for Ascent & Abyss Snakes & Ladders"

   # Set branch to main
   git branch -M main

   # Add your remote and push
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<YOUR_REPOSITORY_NAME>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages in your repository settings**:
   - Go to your repository on GitHub.
   - Click **Settings** (top tab).
   - In the left sidebar, click **Pages**.
   - Under **Build and deployment > Source**, choose **GitHub Actions**.
4. In under 1 minute, the action will automatically build your app and deploy it to:
   `https://<YOUR_GITHUB_USERNAME>.github.io/<YOUR_REPOSITORY_NAME>/`

---

### Method 2: Manual Static Build & Push to `gh-pages` Branch

If you prefer building locally and pushing the static output:

```bash
# 1. Install dependencies and build
npm install
npm run build

# 2. Deploy dist folder to gh-pages branch
npx gh-pages -d dist
```

Then in **Settings > Pages**, set source to **Deploy from a branch** and select `gh-pages` / `/ (root)`.

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start local development server (port 3000)
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🎲 Game Rules
1. **The Journey**: Players start at Tile 1 and take turns rolling a 6-sided die.
2. **Ladders (Ascent)**: Landing at the base of a ladder automatically advances you to its highest rung.
3. **Snakes (Abyss)**: Landing on a snake's head slides your token back down to the tip of its tail.
4. **Exact Roll to Win**: To conquer Tile 100, you must land on it with an exact roll. Any surplus roll bounces you backward from 100!

---

## 📄 License
Apache-2.0
