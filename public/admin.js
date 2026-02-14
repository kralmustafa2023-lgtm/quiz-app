const token = localStorage.getItem('token');
if (!token) window.location.href = 'index.html';

const API_URL = '/api/creator';
let currentQuizId = null;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', loadQuizzes);

async function loadQuizzes() {
    try {
        const res = await fetch(`${API_URL}/quizzes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const quizzes = await res.json();
        const list = document.getElementById('quizList');

        if (quizzes.length === 0) {
            list.innerHTML = '<p>Henüz hiç quiz oluşturmadınız.</p>';
            return;
        }

        list.innerHTML = quizzes.map(q => `
            <div class="quiz-item">
                <h3>${q.title}</h3>
                <p class="code">Kod: <strong>${q.id}</strong></p>
                <div class="actions">
                    <button onclick="openDetail('${q.id}', '${q.title}')" class="btn small primary">Yönet</button>
                    <button onclick="deleteQuiz('${q.id}')" class="btn small danger">Sil</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error(error);
        alert('Quizler yüklenirken hata oluştu');
    }
}

function showCreateQuizModal() {
    document.getElementById('createQuizModal').style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

async function createQuiz() {
    const title = document.getElementById('newQuizTitle').value;
    const description = document.getElementById('newQuizDesc').value;

    if (!title) return alert('Başlık zorunlu!');

    try {
        const res = await fetch(`${API_URL}/quizzes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, description })
        });

        if (res.ok) {
            closeModal('createQuizModal');
            loadQuizzes();
        } else {
            alert('Hata oluştu');
        }
    } catch (error) {
        console.error(error);
    }
}

async function deleteQuiz(id) {
    if (!confirm('Bu quizi silmek istediğine emin misin?')) return;

    try {
        await fetch(`${API_URL}/quizzes/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadQuizzes();
    } catch (error) {
        alert('Silinemedi');
    }
}

async function openDetail(id, title) {
    currentQuizId = id;
    document.getElementById('detailTitle').innerText = title;
    document.getElementById('detailCode').innerText = `Öğrenci Katılım Kodu: ${id}`;
    document.getElementById('quizDetailModal').style.display = 'block';

    loadResults(id);
}

async function addQuestion() {
    if (!currentQuizId) return;

    const data = {
        text: document.getElementById('qText').value,
        options: {
            a: document.getElementById('optA').value,
            b: document.getElementById('optB').value,
            c: document.getElementById('optC').value,
            d: document.getElementById('optD').value
        },
        correct_answer: document.getElementById('correctOpt').value,
        points: parseInt(document.getElementById('qPoints').value)
    };

    if (!data.text || !data.options.a || !data.options.b) return alert('Soru ve en az 2 şık gerekli');

    try {
        const res = await fetch(`${API_URL}/quizzes/${currentQuizId}/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Soru eklendi!');
            // Formu temizle
            document.getElementById('qText').value = '';
            document.getElementById('optA').value = '';
            document.getElementById('optB').value = '';
            document.getElementById('optC').value = '';
            document.getElementById('optD').value = '';
        } else {
            alert('Hata');
        }
    } catch (error) {
        alert('Hata');
    }
}

async function loadResults(id) {
    const list = document.getElementById('resultsList');
    list.innerHTML = 'Yükleniyor...';

    try {
        const res = await fetch(`${API_URL}/quizzes/${id}/results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const results = await res.json();

        if (results.length === 0) {
            list.innerHTML = '<p>Henüz katılım yok.</p>';
            return;
        }

        list.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Öğrenci</th>
                        <th>Puan</th>
                        <th>Tarih</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => `
                        <tr>
                            <td>${r.user_name}</td>
                            <td>${r.score} / ${r.max_score}</td>
                            <td>${new Date(r.completed_at).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        list.innerHTML = 'Hata';
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
