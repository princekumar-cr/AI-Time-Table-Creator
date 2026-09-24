document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Toggle between Login and Register
    window.toggleForms = () => {
        loginSection.classList.toggle('hidden');
        registerSection.classList.toggle('hidden');
    };

    // Theme Toggle Logic
    const updateIcons = () => {
        const dark = document.getElementById('theme-toggle-dark-icon');
        const light = document.getElementById('theme-toggle-light-icon');
        if (html.classList.contains('dark')) {
            light.classList.remove('hidden');
            dark.classList.add('hidden');
        } else {
            dark.classList.remove('hidden');
            light.classList.add('hidden');
        }
    };

    themeToggleBtn.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('color-theme', html.classList.contains('dark') ? 'dark' : 'light');
        updateIcons();
    });

    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        html.classList.add('dark');
    }
    updateIcons();

    // Login Submission
    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard';
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Connection error. Is the server running?");
        }
    };

    // Register Submission
    document.getElementById('register-form').onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            if (data.success) {
                alert("Account created! You can now sign in.");
                toggleForms();
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };
});
