// Hybridní aplikace pro správu hudebních žáků s Google Apps Script API
class MusicStudentManager {
    constructor() {
        // Konfigurace API
        this.config = {
            apiBaseUrl: "https://script.google.com/macros/s/AKfycbwIXxgETTkJ6tAzm1XzpmSngGBgPh5qhnCZA3PBMeKrnkoQT1OWLIGnq0LcDoyiC9E8Fg/exec",  // ← ZMĚŇTE!
            testMode: false,  // ← true = fallback data, false = ostré API
            syncInterval: 30000, // 30 sekund
            maxRetries: 3
        };

        // Fallback data pro testování
        this.fallbackData = {
            "students": [
                {"id": 1, "firstName": "Karolína", "lastName": "Bayerová", "fullName": "Bayerová Karolína", "birthDate": "2015-11-28", "instrument": "kytara", "grade": 3, "motivation": 2, "avatar": "https://drive.google.com/file/d/1-_uvWkEc1nMdMUf5CmRNJ-v9C8wvRWK-/view?usp=sharing", "nickname": "Karolínka"},
                {"id": 2, "firstName": "Antonín", "lastName": "Bechyňa", "fullName": "Bechyňa Antonín", "birthDate": "2014-10-02", "instrument": "kytara", "grade": 4, "motivation": 1, "avatar": "https://images.squarespace-cdn.com/content/v1/5e6ec4e2ba0df96243db28ec/1719006484066-YI3WQCK626ROB6EZ5L03/known+feature+03+-+metronome.jpg", "nickname": "Toník"},
                {"id": 3, "firstName": "Filip", "lastName": "Červenka", "fullName": "Červenka Filip", "birthDate": "2015-04-05", "instrument": "klarinet", "grade": 4, "motivation": 4, "avatar": "https://drive.google.com/file/d/1-_uvWkEc1nMdMUf5CmRNJ-v9C8wvRWK-/view?usp=sharing", "nickname": "Filípek"}
            ],
            "tasks": [
                {"id": 1, "title": "Hrát správné noty a posuvky", "studentName": "Bechyňa Antonín", "note": "", "composition": "Coleman - Irská", "status": "⏳ Cvičíme", "date": "2025-09-19", "points": 6},
                {"id": 2, "title": "Dotáhnout držení nástroje", "studentName": "Bechyňa Antonín", "note": "", "composition": "Bach - Chorál č. 1", "status": "🚀 Skvělý pokrok!", "date": "2025-09-20", "points": 9}
            ],
            "awards": [
                {"id": 1, "title": "Super Rytmus", "imageUrl": "https://i.imgur.com/fm6lp0f.jpg", "description": "Za zvládnutí složitého rytmického úseku.", "studentName": "Bechyňa Antonín"}
            ]
        };

        // Aktuální stav aplikace
        this.students = [];
        this.tasks = [];
        this.awards = [];
        this.compositions = [];
        this.currentUser = null;
        this.userType = null; // 'admin' nebo 'student'
        
        // Inicializace
        this.init();
    }

    async init() {
        this.showLoading('Inicializuji aplikaci...');
        
        // Zkontroluj URL parametry (tokeny)
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const adminToken = urlParams.get('admin');
        
        if (token || adminToken) {
            // Má token - zkus načíst data
            await this.loadDataWithToken(token, adminToken);
        } else {
            // Nemá token - zobraz login
            this.showLogin();
        }
    }

    async loadDataWithToken(token, adminToken) {
        try {
            this.showLoading('Načítám data ze serveru...');
            
            const data = await this.fetchDataFromAPI(token, adminToken);
            
            if (data.success) {
                this.userType = data.userType;
                this.loadDataFromResponse(data.data);
                this.showMainApp();
                this.setupEventListeners();
                
                if (this.userType === 'admin') {
                    this.showAdminView();
                } else {
                    this.showStudentView();
                }
            } else {
                throw new Error(data.error || 'Neplatný token');
            }
        } catch (error) {
            console.error('Chyba při načítání dat:', error);
            this.showError('Nepodařilo se načíst data. Zkontrolujte připojení k internetu.');
            
            // Fallback na testovací data
            if (this.config.testMode) {
                this.showLoading('Používám testovací data...');
                setTimeout(() => {
                    this.loadFallbackData();
                    this.showMainApp();
                    this.setupEventListeners();
                    this.showAdminView(); // Defaultně admin view pro testování
                }, 1000);
            }
        }
    }

  async fetchDataFromAPI(token, adminToken) {
    if (this.config.testMode) {
        // Simulace API volání v test režimu
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    success: true,
                    userType: adminToken ? 'admin' : 'student',
                    data: {
                        students: this.fallbackData.students,
                        tasks: this.fallbackData.tasks,
                        awards: this.fallbackData.awards,
                        compositions: []
                    }
                });
            }, 1500); // Simulace zpoždění
        });
    }

    // Skutečné API volání
    const url = new URL(this.config.apiBaseUrl);
    url.searchParams.set('format', 'json');
    
    if (adminToken) {
        url.searchParams.set('admin', adminToken);
    } else if (token) {
        url.searchParams.set('token', token);
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}


        // Skutečné API volání
        const url = new URL(this.config.apiBaseUrl);
        url.searchParams.set('format', 'json');
        
        if (adminToken) {
            url.searchParams.set('admin', adminToken);
        } else if (token) {
            url.searchParams.set('token', token);
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    loadDataFromResponse(data) {
        this.students = data.students || [];
        this.tasks = data.tasks || [];
        this.awards = data.awards || [];
        this.compositions = data.compositions || [];
        
        // Pokud je to student, nastav currentStudent
        if (this.userType === 'student' && data.student) {
            this.currentStudent = data.student;
        }
    }

    loadFallbackData() {
        this.students = [...this.fallbackData.students];
        this.tasks = [...this.fallbackData.tasks];
        this.awards = [...this.fallbackData.awards];
        this.userType = 'admin'; // Pro testování
    }

    // UI Metody
    showLoading(message = 'Načítám...') {
        this.hideAllScreens();
        document.getElementById('loadingScreen').classList.remove('hidden');
        document.getElementById('loadingStatus').textContent = message;
    }

    showLogin() {
        this.hideAllScreens();
        document.getElementById('loginScreen').classList.remove('hidden');
        this.setupLoginEventListeners();
    }

    showMainApp() {
        this.hideAllScreens();
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Aktualizuj user info
        const userInfo = document.getElementById('userInfo');
        if (this.userType === 'admin') {
            userInfo.textContent = '👨‍🏫 Režim učitele';
        } else if (this.currentStudent) {
            userInfo.textContent = `👨‍🎓 ${this.currentStudent.nickname}`;
        }
    }

    showError(message) {
        this.hideAllScreens();
        const errorHtml = `
            <div class="error-screen">
                <div class="error-content">
                    <div class="error-icon">❌</div>
                    <h2>Chyba</h2>
                    <p>${message}</p>
                    <button onclick="location.reload()" class="btn btn--primary">Zkusit znovu</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHtml);
    }

    hideAllScreens() {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }

    showAdminView() {
        // Zobraz admin kontroly
        const headerControls = document.getElementById('headerControls');
        if (headerControls) {
            headerControls.innerHTML = `
                <select id="instrumentFilter" class="form-control filter-select">
                    <option value="">Všechny nástroje</option>
                    <option value="kytara">Kytara</option>
                    <option value="klarinet">Klarinet</option>
                    <option value="zobcová flétna">Zobcová flétna</option>
                    <option value="saxofon">Saxofon</option>
                </select>
                <select id="gradeFilter" class="form-control filter-select">
                    <option value="">Všechny ročníky</option>
                    <option value="1">1. ročník</option>
                    <option value="2">2. ročník</option>
                    <option value="3">3. ročník</option>
                    <option value="4">4. ročník</option>
                </select>
                <button id="addStudentBtn" class="btn btn--primary">➕ Přidat žáka</button>
            `;
        }
        
        this.renderDashboard();
        this.updateStats();
    }

    showStudentView() {
        // Skryj admin kontroly
        const headerControls = document.getElementById('headerControls');
        if (headerControls) {
            headerControls.innerHTML = '';
        }
        
        if (this.currentStudent) {
            this.showStudentDetail(this.currentStudent);
        }
    }

    setupLoginEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const tokenInput = document.getElementById('tokenInput');
                if (tokenInput && tokenInput.value) {
                    // Přesměruj na URL s tokenem
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('token', tokenInput.value);
                    window.location.href = newUrl.toString();
                }
            });
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Odstraň tokeny z URL a reload
                const newUrl = new URL(window.location.href);
                newUrl.search = '';
                window.location.href = newUrl.toString();
            });
        }

        // Filtry (pouze pro admin)
        if (this.userType === 'admin') {
            const instrumentFilter = document.getElementById('instrumentFilter');
            const gradeFilter = document.getElementById('gradeFilter');
            
            if (instrumentFilter) {
                instrumentFilter.addEventListener('change', () => this.applyFilters());
            }
            if (gradeFilter) {
                gradeFilter.addEventListener('change', () => this.applyFilters());
            }
        }
    }

    // Dashboard metody (stejné jako předtím)
    renderDashboard() {
        this.showView('dashboardView');
        this.renderStudentsGrid();
    }

    renderStudentsGrid(filteredStudents = null) {
        const studentsToRender = filteredStudents || this.students;
        const grid = document.getElementById('studentsGrid');
        
        if (!grid) return;
        
        if (studentsToRender.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🎵</div>
                    <p class="empty-state-text">Žádní žáci nevyhovují filtrům</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = studentsToRender.map(student => this.createStudentCard(student)).join('');

        // Přidání event listenerů pro karty žáků
        studentsToRender.forEach(student => {
            const card = document.querySelector(`[data-student-id="${student.id}"]`);
            if (card) {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showStudentDetail(student);
                });
            }
        });
    }

    createStudentCard(student) {
        const studentTasks = this.getStudentTasks(student.fullName);
        const averagePoints = this.calculateAveragePoints(studentTasks);
        const motivationClass = this.getMotivationClass(student.motivation);
        const motivationText = this.getMotivationText(student.motivation);
        const age = this.calculateAge(student.birthDate);
        const initials = this.getInitials(student.firstName, student.lastName);

        return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar">${initials}</div>
                    <div class="student-info">
                        <h3>${student.nickname || student.firstName}</h3>
                        <div class="student-details">
                            ${student.instrument} • ${student.grade}. ročník • ${age} let
                        </div>
                    </div>
                </div>
                <div class="student-stats">
                    <div class="stat-item">
                        <span class="stat-value">${averagePoints.toFixed(1)}</span>
                        <span class="stat-label">Průměr bodů</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${studentTasks.length}</span>
                        <span class="stat-label">Úkolů</span>
                    </div>
                </div>
                <div class="motivation-indicator ${motivationClass}">
                    <span>${motivationText}</span>
                </div>
            </div>
        `;
    }

    showStudentDetail(student) {
        this.currentStudent = student;
        this.showView('studentDetailView');
        this.renderStudentProfile(student);
        this.renderStudentTasks(student);
        this.renderStudentAwards(student);
    }

    renderStudentProfile(student) {
        const age = this.calculateAge(student.birthDate);
        const initials = this.getInitials(student.firstName, student.lastName);
        const motivationText = this.getMotivationText(student.motivation);
        
        const profileElement = document.getElementById('studentProfile');
        if (profileElement) {
            profileElement.innerHTML = `
                <div class="profile-avatar">${initials}</div>
                <div class="profile-info">
                    <h2>${student.fullName}</h2>
                    <div class="profile-details">
                        <div class="profile-detail">
                            <span class="profile-detail-label">Přezdívka</span>
                            <span class="profile-detail-value">${student.nickname || student.firstName}</span>
                        </div>
                        <div class="profile-detail">
                            <span class="profile-detail-label">Nástroj</span>
                            <span class="profile-detail-value">${student.instrument}</span>
                        </div>
                        <div class="profile-detail">
                            <span class="profile-detail-label">Ročník</span>
                            <span class="profile-detail-value">${student.grade}. ročník</span>
                        </div>
                        <div class="profile-detail">
                            <span class="profile-detail-label">Věk</span>
                            <span class="profile-detail-value">${age} let</span>
                        </div>
                        <div class="profile-detail">
                            <span class="profile-detail-label">Motivace</span>
                            <span class="profile-detail-value">${motivationText}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    renderStudentTasks(student) {
        const tasks = this.getStudentTasks(student.fullName);
        const tasksList = document.getElementById('tasksList');

        if (!tasksList) return;

        if (tasks.length === 0) {
            tasksList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <p class="empty-state-text">Žádné úkoly zatím nebyly přidány</p>
                </div>
            `;
            return;
        }

        tasksList.innerHTML = tasks.map(task => this.createTaskItem(task)).join('');
    }

    createTaskItem(task) {
        return `
            <div class="task-item">
                <div class="task-header">
                    <h4 class="task-title">${task.title}</h4>
                    <span class="task-points">${task.points} b</span>
                </div>
                ${task.composition ? `<div class="task-composition">${task.composition}</div>` : ''}
                <div class="task-status">${task.status}</div>
                <div class="task-date">${this.formatDate(task.date)}</div>
                ${task.note ? `<div class="task-note">${task.note}</div>` : ''}
            </div>
        `;
    }

    renderStudentAwards(student) {
        const awards = this.getStudentAwards(student.fullName);
        const awardsList = document.getElementById('awardsList');

        if (!awardsList) return;

        if (awards.length === 0) {
            awardsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <p class="empty-state-text">Žádná ocenění zatím nebyla udělena</p>
                </div>
            `;
            return;
        }

        awardsList.innerHTML = awards.map(award => this.createAwardItem(award)).join('');
    }

    createAwardItem(award) {
        return `
            <div class="award-item">
                <div class="award-icon">🏆</div>
                <div class="award-content">
                    <h4 class="award-title">${award.title}</h4>
                    <p class="award-description">${award.description}</p>
                </div>
            </div>
        `;
    }

    applyFilters() {
        const instrumentFilter = document.getElementById('instrumentFilter');
        const gradeFilter = document.getElementById('gradeFilter');

        const instrumentValue = instrumentFilter ? instrumentFilter.value : '';
        const gradeValue = gradeFilter ? gradeFilter.value : '';

        let filteredStudents = [...this.students];

        if (instrumentValue) {
            filteredStudents = filteredStudents.filter(s => s.instrument === instrumentValue);
        }

        if (gradeValue) {
            filteredStudents = filteredStudents.filter(s => s.grade === parseInt(gradeValue));
        }

        this.renderStudentsGrid(filteredStudents);
    }

    // Pomocné metody
    showView(viewId) {
        const views = document.querySelectorAll('.view');
        views.forEach(view => {
            view.classList.add('hidden');
        });
        
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
    }

    updateStats() {
        const totalStudentsEl = document.getElementById('totalStudents');
        const activeTasksEl = document.getElementById('activeTasks');
        const totalAwardsEl = document.getElementById('totalAwards');

        if (totalStudentsEl) {
            totalStudentsEl.textContent = this.students.length;
        }
        
        if (activeTasksEl) {
            const activeTasks = this.tasks.filter(task => task.status !== '✅ Zvládnuto').length;
            activeTasksEl.textContent = activeTasks;
        }
        
        if (totalAwardsEl) {
            totalAwardsEl.textContent = this.awards.length;
        }
    }

    getStudentTasks(studentName) {
        return this.tasks.filter(task => task.studentName === studentName);
    }

    getStudentAwards(studentName) {
        return this.awards.filter(award => award.studentName === studentName);
    }

    calculateAveragePoints(tasks) {
        if (tasks.length === 0) return 0;
        const sum = tasks.reduce((acc, task) => acc + task.points, 0);
        return sum / tasks.length;
    }

    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    getInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }

    getMotivationClass(motivation) {
        if (motivation >= 4) return 'motivation-high';
        if (motivation >= 3) return 'motivation-medium';
        return 'motivation-low';
    }

    getMotivationText(motivation) {
        if (motivation >= 4) return '😊 Vysoká motivace';
        if (motivation >= 3) return '😐 Střední motivace';
        return '😔 Krize motivace';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('cs-CZ');
    }
}

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    new MusicStudentManager();
});
