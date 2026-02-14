// Global değişkenler
let currentUser = null;
let isAdmin = false;
let questions = [];
let userAnswers = {};

// ==================== LOGIN FUNCTIONS ====================

function switchLoginTab(tab) {
    const userForm = document.getElementById('userLoginForm');
    const adminForm = document.getElementById('adminLoginForm');
    const tabs = document.querySelectorAll('#loginScreen .tab');

    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'user') {
        userForm.classList.add('active');
        adminForm.classList.remove('active');
        tabs[0].classList.add('active');
    } else {
        adminForm.classList.add('active');
        userForm.classList.remove('active');
        tabs[1].classList.add('active');
    }
}

async function userLogin() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();

    if (!firstName || !lastName) {
        alert('⚠️ Lütfen isim ve soyisim girin!');
        return;
    }

    try {
        const response = await fetch('/api/user/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: firstName, last_name: lastName })
        });

        const data = await response.json();

        if (data.success) {
            currentUser = data.user;
            isAdmin = false;
            showUserDashboard();
        } else {
            alert('❌ Giriş başarısız!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function adminLogin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();

    if (!username || !password) {
        alert('⚠️ Lütfen kullanıcı adı ve şifre girin!');
        return;
    }

    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (data.success) {
            isAdmin = true;
            showAdminDashboard();
        } else {
            alert('❌ ' + data.message);
        }
    } catch (error) {
        console.error('Admin login error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

function logout() {
    currentUser = null;
    isAdmin = false;
    userAnswers = {};

    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('userDashboard').classList.add('hidden');
    document.getElementById('adminDashboard').classList.add('hidden');

    // Formu temizle
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
}

// ==================== USER DASHBOARD ====================

async function showUserDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('userDashboard').classList.remove('hidden');

    document.getElementById('welcomeMessage').textContent =
        `Hoş Geldin, ${currentUser.first_name} ${currentUser.last_name}! 👋`;

    await loadQuiz();
    await loadUserResults();
    await loadLeaderboard();
}

function switchUserTab(tab) {
    const tabs = document.querySelectorAll('#userDashboard .tab');
    const contents = document.querySelectorAll('#userDashboard .tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'quiz') {
        tabs[0].classList.add('active');
        document.getElementById('quizTab').classList.add('active');
        loadQuiz();
    } else if (tab === 'results') {
        tabs[1].classList.add('active');
        document.getElementById('resultsTab').classList.add('active');
        loadUserResults();
    } else if (tab === 'leaderboard') {
        tabs[2].classList.add('active');
        document.getElementById('leaderboardTab').classList.add('active');
        loadLeaderboard();
    }
}

async function loadQuiz() {
    try {
        const response = await fetch('/api/questions');
        questions = await response.json();

        const container = document.getElementById('quizContainer');

        if (questions.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz soru eklenmemiş! 📝</div>';
            return;
        }

        container.innerHTML = questions.map((q, index) => `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-text">${index + 1}. ${q.question_text}</div>
                    <div class="question-points">🎯 ${q.points} puan</div>
                </div>
                <div class="options">
                    ${['A', 'B', 'C', 'D'].map(option => `
                        <div class="option" onclick="selectAnswer(${q.id}, '${option}', this)">
                            <div class="option-label">${option}</div>
                            <div>${q['option_' + option.toLowerCase()]}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Load quiz error:', error);
    }
}

async function selectAnswer(questionId, answer, element) {
    const questionCard = element.closest('.question-card');
    const options = questionCard.querySelectorAll('.option');

    // Önceki seçimi kaldır
    options.forEach(opt => opt.classList.remove('selected'));

    // Yeni seçimi işaretle
    element.classList.add('selected');

    try {
        const response = await fetch('/api/submit-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: currentUser.id,
                question_id: questionId,
                user_answer: answer
            })
        });

        const data = await response.json();

        if (data.success) {
            // Doğru/yanlış göster
            options.forEach(opt => {
                const optLabel = opt.querySelector('.option-label').textContent;
                if (optLabel === data.correct_answer) {
                    opt.classList.add('correct');
                }
                if (optLabel === answer && !data.is_correct) {
                    opt.classList.add('incorrect');
                }
                opt.style.pointerEvents = 'none';
            });

            // Puan mesajı göster
            if (data.is_correct) {
                showMessage(questionCard, `✅ Doğru! +${data.points_earned} puan`, 'success');
            } else {
                showMessage(questionCard, `❌ Yanlış! Doğru cevap: ${data.correct_answer}`, 'error');
            }

            // Sonuçları güncelle
            setTimeout(() => loadUserResults(), 1000);
        }
    } catch (error) {
        console.error('Submit answer error:', error);
    }
}

function showMessage(container, message, type) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.marginTop = '12px';

    container.appendChild(alertDiv);

    setTimeout(() => alertDiv.remove(), 3000);
}

async function loadUserResults() {
    try {
        const response = await fetch(`/api/user/${currentUser.id}/results`);
        const results = await response.json();

        const container = document.getElementById('userResults');
        container.innerHTML = `
            <div class="stat-card">
                <div class="stat-value">🏆 ${results.total_points || 0}</div>
                <div class="stat-label">Toplam Puanın</div>
            </div>
            <div class="stat-card success">
                <div class="stat-value">✅ ${results.correct_answers || 0}</div>
                <div class="stat-label">Doğru Cevap</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-value">📝 ${results.total_questions || 0}</div>
                <div class="stat-label">Cevaplanan Soru</div>
            </div>
        `;
    } catch (error) {
        console.error('Load results error:', error);
    }
}

async function loadLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const leaderboard = await response.json();

        const container = document.getElementById('leaderboardList');

        if (leaderboard.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz kimse test çözmemiş! 🏆</div>';
            return;
        }

        container.innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item">
                <div class="rank">${index + 1}</div>
                <div class="user-info">
                    <div class="user-name">${user.first_name} ${user.last_name}</div>
                    <div class="user-stats">
                        ✅ ${user.correct_answers || 0} doğru · 
                        📝 ${user.questions_answered || 0} soru
                    </div>
                </div>
                <div class="user-points">${user.total_points || 0}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load leaderboard error:', error);
    }
}

// ==================== ADMIN DASHBOARD ====================

async function showAdminDashboard() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');

    await loadAdminQuestions();
    await loadAdminUsers();
    await loadAdminLeaderboard();
}

function switchAdminTab(tab) {
    const tabs = document.querySelectorAll('#adminDashboard .tab');
    const contents = document.querySelectorAll('#adminDashboard .tab-content');

    tabs.forEach(t => t.classList.remove('active'));
    contents.forEach(c => c.classList.remove('active'));

    if (tab === 'questions') {
        tabs[0].classList.add('active');
        document.getElementById('adminQuestionsTab').classList.add('active');
        loadAdminQuestions();
    } else if (tab === 'users') {
        tabs[1].classList.add('active');
        document.getElementById('adminUsersTab').classList.add('active');
        loadAdminUsers();
    } else if (tab === 'leaderboard') {
        tabs[2].classList.add('active');
        document.getElementById('adminLeaderboardTab').classList.add('active');
        loadAdminLeaderboard();
    }
}

async function addQuestion() {
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
        const response = await fetch('/api/admin/questions', {
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
            alert('✅ Soru başarıyla eklendi!');

            // Formu temizle
            document.getElementById('questionText').value = '';
            document.getElementById('optionA').value = '';
            document.getElementById('optionB').value = '';
            document.getElementById('optionC').value = '';
            document.getElementById('optionD').value = '';
            document.getElementById('points').value = '10';

            await loadAdminQuestions();
        } else {
            alert('❌ Soru eklenirken hata oluştu!');
        }
    } catch (error) {
        console.error('Add question error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function loadAdminQuestions() {
    try {
        const response = await fetch('/api/admin/questions');
        const questions = await response.json();

        const container = document.getElementById('questionsList');

        if (questions.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz soru eklenmemiş! 📝</div>';
            return;
        }

        container.innerHTML = questions.map((q, index) => `
            <div class="question-card">
                <div class="question-header">
                    <div class="question-text">${index + 1}. ${q.question_text}</div>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <div class="question-points">🎯 ${q.points} puan</div>
                        <button class="btn btn-danger" onclick="deleteQuestion(${q.id})" style="padding: 8px 16px;">
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
        console.error('Load admin questions error:', error);
    }
}

async function deleteQuestion(id) {
    if (!confirm('Bu soruyu silmek istediğinize emin misiniz?')) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/questions/${id}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Soru silindi!');
            await loadAdminQuestions();
        } else {
            alert('❌ Soru silinirken hata oluştu!');
        }
    } catch (error) {
        console.error('Delete question error:', error);
        alert('❌ Bir hata oluştu!');
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch('/api/admin/users');
        const users = await response.json();

        const container = document.getElementById('usersList');

        if (users.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz kullanıcı yok! 👥</div>';
            return;
        }

        container.innerHTML = `
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>İsim Soyisim</th>
                            <th>Toplam Puan</th>
                            <th>Cevaplanan Soru</th>
                            <th>Doğru Cevap</th>
                            <th>Başarı Oranı</th>
                            <th>Katılım Tarihi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => {
            const successRate = user.questions_answered > 0
                ? ((user.correct_answers / user.questions_answered) * 100).toFixed(0)
                : 0;
            return `
                                <tr>
                                    <td><strong>${user.first_name} ${user.last_name}</strong></td>
                                    <td><span class="badge badge-primary">🏆 ${user.total_points || 0}</span></td>
                                    <td>📝 ${user.questions_answered || 0}</td>
                                    <td>✅ ${user.correct_answers || 0}</td>
                                    <td><span class="badge badge-success">%${successRate}</span></td>
                                    <td>${new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                                </tr>
                            `;
        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Load admin users error:', error);
    }
}

async function loadAdminLeaderboard() {
    try {
        const response = await fetch('/api/leaderboard');
        const leaderboard = await response.json();

        const container = document.getElementById('adminLeaderboardList');

        if (leaderboard.length === 0) {
            container.innerHTML = '<div class="alert alert-error">Henüz kimse test çözmemiş! 🏆</div>';
            return;
        }

        container.innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item">
                <div class="rank">${index + 1}</div>
                <div class="user-info">
                    <div class="user-name">${user.first_name} ${user.last_name}</div>
                    <div class="user-stats">
                        ✅ ${user.correct_answers || 0} doğru · 
                        📝 ${user.questions_answered || 0} soru
                    </div>
                </div>
                <div class="user-points">${user.total_points || 0}</div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load admin leaderboard error:', error);
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Quiz Uygulaması hazır!');
});
