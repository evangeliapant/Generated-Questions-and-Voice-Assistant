from flask import Flask, request, jsonify, render_template
import pdfplumber
from transformers import T5ForConditionalGeneration, T5Tokenizer, pipeline

app = Flask(__name__)

# Load the correct model and tokenizer for question generation
model_name = "valhalla/t5-small-qg-hl"
qg_model = T5ForConditionalGeneration.from_pretrained(model_name)
qg_tokenizer = T5Tokenizer.from_pretrained(model_name)

# Define a pipeline for question generation
qg_pipeline = pipeline("text2text-generation", model=qg_model, tokenizer=qg_tokenizer)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload-pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    pdf_file = request.files['file']

    if pdf_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Process the PDF using pdfplumber
        with pdfplumber.open(pdf_file) as pdf:
            text = "\n".join(page.extract_text() for page in pdf.pages if page.extract_text())

        # Example of generating questions - adjust as needed
        questions = qg_pipeline(text, max_length=512, num_beams=5, num_return_sequences=5) 

        return jsonify(questions)

    except Exception as e:
        print(f"Error processing PDF: {e}")
        return jsonify({'error': 'Failed to process PDF'}), 500

if __name__ == '__main__':
    app.run(debug=True)
