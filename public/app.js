// Global değişkenler
let currentUser = null;
let currentQuiz = null;
let currentParticipant = null;

// ==================== LOGIN/REGISTER FUNCTIONS ====================

function switchLoginTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const joinQuizForm = document.getElementById('joinQuizForm');
    const tabs = document.querySelectorAll('#loginScreen .tab');

    tabs.forEach(t => t.classList.remove('active'));
    [loginForm, registerForm, joinQuizForm].forEach(f => f.classList.remove('active'));

    if (tab === 'login') {
        loginForm.classList.add('active');
        tabs[0].classList.add('active');
    } else if (tab === 'register') {
        registerForm.classList.add('active');
        tabs[1].classList.add('active');
    } else if (tab === 'join') {
        joinQuizForm.classList.add('active');
        tabs[2].classList.add('active');
    }
}

async function userLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    if (!username || !password) {
        alert('⚠️ Lütfen kullanıcı adı ve şifre girin!');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            showUserDashboard();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function userRegister() {
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!firstName || !lastName || !username || !password) {
        alert('⚠️ Lütfen tüm alanları doldurun!');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, username, password })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
            switchLoginTab('login');
            document.getElementById('loginUsername').value = username;
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Register error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function joinQuiz() {
    const participantName = document.getElementById('participantName').value.trim();
    const quizCode = document.getElementById('quizCode').value.trim().toUpperCase();

    if (!participantName || !quizCode) {
        alert('⚠️ Lütfen isminizi ve quiz kodunu girin!');
        return;
    }

    try {
        const response = await fetch(`/api/public/quiz/${quizCode}`);
        const data = await response.json();

        if (data.success) {
            currentQuiz = data.quiz;
            currentParticipant = { name: participantName, quiz_code: quizCode };
            showTakeQuizScreen();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Join quiz error:', error);
        alert('❌ Quiz bulunamadı!');
    }
}

function logout() {
    currentUser = null;
    currentQuiz = null;
    currentParticipant = null;

    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('userDashboard').classList.add('hidden');
    document.getElementById('quizDetailScreen').classList.add('hidden');
    document.getElementById('takeQuizScreen').classList.add('hidden');

    // Clear forms
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
}

// ==================== USER DASHBOARD ====================

async function showUserDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('userDashboard').classList.remove('hidden');

    document.getElementById('welcomeMessage').textContent =
        `Hoş Geldin, ${currentUser.first_name} ${currentUser.last_name}! 👋`;

    await loadMyQuizzes();
}

function switchUserTab(tab) {
    const tabs = document.querySelectorAll('#userDashboard .tab');
    const contents = document.querySelectorAll('#userDashboard .tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'myquizzes') {
        tabs[0].classList.add('active');
        document.getElementById('myQuizzesTab').classList.add('active');
        loadMyQuizzes();
    } else if (tab === 'create') {
        tabs[1].classList.add('active');
        document.getElementById('createQuizTab').classList.add('active');
    } else if (tab === 'results') {
        tabs[2].classList.add('active');
        document.getElementById('resultsTab').classList.add('active');
        loadUserParticipations();
    }
}

async function loadMyQuizzes() {
    try {
        const response = await fetch(`/api/creator/${currentUser.id}/quizzes`);
        const quizzes = await response.json();

        const container = document.getElementById('myQuizzesList');

        if (quizzes.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz quiz oluşturmadınız! ➕ Yeni Quiz sekmesinden oluşturabilirsiniz.</div>';
            return;
        }

        container.innerHTML = quizzes.map(quiz => `
            <div class="question-card" style="cursor: pointer;" onclick="openQuizDetail('${quiz.quiz_code}')">
                <div class="question-header">
                    <div>
                        <div class="question-text">${quiz.title}</div>
                        <p style="margin: 8px 0; color: var(--gray-dark);">${quiz.description || ''}</p>
                        <div style="display: flex; gap: 15px; margin-top: 10px;">
                            <span>📝 ${quiz.question_count || 0} soru</span>
                            <span>👥 ${quiz.participant_count || 0} katılımcı</span>
                            <span>🔑 Kod: <strong>${quiz.quiz_code}</strong></span>
                        </div>
                    </div>
                    <div>
                        <span class="badge ${quiz.is_active ? 'badge-success' : 'badge-secondary'}">
                            ${quiz.is_active ? '✅ Aktif' : '🔒 Pasif'}
                        </span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load my quizzes error:', error);
    }
}

async function createQuiz() {
    const title = document.getElementById('quizTitle').value.trim();
    const description = document.getElementById('quizDescription').value.trim();

    if (!title) {
        alert('⚠️ Lütfen quiz başlığı girin!');
        return;
    }

    try {
        const response = await fetch('/api/creator/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creator_id: currentUser.id,
                title,
                description
            })
        });

        const data = await response.json();

        if (data.success) {
            const messageDiv = document.getElementById('quizCreatedMessage');
            messageDiv.className = 'alert alert-success';
            messageDiv.innerHTML = `
                ✅ Quiz oluşturuldu!<br>
                <strong>Quiz Kodu: ${data.quiz.quiz_code}</strong><br>
                Bu kodu arkadaşlarınızla paylaşın!
            `;
            messageDiv.classList.remove('hidden');

            // Clear form
            document.getElementById('quizTitle').value = '';
            document.getElementById('quizDescription').value = '';

            // Reload quizzes
            setTimeout(() => {
                switchUserTab('myquizzes');
                messageDiv.classList.add('hidden');
            }, 3000);
        } else {
            alert('❌ Quiz oluşturulamadı!');
        }
    } catch (error) {
        console.error('Create quiz error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function loadUserParticipations() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/participations`);
        const participations = await response.json();

        const container = document.getElementById('userResults');

        if (participations.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz hiçbir quiz\'e katılmadınız!</div>';
            return;
        }

        container.innerHTML = participations.map(p => `
            <div class="stat-card">
                <div class="stat-value">${p.quiz_title}</div>
                <div class="stat-label">🏆 ${p.score || 0} / ${p.max_score || 0} puan</div>
                <div class="stat-label">✅ ${p.correct_answers || 0} doğru</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load participations error:', error);
    }
}

// ==================== QUIZ DETAIL SCREEN ====================

async function openQuizDetail(quizCode) {
    try {
        const response = await fetch(`/api/creator/quiz/${quizCode}`);
        const data = await response.json();

        if (data.success) {
            currentQuiz = data.quiz;
            
            document.getElementById('userDashboard').classList.add('hidden');
            document.getElementById('quizDetailScreen').classList.remove('hidden');

            document.getElementById('quizDetailTitle').textContent = currentQuiz.title;
            document.getElementById('quizDetailDescription').textContent = currentQuiz.description || '';
            document.getElementById('quizCodeDisplay').innerHTML = `
                <div class="alert alert-success">
                    🔑 Quiz Kodu: <strong style="font-size: 24px;">${currentQuiz.quiz_code}</strong>
                    <br><small>Bu kodu arkadaşlarınızla paylaşın!</small>
                </div>
            `;

            await loadQuizQuestions();
            await loadQuizParticipants();
            await loadQuizLeaderboard();
        }
    } catch (error) {
        console.error('Open quiz detail error:', error);
    }
}

function backToMyQuizzes() {
    document.getElementById('quizDetailScreen').classList.add('hidden');
    document.getElementById('userDashboard').classList.remove('hidden');
    currentQuiz = null;
    switchUserTab('myquizzes');
}

function switchQuizDetailTab(tab) {
    const tabs = document.querySelectorAll('#quizDetailScreen .tab');
    const contents = document.querySelectorAll('#quizDetailScreen .tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'questions') {
        tabs[0].classList.add('active');
        document.getElementById('quizQuestionsTab').classList.add('active');
        loadQuizQuestions();
    } else if (tab === 'participants') {
        tabs[1].classList.add('active');
        document.getElementById('quizParticipantsTab').classList.add('active');
        loadQuizParticipants();
    } else if (tab === 'leaderboard') {
        tabs[2].classList.add('active');
        document.getElementById('quizLeaderboardTab').classList.add('active');
        loadQuizLeaderboard();
    }
}

async function addQuestionToQuiz() {
    const questionText = document.getElementById('questionText').value.trim();
    const optionA = document.getElementById('optionA').value.trim();
    const optionB = document.getElementById('optionB').value.trim();
    const optionC = document.getElementById('optionC').value.trim();
    const optionD = document.getElementById('optionD').value.trim();
    const correctAnswer = document.getElementById('correctAnswer').value;
    const points = document.getElementById('points').value;

    if (!questionText || !optionA || !optionB || !optionC || !optionD) {
        alert('⚠️ Lütfen tüm alanları doldurun!');
        return;
    }

    try {
        const response = await fetch(`/api/creator/quiz/${currentQuiz.quiz_code}/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                question_text: questionText,
                option_a: optionA,
                option_b: optionB,
                option_c: optionC,
                option_d: optionD,
                correct_answer: correctAnswer,
                points: parseInt(points)
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Soru eklendi!');

            // Clear form
            document.getElementById('questionText').value = '';
            document.getElementById('optionA').value = '';
            document.getElementById('optionB').value = '';
            document.getElementById('optionC').value = '';
            document.getElementById('optionD').value = '';
            document.getElementById('points').value = '10';

            await loadQuizQuestions();
        } else {
            alert('❌ Soru eklenirken hata oluştu!');
        }
    } catch (error) {
        console.error('Add question error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function loadQuizQuestions() {
    try {
        const response = await fetch(`/api/creator/quiz/${currentQuiz.quiz_code}/questions`);
        const questions = await response.json();

        const container = document.getElementById('quizQuestionsList');

        if (questions.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz soru eklenmemiş!</div>';
            return;
        }

        container.innerHTML = questions.map((q, index) => `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-text">${index + 1}. ${q.question_text}</div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div class="question-points">🎯 ${q.points} puan</div>
                        <button class="btn btn-danger" onclick="deleteQuizQuestion('${q._id}')" style="padding: 8px 16px;">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="options">
                    ${['A', 'B', 'C', 'D'].map(option => `
                        <div class="option ${option === q.correct_answer ? 'correct' : ''}">
                            <div class="option-label">${option}</div>
                            <div>${q['option_' + option.toLowerCase()]}</div>
                            ${option === q.correct_answer ? '<span style="margin-left: auto; color: var(--success); font-weight: 700;">✓ Doğru</span>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load quiz questions error:', error);
    }
}

async function deleteQuizQuestion(questionId) {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`/api/creator/quiz/${currentQuiz.quiz_code}/questions/${questionId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Soru silindi!');
            await loadQuizQuestions();
        } else {
            alert('❌ Soru silinirken hata oluştu!');
        }
    } catch (error) {
        console.error('Delete question error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function loadQuizParticipants() {
    try {
        const response = await fetch(`/api/creator/quiz/${currentQuiz.quiz_code}/participants`);
        const participants = await response.json();

        const container = document.getElementById('participantsList');

        if (participants.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz katılımcı yok!</div>';
            return;
        }

        container.innerHTML = `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Katılımcı</th>
                            <th>Puan</th>
                            <th>Doğru</th>
                            <th>Yanlış</th>
                            <th>Tarih</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${participants.map(p => `
                            <tr>
                                <td><strong>${p.participant_name}</strong></td>
                                <td><span class="badge badge-primary">🏆 ${p.score || 0}</span></td>
                                <td>✅ ${p.correct_answers || 0}</td>
                                <td>❌ ${(p.total_questions || 0) - (p.correct_answers || 0)}</td>
                                <td>${new Date(p.completed_at).toLocaleDateString('tr-TR')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Load participants error:', error);
    }
}

async function loadQuizLeaderboard() {
    try {
        const response = await fetch(`/api/creator/quiz/${currentQuiz.quiz_code}/leaderboard`);
        const leaderboard = await response.json();

        const container = document.getElementById('quizLeaderboardList');

        if (leaderboard.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz kimse quiz\'i tamamlamamış!</div>';
            return;
        }

        container.innerHTML = leaderboard.map((p, index) => `
            <div class="leaderboard-item">
                <div class="rank">${index + 1}</div>
                <div class="user-info">
                    <div class="user-name">${p.participant_name}</div>
                    <div class="user-stats">
                        ✅ ${p.correct_answers || 0} doğru · 
                        ❌ ${(p.total_questions || 0) - (p.correct_answers || 0)} yanlış
                    </div>
                </div>
                <div class="user-points">${p.score || 0}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load leaderboard error:', error);
    }
}

// ==================== TAKE QUIZ SCREEN (for participants) ====================

async function showTakeQuizScreen() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('takeQuizScreen').classList.remove('hidden');

    document.getElementById('takeQuizTitle').textContent = currentQuiz.title;
    document.getElementById('takeQuizDescription').textContent = currentQuiz.description || '';
    document.getElementById('participantInfo').innerHTML = `
        <span class="badge badge-primary">👤 ${currentParticipant.name}</span>
    `;

    await loadQuizForParticipant();
}

async function loadQuizForParticipant() {
    const container = document.getElementById('quizQuestionsContainer');

    if (currentQuiz.questions.length === 0) {
        container.innerHTML = '<div class="alert alert-error">Bu quiz\'de henüz soru yok!</div>';
        return;
    }

    container.innerHTML = currentQuiz.questions.map((q, index) => `
        <div class="question-card" data-question-id="${q._id}">
            <div class="question-header">
                <div class="question-text">${index + 1}. ${q.question_text}</div>
                <div class="question-points">🎯 ${q.points} puan</div>
            </div>
            <div class="options">
                ${['A', 'B', 'C', 'D'].map(option => `
                    <div class="option" onclick="selectParticipantAnswer('${q._id}', '${option}', this)">
                        <div class="option-label">${option}</div>
                        <div>${q['option_' + option.toLowerCase()]}</div>
                    </div>
                `).join('')}
            </div>
            <div class="answer-feedback"></div>
        </div>
    `).join('');

    container.innerHTML += `
        <button class="btn btn-success btn-block" onclick="submitQuizAnswers()" style="margin-top: 30px;">
            ✅ Quiz'i Tamamla
        </button>
    `;
}

const participantAnswers = {};

function selectParticipantAnswer(questionId, answer, element) {
    const questionCard = element.closest('.question-card');
    const options = questionCard.querySelectorAll('.option');

    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');

    participantAnswers[questionId] = answer;
}

async function submitQuizAnswers() {
    const answeredCount = Object.keys(participantAnswers).length;
    const totalQuestions = currentQuiz.questions.length;

    if (answeredCount < totalQuestions) {
        if (!confirm(`${totalQuestions - answeredCount} soru cevaplanmadı. Yine de göndermek istiyor musunuz?`)) {
            return;
        }
    }

    try {
        const answers = Object.entries(participantAnswers).map(([question_id, answer]) => ({
            question_id,
            answer
        }));

        const response = await fetch(`/api/public/quiz/${currentQuiz.quiz_code}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                participant_name: currentParticipant.name,
                answers
            })
        });

        const data = await response.json();

        if (data.success) {
            showQuizResults(data);
        } else {
            alert('❌ Quiz gönderilemedi!');
        }
    } catch (error) {
        console.error('Submit quiz error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

function showQuizResults(data) {
    document.getElementById('quizQuestionsContainer').classList.add('hidden');
    document.getElementById('quizResultSummary').classList.remove('hidden');

    const percentage = ((data.score / data.max_score) * 100).toFixed(0);

    document.getElementById('finalScore').innerHTML = `
        <div class="stat-card success">
            <div class="stat-value">🏆 ${data.score}</div>
            <div class="stat-label">Toplam Puan</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">✅ ${data.correct_count}</div>
            <div class="stat-label">Doğru Cevap</div>
        </div>
        <div class="stat-card warning">
            <div class="stat-value">❌ ${data.wrong_count}</div>
            <div class="stat-label">Yanlış Cevap</div>
        </div>
        <div class="stat-card ${percentage >= 70 ? 'success' : percentage >= 50 ? 'warning' : ''}">
            <div class="stat-value">%${percentage}</div>
            <div class="stat-label">Başarı Oranı</div>
        </div>
    `;
}

function exitQuiz() {
    currentQuiz = null;
    currentParticipant = null;
    document.getElementById('takeQuizScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('quizResultSummary').classList.add('hidden');
    document.getElementById('quizQuestionsContainer').classList.remove('hidden');
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Quiz Uygulaması hazır!');
});
