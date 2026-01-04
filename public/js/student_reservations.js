document.addEventListener('DOMContentLoaded', () => {
    loadMyReservations();
});

async function loadMyReservations() {
    try {
        const res = await fetch('/api/reservations/my-reservations');
        if (res.status === 401) {
            window.location.href = '/index.html';
            return;
        }
        const reservations = await res.json();
        const mb = document.getElementById('reservationsContainer');
        mb.innerHTML = '';

        if (reservations.length === 0) {
            mb.innerHTML = '<div class="alert alert-info">No tienes reservas registradas.</div>';
            return;
        }

        reservations.forEach(r => {
            // Determine status color
            let badgeClass = 'bg-secondary';
            if (r.status === 'active') badgeClass = 'bg-success';
            if (r.status === 'cancelled') badgeClass = 'bg-danger';

            const card = document.createElement('div');
            card.className = 'card mb-3 shadow-sm';
            card.style.backgroundColor = '#2c2c2c';
            card.style.color = '#fff';
            card.style.border = '1px solid #444';

            // Only show Cancel button if active
            const cancelButton = r.status === 'active'
                ? `<button class="btn btn-outline-danger btn-sm float-end" onclick="cancelReservation(${r.id})">Cancelar</button>`
                : '';

            card.innerHTML = `
                <div class="card-body">
                    ${cancelButton}
                    <h5 class="card-title text-white">${r.room_name} <span class="badge ${badgeClass} fs-6">${r.status}</span></h5>
                    <p class="card-text mb-1">📅 ${r.date}</p>
                    <p class="card-text mb-1">⏰ ${r.start_time} - ${r.end_time}</p>
                    <small class="text-muted">${r.location}</small>
                </div>
            `;
            mb.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        document.getElementById('reservationsContainer').innerHTML = '<div class="alert alert-danger">Error cargando reservas.</div>';
    }
}

async function cancelReservation(id) {
    if (!confirm('¿Seguro que deseas cancelar esta reserva?')) return;

    try {
        const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
            alert('Reserva cancelada');
            loadMyReservations();
        } else {
            alert(data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
