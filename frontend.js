document.addEventListener('DOMContentLoaded', () => {
    // --- System State ---
    let db = { teachers: [], subjects: [], rooms: [], timetable: [] };
    const html = document.documentElement;

    // --- Core Initialization ---
    const init = async () => {
        try {
            const res = await fetch('/api/data');
            db = await res.json();
            renderAll();
        } catch (e) { console.error("System sync failed."); }
    };

    const renderAll = () => {
        updateStats();
        renderTeachers();
        renderSubjects();
        renderRooms();
        renderTimetable();
    };

    const updateStats = () => {
        if(document.getElementById('stat-teachers')) document.getElementById('stat-teachers').textContent = db.teachers.length;
        if(document.getElementById('stat-subjects')) document.getElementById('stat-subjects').textContent = db.subjects.length;
        if(document.getElementById('stat-rooms')) document.getElementById('stat-rooms').textContent = db.rooms.length;
    };

    // --- Navigation System (FIXED) ---
    window.switchTab = (tabId) => {
        // 1. Hide all page views
        document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));
        
        // 2. Show requested page view
        const targetView = document.getElementById(`view-${tabId}`);
        if(targetView) targetView.classList.remove('hidden');

        // 3. Update Sidebar Active State
        document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
        const navItem = document.getElementById(`nav-${tabId}`);
        if(navItem) navItem.classList.add('active');

        // 4. Update Header Title
        const titleMap = {
            'dashboard': 'System Insights',
            'timetable': 'Master Timetable',
            'teachers': 'Faculty Hub',
            'subjects': 'Academic Library',
            'rooms': 'Infrastructure'
        };
        document.getElementById('page-title').textContent = titleMap[tabId] || 'System Dashboard';
    };

    // --- Sidebar Collapse Logic ---
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    if(toggleBtn) {
        toggleBtn.onclick = () => {
            sidebar.classList.toggle('-translate-x-full');
        };
    }

    // --- Rendering Engines ---
    const renderTeachers = () => {
        const grid = document.getElementById('teachers-list');
        if(!grid) return;
        grid.innerHTML = db.teachers.map(t => `
            <div class="glass-card p-8 text-center group hover:scale-[1.02] transition-transform">
                <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=0ea5e9&color=fff" class="w-20 h-20 rounded-[2rem] mx-auto mb-6 shadow-xl">
                <h4 class="font-black text-xl text-slate-900 dark:text-white">${t.name}</h4>
                <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-2">${t.designation || 'Faculty'}</p>
                <div class="mt-6 pt-6 border-t dark:border-dark-border grid grid-cols-2 gap-4 text-left">
                    <div><p class="text-[9px] font-black text-slate-400 uppercase">Dept</p><p class="text-xs font-bold text-slate-700 dark:text-slate-300">${t.dept}</p></div>
                    <div><p class="text-[9px] font-black text-slate-400 uppercase">Focus</p><p class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">${t.spec || 'General'}</p></div>
                </div>
            </div>
        `).join('');
    };

    const renderSubjects = () => {
        const list = document.getElementById('subjects-list');
        if(!list) return;
        list.innerHTML = db.subjects.map(s => `
            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td class="p-6 font-black text-primary-600 text-sm tracking-tight">${s.code}</td>
                <td class="p-6 font-bold text-slate-900 dark:text-white text-sm">${s.name}</td>
                <td class="p-6"><span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-[9px] font-black uppercase text-slate-500 border border-slate-200 dark:border-slate-700">${s.type}</span></td>
            </tr>
        `).join('');
    };

    const renderRooms = () => {
        const grid = document.getElementById('rooms-list');
        if(!grid) return;
        grid.innerHTML = db.rooms.map(r => `
            <div class="glass-card p-6 border-l-4 ${r.type === 'Lab' ? 'border-purple-500' : 'border-primary-500'}">
                <h4 class="font-black text-lg text-slate-900 dark:text-white">${r.name}</h4>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">${r.type}</p>
                <div class="mt-4 flex items-center justify-between">
                    <span class="text-xs font-bold text-slate-500"><i class="fas fa-users mr-2"></i> Cap: ${r.capacity}</span>
                    <span class="px-2 py-1 bg-green-100 text-green-600 text-[8px] font-black rounded uppercase">Available</span>
                </div>
            </div>
        `).join('');
    };

    const renderTimetable = () => {
        const body = document.getElementById('timetable-body-main');
        if(!body) return;
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        body.innerHTML = days.map(day => `
            <tr class="border-b dark:border-dark-border">
                <td class="p-4 font-black text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-dark-bg border-r dark:border-dark-border">${day}</td>
                <td class="timetable-slot"></td><td class="timetable-slot"></td>
                <td class="bg-slate-100 dark:bg-slate-800/50 p-2 text-center text-[8px] font-black uppercase tracking-[5px] text-slate-300">RECESS</td>
                <td class="timetable-slot"></td><td class="timetable-slot"></td>
            </tr>
        `).join('');
    };

    // --- Form Handlers ---
    const handleForm = async (formId, apiPath) => {
        const form = document.getElementById(formId);
        if(!form) return;
        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());
            const res = await fetch(apiPath, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)});
            if(res.ok) {
                toggleModal(formId.replace('add-', '').replace('-form', '-modal'));
                form.reset();
                init();
            }
        };
    };

    handleForm('add-teacher-form', '/api/teachers');
    handleForm('add-subject-form', '/api/subjects');
    handleForm('add-room-form', '/api/rooms');

    // --- UI Controls ---
    window.toggleModal = (id) => {
        const m = document.getElementById(id);
        if(m) m.classList.toggle('open');
    };

    window.toggleAssistant = () => {
        const win = document.getElementById('chat-window');
        if(win) win.classList.toggle('scale-100');
        if(win) win.classList.toggle('opacity-100');
    };

    // Theme Update
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
        themeBtn.onclick = () => {
            html.classList.toggle('dark');
            localStorage.setItem('color-theme', html.classList.contains('dark') ? 'dark' : 'light');
            updateIcons();
        };
    }
    const updateIcons = () => {
        const d = document.getElementById('theme-toggle-dark-icon');
        const l = document.getElementById('theme-toggle-light-icon');
        if(!d) return;
        if(html.classList.contains('dark')) { l.classList.remove('hidden'); d.classList.add('hidden'); }
        else { d.classList.remove('hidden'); l.classList.add('hidden'); }
    };
    if(localStorage.getItem('color-theme') === 'dark') html.classList.add('dark');
    updateIcons();

    init();
});
