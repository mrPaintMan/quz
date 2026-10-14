# Product

Quz is a personal web app for the yearly Christmas quiz (Julquiz) that the user and their fiancé host for about 20 friends in early December. It replaces Facebook team chats and paper score sheets: teams answer on a phone, the hosts grade and reveal, and the app keeps a live score.

- **Authors:** the two hosts, building the quiz over about 2 months. AI-assisted questions are welcome but optional.
- **Players:** about 20 guests split into roughly 6 teams of 2–3, all in one room, playing together in real time.
- **Format:** about 2 hours, 4–5 themed rounds of about 4 questions each, plus an activity. A På spåret round is the highlight.
- **Answer key:** gone through after each round. Answers stay hidden until every team has submitted.
- **Usage:** one evening a year at peak, authoring in Oct–Nov, idle the rest of the year. Past quizzes are kept.

## Views

- **TV (shared screen):** current question, media, timer, På spåret clues, the answer key and a live leaderboard. Replaces the PowerPoint.
- **Team phone:** join by scanning a QR code and picking a team name, with no account. One phone per team. Submits answers for the open question and shows the team's own score.
- **Host admin:** write quizzes, run the night (advance questions, reveal the next clue, lock answers, show the answer key), review and override grading, add manual points for activities.

## Question types

| Type | Example from earlier years | Grading |
|---|---|---|
| Multiple choice (text or image options) | Which Minttu flavour is not real? | Auto |
| Numeric, tolerance tiers | Bob's age in months (±1 for 3p); dinosaurs 66M years (60–72 for 1p) | Auto |
| Numeric, closest wins | Population of Gothenburg, top 3 get 3/2/1 | Auto, ranked across teams |
| Free text, single answer | Which municipality is the coat of arms? | Auto by normalized match, host overrides |
| Multi-part, points per item | Drink ingredients 1p each; capitals 0.5p each | Auto per item, host overrides |
| Matching | Pair names with pictures | Auto per pair |
| Media question | Coat of arms image, song from a video | Any of the above, with image, audio or video |
| På spåret | Clues worth 10, 8, 6, 4, 2 points | Points locked at the clue level when the team answers |
| Activity | Drink tasting, Wikipedia race, pigeon | Manual points from the host |

## Behaviour

- Answers stay hidden from other teams and the TV until the host reveals them.
- Live leaderboard on the TV, updated as points are confirmed.
- Optional countdown timer per question (for example 15 seconds for capitals).
- Past quizzes are kept and can be copied as a starting point.

## Question flow during the night

Host-driven, repeats per question:

1. **Show:** the host opens the question. The TV shows it, phones show the answer form, an optional timer starts.
2. **Answer:** teams submit. The admin sees who has answered; the TV shows only how many.
3. **Lock:** the host locks when all teams are in or the timer ends.
4. **Grade:** auto-grading runs; the host reviews and overrides in the admin view.
5. **Reveal:** the TV shows the answer key, then the updated leaderboard.

På spåret adds a step inside Answer: the host reveals clues one at a time (10, 8, 6, 4, 2), and each team's guess stores the clue level it was locked at.

## Constraints

- Free tiers only, except a custom domain. Hosted on Vercel.
- No security beyond a host passphrase. Internet at the venue is assumed.
- About 20 concurrent users, one night a year. The backend must survive months of inactivity.
- Both hosts can edit. Last save wins, no real-time co-editing.
