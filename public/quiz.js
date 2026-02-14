const urlParams = new URLSearchParams(window.location.search);
const quizCode = urlParams.get('code');

if (quizCode) {
    document.getElementById('quizCodeInput').value = quizCode;
} else {
    alert('Quiz kodu bulunamadı!');
    window.location.href = 'index.html';
}

let quizData = null;
let userAnswers = [];

async function startQuiz() {
    const studentName = document.getElementById('studentName').value.trim();
    if (!studentName) return alert('Lütfen adınızı girin!');

    try {
        const res = await fetch(`/api/public/quiz/${quizCode}`);
        const data = await res.json();

        if (data.success) {
            quizData = data.quiz;
            document.getElementById('startScreen').classList.add('hidden');
            document.getElementById('quizScreen').classList.remove('hidden');
            renderQuiz();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Hata oluştu');
    }
}

function renderQuiz() {
    document.getElementById('quizTitle').innerText = quizData.title;
    document.getElementById('quizDesc').innerText = quizData.description || '';

    const container = document.getElementById('questionsContainer');
    container.innerHTML = quizData.questions.map((q, index) => `
        <div class="question-card" id="q-${q._id}">
            <div class="question-header">
                <div class="question-text">${index + 1}. ${q.text}</div>
                <div class="question-points">🎯 ${q.points}p</div>
            </div>
            <div class="options">
                ${['a', 'b', 'c', 'd'].map(optKey => `
                    <div class="option" onclick="selectOption('${q._id}', '${optKey}', this)">
                        <div class="option-label">${optKey.toUpperCase()}</div>
                        <div>${q.options[optKey]}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function selectOption(questionId, answer, element) {
    // UI Update
    const card = document.getElementById(`q-${questionId}`);
    const options = card.querySelectorAll('.option');
    options.forEach(o => o.classList.remove('selected'));
    element.classList.add('selected');

    // Data Update
    const existing = userAnswers.find(a => a.question_id === questionId);
    if (existing) {
        existing.value = answer;
    } else {
        userAnswers.push({ question_id: questionId, value: answer });
    }
}

async function submitQuiz() {
    if (userAnswers.length < quizData.questions.length) {
        if (!confirm('Bazı soruları boş bıraktınız. Yine de bitirmek istiyor musunuz?')) return;
    }

    const studentName = document.getElementById('studentName').value;

    try {
        const res = await fetch(`/api/public/quiz/${quizCode}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_name: studentName,
                answers: userAnswers
            })
        });

        const data = await res.json();

        if (data.success) {
            showResult(data);
        }
    } catch (error) {
        alert('Hata');
    }
}

function showResult(data) {
    document.getElementById('quizScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.remove('hidden');

    document.getElementById('finalScore').innerText = `${data.score} / ${data.max_score}`;

    // Doğru/Yanlış detayları (İsteğe bağlı, burada basit özet)
    const correctCount = data.results.filter(r => r.is_correct).length;
    document.getElementById('resultDetails').innerText =
        `${data.results.length} sorudan ${correctCount} doğru cevap verdiniz.`;
}
