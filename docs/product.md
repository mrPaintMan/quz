# Product

Quz is a personal web app for the yearly Christmas quiz (Julquiz) that the user and their fiancé host for about 20 friends in early December. It replaces Facebook team chats, paper score sheets and the PowerPoint: teams answer on a phone, the hosts grade and reveal, and the app keeps a live score.

- **Authors:** the two hosts, building the quiz over about 2 months. AI-assisted questions are welcome but optional.
- **Players:** about 20 guests split into roughly 6 teams, all in one room, playing together in real time. One team = one phone; the app knows nothing about who or how many are in a team.
- **Format:** about 2 hours, 4–5 rounds: themed question rounds of about 4 questions, an activity round and a På spåret round (the highlight).
- **Usage:** one evening a year at peak, authoring in Oct–Nov, idle the rest of the year. Past quizzes are kept.
- **Language:** the whole UI is in Swedish only.
- **Future:** more question types will be added in later years. Adding one must not require changes across the app (see D14).

## Visual reference

The wireframes in the claude.ai design canvas "Quz wireframes" (https://claude.ai/artifact/7gXT6buJsVwFkTkN2VgvAN) show the screens and flows. They are conceptual: use them for what each screen contains and how it behaves, not as the final visual design.

## Views

- **TV (shared screen):** shows a sequence of screens that the hosts step through: lobby, rules, questions, answers, leaderboard and score graph. Replaces the PowerPoint.
- **Team phone:** join by scanning the QR code on the TV (or typing quz.nu) and picking a team name and colour, with no account. The phone follows the game by itself; teams never tap "next". It shows the input for the open question and the team's own score.
- **Host admin, authoring:** a list of quizzes; inside a quiz, rounds on the left (drag to reorder), the round's questions in the middle, the selected question's editor on the right. Changes save automatically. Buttons to preview on the TV and to start the quiz.
- **Host admin, running the night:** a live copy of what the TV shows now and a preview of what comes next; next/previous (also by keyboard); timer pause and +15 s; play media; show answer; pause the whole quiz; a review queue; a leaderboard showing which teams have answered.
- **Host admin, score history:** total score per team question by question, points per round (round winner highlighted), biggest jump and number of lead changes. Can be shown on the TV.

## Rounds

| Round kind | Contents |
|---|---|
| Question round | A title (the theme) and its questions. An activity is a question too, usually the last one in a round |
| På spåret | Exactly one trip first (a film, the destination and five clues worth 10, 8, 6, 4 and 2 points), then up to three questions of any answerable type asked after films about the destination: one film with several questions, or a film per question |

## Question types

Every question has: a prompt shown on the TV, points, an optional time limit, optional media (image, audio or video clip) and optional host notes that never show on the TV.

| Type | Team answers by | Grading |
|---|---|---|
| Multiple choice | Picking one option (A–D, text or image) | Auto |
| Free text | Typing in 1–3 fields; each field can have a label written by the hosts (for example the sub-question repeated). One field is plain free text | Auto per field against a list of accepted spellings, with fuzzy matching; uncertain answers go to the review queue |
| Guess the number | Typing a number on a number pad | Auto: tolerance tiers (for example ±1 for 3p) or closest wins (top 3 get 3/2/1) |
| Sort | Dragging items into order | Auto, points per item in the right position |
| Match | Drawing lines between two lists | Auto, points per correct pair |
| List as many as you can | Typing items one at a time; duplicates are refused; submits itself when the time runs out | Per correct item (for example 0.5p each). Layered: an optional answer key (pasted in bulk, may be empty for open lists), fuzzy matching against it, then the hosts review each unique unknown item once for all teams, optionally with AI suggestions to confirm (see "Grading") |
| Ingredients | Filling in unordered fields (for example the 5 ingredients of a drink) | Auto per correct item, order doesn't matter |
| Drawing | Drawing with a finger; submits itself when the time runs out | Hosts score by hand; drawings are shown on the TV during review |
| Map pin | Placing a pin on a map | Auto: points if the pin is within a set radius of the target. The target and the radius are shown on the map when the answer is revealed |
| På spåret | Writing a guess, then pulling the emergency brake while clues 10, 8, 6, 4, 2 are revealed | Points locked at the clue level when the brake is pulled; a wrong guess scores 0 |
| Activity | Nothing in the app; the TV shows the prompt and the phones show that an activity is going on | Hosts enter points per team, up to a set maximum |

## The night

The TV and the phones follow one screen sequence, derived from the quiz:

1. **Lobby:** QR code, the address quz.nu and the teams that have joined, each with its own colour. Only one game runs at a time, so quz.nu always joins it.
2. **Rules:** how the evening works and an overview (number of rounds, questions, activities, playing time).
3. **For each round:** an intro screen with the round's title, then its questions.
4. **For each question:**
   - **Show:** the TV shows the question and media, the phones show the answer input, the timer starts if there is one.
   - **Answer:** teams submit. The admin sees who has answered; the TV shows only how many.
   - **Lock:** an answer is final once submitted. When the time runs out, unsent answers are locked as they are (drafts are kept on the server, so a sleeping phone loses nothing).
   - **Grade:** auto-grading runs; uncertain answers go to the hosts' review queue (right / wrong).
   - **Reveal:** the TV shows the answer key on the question's own answer screen, right after the question. An activity has no answer screen; its points show on the next leaderboard.
5. **Between rounds:** the leaderboard and, when the hosts choose, the score graph. After the last round, the final leaderboard instead.

På spåret: the trip comes first, as a question with its answer screen; then each film plays on its own screen, followed by its questions, which the phones open only after the film. During the trip, the film plays on the TV and the five clues follow at an even pace through it, one per fifth of the film; the admin view shows which clue is active. Each team's guess stores the clue level at which it pulled the brake.

## Grading

- Automatic grading gives each answer, or each item of an answer, one of: correct, wrong, needs review.
- **Review is per unique answer, not per team.** If four teams wrote "Oslo", the hosts judge "Oslo" once and the decision applies to all four. A decision on a list or free-text question is also added to that question's answer key, so a copied quiz keeps it.
- **AI judge (optional, per list question):** when the question locks, the unknown items are sent to Claude, which suggests correct, wrong or unsure for each. Suggestions are shown in the review queue and only count once the hosts confirm them; unsure items stay open. If the call fails, everything stays in the review queue as usual.
- Hosts can always override any grading.

## Behaviour

- Answers stay hidden from other teams and the TV until the hosts reveal them.
- Live leaderboard, updated as points are confirmed; the admin also sees the points each team got on the latest question.
- Hosts can override any automatic grading and add manual points (activities, bonuses).
- Past quizzes are kept and can be copied as a starting point.

## Constraints

- Free tiers only, except a custom domain. Hosted on Vercel.
- No security beyond a host passphrase. Internet at the venue is assumed.
- About 20 concurrent users, one night a year. The backend must survive months of inactivity.
- Both hosts can edit. Last save wins, no real-time co-editing.
