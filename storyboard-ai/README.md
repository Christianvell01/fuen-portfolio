# Storyboard AI Builder

This is a separate mini-app inside your repo.

## Folder location

```text
/storyboard-ai/
```

It is intentionally isolated so your existing AI portfolio website is **not overridden**.

## Current MVP

The current version is a **single-file static app** (`index.html`) that:

- accepts a pasted script
- breaks the script into scene blocks
- generates simple storyboard shot cards
- creates an image prompt and video prompt for each shot
- includes your continuity locks in every prompt
- lets you copy the storyboard as text
- lets you export the storyboard as JSON
- saves your work locally in the browser

## Access path after GitHub Pages deploys

If your repo is already published with GitHub Pages, this tool should be reachable at:

```text
https://christianvell01.github.io/fuen-portfolio/storyboard-ai/
```

## Later upgrade ideas

- character database / avatar locks
- reference image uploads
- shot-by-shot editing
- API integration with image/video generators
- PDF export
- prompt templates for Veo, Kling, Runway, Hailuo, Omni, and more
