import { Question } from './types';

export const QUIZ_QUESTIONS: Question[] = [
  // EASY
  {
    id: 1,
    question: "What is the correct way to create a function in Python?",
    options: {
      A: "function myFunc():",
      B: "def myFunc():",
      C: "create myFunc():",
      D: "void myFunc():"
    },
    correctAnswer: "B",
    difficulty: "EASY",
    hint: "Think 'define'...",
    explanation: "In Python, 'def' is the keyword used to define a function. 'function' is used in JavaScript, 'create' is not a standard keyword, and 'void' is used in languages like C++ or Java."
  },
  {
    id: 2,
    question: "How do you start a comment in Python?",
    options: {
      A: "//",
      B: "/*",
      C: "<!--",
      D: "#"
    },
    correctAnswer: "D",
    difficulty: "EASY",
    hint: "It's also called a pound sign or hash.",
    explanation: "Python uses the '#' symbol for single-line comments. '//' is for JavaScript/C++, '/*' is for CSS/JS multi-line comments, and '<!--' is for HTML."
  },
  {
    id: 3,
    question: "What is the correct file extension for Python files?",
    options: {
      A: ".pyth",
      B: ".pt",
      C: ".pyt",
      D: ".py"
    },
    correctAnswer: "D",
    difficulty: "EASY",
    hint: "Just the first two letters of 'Python'.",
    explanation: "The standard file extension for Python source files is '.py'. Other options like '.pyth' or '.pyt' are not standard."
  },
  // MEDIUM
  {
    id: 4,
    question: "Which data type is used to store multiple items in a single variable and is ordered and changeable?",
    options: {
      A: "Tuple",
      B: "Set",
      C: "List",
      D: "Dictionary"
    },
    correctAnswer: "C",
    difficulty: "MEDIUM",
    hint: "Tuples are immutable, but this one can be changed.",
    explanation: "A 'List' is ordered and changeable (mutable). 'Tuples' are ordered but unchangeable (immutable). 'Sets' are unordered and unindexed. 'Dictionaries' are ordered (as of Python 3.7) and changeable, but they store key-value pairs."
  },
  {
    id: 5,
    question: "What is the output of print(2 ** 3)?",
    options: {
      A: "6",
      B: "8",
      C: "9",
      D: "5"
    },
    correctAnswer: "B",
    difficulty: "MEDIUM",
    hint: "Two to the power of three.",
    explanation: "The '**' operator in Python is used for exponentiation. 2 to the power of 3 (2 * 2 * 2) equals 8. The '*' operator is for multiplication, which would result in 6."
  },
  {
    id: 6,
    question: "Which method is used to remove whitespace from both ends of a string?",
    options: {
      A: "strip()",
      B: "trim()",
      C: "cut()",
      D: "len()"
    },
    correctAnswer: "A",
    difficulty: "MEDIUM",
    hint: "Think of 'stripping' away the extra space.",
    explanation: "The 'strip()' method removes any leading and trailing whitespace. 'trim()' is used in other languages like JavaScript. 'len()' returns the length of the string."
  },
  // HARD
  {
    id: 7,
    question: "What is the correct syntax to output the type of a variable or object in Python?",
    options: {
      A: "print(typeof(x))",
      B: "print(type(x))",
      C: "print(x.type())",
      D: "print(getType(x))"
    },
    correctAnswer: "B",
    difficulty: "HARD",
    hint: "It's a built-in function with a very direct name.",
    explanation: "The built-in 'type()' function returns the type of the specified object. 'typeof' is a JavaScript operator. 'x.type()' and 'getType(x)' are not standard Python syntax."
  },
  {
    id: 8,
    question: "Which of the following is a Python decorator?",
    options: {
      A: "@decorator",
      B: "#decorator",
      C: "$decorator",
      D: "&decorator"
    },
    correctAnswer: "A",
    difficulty: "HARD",
    hint: "Decorators use the 'at' symbol.",
    explanation: "Decorators in Python are prefixed with the '@' symbol. They are used to modify the behavior of a function or class without changing its source code."
  },
  {
    id: 9,
    question: "What does the 'lambda' keyword represent in Python?",
    options: {
      A: "A large function",
      B: "An anonymous function",
      C: "A recursive function",
      D: "A class method"
    },
    correctAnswer: "B",
    difficulty: "HARD",
    hint: "Functions without a name.",
    explanation: "A 'lambda' function is a small, anonymous function that can have any number of arguments but only one expression. It's often used for short-lived tasks."
  }
];
