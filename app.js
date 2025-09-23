console.log('Loading app...');

const students = [
    {"id": 1, "firstName": "Karolína", "lastName": "Bayerová", "fullName": "Bayerová Karolína", "instrument": "kytara", "grade": 3, "nickname": "Karolínka"},
    {"id": 2, "firstName": "Antonín", "lastName": "Bechyňa", "fullName": "Bechyňa Antonín", "instrument": "kytara", "grade": 4, "nickname": "Toník"},
    {"id": 3, "firstName": "Filip", "lastName": "Červenka", "fullName": "Červenka Filip", "instrument": "klarinet", "grade": 4, "nickname": "Filípek"}
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Skryj loading a login screen
    const loadingScreen = document.getElementById('loadingScreen');
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');
    
    if (loadingScreen) loadingScreen.classList.add('hidden');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
    
    // Nastav user info
    const userInfo = document.getElementById('userInfo');
    if (userInfo) userInfo.textContent = '👨‍🏫 Testovací režim';
    
    // Nastav statistiky
    const totalStudents = document.getElementById('totalStudents');
    const activeTasks = document.getElementById('activeTasks');
    const totalAwards = document.getElementById('totalAwards');
    
    if (totalStudents) totalStudents.textContent = students.length;
    if (activeTasks) activeTasks.textContent = '5';
    if (totalAwards) totalAwards.textContent = '3';
    
    // Vykresli žáky
    const grid = document.getElementById('studentsGrid');
    if (grid) {
        grid.innerHTML = students.map(student => {
            const age = new Date().getFullYear() - new Date('2015-01-01').getFullYear();
            const initials = student.firstName.charAt(0) + student.lastName.charAt(0);
            
            return `
                <div class="student-card">
                    <div class="student-header">
                        <div class="student-avatar">${initials}</div>
                        <div class="student-info">
                            <h3>${student.nickname}</h3>
                            <div class="student-details">${student.instrument} • ${student.grade}. ročník • ${age} let</div>
                        </div>
                    </div>
                    <div class="student-stats">
                        <div class="stat-item">
                            <span class="stat-value">8.5</span>
                            <span class="stat-label">Průměr bodů</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-value">3</span>
                            <span class="stat-label">Úkolů</span>
                        </div>
                    </div>
                    <div class="motivation-indicator motivation-high">
                        <span>😊 Vysoká motivace</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    console.log('App loaded successfully');
});
