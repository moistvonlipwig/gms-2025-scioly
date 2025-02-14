import fitz  # PyMuPDF
import os
import sys

def extract_text_and_images(pdf_path, output_dir='extracted_content'):
    """
    Extract text and images from a PDF using PyMuPDF.

    :param pdf_path: Path to the PDF file.
    :param output_dir: Directory to save extracted images and text.
    :return: A dictionary with two keys:
             {
               'text_file': path to extracted text file,
               'images': [list of extracted image file paths]
             }
    """
    # Extract the base filename without extension
    pdf_filename = os.path.splitext(os.path.basename(pdf_path))[0]

    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Define text output file
    text_output_path = os.path.join(output_dir, f"{pdf_filename}.txt")

    # Open the PDF
    doc = fitz.open(pdf_path)

    extracted_image_paths = []
    all_text = []

    # Loop through each page in the PDF
    for page_index in range(len(doc)):
        page = doc[page_index]

        # Extract text
        page_text = page.get_text("text")
        all_text.append(f"--- Page {page_index + 1} ---\n{page_text}\n")

        # Extract images
        image_list = page.get_images(full=True)
        for img_index, img_info in enumerate(image_list, start=1):
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]  # typically "png" or "jpeg"

            # Construct the new image filename
            image_filename = f"{pdf_filename}_page{page_index + 1}_img{img_index}.{image_ext}"
            image_filepath = os.path.join(output_dir, image_filename)

            # Save the image
            with open(image_filepath, "wb") as f:
                f.write(image_bytes)

            extracted_image_paths.append(image_filepath)

    doc.close()

    # Save extracted text to a file
    with open(text_output_path, "w", encoding="utf-8") as text_file:
        text_file.writelines(all_text)

    return {
        "text_file": text_output_path,
        "images": extracted_image_paths
    }


if __name__ == "__main__":
    # Check if the user passed a filename
    if len(sys.argv) < 2:
        print(f"Usage: python {os.path.basename(__file__)} <PDF_FILE_PATH>")
        sys.exit(1)

    pdf_file = sys.argv[1]

    # Make sure the file actually exists
    if not os.path.isfile(pdf_file):
        print(f"Error: The file '{pdf_file}' does not exist.")
        sys.exit(1)

    # Extract text and images
    results = extract_text_and_images(pdf_file)

    # Print text file location
    print(f"Extracted text saved to: {results['text_file']}")

    # Print image file locations
    print("Extracted image files:")
    for img_path in results["images"]:
        print(img_path)

