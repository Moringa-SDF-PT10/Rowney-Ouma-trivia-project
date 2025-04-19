// DOM Elements
const startScreen = document.getElementById('startScreen');
const loadingScreen = document.getElementById('loadingScreen');
const gameScreen = document.getElementById('gameScreen');
const endScreen = document.getElementById('endScreen');

const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');

const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('optionsContainer');
const scoreElement = document.getElementById('score');
const totalQuestionsElement = document.getElementById('totalQuestions');
const finalScoreElement = document.getElementById('finalScore');
const finalTotalElement = document.getElementById('finalTotal');
const progressBar = document.getElementById('progressBar');
const categoryElement = document.getElementById('category');
const difficultyElement = document.getElementById('difficulty');

// Game Variables
let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let timeLeft = 60;
let timerInterval;

// API URL
const apiUrl = 'https://opentdb.com/api.php?amount=10&category=21&difficulty=medium&type=multiple';

// Event Listeners
startBtn.addEventListener('click', startGame);
nextBtn.addEventListener('click', showNextQuestion);
restartBtn.addEventListener('click', restartGame);

function updateTimer() { 
    timeLeft--;
    document.getElementById('timer').textContent = timeLeft;
    if (timeLeft <= 0) clearInterval(timerInterval);
  }
  
// Start the game
function startGame() {
    startScreen.classList.add('hidden');
    loadingScreen.classList.remove('hidden');
    timerInterval = setInterval(updateTimer, 1000); // <- ADD THIS LINE
    fetchQuestions();
  }

// Fetch questions from API
function fetchQuestions() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.response_code === 0) {
                questions = data.results;
                loadingScreen.classList.add('hidden');
                gameScreen.classList.remove('hidden');
                totalQuestionsElement.textContent = questions.length;
                finalTotalElement.textContent = questions.length;
                showQuestion();
            } else {
                // Handle API error
                loadingScreen.classList.add('hidden');
                startScreen.classList.remove('hidden');
                alert('Failed to load questions. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            loadingScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
            alert('Error loading questions. Please check your connection and try again.');
        });
}

// Display current question
function showQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    
    // Decode HTML entities in question and answers
    questionElement.textContent = decodeHtmlEntities(currentQuestion.question);
    categoryElement.textContent = currentQuestion.category;
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Combine correct and incorrect answers
    const allAnswers = [
        currentQuestion.correct_answer,
        ...currentQuestion.incorrect_answers
    ];
    
    // Shuffle answers
    const shuffledAnswers = shuffleArray(allAnswers);
    
    // Create answer buttons
    shuffledAnswers.forEach(answer => {
        const button = document.createElement('button');
        button.classList.add('btn-option');
        button.textContent = decodeHtmlEntities(answer);
        button.addEventListener('click', () => selectAnswer(answer, currentQuestion.correct_answer));
        optionsContainer.appendChild(button);
    });
    
    // Hide next button until an answer is selected
    nextBtn.classList.add('hidden');
}

// Handle answer selection
function selectAnswer(selectedAnswer, correctAnswer) {
    const options = document.querySelectorAll('.btn-option');
    let isCorrect = false;
    
    options.forEach(option => {
        // Disable all buttons
        option.disabled = true;
        
        // Mark correct answer
        if (option.textContent === decodeHtmlEntities(correctAnswer)) {
            option.classList.add('correct');
        }
        
        // Mark selected incorrect answer
        if (option.textContent === decodeHtmlEntities(selectedAnswer) && 
            selectedAnswer !== correctAnswer) {
            option.classList.add('incorrect');
        }
        
        // Check if selected answer is correct
        if (selectedAnswer === correctAnswer && 
            option.textContent === decodeHtmlEntities(selectedAnswer)) {
            isCorrect = true;
        }
    });
    
    // Update score if correct
    if (isCorrect) {
        score++;
        scoreElement.textContent = score;
    }
    
    // Show next button
    nextBtn.classList.remove('hidden');
}

// Show next question or end game
function showNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        endGame();
    }
}

// End the game
function endGame() {
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreElement.textContent = score;
}

// Restart the game
function restartGame() {
    currentQuestionIndex = 0;
    score = 0;
    scoreElement.textContent = score;
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

// Helper function to shuffle array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}
