document.addEventListener('DOMContentLoaded', () => {
    loadProfile();

    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;

        try {
            const res = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Perfil actualizado correctamente');
            } else {
                alert(data.error || 'Error actualizando perfil');
            }
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        }
    });
});

async function loadProfile() {
    try {
        const res = await fetch('/api/auth/me');
        if (res.status === 401) {
            window.location.href = '/index.html';
            return;
        }
        const user = await res.json();

        document.getElementById('email').value = user.email;
        document.getElementById('name').value = user.name;
        document.getElementById('phone').value = user.phone || '';
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
