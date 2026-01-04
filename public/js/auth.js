document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    if (data.role === 'admin') {
                        window.location.href = '/admin/dashboard.html';
                    } else {
                        window.location.href = '/student/dashboard.html';
                    }
                } else {
                    alert(data.error);
                }
            } catch (err) {
                console.error(err);
                alert('Error connecting to server');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone, password })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('Registro exitoso. Por favor inicia sesión.');
                    window.location.href = 'index.html';
                } else {
                    alert(data.error);
                }
            } catch (err) {
                console.error(err);
                alert('Error connecting to server');
            }
        });
    }
});
