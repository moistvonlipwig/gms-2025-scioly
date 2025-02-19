import json
import sys

def convert_old_to_new(old_test_data):
    new_format = {
        "title": old_test_data.get("title", "Converted Test"),
        "authors": old_test_data.get("authors", []),
        "instructions": old_test_data.get("instructions", []),
        "questions": []
    }

    # Define sections
    sections = {
        "multipleChoice": {"type": "multipleChoice", "points": 2, "questions": []},
        "shortAnswer": {"type": "shortAnswer", "points": 5, "questions": []},
        "extendedProblem": {"type": "extendedProblem", "points": 40, "questions": []}
    }

    for question in old_test_data.get("questions", []):
        # Detect multiple-choice
        if "options" in question and isinstance(question["options"], list):
            sections["multipleChoice"]["questions"].append(question)
        # Detect extended problems (longer question texts)
        elif len(question.get("question", "")) > 150:  # Adjust threshold if needed
            sections["extendedProblem"]["questions"].append(question)
        else:
            sections["shortAnswer"]["questions"].append(question)

    # Add non-empty sections to the new format
    for section in sections.values():
        if section["questions"]:
            new_format["questions"].append(section)

    return new_format

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python convert_test.py <old_test.json> <new_test.json>")
        sys.exit(1)

    old_file = sys.argv[1]
    new_file = sys.argv[2]

    # Load the old format JSON file
    try:
        with open(old_file, "r") as f:
            old_test = json.load(f)
    except FileNotFoundError:
        print(f"Error: File '{old_file}' not found.")
        sys.exit(1)

    # Convert to new format
    new_test = convert_old_to_new(old_test)

    # Save the new format JSON file
    with open(new_file, "w") as f:
        json.dump(new_test, f, indent=2)

    print(f"Conversion complete! New format saved as '{new_file}'.")

