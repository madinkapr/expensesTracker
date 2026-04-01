import PyPDF2
import os

pdf_path = r'C:\Users\elikp\OneDrive\Documents\Projects\ExpensesTracker\docs\expensewise_tz_webapp_v2.pdf'
output_path = r'C:\Users\elikp\OneDrive\Documents\Projects\ExpensesTracker\docs\pdf_content.txt'

with open(pdf_path, 'rb') as file:
    reader = PyPDF2.PdfReader(file)
    print(f"Pages: {len(reader.pages)}")
    
    full_text = ""
    for i, page in enumerate(reader.pages, 1):
        text = page.extract_text()
        full_text += f"--- Page {i} ---\n{text}\n\n"
        print(f"Extracted page {i}...")
    
    with open(output_path, 'w', encoding='utf-8') as out_file:
        out_file.write(full_text)
    
    print(f"\nPDF extracted successfully to {output_path}")
