// TODO
// Create data with:
// - Question Title
// - Question 2-4 Answers
// File will be included, and iterated via Bot logic, for quiz-questions.

export const javaScriptQuiz = [
  {
    id: 1,
    question: "What is valid JavaScript data type?",
    proposedAnswers: [
      "wellTypedString", "string", "numer", "noll"
    ],
    expectedAnswer: "string" // or 1 as index
  }, {
    id: 2,
    question: "What is not valid JavaScript entity",
    proposedAnswers: [
      "function", "fluctuation", "class", "Symbol"
    ],
    expectedAnswer: "fluctuation" // or 1 as index
  }
]

export const reactQuiz = [
  {
    id: 1,
    question: "",
    proposedAnswers: [
      
    ],
    expectedAnswer: ""
  }, {
    id: 2,
    question: "",
    proposedAnswers: [
      
    ],
    expectedAnswer: ""
  }
]


// For programmatic selection. TODO
export const quizData = {
  js: javaScriptQuiz,
  react: reactQuiz
}
