# Plan

Two deadlines:

- **2026-10-28 · Authoring live:** both hosts can write the real quiz, with every question type, in the admin view, online, from their own devices, in the production database. (Moved from 2026-10-21 when the wireframes added more question types.)
- **Late November · Game ready:** dry run with a few friends on real phones. The Julquiz itself is in early December.

The quiz is written in production from day one, so nothing has to be moved from the development database later.

The dates are internal targets. Code quality (`docs/engineering.md`) wins if they conflict; the hard goal is hosting the quiz in early December.

## Next up

The feedback round from the user's test night (2026-11-11) is done, and the phone's result is drawn like each type's input (D59). Points by hand are done (D61). M3 continues with Rita, then På spåret, each with all four pieces (rules, phone input, TV display, phone result); Rita's drawings are scored by hand like activities. Try the feedback round's changes on a night in dev first: the cloud sessions can't reach Convex.

## Milestones

### M0 · Setup
- [x] Next.js + TypeScript + Tailwind scaffold
- [x] Convex installed, Convex provider wired into the root layout
- [x] Context docs: `CLAUDE.md`, `docs/`
- [x] Convex dev deployment created and linked (`.env.local`)
- [x] Engineering standards and file structure (D10–D12)
- [x] Vitest, convex-test, React Testing Library, 80% threshold enforced
- [x] ESLint import rules, pre-commit hook, CI on GitHub Actions (D13)

### M1 · Authoring live (due 2026-10-28)
- [x] Convex schema: quizzes, rounds (question round, På spåret), questions (D18)
- [x] Content validators for every question type, with the type registry (D14)
- [x] Domain rules per type: max points and problems, `findQuestionProblems` (D20)
- [x] Convex queries and mutations: quizzes, rounds, questions (create, update, reorder, delete, copy), media upload (D22)
- [x] Host passphrase gate, backend (D21)
- [x] Login screen for the passphrase
- [x] shadcn/ui set up, Swedish UI texts, wireframe theme (D24)
- [x] Quiz list; create, copy and delete a quiz
- [x] Editor: rounds (add, rename, reorder, delete), questions (add, reorder, delete), autosave (D25)
- [x] Editor per question type (all 11)
- [x] Media: upload images, audio and video clips to Convex storage
- [x] Production Convex deployment (Ireland) and Vercel project, live at quz.nu
- [x] Both hosts can log in and save from their own devices

### Follow-ups from M1
- [x] Drag and drop for reordering, beside the arrows (D26)
- [x] Map for placing the map pin answer and the phone's starting view, with the radius drawn (D27)
- [x] Moving a question to another round from the editor
- [x] Show a message when creating, copying, deleting or moving fails (`ActionErrorProvider`)
- [x] Fixes from the codebase review: one hook for half-typed field text, autosave reports its own failures, shared authoring parts in `authoring/shared/`, one type per shape, docs brought up to date
- [x] Empty number fields saved as `null` instead of `NaN` (D28)
- [x] Run `migrateMissingNumbers` on dev and production, then delete it
- [x] Send the host back to the login screen, instead of a blank page, if the passphrase changes on the server while logged in (`SessionErrorBoundary`)
- [x] Reordering by drag only, round count under the title, two map detail levels with zoom up to 12 (D29)
- [x] På spåret as one trip with five fixed clues and an uploaded film, shown by a still (D30)
- [x] Run `migratePaSparetClues` on dev and production, then narrow the clue schema and delete the migration (D30)
- [x] Films stored in Cloudflare R2, dev and production buckets set up (D32)
- [x] På spåret films with up to three questions asked after them (D33)
- [x] Logo: favicon, iPhone icon, logo top left linking to a simple home page (D31)

### M2 · Live game loop
- [x] Convex schema: games, teams, answers (drafts and locks), adjustments; start and end a game, join a team, rejoin by saved id (D34)
- [x] Screen sequence derived from the quiz, with next and previous on the server (D15, D35)
- [x] TV: lobby with QR code and quz.nu, rules screen, round intro; question, answer, film and leaderboard as text placeholders (D36)
- [x] Phone: join with a team name and colour, rejoin after refresh, follow the game (D36)
- [x] TV fits any browser window: a 16:9 stage scaled to the window (D37)
- [x] Lobby fits all 12 teams: names flow and wrap, smaller when long (D37)
- [x] Admin: live control with the TV now and next drawn small, Nästa and Föregående; question timer with pause and +15 s on the TV, phones and admin (D38)
- [x] Admin: media playback: question pictures on the TV with the question and its answer; sound and video played on the TV with Spela and Pausa in the admin (D39)
- [x] På spåret: film position kept on the server, the trip's points over its film on the TV, admin shows the active clue and time to the next (D39, D40). Loading the film ahead is left out until the dry run shows a need
- [x] På spåret films: TV plays each film on its own screen, then its questions (D40); phones answer them in M3
- [x] Draft saving and locking, including on timer end, with a 2 s grace; Nästa closes a question for good (D41)

### M3 · Answering and grading, all types
- [ ] Answer input, TV display and grader for each question type. Done: multiple choice, with the shared answering on the phone, TV and admin (D42); Gissa siffran (D44); Sortera (D46); Para ihop (D47); Gissa ingredienserna, exact spellings until the AI judge (D48); Kartnål, every team's pin on the TV and the phones (D60); Fritext, exact answers until the AI judge (D49); Nämn så många som möjligt, with the right items on the TV (D53)
- [x] The hosts' review list, per unique answer, for free text and ingredients (D51)
- [x] AI judge filling in the review list, one call per question on Nästa (D50, D52; replaces fuzzy matching)
- [x] AI judge and review for list questions, two forms of one answer counting once (D53). When På spåret is built, replace its editor's old "Rätta med ungefärlig matchning" switch (fuzzy matching is gone, D50) with the AI judge's switch
- [x] Show each team which of its answers were judged right or wrong (D50, D58)
- [x] Host overrides (the review list, D51) and manual points: activities and corrections (D61)
- [x] Leaderboard on the TV and admin, own score on phones, counting closed questions (D43)

### Feedback round (2026-11-11), paused M3
Agreed with the user, in this order:
1. [x] Running the night: next screen's notes under the preview, the TV question's notes folded away, Gissa siffran's scoring in the admin, "Avsluta quiz" in place of Nästa on the last screen, activities and round intros centred on the TV (D54)
2. [x] Judging flow: the AI judge starts as soon as every team has sent or the time is out, and Nästa waits until every answer is judged, unsure ones included (D55)
3. [x] The Granska box: every answer, exact matches read-only at the bottom; sections Att granska, Bedömda, Stämde med facit; each sub-question's correct answer by its title (D56)
4. [x] Faster images: shrink on upload (at most 1920 px), and the TV loads the next screen's images ahead (the user accepts they can be found a screen early); the slow map test made fast (D57)
5. [x] Phones show what scored: from the answer screen until the next question, each team's own answer marked right or wrong per item, with its points; follows verdict changes (D58)

### M4 · Highlights
- [ ] På spåret: clue reveal and emergency brake
- [ ] Map pin answer input and reveal with radius, reusing `BorderMap` (D27)
- [ ] Drawing answers shown on the TV
- [ ] Score history and score graph on the TV

### M5 · Polish and launch (late November)
- [ ] Final visual design and Christmas theme, TV-sized layout
- [x] Custom domain (quz.nu)
- [ ] Dry run with a few friends on real phones

### Before next year's larger night (architecture review, 2026-11-11)
- [ ] Give the TV and the phones their own lighter live queries instead of all following `getRunningGame`, which rebuilds the sequence from the whole quiz on every change of the game (D35, D45, D53)
- [ ] Rename the stored `fuzzy` switch to what it is now (the AI judge) and drop the list's unused `aiAssist`, with a data migration
- [ ] A few browser tests against a local Convex, as the cloud sessions can't try the app with data
- Folded into the feedback round instead, done: an explicit judging phase per question (round 2, D55), and per-part outcomes as the base of grading and the phones' feedback (round 5, D58)

## Log

- 2026-10-14: Project scaffolded; Convex dev deployment linked; context docs created. Plan reordered so authoring goes live first, due 2026-10-21.
- 2026-10-15: Engineering standards and file structure agreed (D10–D12); Zod dropped.
- 2026-10-17: Test tooling, import rules, pre-commit hook and CI in place (D13).
- 2026-10-17: Wireframes reviewed: product doc rewritten, D14–D17 added, "Authoring live" moved to 2026-10-28.
- 2026-10-17: Schema, content validators for all 11 types and domain rules (max points, problems) with tests; D18–D20.
- 2026-10-17: Fixes from the first code review: NaN-safe checks, duplicate and tier-order warnings, map zoom check, alias imports in the domain (verified to bundle in Convex).
- 2026-10-17: Second review fixes (match allows a shared right side, placing order, margin message, duplicate options); review workflow set to one round per push.
- 2026-10-17: Editor backend: passphrase wrapper, quiz/round/question/media functions with tests (D21, D22).
- 2026-10-17: Admin UI on branch `m1`: login, quiz list, three-column editor with all 11 question type editors, autosave and media upload (D23–D25). Production deploy steps written in `docs/deploy.md`.
- 2026-10-17: Error messages for failed host actions, a session error boundary, and moving a question to another round (M1 follow-ups).
- 2026-10-17: Production live at quz.nu (Convex prod in Ireland). Copy pass on the authoring flow: omgång, deltagarna, alternativ (`docs/copy.md`); one branch and PR per topic.
- 2026-10-18: M1 polish: drag and drop for rounds, questions and Sortera items, disabled arrows at list ends, dropdown chevron inset (D26).
- 2026-10-18: Map pin authoring on a borders-only map with a fixed pin, the radius drawn to scale, and a phone-sized map for the starting view (D27).
- 2026-10-18: Codebase review for tech debt, clean-code smells and dead code. Removed unused files (Next.js starter icons, `src/lib/utils.ts`, the unused shadcn card, Convex's starter README), the login form's unused notice, the unused sidebar colour tokens, and two needless type exports.
- 2026-10-18: Review fixes: `useDraftText` for number, lines and answer-key fields, `useAutosave` with save failure, sortable rows and autosave moved to `authoring/shared/`, single types for rounds with questions, media kind and map views, docs updated; empty numbers are `null` everywhere, with a one-off migration (D28).
- 2026-10-18: `migrateMissingNumbers` ran on dev and production (no `NaN` found in either) and was deleted.
- 2026-10-22: M1 closed. M2 started: games, teams, answers and adjustments tables, one game at a time joined at quz.nu, 12 team colours (D34). Decisions renumbered: R2 is D32, film questions D33.
- 2026-10-25: Screen sequence: round intro, each question then its answer, leaderboards between rounds and a final one, films before their questions in På spåret; next and previous on the server (D35).
- 2026-10-26: TV at /tv (lobby with QR code, rules, round intro, text placeholders), phones join and follow at /, "Starta quiz" and a bare live control (D36). Tried end to end on dev in the browser pane.
- 2026-10-29: Live control shows the TV now and next; question timer with pause and +15 s on the TV, phones and admin. Keyboard shortcuts and pausing the whole quiz dropped (D38). Not yet tried in a browser: the cloud session's network blocks Convex.
- 2026-11-01: Question media on the TV, sound and video played from the admin, TV setup for sound in `docs/deploy.md` (D39). Not yet tried in a browser.
- 2026-11-01: På spåret: the trip's points over its film on the TV, the active clue in the admin, films before their questions played on the TV (D40). Not yet tried in a browser.
- 2026-11-02: Drafts and locking on the server: save, send, lock 2 s after the time is out, Nästa closes a question for good (D41). No answer inputs yet (M3).
- 2026-11-02: The trip's points sat beside films whose shape didn't fill the space; videos now sit in a frame with the film's own shape (D40). Checked in Chromium with 16:9 and 4:3 films.
- 2026-11-04: M3 started: multiple choice answered on the phone, options and the right one on the TV, who has answered in the admin (D42). Not tried in a browser with data.
- 2026-11-04: Scores: leaderboards with points on the TV, a Topplista in the admin, own points on the phones, counting a question once Nästa closes it (D43).
- 2026-11-05: Gissa siffran: number field on the phone, the right number on the TV, poängnivåer and närmast vinner with shared places; grading takes all of a question's answers together (D44). Not tried in a browser with data.
- 2026-11-05: Ready for larger nights: drafts saved a second after the team pauses, and at once when the phone hides the page, without the team seeing it; counting and scores read only sent answers (D45). The 12-team cap remains a product decision.
- 2026-11-05: Sortera: drag to reorder on the phone, a stable shuffle that is never the right order, the right order on the TV, points per right place (D46). Not tried in a browser with data.
- 2026-11-09: Para ihop: tap to pair with coloured lines on the phone, both lists and then the right pairs on the TV, points per right pair, partial answers allowed (D47). Not tried in a browser with data. The cloud environment now installs the npm packages in its setup script.
- 2026-11-09: Gissa ingredienserna: a field per ingredient on the phone, the ingredients on the TV, points per ingredient guessed by an accepted spelling; one text comparison shared by grading and the duplicate checks (D48). Not tried in a browser with data.
- 2026-11-09: Fritext: a field per sub-question on the phone, the sub-questions and then their answers on the TV, points per field answered with an accepted answer (D49). Decided the AI judge replaces fuzzy matching, with Claude Haiku 5.5 and verdicts that count at once (D50). Not tried in a browser with data.
- 2026-11-10: The hosts' review list: on a Fritext or ingredients answer screen, each unmatched text once with Rätt / Fel (or which ingredient), shared by every team that wrote it and counted in the scores at once (D51). Not tried in a browser with data.
- 2026-11-10: The AI judge: when Nästa closes a Fritext or ingredients question, Claude Haiku 5.5 judges the unmatched texts in one call; right and wrong count at once and are marked AI in the review list, unsure ones and failed calls are left to the hosts (D52). Tried only against a fake Claude in tests, not in a browser with data.
- 2026-11-10: Nämn så många som möjligt: add answers one at a time on the phone, the items the teams got right on the TV, the AI judge and the review list naming right answers outside the key so two forms count once (D53). Not tried in a browser with data.
- 2026-11-11: Feedback round 1, running the night: notes in the live control, Gissa siffran's scoring, Avsluta quiz on the last screen, centred activities and round intros on the TV (D54). Not tried in a browser with data.
- 2026-11-11: Feedback round 2, judging flow: answers lock when every team has sent, the time is out or Nästa closes the question, which starts the AI judge; Nästa waits until every answer is judged; one rule decides a question's judging phase (D55). Not tried in a browser with data.
- 2026-11-11: Feedback round 3, the Granska box: every answer in three sections (Att granska on top, Bedömda, Stämde med facit read-only), and each sub-question's correct answer by its title (D56). Not tried in a browser with data.
- 2026-11-11: Feedback round 4, faster pictures: shrunk on upload to at most 1920 px as WebP, and loaded ahead on the TV; the map's loading test uses tiny stand-in maps, so no test can time out (D57). Not tried in a browser with data.
- 2026-11-11: Feedback round 5, phones show what scored: after the answer, the team's own answer part by part with its points, following verdicts; grading is now built from per-part outcomes, so the phones and the scores can't disagree (D58). Not tried in a browser with data.
- 2026-11-12: The phone's result after the answer: each type's answer drawn like its input, the parts that scored lit up in gold one after another with their points, a wrong Flerval pick in red; a fourth registry entry per type (D59). Not tried in a browser with data.
- 2026-11-12: Kartnål with all four pieces: answered by moving the map under the middle pin; the TV's answer shows the right place, the radius and every team's pin with its distance; the phone's result shows the team's pin glowing when it scored, the distance, and every other team's pin on a map free to move (D60). Not tried in a browser with data.
- 2026-11-12: Points by hand: the hosts give each team its points on an activity's screen with − / + or a typed number, and the phone shows them; "Rätta poäng" under the Topplista adds or takes away points at any time, no reason asked (D61). Not tried in a browser with data.
