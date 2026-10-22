# Math Practice Web Application - Development Report

## Project summary

I built a browser-based Math Practice application for children ages 7-12. The application supports addition, subtraction, multiplication, and division, with easy, medium, and hard difficulty levels. Students can choose the operations and session length, answer multiple-choice question cards, reveal answers, review mistakes, generate similar practice questions, and view persistent statistics. The application does not require an account. Practice data is stored locally in the browser.

## Development approach

I used ChatGPT as the primary AI coding agent and treated the assignment requirements as the source of truth. Instead of relying on a single generated result without verification, I separated the work into functional areas: question generation, session configuration, question-card interaction, result tracking, mistake review, statistics, persistence, testing, and deployment configuration.

The final implementation is a static web application using HTML, CSS, and JavaScript. This kept deployment simple and removed unnecessary backend dependencies. The math-generation logic is separated into its own module so it can be tested directly. Browser state is stored with localStorage, which satisfies the requirement to preserve relevant information between sessions without requiring user registration.

## Prompting strategy

Three especially useful interactions were:

1. **Initial implementation request.** I supplied the full assignment requirements and asked the AI agent to complete the application, including GitHub, testing, deployment preparation, and final submission materials.
2. **Feature-focused direction.** I emphasized the required behavior for all four arithmetic operations, multiple difficulty levels, configurable sessions, mistake tracking, similar-question generation, persistent statistics, and a child-friendly responsive interface.
3. **Verification direction.** I required automated tests and a manual browser checklist instead of assuming that generated code was correct. This led to tests for arithmetic correctness, division safety, answer-choice uniqueness, edge cases, and accuracy calculations.

These prompts were effective because they specified expected behavior and required a concrete method to verify the result.

## Debugging and problem solving

The most important implementation issue was safe question generation, especially division. A naive random division generator can create decimal answers or use zero as a divisor. The solution was to generate division questions backward: first choose a nonzero divisor and an integer quotient, then multiply them to create the dividend. Subtraction was also constrained so the result stays non-negative for the target age range.

I verified the solution with randomized automated tests. The test suite generates hundreds of questions for each operation and difficulty level and checks the answer mathematically. It separately verifies that every division problem has a nonzero divisor and an integer answer. The suite also checks that every question has four unique answer choices and that the correct answer is always included. All seven test groups passed.

Another interaction issue involved the Reveal Answer feature. Revealing the answer should not automatically count the question as correct or incorrect. The implementation reveals the correct choice and then asks the student to report either "I got it" or "I missed it." This keeps statistics meaningful while still allowing answer revelation.

## Testing

Testing used two layers: automated logic tests and a manual browser checklist. Automated tests cover all four operations, all three difficulty levels, safe division, non-negative subtraction, unique answer choices, small-number edge cases, and accuracy calculations.

The manual checklist covers navigation, configuration controls, question-card feedback, session totals, mistake review, similar-question practice, statistics, localStorage persistence, reset behavior, responsive layout, and deployed refresh behavior.

## Reflection

The main strength of AI-assisted development was speed. The agent could translate requirements into a coherent application structure, create repetitive interface code, generate tests, and prepare documentation quickly. It was also useful for identifying edge cases that are easy to overlook, such as duplicate multiple-choice answers and invalid division questions.

The limitation is that generated code still has to be evaluated. An AI agent can say that a feature is complete even when it has not been exercised in the browser. I learned that the best way to use an AI coding agent is to give it behavioral requirements, require tests or reproducible verification steps, and inspect the result before moving on. The developer is still responsible for final behavior, version control, deployment, and being able to explain the architecture.
