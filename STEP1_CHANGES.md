# Cloudville — Step 1 changes

## Implemented
- Moved simulation state, update, and canvas drawing functions into `app/simulation.js`, reducing the size of the React page module without changing the simulation rules.
- The simulation's animation loop now runs only when the primary café canvas is within the viewport and the document tab is visible. It resumes without simulating the time spent away.
- Capped canvas pixel density at 2x to reduce drawing cost on high-density screens.
- Reduced React statistics updates from about five to about three per simulation second.
- Quizzes now require at least 2 correct answers out of 3 to count as passed. Failed quizzes display explanations and offer a retry; progress is recorded only on a pass.
- Preserved the existing localStorage completion mechanism, all five lessons, and GitHub Pages static-export configuration.

## Validation and deployment
- Syntax checks were run on the extracted simulation module.
- A full Next.js production build could not be completed in this execution environment because `npm ci` could not complete fetching dependencies. Run `npm ci && npm run build` on your machine or push these changes to a branch and use the existing GitHub Actions build.
- This package deliberately excludes `.git`, `.next`, `out`, `node_modules`, and `.DS_Store`. Run `npm ci` to reinstall dependencies.

## Next
- Run a browser smoke test for all lessons and quiz retries on desktop/mobile.
- Visual redesign, analytics, the Google form, and Reddit launch are separate later steps.
