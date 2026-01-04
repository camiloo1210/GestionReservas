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
                        <button class="btn btn-primary w-100" onclick="confirmBooking(${room.id}, '${room.name}', '${date}', '${room.start_time}', '${room.end_time}')">Reservar</button>
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

function confirmBooking(roomId, roomName, date, start, end) {
    // Ideally use a Modal, but confirm is faster for now
    if (confirm(`¿Deseas reservar la sala ${roomName} para el ${date} de ${start} a ${end}?`)) {
        createReservation(roomId, date, start, end);
    }
}

async function createReservation(roomId, date, start, end) {
    try {
        const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                room_id: roomId,
                date: date,
                start_time: start,
                end_time: end
            })
        });

        const data = await res.json();
        if (res.ok) {
            alert('¡Reserva creada exitosamente!');
            window.location.href = 'my_reservations.html';
        } else {
            alert(data.error || 'Error al crear reserva');
        }
    } catch (err) {
        console.error(err);
        alert('Error de conexión');
    }
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
