# Cloudville — Step 2: Design and mobile improvements

Based on the ZIP uploaded November 9, 2026.

## Changed
- `app/CloudvilleWelcome.js`: clearer homepage CTA, continue-learning button, completed-lesson cards, progress meter, refined footer and city details.
- `app/page.js`: passes saved completion data to homepage, clearer lesson lab heading, simulation status and experiment controls grouping.
- `app/globals.css`: cohesive visual system, modernized cards and controls, refined city illustration, mobile spacing and layout, accessible focus states and reduced-motion support.

## Preserved
- All five lessons and existing simulation behavior.
- Quiz logic and saved progress from Step 1.
- GitHub Pages static export settings and base path.

## Verification
- JSX parsed successfully for page.js, CloudvilleWelcome.js, LessonQuiz.js and layout.js.
- simulation.js passed Node syntax validation.
- Full production build NOT verified in this Linux environment: Next.js tried to download a Linux SWC package, and internet access failed. Please run `npm ci && npm run build` on your Mac.

## Install
1. Back up your existing Cloudville folder.
2. Copy the contents of this ZIP's `cloudville` folder into your existing project, choosing Replace for matching files. Don't remove your original `.git` folder or environment files.
3. In VS Code terminal: `npm ci`, then `npm run dev`.
4. Check desktop/mobile, all 5 lessons, quiz completion and progress, then `npm run build` before publishing.

No analytics ID, questionnaire URL or live site URL was invented or inserted; those belong to Step 3.
