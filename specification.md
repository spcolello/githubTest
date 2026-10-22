# Math Practice Application Specification

This implementation follows the functional requirements supplied in the assignment brief.

## Core requirements
- Support addition, subtraction, multiplication, and division.
- Offer easy, medium, and hard difficulty levels.
- Present questions as interactive multiple-choice cards.
- Allow answer revelation and self-reporting when an answer is revealed.
- Provide immediate visual feedback.
- Configure sessions by operations, difficulty, and number of questions.
- Track attempted, correct, and incorrect counts.
- Present an end-of-session summary.
- Persist missed questions for later review.
- Generate similar questions based on a missed question's operation and difficulty.
- Provide total and per-operation statistics plus practice history.
- Persist data between browser sessions without user accounts.
- Provide an attractive responsive interface suitable for ages 7–12.

## Question-generation rules used by this implementation
- Easy addition/subtraction: operands up to 20.
- Medium addition/subtraction: operands up to 100.
- Hard addition/subtraction: operands up to 500.
- Easy multiplication/division: factors/divisors up to 6.
- Medium multiplication/division: factors/divisors up to 12.
- Hard multiplication/division: factors/divisors up to 20.
- Subtraction results are non-negative.
- Division results are whole numbers and never divide by zero.
