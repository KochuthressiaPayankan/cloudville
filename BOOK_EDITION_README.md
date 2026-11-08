# Cloudville — The Little Atlas of the Cloud

A page-by-page illustrated town book, retaining the five original Cloudville lesson simulations and quizzes.

## Experience

- Cover → Town map → 4 pages for each of 5 chapters (intro, simulation, field notes, quiz) → final page.
- Page turn: bottom previous/next buttons, or keyboard **Left/Right** arrows and **Page Up/Page Down**.
- Chapter map to jump to any lesson; save completed quizzes using `localStorage` and last page using `sessionStorage`.
- Printable exploration certificate unlocked only after passing all five chapter quizzes. Enter name before printing.
- Built-in cloud glossary, Share action, reduced-motion support, and optional external feedback button.
- Real-time simulations, controls, and quizzes are preserved. The live café page can scroll **inside the page** on smaller screens; the overall site is not one endless scrolling document.

## Run on your Mac

1. Back up your existing `~/Desktop/cloudville` folder.
2. Copy the **contents** of this `cloudville` folder into it, overwriting matching files, keeping your `.git` folder and any private `.env` files.
3. In VS Code Terminal:

   ```sh
   cd ~/Desktop/cloudville
   npm ci
   npm run dev
   ```
4. Open <http://localhost:3000> and test all five chapters; when ready run `npm run build`.

## Google Analytics (optional)

Create `.env.local` in the project root with:

```dotenv
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FEEDBACK_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform
```

Only set real values you own. Restart `npm run dev` after changing them. A public Google Form must be created by you in your account; the application does not create or host form responses. With a GA4 ID, basic page views and these events can be sent: `lesson_started`, `simulation_opened`, `simulation_interacted`, `lesson_completed`, `course_completed`, `feedback_clicked`. Without the ID, no GA requests are made. The static GitHub Pages deployment needs these public environment variables configured at build time to include them in the published site (see below).

For the existing GitHub Actions static export workflow, add the following to the build step if you want your GA4 and form links to work on GitHub Pages:

```yaml
env:
  NEXT_PUBLIC_GA_ID: ${{ vars.NEXT_PUBLIC_GA_ID }}
  NEXT_PUBLIC_FEEDBACK_URL: ${{ vars.NEXT_PUBLIC_FEEDBACK_URL }}
```

Configure repository **Settings → Secrets and variables → Actions → Variables**; these are public client-side values, not secrets. Don't add credentials here. The existing `basePath=/cloudville` on GitHub Pages is preserved.

## Testing notes

JSX source parses successfully. Production build could not run in this Linux environment because the supplied dependency tree has macOS-only Next.js SWC binaries and network install is unavailable. **Run `npm ci && npm run build` on your Mac before deployment**. Screen sizes and page overflow should also be checked in Safari and mobile browsers.
