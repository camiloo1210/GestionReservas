document.addEventListener('DOMContentLoaded', () => {
    loadRoomsFilter();
    loadReservations(); // Load all by default

    document.getElementById('filterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('filterDate').value;
        const roomId = document.getElementById('filterRoom').value;
        loadReservations(date, roomId);
    });
});

async function loadRoomsFilter() {
    try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        const select = document.getElementById('filterRoom');
        rooms.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.text = r.name;
            select.appendChild(opt);
        });
    } catch (err) { console.error(err); }
}

async function loadReservations(date = '', roomId = '') {
    try {
        let url = `/api/reservations/all?`;
        if (date) url += `date=${date}&`;
        if (roomId) url += `room_id=${roomId}&`;

        const res = await fetch(url);
        if (res.status === 403) {
            alert('Acceso denegado');
            window.location.href = '/index.html';
            return;
        }

        const reservations = await res.json();
        const tbody = document.getElementById('reservationsBody');
        tbody.innerHTML = '';

        if (reservations.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron reservas.</td></tr>';
            return;
        }

        reservations.forEach(r => {
            let statusBadge = 'bg-secondary';
            if (r.status === 'active') statusBadge = 'bg-success';
            if (r.status === 'cancelled') statusBadge = 'bg-danger';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.user_name} <br><small class="text-muted">${r.user_email}</small></td>
                <td>${r.room_name}</td>
                <td>${r.date}</td>
                <td>${r.start_time} - ${r.end_time}</td>
                <td><span class="badge ${statusBadge}">${r.status}</span></td>
                <td>
                    ${r.status === 'active'
                    ? `<button class="btn btn-sm btn-outline-danger" onclick="cancelReservation(${r.id})">Cancelar</button>`
                    : '-'}
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
    }
}

async function cancelReservation(id) {
    if (!confirm('¿Cancelar esta reserva como Administrador?')) return;
    try {
        const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'POST' });
        if (res.ok) {
            alert('Reserva cancelada');
            // Refresh current view
            const date = document.getElementById('filterDate').value;
            const roomId = document.getElementById('filterRoom').value;
            loadReservations(date, roomId);
        } else {
            alert('Error al cancelar');
        }
    } catch (err) { console.error(err); }
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
