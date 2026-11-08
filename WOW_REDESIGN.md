# Cloudville — World Edition

A bold visual redesign with the original Cloudville lessons, café simulation, quiz logic, pastel blue/yellow/coral colors, and GitHub Pages deployment preserved.

## What is new

- A bespoke, responsive SVG town (no downloaded image assets), with floating island, café, data-center buildings, animated clouds and small floating details.
- A new editorial homepage: stronger type, layered backgrounds, distinctive navigation, playful buttons, and a clear call to action.
- A short three-step "how it works" section for first-time learners.
- Five richer neighbourhood cards with colorful artwork, hover feedback, and a progress passport that reads existing saved lesson progress.
- A warm finish section, refreshed footer, and clearer mobile layout.
- A premium-looking simulation chapter using the existing controls, objectives, canvas, messages and quizzes.
- Reduced-motion support, accessible navigation menu labels, no added dependencies.

## Install on Mac

1. Stop your running dev server with Ctrl+C.
2. Make a backup copy of your current Cloudville folder.
3. Extract the ZIP, open the `cloudville` folder, and copy its `app` folder plus `package.json`, `next.config.js`, etc. **into your existing project folder**, replacing matching files. Do not overwrite your `.git` or `.env` files.
4. In VS Code Terminal: `cd ~/Desktop/cloudville && npm run dev`.
5. Open http://localhost:3000. Check the town, cards, lesson controls, and quizzes.
6. Run `npm run build` on your Mac before publishing. Your deployment remains configured for GitHub Pages under `/cloudville`.

## Validation

- The modified React file parsed successfully using the Next.js-bundled Babel parser.
- Attempted production build on a Linux runner but could not finish: the project dependencies contain macOS-targeted native packages, and the runner's network can't download the Linux SWC package. **Not verified as a complete production build**.

## Notes

- The city illustration is handcrafted inline SVG, not an external asset and not an image-generation result.
- All five lesson concepts, simulation logic, existing saved progress, and quizzes are preserved.
- No analytics or Google Form has been wired up yet; those belong to the subsequent launch phase.
