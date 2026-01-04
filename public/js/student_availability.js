document.addEventListener('DOMContentLoaded', () => {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateFilter').value = today;
    checkAvailability(today); // Load today's availability by default

    document.getElementById('filterForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('dateFilter').value;
        checkAvailability(date);
    });
});

async function checkAvailability(date) {
    try {
        const res = await fetch(`/api/rooms/availability?date=${date}`);
        const rooms = await res.json();
        const container = document.getElementById('roomsContainer');
        container.innerHTML = '';

        if (rooms.length === 0) {
            container.innerHTML = '<div class="alert alert-warning">No hay salas disponibles para esta fecha.</div>';
            return;
        }

        rooms.forEach((room) => {
            const card = document.createElement('div');
            card.className = 'col-md-4 mb-3';
            card.innerHTML = `
                <div class="card h-100 shadow-sm" style="background-color: #2c2c2c; color: #fff; border: 1px solid #444;">
                    <div class="card-body">
                        <h5 class="card-title text-danger">${room.name}</h5>
                        <p class="card-text">
                            <strong>Capacidad:</strong> ${room.capacity} personas<br>
                            <strong>Ubicación:</strong> ${room.location}
                        </p>
                        <hr style="border-color: #555;">
                        <p class="mb-1 text-info">Horario Disponible:</p>
                        <h6 class="mb-3">${room.start_time} - ${room.end_time}</h6>
                        <button class="btn btn-primary w-100" disabled>Reservar (Próximamente)</button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        document.getElementById('roomsContainer').innerHTML = '<div class="alert alert-danger">Error cargando disponibilidad.</div>';
    }
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
