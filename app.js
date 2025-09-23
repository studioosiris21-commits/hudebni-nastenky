// Jednoduchá testovací verze
class MusicStudentManager {
    constructor() {
        this.config = {
            apiBaseUrl: "https://script.google.com/macros/s/AKfycbwIXxgETTkJ6tAzm1XzpmSngGBgPh5qhnCZA3PBMeKrnkoQT1OWLIGnq0LcDoyiC9E8Fg/exec",
            testMode: true
        };
        
        this.students = [
            {"id": 1, "firstName": "Karolína", "lastName": "Bayerová", "fullName": "Bayerová Karolína", "birthDate": "2015-11-28", "instrument": "kytara", "grade": 3, "motivation": 2, "nickname": "Karolínka"},
            {"id": 2, "firstName": "Antonín", "lastName": "Bechyňa", "fullName": "Bechyňa Antonín", "birthDate": "2014-10-02", "instrument": "kytara", "grade": 4, "motivation": 1, "nickname": "Toník"},
            {"id": 3, "firstName": "Filip", "lastName": "Červenka", "fullName": "Červenka Filip", "birthDate": "2015-04-05", "instrument": "klarinet", "grade": 4, "motivation": 4, "nickname": "Filípek"}
        ];
        
        this.tasks = [
            {"id": 1, "title": "Hrát správné noty a posuvky", "studentName": "Bechyňa Antonín", "composition": "Coleman - Irská", "status": "⏳ Cvičíme", "date": "2025-09-19", "points": 6},
            {"id": 2, "title": "Dotáhnout držení nástroje", "studentName": "Bechyňa Antonín", "composition": "Bach - Chorál č. 1", "status": "🚀 Skvělý pokrok!", "date": "2025-09-20", "points": 9}
        ];
        
        this.awards = [
            {"id": 1, "title": "Super Rytmus", "imageUrl": "https://i.imgur.com/fm6lp0f.jpg", "description": "Za zvládnutí složitého rytmického úseku.", "studentName": "Bechyňa Antonín"}
        ];
        
        this.init();
    }

    init() {
        console.log('Aplikace se spouští...');
        this.hideAllScreens();
        this.showMainApp();
        this.renderDashboard();
        this.updateStats();
    }

    hideAllScreens() {
        const screens = ['loadingScreen', 'loginScreen'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) screen.classList.add('hidden');
        });
    }

    showMainApp() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
        
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = '👨‍🏫 Testovací režim';
        }
    }

    renderDashboard() {
        const grid = document.getElementById('studentsGrid');
        if (!grid) return;

        grid.innerHTML = this.students.map(student => this.createStudentCard(student)).join('');
    }

    createStudentCard(student) {
        const age = this.calculateAge(student.birthDate);
        const initials = this.getInitials(student.firstName, student.lastName);
        const studentTasks = this.getStudentTasks(student.fullName);

        return `
            <div class="student-card" data-student-id="${student.id}">
                <div class="student-header">
                    <div class="student-avatar">${initials}</div>
                    <div class="student-info">
                        <h3>${student.nickname}</h3>
                        <div class="student-details">
                            ${student.instrument} • ${student.grade}. ročník • ${age} let
                        </div>
                    </div>
                </div>
                <div class="student-stats">
                    <div class="stat-item">
                        <span class="stat-value">${studentTasks.length}</span>
                        <span class="stat-label">Úkolů</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateStats() {
        const totalStudentsEl = document.getElementById('totalStudents');
        const activeTasksEl = document.getElementById('activeTasks');
        const totalAwardsEl = document.getElementById('totalAwards');

        if (totalStudentsEl) totalStudentsEl.textContent = this.students.length;
        if (activeTasksEl) activeTasksEl.textContent = this.tasks.length;
        if (totalAwardsEl) totalAwardsEl.textContent = this.awards.length;
    }

    getStudentTasks(studentName) {
        return this.tasks.filter(task => task.studentName === studentName);
    }

    calculateAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        return today.getFullYear() - birth.getFullYear();
    }

    getInitials(firstName, lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
}

// Spuštění aplikace
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, spouštím aplikaci...');
    new MusicStudentManager();
});
