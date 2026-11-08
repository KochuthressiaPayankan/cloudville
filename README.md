# Cloudville — Clear Edition

A clean, modern, page-by-page Cloudville website. The book aesthetic is removed, while the cartoon town, pastel blue/peach/yellow palette, café simulation, five lessons, quizzes, glossary, progress, and certificate remain.

## Navigation

Home → Lessons → a lesson's Overview → Experiment → What you learned → Quick quiz → next lesson. Use the prominent Back/Continue controls; the section selector also allows jumping within a lesson. Left/Right or PageUp/PageDown navigate, except while focusing an input, button, or link. The site is screen-based rather than one continuous long page. Smaller screens and the simulator have internal scrolling where necessary.

Quiz: pass at least 2 of 3 questions to complete a lesson. Back/Continue won't advance from a failed or unattempted quiz, but visitors can still switch lessons.

## Install on Mac

1. Back up your old `~/Desktop/cloudville` project.
2. Extract this archive. Copy files and folders **inside** `cloudville/` into the existing `~/Desktop/cloudville/` folder, replacing matching files, or open the extracted `cloudville/` folder directly in VS Code.
3. Run:

   ```sh
   cd ~/Desktop/cloudville
   npm ci
   npm run dev
   ```

4. Open http://localhost:3000. Test home, lessons, five simulations and quizzes, progress after reload, keyboard navigation, Safari/mobile size.
5. Run `npm run build` before pushing to GitHub Pages.

No additional package dependencies were added.

## Analytics and feedback

Optionally set these **public** environment variables at build time:

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_FEEDBACK_URL=https://docs.google.com/forms/d/e/REAL_ID/viewform
```

For local tests, put real values in `.env.local` and restart the dev server. A feedback link without `NEXT_PUBLIC_FEEDBACK_URL` opens an explanation instead of a live form. Google Analytics is opt-in and needs a genuine GA4 Measurement ID. To use them in GitHub Pages, configure public GitHub Actions variables and pass them into the build step as shown in the earlier Atlas readme. These are not account secrets.

## Technical verification

JavaScript/JSX parsing passes for all source modules using the TypeScript parser; full Next.js production build and visual/browser testing haven't been completed in this environment. Run them locally before publishing.
