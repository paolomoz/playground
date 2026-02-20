#!/bin/bash
set -e

echo "Generating AI images with Gemini..."
node generate-images.js

echo "Deploying to GitHub Pages..."
npx gh-pages -d . -b gh-pages --dotfiles false

echo "Deployed! Page will be live at your GitHub Pages URL."
