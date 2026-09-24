document.addEventListener('DOMContentLoaded', () => {
    // --- Secure Route Check ---
    const token = localStorage.getItem('token');
    if (!token && window.location.pathname === '/dashboard') {
        window.location.href = '/';
        return;
    }

    // --- State ---
    let db = { faculty: [], subjects: [], rooms: [], activity: [] };
    const html = document.documentElement;

    // --- Core Functions ---
    const fetchData = async () => {
        try {
            const [dataRes, facultyRes, subjectsRes] = await Promise.all([
                fetch('/api/dashboard'),
                fetch('/api/faculty'),
                fetch('/api/subjects')
            ]);
            
            const stats = await dataRes.json();
            db.faculty = await facultyRes.json();
            db.subjects = await subjectsRes.json();
            
            updateStatsUI(stats);
            renderFaculty();
            renderSubjects();
            renderActivity(stats.recentActivity);
        } catch (err) { console.error("Sync Failed:", err); }
    };

    const updateStatsUI = (stats) => {
        document.getElementById('stat-faculty').textContent = stats.totalFaculty;
        document.getElementById('stat-subjects').textContent = stats.totalSubjects;
        document.getElementById('stat-rooms').textContent = stats.totalRooms;
        document.getElementById('stat-timetables').textContent = stats.timetablesGenerated;
    };

    const renderActivity = (activity) => {
        const list = document.getElementById('activity-list');
        list.innerHTML = activity.map(a => `
            <div class="flex items-center space-x-4 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors cursor-default">
                <div class="w-10 h-10 bg-primary-500/10 text-primary-600 rounded-xl flex items-center justify-center font-black text-xs"><i class="fas fa-history"></i></div>
                <div class="flex-1">
                    <p class="text-sm font-black text-slate-900 dark:text-white">${a.action}</p>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">${a.time}</p>
                </div>
            </div>
        `).join('');
    };

    // --- Navigation System ---
    window.switchTab = (tabId) => {
        document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
        document.getElementById(`view-${tabId}`).classList.add('active');
        
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        document.getElementById(`nav-${tabId}`).classList.add('active');

        document.getElementById('page-title').textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
    };

    // --- Sidebar Collapse ---
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const mainHeader = document.getElementById('main-header');
    
    document.getElementById('sidebar-collapse').onclick = () => {
        sidebar.classList.toggle('sidebar-collapsed');
        const isCollapsed = sidebar.classList.contains('sidebar-collapsed');
        const margin = isCollapsed ? '80px' : '288px';
        mainContent.style.marginLeft = margin;
        mainHeader.style.marginLeft = margin;
    };

    // --- Faculty Logic ---
    const renderFaculty = () => {
        const grid = document.getElementById('faculty-grid');
        grid.innerHTML = db.faculty.map(f => `
            <div class="glass-card p-8 text-center group hover:scale-[1.02] transition-transform">
                <img src="https://ui-avatars.com/api/?name=${f.name}&background=random" class="w-20 h-20 rounded-[2rem] mx-auto mb-6 shadow-xl">
                <h4 class="font-black text-xl text-slate-900 dark:text-white">${f.name}</h4>
                <p class="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mt-2">${f.designation}</p>
                <div class="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center px-2">
                    <div class="text-left"><p class="text-[9px] font-black text-slate-400 uppercase">Faculty</p><p class="text-xs font-bold">${f.dept}</p></div>
                    <button onclick="deleteFaculty(${f.id})" class="text-slate-300 hover:text-red-500 transition-colors"><i class="fas fa-trash-can"></i></button>
                </div>
            </div>
        `).join('');
    };

    window.deleteFaculty = async (id) => {
        if(confirm("Expel this faculty from registry?")) {
            await fetch(`/api/faculty/${id}`, { method: 'DELETE' });
            fetchData();
        }
    };

    document.getElementById('add-faculty-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        await fetch('/api/faculty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        toggleModal('faculty-modal');
        fetchData();
    };

    // --- Subject Logic ---
    const renderSubjects = () => {
        const list = document.getElementById('subjects-list');
        list.innerHTML = db.subjects.map(s => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="p-6 font-black text-primary-600 text-sm">${s.code}</td>
                <td class="p-6 font-bold text-slate-900 dark:text-white text-sm">${s.name}</td>
                <td class="p-6"><span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase">${s.type}</span></td>
                <td class="p-6 font-bold text-slate-500 text-xs">${s.weeklyHours} Hrs</td>
                <td class="p-6 text-right"><button class="text-slate-300 hover:text-primary-600 transition-colors"><i class="fas fa-edit"></i></button></td>
            </tr>
        `).join('');
    };

    // --- AI Assistant Toggle & Chat ---
    window.toggleAssistant = () => {
        const panel = document.getElementById('chat-panel');
        const fab = document.getElementById('assistant-fab');
        panel.classList.toggle('hidden');
        fab.classList.toggle('active');
        
        const icon = fab.querySelector('i');
        icon.className = fab.classList.contains('active') ? 'fas fa-plus text-3xl' : 'fas fa-sparkles text-3xl';
    };

    const chatMsgs = document.getElementById('chat-msgs');
    const chatInput = document.getElementById('chat-input');
    
    document.getElementById('send-chat').onclick = async () => {
        const msg = chatInput.value.trim();
        if(!msg) return;
        
        // Add User Message
        chatMsgs.innerHTML += `<div class="flex justify-end"><div class="bg-primary-600 text-white p-4 rounded-[24px] rounded-tr-none text-sm font-medium shadow-lg max-w-[85%]">${msg}</div></div>`;
        chatInput.value = '';
        chatMsgs.scrollTop = chatMsgs.scrollHeight;

        // Mock AI Thinking
        setTimeout(async () => {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg })
            });
            const data = await res.json();
            chatMsgs.innerHTML += `<div class="flex justify-start"><div class="bg-white dark:bg-slate-800 p-4 rounded-[24px] rounded-tl-none shadow-sm border border-slate-100 dark:border-slate-700 text-sm font-medium max-w-[85%]">${data.message}</div></div>`;
            chatMsgs.scrollTop = chatMsgs.scrollHeight;
        }, 600);
    };

    // --- System UI Helpers ---
    window.toggleModal = (id) => document.getElementById(id).classList.toggle('hidden');
    window.logout = () => { localStorage.clear(); window.location.href = '/'; };
    window.toggleProfile = () => alert("Institutional Profile Management coming in next patch.");

    // --- Theme Control ---
    const themeBtn = document.getElementById('theme-toggle');
    const updateThemeIcons = () => {
        const d = document.getElementById('theme-toggle-dark-icon');
        const l = document.getElementById('theme-toggle-light-icon');
        if(!d) return;
        if(html.classList.contains('dark')) { l.classList.remove('hidden'); d.classList.add('hidden'); }
        else { d.classList.remove('hidden'); l.classList.add('hidden'); }
    };

    themeBtn.onclick = () => {
        html.classList.toggle('dark');
        localStorage.setItem('color-theme', html.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcons();
    };

    if(localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    }
    updateThemeIcons();

    // Set User Name in Header
    const user = JSON.parse(localStorage.getItem('user'));
    if(user) document.getElementById('header-user-name').textContent = user.name;

    // Run Initial Data Sync
    fetchData();
});
