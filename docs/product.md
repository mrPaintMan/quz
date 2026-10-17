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
- **Team phone:** join by scanning the QR code on the TV (or typing the join word) and picking a team name, with no account. The phone follows the game by itself; teams never tap "next". It shows the input for the open question and the team's own score.
- **Host admin, authoring:** a list of quizzes; inside a quiz, rounds on the left (drag to reorder), the round's questions in the middle, the selected question's editor on the right. Changes save automatically. Buttons to preview on the TV and to start the quiz.
- **Host admin, running the night:** a live copy of what the TV shows now and a preview of what comes next; next/previous (also by keyboard); timer pause and +15 s; play media; show answer; pause the whole quiz; a review queue; a leaderboard showing which teams have answered.
- **Host admin, score history:** total score per team question by question, points per round (round winner highlighted), biggest jump and number of lead changes. Can be shown on the TV.

## Rounds

| Round kind | Contents |
|---|---|
| Question round | A theme and its questions |
| Activity | A description; scored by hand, or answered in the app with an activity question type (ingredients, drawing) |
| På spåret | One or more trips, each a På spåret question |

## Question types

Every question has: a prompt shown on the TV, points, an optional time limit, optional media (image, audio or video clip) and optional host notes that never show on the TV.

| Type | Team answers by | Grading |
|---|---|---|
| Multiple choice | Picking one option (A–D, text or image) | Auto |
| Free text | Typing in 1–3 fields; each field can have a label written by the hosts (for example the sub-question repeated). One field is plain free text | Auto per field against a list of accepted spellings, with fuzzy matching; uncertain answers go to the review queue |
| Guess the number | Typing a number on a number pad | Auto: tolerance tiers (for example ±1 for 3p) or closest wins (top 3 get 3/2/1) |
| Sort | Dragging items into order | Auto, points per item in the right position |
| Match | Drawing lines between two lists | Auto, points per correct pair |
| List as many as you can | Typing items one at a time; duplicates are refused; submits itself when the time runs out | Auto per correct item (for example 0.5p each), uncertain ones to review |
| Ingredients | Filling in unordered fields (for example the 5 ingredients of a drink) | Auto per correct item, order doesn't matter |
| Drawing | Drawing with a finger; submits itself when the time runs out | Hosts score by hand; drawings are shown on the TV during review |
| Map pin | Placing a pin on a map | Auto: points if the pin is within a set radius of the target. The target and the radius are shown on the map when the answer is revealed |
| På spåret | Writing a guess, then pulling the emergency brake while clues 10, 8, 6, 4, 2 are revealed | Points locked at the clue level when the brake is pulled; a wrong guess scores 0 |
| Activity (manual) | Nothing in the app | Hosts enter points per team |

## The night

The TV and the phones follow one screen sequence, derived from the quiz:

1. **Lobby:** QR code, join word (for example quz.se/GLÖGG) and the teams that have joined, each with its own colour.
2. **Rules:** how the evening works and an overview (number of rounds, questions, activities, playing time).
3. **For each question:**
   - **Show:** the TV shows the question and media, the phones show the answer input, the timer starts if there is one.
   - **Answer:** teams submit. The admin sees who has answered; the TV shows only how many.
   - **Lock:** an answer is final once submitted. When the time runs out, unsent answers are locked as they are (drafts are kept on the server, so a sleeping phone loses nothing).
   - **Grade:** auto-grading runs; uncertain answers go to the hosts' review queue (right / wrong).
   - **Reveal:** the TV shows the answer key; then the updated leaderboard.
4. **Between rounds:** leaderboard and, when the hosts choose, the score graph.

På spåret: the hosts reveal the clues one at a time; each team's guess stores the clue level at which it pulled the brake.

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
