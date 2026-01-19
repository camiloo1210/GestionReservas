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
    showConfirmModal(`¿Deseas reservar la sala <strong>${roomName}</strong> para el <strong>${date}</strong> de <strong>${start}</strong> a <strong>${end}</strong>?`, () => {
        createReservation(roomId, date, start, end);
    });
}

function showConfirmModal(message, onConfirm) {
    if (!document.getElementById('confirmModal')) {
        const modalHTML = `
            <div class="modal fade" id="confirmModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-primary">
                        <div class="modal-header" style="background-color: #c70039; color: white;">
                            <h5 class="modal-title">📅 Confirmar Reserva</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="confirmModalBody"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmModalBtn" style="background-color: #c70039; border-color: #c70039;">Reservar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    document.getElementById('confirmModalBody').innerHTML = `<p>${message}</p>`;
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const confirmBtn = document.getElementById('confirmModalBtn');
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    newBtn.addEventListener('click', () => { modal.hide(); onConfirm(); });
    modal.show();
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
            Toast.success('¡Reserva creada exitosamente!');
            window.location.href = 'my_reservations.html';
        } else {
            Toast.error(data.error || 'Error al crear reserva');
        }
    } catch (err) {
        console.error(err);
        Toast.error('Error de conexión');
    }
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
