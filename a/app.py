import json
import requests
import os
import re

def download_pdf(url, output_path):
    try:
        # Make the HTTP request to get the PDF file
        response = requests.get(url, stream=True)
        response.raise_for_status()  # Check for HTTP errors

        # Get the total file size
        total_size = int(response.headers.get('content-length', 0))

        # Open a local file with write-binary mode
        with open(output_path, 'wb') as file:
            # Initialize variables for tracking progress
            downloaded_size = 0
            chunk_size = 8192

            # Write the content of the response in chunks
            for chunk in response.iter_content(chunk_size=chunk_size):
                file.write(chunk)
                downloaded_size += len(chunk)
                
                # Calculate download progress
                if total_size != 0:
                    progress = downloaded_size / total_size * 100
                    print(f'Downloading: {progress:.2f}% ({downloaded_size}/{total_size} bytes)', end='\r')
                else:
                    print(f'Downloading... ({downloaded_size} bytes)', end='\r')

        print(f'\nDownload complete: {output_path}')
    except requests.exceptions.RequestException as e:
        print(f'Error downloading the PDF: {e}')

def main():
    # Create a folder for storing the files
    folder_name = 'blockchain_data'
    os.makedirs(folder_name, exist_ok=True)

    # Read the JSON file
    with open('blockchain.json', 'r', encoding='utf-8') as file:     
        data = json.load(file)

    # Iterate through the entries and download each PDF
    for entry in data:
        pdf_url = entry.get('pdf_url')
        title = entry.get('title')
        if pdf_url and title:
            # Generate a sanitized output file name based on the title
            sanitized_title = re.sub(r'[^\w\-_\. ]', '_', title)
            output_path = os.path.join(folder_name, f"{sanitized_title}.pdf")

            # Ensure the output path is unique
            count = 1
            while os.path.exists(output_path):
                output_path = os.path.join(folder_name, f"{sanitized_title}_{count}.pdf")
                count += 1

            download_pdf(pdf_url, output_path)

    # Copy the JSON file to the folder
    json_file_path = os.path.join(folder_name, 'blockchain.json')
    os.rename('blockchain.json', json_file_path)

if __name__ == "__main__":
    main()
