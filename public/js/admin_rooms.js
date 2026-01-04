document.addEventListener('DOMContentLoaded', () => {
    loadRooms();

    // Create Room
    document.getElementById('createRoomForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('roomName').value;
        const capacity = document.getElementById('roomCapacity').value;
        const location = document.getElementById('roomLocation').value;

        try {
            const res = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, capacity, location })
            });
            if (res.ok) {
                alert('Sala creada exitosamente');
                document.getElementById('createRoomForm').reset();
                const modal = bootstrap.Modal.getInstance(document.getElementById('createRoomModal'));
                modal.hide();
                loadRooms();
            } else {
                alert('Error creando sala');
            }
        } catch (err) {
            console.error(err);
        }
    });

    // Schedule Form
    document.getElementById('scheduleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const roomId = document.getElementById('scheduleRoomId').value;
        const date = document.getElementById('scheduleDate').value;
        const start_time = document.getElementById('scheduleStart').value;
        const end_time = document.getElementById('scheduleEnd').value;

        try {
            const res = await fetch(`/api/rooms/${roomId}/schedules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date, start_time, end_time })
            });
            if (res.ok) {
                alert('Horario asignado');
                const modal = bootstrap.Modal.getInstance(document.getElementById('scheduleModal'));
                modal.hide();
            } else {
                const data = await res.json();
                alert(data.error || 'Error asignando horario');
            }
        } catch (err) {
            console.error(err);
        }
    });
});

async function loadRooms() {
    try {
        const res = await fetch('/api/rooms');
        const rooms = await res.json();
        const tbody = document.getElementById('roomsTableBody');
        tbody.innerHTML = '';

        rooms.forEach((room) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${room.name}</td>
                <td>${room.capacity}</td>
                <td>${room.location}</td>
                <td><span class="badge ${room.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}">${room.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="openScheduleModal(${room.id}, '${room.name}')">Horarios</button>
                    <!-- Edit/Delete could replace this or be added -->
                    <button class="btn btn-sm btn-danger" onclick="deleteRoom(${room.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

function openScheduleModal(id, name) {
    document.getElementById('scheduleRoomId').value = id;
    document.getElementById('scheduleRoomName').textContent = name;
    const modal = new bootstrap.Modal(document.getElementById('scheduleModal'));
    modal.show();
}

async function deleteRoom(id) {
    if (!confirm('¿Seguro que deseas eliminar esta sala?')) return;
    try {
        const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
        if (res.ok) loadRooms();
        else alert('Error eliminando sala');
    } catch (err) { console.error(err); }
}

// Logout
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
