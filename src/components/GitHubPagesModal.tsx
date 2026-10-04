import React, { useState } from 'react';
import { sound } from '../utils/audio';
import { X, Copy, Check, Terminal, Globe, Rocket } from 'lucide-react';
import { Github } from './GithubIcon';

interface GitHubPagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubPagesModal: React.FC<GitHubPagesModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const copyCode = async (text: string, index: number) => {
    sound.playClick();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  const gitCommands = `# 1. Initialize git and commit all files
git init
git add .
git commit -m "feat: Minimalist multiplayer Snakes & Ladders game"

# 2. Add your GitHub repository remote
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPO_NAME>.git
git branch -M main
git push -u origin main`;

  const actionsWorkflow = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build static bundle
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-5 sm:p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col gap-5 text-neutral-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Github className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Deploy to GitHub Pages
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Intro */}
        <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
          Because this game uses <strong>WebRTC PeerJS</strong> and client-side audio/QR libraries, it runs completely serverless and works 100% statically on <strong>GitHub Pages</strong> with zero hosting costs.
        </p>

        {/* Step 1 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Step 1: Push Repository to GitHub
            </span>
            <button
              onClick={() => copyCode(gitCommands, 1)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {copiedIndex === 1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 1 ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto whitespace-pre">
            {gitCommands}
          </pre>
        </div>

        {/* Step 2 */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Step 2: Enable GitHub Pages in Repository Settings
          </span>
          <ol className="text-xs text-neutral-300 space-y-1.5 pl-4 list-decimal">
            <li>On your GitHub repository page, click <strong>Settings</strong>.</li>
            <li>In the left sidebar, click <strong>Pages</strong>.</li>
            <li>Under <strong>Build and deployment &gt; Source</strong>, select <strong>GitHub Actions</strong>.</li>
          </ol>
        </div>

        {/* Step 3 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5" />
              Step 3: Included Automated GitHub Actions Workflow
            </span>
            <button
              onClick={() => copyCode(actionsWorkflow, 2)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 transition-colors cursor-pointer"
            >
              {copiedIndex === 2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedIndex === 2 ? 'Copied!' : 'Copy Workflow'}</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-400">
            This workflow file is already placed in <code>.github/workflows/deploy.yml</code>. Whenever you push to <code>main</code>, GitHub Actions builds and publishes your site automatically!
          </p>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs transition-colors cursor-pointer"
        >
          Close Guide
        </button>
      </div>
    </div>
  );
};
