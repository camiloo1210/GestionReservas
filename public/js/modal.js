function mostrarModal(texto, tipo = "info") {
    const titulo = document.getElementById("modalTitulo");
    const cuerpo = document.getElementById("modalTexto");

    if (tipo === "error") titulo.textContent = "Error";
    else if (tipo === "ok") titulo.textContent = "Éxito";
    else titulo.textContent = "Mensaje";

    cuerpo.textContent = texto;

    const modal = new bootstrap.Modal(document.getElementById("modalMsg"));
    modal.show();
}
