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
    showConfirmModal('¿Seguro que deseas cancelar esta reserva?', async () => {
        try {
            const res = await fetch(`/api/reservations/${id}/cancel`, { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                Toast.success('Reserva cancelada');
                loadMyReservations();
            } else {
                Toast.error(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    });
}

function showConfirmModal(message, onConfirm) {
    if (!document.getElementById('confirmModal')) {
        const modalHTML = `
            <div class="modal fade" id="confirmModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content border-warning">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title">⚠️ Confirmar</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="confirmModalBody"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
                            <button type="button" class="btn btn-warning" id="confirmModalBtn">Sí, cancelar</button>
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
function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
