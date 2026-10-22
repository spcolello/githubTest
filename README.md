# Math Practice

A child-friendly arithmetic practice web application for ages 7–12. The app supports addition, subtraction, multiplication, and division; multiple difficulty levels; configurable sessions; mistake review; similar-question practice; persistent statistics; and responsive layouts.

## Features
- Addition, subtraction, multiplication, and division
- Easy, medium, and hard difficulty levels
- 5, 10, or 20 question sessions
- Four-choice interactive question cards
- Reveal-answer flow with self-reporting
- Correct/incorrect feedback and end-of-session summary
- Persistent mistake tracking with similar-question practice
- Overall statistics, per-operation accuracy, and recent session history
- Browser persistence using `localStorage`
- Responsive, keyboard-accessible UI

## Run locally
No dependency installation is required.

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Tests
```bash
npm test
```

The automated tests validate arithmetic correctness, integer-safe division, non-negative subtraction, unique multiple-choice answers, inclusion of the correct answer, and accuracy calculations. See `TESTING.md` for manual verification.

## Deploy to Netlify
This is a static site. Connect this repository in Netlify and use:
- Build command: leave blank
- Publish directory: `.`

`netlify.toml` configures refresh fallback.

## Data storage
Practice data is stored only in the browser under the localStorage key `mathPracticeDataV1`.