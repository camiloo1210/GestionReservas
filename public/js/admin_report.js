function loadReport() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  fetch(`/reservations/report/usage?start=${start}&end=${end}`)
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("reportTable");
      table.innerHTML = "";

      data.forEach(r => {
        table.innerHTML += `
          <tr>
            <td>${r.room}</td>
            <td>${r.total}</td>
          </tr>
        `;
      });
    });
}
