import fitz  # PyMuPDF
import os
import sys

def extract_text_and_images(pdf_path, output_dir='extracted_images'):
    """
    Extract text and images from a PDF using PyMuPDF.
    
    :param pdf_path: Path to the PDF file.
    :param output_dir: Directory to save extracted images.
    :return: A dictionary with two keys:
             {
               'text': [list of text per page],
               'images': [list of extracted image file paths]
             }
    """
    # Open the PDF
    doc = fitz.open(pdf_path)
    
    # Prepare data structures
    all_text_per_page = []
    extracted_image_paths = []

    # Create output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Loop through each page in the PDF
    for page_index in range(len(doc)):
        page = doc[page_index]

        # 1. Extract text
        page_text = page.get_text("text")
        all_text_per_page.append(page_text)

        # 2. Extract images
        image_list = page.get_images(full=True)  # returns a list of image info on the page
        for img_index, img_info in enumerate(image_list, start=1):
            xref = img_info[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]  # typically "png" or "jpeg"

            # Build a filename and save the image
            image_filename = f"page{page_index+1}_img{img_index}.{image_ext}"
            image_filepath = os.path.join(output_dir, image_filename)

            with open(image_filepath, "wb") as f:
                f.write(image_bytes)

            extracted_image_paths.append(image_filepath)

    doc.close()

    return {
        "text": all_text_per_page,
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

    # Print out all text (page by page)
    for i, page_text in enumerate(results["text"], start=1):
        print(f"--- Text on Page {i} ---")
        print(page_text)
        print()

    # Print out the paths of extracted images
    print("Extracted image files:")
    for img_path in results["images"]:
        print(img_path)
