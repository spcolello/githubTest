# Testing and Verification

## Automated tests
Run `npm test`.

Expected result: all seven test groups pass.

The tests cover:
1. All four arithmetic operations.
2. Correct answers for generated questions across all difficulty levels.
3. Whole-number division with nonzero divisors.
4. Non-negative subtraction results.
5. Four unique answer choices containing the correct answer.
6. Edge cases for zero and small answers.
7. Accuracy percentage calculations.

## Manual browser checklist
- [ ] Home page loads and navigation works.
- [ ] At least one operation is required to start.
- [ ] Each operation can be selected individually; Select All works.
- [ ] Easy, Medium, and Hard can be selected.
- [ ] 5, 10, and 20 question session lengths can be selected.
- [ ] All four operations calculate correctly.
- [ ] Division uses whole-number answers.
- [ ] Every card has four unique choices and includes the correct answer.
- [ ] Correct/incorrect feedback and counts update correctly.
- [ ] Reveal Answer displays the answer and asks the student to self-report.
- [ ] Session progress and end summary are accurate.
- [ ] Missed questions appear on Mistake Review.
- [ ] Practice Similar starts same-operation/difficulty questions.
- [ ] Statistics and per-operation accuracy update correctly.
- [ ] Refreshing preserves mistakes, history, and statistics.
- [ ] Reset Data clears stored data after confirmation.
- [ ] Layout remains usable at phone width.
- [ ] Deployed site works after a hard refresh.
