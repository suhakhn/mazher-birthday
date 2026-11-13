# Birthday Surprise for Mazher

A five-chapter romantic birthday experience built with HTML, CSS, and vanilla JavaScript.

## Run locally
1. Extract `birthday-surprise.zip`.
2. Open the folder in Visual Studio Code.
3. Install the **Live Server** extension (recommended).
4. Right-click `index.html` → **Open with Live Server**.
   - Or open `index.html` directly in a browser. Live Server is more reliable for local development.

## Publish with GitHub Pages
1. Sign in to GitHub and create a new **public** repository, for example `mazher-birthday`.
2. Upload `index.html`, `style.css`, `script.js`, and this README (keep the same folder structure; the optional `assets` folder may remain empty).
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch **main** and folder **/(root)**, then click **Save**.
6. Wait for the Pages deployment to finish. Your site will be available at:
   `https://YOUR-USERNAME.github.io/mazher-birthday/`
7. Open the published link on a phone and test all five chapters before sharing it.

## Music
The music toggle starts only after the visitor taps it. To keep the project self-contained, it generates a gentle original ambient melody with the browser's Web Audio API; no MP3 is required. Some browsers may restrict audio until a user gesture.

## Customization
- Edit the letter and final message in `script.js` / `index.html`.
- Change colors and typography in the `:root` section at the top of `style.css`.
- No photos or external video clips are used. Google Fonts are loaded online; system fallback fonts are included.
- The website respects `prefers-reduced-motion`.

## Notes
This is a static site and needs no backend, build step, API key, or paid hosting. Keep all three source files at the repository root for the GitHub Pages instructions above.
