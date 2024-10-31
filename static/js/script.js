let currentQuestion = 0;
let questions = [];

function uploadPDF() {
    const fileInput = document.getElementById('pdfInput');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    fetch('/upload-pdf', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Questions received:', data);
        questions = data;
        displayQuestion();
        document.getElementById('speakBtn').disabled = false;  // Enable the speak button
    })
}

function displayQuestion() {
    const questionContainer = document.getElementById('questionsContainer');
    if (questions.length > 0 && currentQuestion < questions.length) {
        questionContainer.textContent = questions[currentQuestion].question;
    } else {
        questionContainer.textContent = "No more questions or failed to load questions.";
    }
}

function speakQuestion() {
    if (questions.length > 0 && currentQuestion < questions.length) {
        const questionText = questions[currentQuestion].generated_text;  // Access the correct field
        const speech = new SpeechSynthesisUtterance(questionText);  // Create a new speech instance
        
        console.log('Speaking question:', questionText);  // Log the question being spoken
        
        speech.onstart = function () {
            console.log('Speech started');
        };
        
        speech.onend = function () {
            console.log('Speech ended');
            currentQuestion += 1;  // Move to next question when speech ends
        };
        
        window.speechSynthesis.speak(speech);  // Speak the question
    } else {
        console.log('No more questions to speak or question array is empty');
    }
}


function startRecognition() {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = function(event) {
        const answer = event.results[0][0].transcript;
        document.getElementById('answerText').textContent = "You said: " + answer;
        currentQuestion++;
        displayQuestion(); // Move to the next question after recording the answer
    };
    recognition.start();
}
