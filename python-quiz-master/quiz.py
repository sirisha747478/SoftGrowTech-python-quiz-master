import random
import time

def run_quiz():
    # 1. Store questions in a dictionary categorized by difficulty
    all_questions = {
        "EASY": [
            {
                "question": "What is the correct way to create a function in Python?",
                "options": ["A) function myFunc():", "B) def myFunc():", "C) create myFunc():", "D) void myFunc():"],
                "answer": "B",
                "hint": "Think 'define'...",
                "explanation": "In Python, 'def' is the keyword used to define a function. 'function' is used in JavaScript, 'create' is not a standard keyword, and 'void' is used in languages like C++ or Java."
            },
            {
                "question": "How do you start a comment in Python?",
                "options": ["A) //", "B) /*", "C) <!--", "D) #"],
                "answer": "D",
                "hint": "It's also called a pound sign or hash.",
                "explanation": "Python uses the '#' symbol for single-line comments. '//' is for JavaScript/C++, '/*' is for CSS/JS multi-line comments, and '<!--' is for HTML."
            },
            {
                "question": "What is the correct file extension for Python files?",
                "options": ["A) .pyth", "B) .pt", "C) .pyt", "D) .py"],
                "answer": "D",
                "hint": "Just the first two letters of 'Python'.",
                "explanation": "The standard file extension for Python source files is '.py'. Other options like '.pyth' or '.pyt' are not standard."
            }
        ],
        "MEDIUM": [
            {
                "question": "Which data type is used to store multiple items in a single variable and is ordered and changeable?",
                "options": ["A) Tuple", "B) Set", "C) List", "D) Dictionary"],
                "answer": "C",
                "hint": "Tuples are immutable, but this one can be changed.",
                "explanation": "A 'List' is ordered and changeable (mutable). 'Tuples' are ordered but unchangeable (immutable). 'Sets' are unordered and unindexed. 'Dictionaries' are ordered (as of Python 3.7) and changeable, but they store key-value pairs."
            },
            {
                "question": "What is the output of print(2 ** 3)?",
                "options": ["A) 6", "B) 8", "C) 9", "D) 5"],
                "answer": "B",
                "hint": "Two to the power of three.",
                "explanation": "The '**' operator in Python is used for exponentiation. 2 to the power of 3 (2 * 2 * 2) equals 8. The '*' operator is for multiplication, which would result in 6."
            },
            {
                "question": "Which method is used to remove whitespace from both ends of a string?",
                "options": ["A) strip()", "B) trim()", "C) cut()", "D) len()"],
                "answer": "A",
                "hint": "Think of 'stripping' away the extra space.",
                "explanation": "The 'strip()' method removes any leading and trailing whitespace. 'trim()' is used in other languages like JavaScript. 'len()' returns the length of the string."
            }
        ],
        "HARD": [
            {
                "question": "What is the correct syntax to output the type of a variable or object in Python?",
                "options": ["A) print(typeof(x))", "B) print(type(x))", "C) print(x.type())", "D) print(getType(x))"],
                "answer": "B",
                "hint": "It's a built-in function with a very direct name.",
                "explanation": "The built-in 'type()' function returns the type of the specified object. 'typeof' is a JavaScript operator. 'x.type()' and 'getType(x)' are not standard Python syntax."
            },
            {
                "question": "Which of the following is a Python decorator?",
                "options": ["A) @decorator", "B) #decorator", "C) $decorator", "D) &decorator"],
                "answer": "A",
                "hint": "Decorators use the 'at' symbol.",
                "explanation": "Decorators in Python are prefixed with the '@' symbol. They are used to modify the behavior of a function or class without changing its source code."
            },
            {
                "question": "What does the 'lambda' keyword represent in Python?",
                "options": ["A) A large function", "B) An anonymous function", "C) A recursive function", "D) A class method"],
                "answer": "B",
                "hint": "Functions without a name.",
                "explanation": "A 'lambda' function is a small, anonymous function that can have any number of arguments but only one expression. It's often used for short-lived tasks."
            }
        ]
    }

    print("--- Welcome to the Python Quiz Game v2.0 ---")
    
    # Difficulty Selection
    while True:
        print("\nSelect Difficulty:")
        print("1. EASY (Basics)")
        print("2. MEDIUM (Data Structures)")
        print("3. HARD (Advanced Concepts)")
        choice = input("Enter choice (1-3): ").strip()
        
        if choice == '1':
            difficulty = "EASY"
            break
        elif choice == '2':
            difficulty = "MEDIUM"
            break
        elif choice == '3':
            difficulty = "HARD"
            break
        print("Invalid choice! Please enter 1, 2, or 3.")

    questions = all_questions[difficulty]
    random.shuffle(questions)

    score = 0
    correct_answers = 0
    incorrect_answers = 0

    print(f"\n--- Starting {difficulty} Mode ---")
    print("Instructions: Type the letter of your choice (A, B, C, or D).")
    print("Tip: Type 'HINT' if you're stuck!\n")

    total_q = len(questions)
    for i, q in enumerate(questions):
        print(f"\n--- Question {i+1} of {total_q} ---")
        print(f"{q['question']}")
        for option in q['options']:
            print(option)
        
        start_time = time.time()
        time_limit = 15
        
        while True:
            print(f"\n(Time Limit: {time_limit}s)")
            user_input = input("Your answer: ").strip().upper()
            
            elapsed_time = time.time() - start_time
            
            if elapsed_time > time_limit:
                print(f"\nTIME_EXCEEDED! ⚠️ (Took {elapsed_time:.1f}s)")
                user_input = "TIMEOUT"
                break
                
            if user_input == 'HINT':
                print(f"💡 HINT: {q['hint']}")
                continue
            if user_input in ['A', 'B', 'C', 'D']:
                break
            print("Invalid input! Please enter A, B, C, D, or 'HINT'.")

        if user_input == q['answer']:
            print("Correct! ✅")
            score += 10
            correct_answers += 1
        elif user_input == "TIMEOUT":
            print(f"Incorrect! ❌ (Time ran out). The correct answer was {q['answer']}.")
            incorrect_answers += 1
        else:
            print(f"Wrong! ❌ The correct answer was {q['answer']}.")
            incorrect_answers += 1
        
        print(f"\nEXPLANATION: {q['explanation']}")
        input("\nPress Enter to continue...")
        print("-" * 30)

    print("\n--- Quiz Finished! ---")
    print(f"Level: {difficulty}")
    print(f"Final Score: {score}")
    print(f"Correct Answers: {correct_answers}")
    print(f"Incorrect Answers: {incorrect_answers}")

    total_possible = len(questions) * 10
    if score == total_possible:
        print("Result: Excellent! 🌟")
    elif score >= total_possible * 0.6:
        print("Result: Good job! 👍")
    else:
        print("Result: Try again! 📚")

    replay = input("\nWould you like to play again? (yes/no): ").strip().lower()
    if replay in ['yes', 'y']:
        run_quiz()
    else:
        print("Thanks for playing! Goodbye.")

if __name__ == "__main__":
    run_quiz()
