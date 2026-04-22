const form = document.getElementById("photoForm");
const fotoInput = document.getElementById("foto");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const mensaje = document.getElementById("mensaje");
const submitBtn = document.getElementById("submitBtn");

// 👉 PEGA TU URL AQUÍ
const SCRIPT_URL = "PEGA_AQUI_TU_URL_DE_APPS_SCRIPT";

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

fotoInput.addEventListener("change", () => {
  const file = fotoInput.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewContainer.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const pais = document.getElementById("pais").value;
  const foto = fotoInput.files[0];

  if (!nombre || !pais || !foto) {
    mostrarMensaje("Completa todos los campos");
    return;
  }

  submitBtn.disabled = true;
  mostrarMensaje("Enviando...");

  try {
    const imageBase64 = await fileToBase64(foto);

    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({
        nombre,
        pais,
        imageBase64,
        fileName: foto.name,
        mimeType: foto.type
      })
    });

    const result = await response.json();

    if (result.success) {
      mostrarMensaje("Foto enviada correctamente");
      form.reset();
      previewContainer.classList.add("hidden");
    } else {
      mostrarMensaje("Error al enviar");
    }

  } catch (error) {
    mostrarMensaje("Error de conexión");
  }

  submitBtn.disabled = false;
});
