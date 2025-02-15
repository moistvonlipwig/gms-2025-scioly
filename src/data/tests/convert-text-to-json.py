import json
import re
import sys

# Ensure the user provided input and output file paths
if len(sys.argv) != 3:
    print("Usage: python script.py <input_file> <output_file>")
    sys.exit(1)

# Get input and output file paths from command-line arguments
input_file_path = sys.argv[1]
output_file_path = sys.argv[2]

try:
    # Read the test text from the input file
    with open(input_file_path, "r", encoding="utf-8") as f:
        test_text = f.read()
except FileNotFoundError:
    print(f"Error: File '{input_file_path}' not found.")
    sys.exit(1)

# Function to extract True/False questions
def extract_true_false(text):
    tf_questions = []
    pattern = re.compile(r"(\d+)\.\s*True\s*False\s*(.*?)\n", re.S)
    matches = pattern.findall(text)

    for match in matches:
        question_number, question_text = match
        tf_questions.append({
            "type": "multipleChoice",
            "question": question_text.strip(),
            "options": ["True", "False"],
            "answer": "",
            "referenceLink": ""
        })

    return tf_questions

# Function to extract multiple-choice questions
def extract_multiple_choice(text):
    mc_questions = []
    pattern = re.compile(r"(\d+)\.\s*\(.*?\)\s*(.*?)\n(A\..*?)\n(B\..*?)\n(C\..*?)\n(D\..*?)\n(E\..*?)?", re.S)
    matches = pattern.findall(text)

    for match in matches:
        question_number, question_text, *options = match
        mc_questions.append({
            "type": "multipleChoice",
            "question": question_text.strip(),
            "options": [opt[2:].strip() for opt in options if opt],
            "answer": "",
            "referenceLink": ""
        })

    return mc_questions

# Function to extract short response questions
def extract_short_answer(text):
    sa_questions = []
    pattern = re.compile(r"(\d+)\.\s*\(\d+ points\)\s*(.*?)\n", re.S)
    matches = pattern.findall(text)

    for match in matches:
        question_number, question_text = match
        sa_questions.append({
            "type": "shortAnswer",
            "question": question_text.strip()
        })

    return sa_questions

# Extract all questions
questions = []
questions.extend(extract_true_false(test_text))
questions.extend(extract_multiple_choice(test_text))
questions.extend(extract_short_answer(test_text))

# Convert to JSON
test_json = json.dumps({"questions": questions}, indent=2)

# Save JSON to a file
try:
    with open(output_file_path, "w", encoding="utf-8") as f:
        f.write(test_json)
    print(f"JSON file saved at: {output_file_path}")
except Exception as e:
    print(f"Error writing file: {e}")
    sys.exit(1)

