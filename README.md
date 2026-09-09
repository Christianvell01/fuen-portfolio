# Fuen Belarma — AI Video Portfolio

A ready-to-upload static website with 15 videos, category filters, a featured-video carousel, an About section, and services. No installation or build command is needed.

## Put it on GitHub Pages

1. Unzip this download on your computer.
2. Create a public GitHub repository, for example `fuen-portfolio`.
3. Upload the EXTRACTED files and the `thumbnails` folder to the repository. `index.html` must be at the top level. Do not upload the ZIP itself or place everything inside an extra folder.
4. Commit the uploaded files to the `main` branch.
5. Open the repository's Settings, then Pages.
6. Under Build and deployment, choose Deploy from a branch.
7. Choose `main` and `/(root)`, then Save.
8. Wait for GitHub to finish publishing. Pages settings will show your website link.

Official instructions: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Files

- index.html: page content and Fuen Belarma branding
- style.css: layout, colors, fonts, and mobile styling
- app.js: video playback, category filters, featured carousel, About dialog
- videos.js: all 15 video titles, categories, Google Drive IDs, and runtimes
- thumbnails/: preview images extracted from the supplied videos
- .nojekyll: keeps GitHub Pages serving these static files directly

## Preview and video playback

Open index.html on your computer to preview the layout. Internet is required for Google Fonts and Google Drive video playback. Full MP4 files are hosted in your Google Drive, not included in this ZIP. Keep the Drive videos shared with the audience you want to view them. If an embedded video does not load, use its Open in Google Drive link.

## Editing

To change a video title or category, edit its entry in videos.js. Keep the quotation marks, commas, and array structure intact. After editing, upload the changed file to GitHub and commit it. New Drive uploads do not automatically appear on this site.

The profile uses an FB monogram; no personal headshot was supplied. No contact form or contact details are invented.
