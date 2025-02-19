import json
import re
import sys
import spacy

# Load SpaCy model for NLP sentence detection
nlp = spacy.load("en_core_web_sm")

# Ensure the user provided input and output file paths
if len(sys.argv) != 3:
    print("Usage: python script.py <input_file> <output_file>")
    sys.exit(1)

input_file_path = sys.argv[1]
output_file_path = sys.argv[2]

try:
    with open(input_file_path, "r", encoding="utf-8") as f:
        test_text = f.read()
except FileNotFoundError:
    print(f"Error: File '{input_file_path}' not found.")
    sys.exit(1)

# Function to refine sentences using NLP for better parsing
def refine_sentences(text):
    """Uses NLP to improve sentence boundaries."""
    doc = nlp(text)
    return " ".join([sent.text.strip() for sent in doc.sents])

# Function to extract True/False questions
def extract_true_false(text):
    tf_questions = []
    pattern = re.compile(r"(\d+)\.\s*(.*?)\s*\(?(?:T/F|True False|True or False)\)?", re.S)
    matches = pattern.findall(text)

    for match in matches:
        question_number, question_text = match
        refined_text = refine_sentences(question_text)  # Use NLP for better sentence structure
        tf_questions.append({
            "type": "trueFalse",
            "question": refined_text,
            "options": ["True", "False"],
            "answer": "",
            "referenceLink": ""
        })

    return tf_questions

# Function to extract multiple-choice questions (Handles lowercase and uppercase)
def extract_multiple_choice(text):
    mc_questions = []
    pattern = re.compile(r"(\d+)\.\s*(.*?)\n(?:[aA][.)]\s*(.*?)\n[bB][.)]\s*(.*?)\n[cC][.)]\s*(.*?)\n[dD][.)]\s*(.*?)(?:\n[eE][.)]\s*(.*?))?)?", re.S)
    matches = pattern.findall(text)

    for match in matches:
        question_number, question_text, *options = match
        refined_text = refine_sentences(question_text)  # NLP refinement
        options = [opt.strip() for opt in options if opt]  # Remove empty options

        mc_questions.append({
            "type": "multipleChoice",
            "question": refined_text,
            "options": options,
            "answer": "",
            "referenceLink": ""
        })

    return mc_questions

# Function to extract short-answer questions **only if it's not MCQ or TF**
def extract_short_answer(text):
    sa_questions = []
    pattern = re.compile(r"(\d+)\.\s*(.*?)\s*\((\d+ points?)\)", re.S)
    matches = pattern.findall(text)

    for match in matches:
        question_number, question_text, points = match
        refined_text = refine_sentences(question_text)  # NLP for better structure
        sa_questions.append({
            "type": "shortAnswer",
            "question": refined_text,
            "points": points.strip()
        })

    return sa_questions

# Extract questions using regex and NLP
questions = []

# **Process Multiple Choice First** so they don't get classified as Short Answer
mcq_extracted = extract_multiple_choice(test_text)
questions.extend(mcq_extracted)

# **Process True/False Next**
tf_extracted = extract_true_false(test_text)
questions.extend(tf_extracted)

# **Process Short-Answer LAST to avoid misclassifications**
sa_extracted = extract_short_answer(test_text)
questions.extend(sa_extracted)

# Convert to JSON format
output_data = {"questions": questions}

# Save JSON to a file
try:
    with open(output_file_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
    print(f"✅ JSON file saved at: {output_file_path}")
except Exception as e:
    print(f"❌ Error writing file: {e}")
    sys.exit(1)
