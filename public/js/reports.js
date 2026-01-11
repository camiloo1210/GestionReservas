document.addEventListener('DOMContentLoaded', () => {
    // Default to current month
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    document.getElementById('startDate').value = startOfMonth.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];

    loadReports();

    document.getElementById('reportForm').addEventListener('submit', (e) => {
        e.preventDefault();
        loadReports();
    });
});

let usageChart = null;

async function loadReports() {
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;

    try {
        const res = await fetch(`/api/reports/usage?start=${start}&end=${end}`);
        if (res.status === 403) {
            window.location.href = '/index.html';
            return;
        }

        const data = await res.json();
        renderTable(data);
        renderChart(data);

    } catch (err) {
        console.error(err);
    }
}

function renderTable(data) {
    const tbody = document.getElementById('reportsBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2" class="text-center">No hay datos en este periodo.</td></tr>';
        return;
    }

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.room_name}</td>
            <td>${row.total_reservations}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderChart(data) {
    const ctx = document.getElementById('usageChart');

    // Destroy previous chart if exists
    // (Assuming using Chart.js via CDN in HTML)
    if (window.usageChart instanceof Chart) {
        window.usageChart.destroy();
    }

    const labels = data.map(d => d.room_name);
    const values = data.map(d => d.total_reservations);

    window.usageChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Reservas por Sala',
                data: values,
                backgroundColor: '#c70039',
                borderColor: '#c70039',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function logout() {
    fetch('/api/auth/logout', { method: 'POST' })
        .then(() => window.location.href = '/index.html');
}
