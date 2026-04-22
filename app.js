const form = document.getElementById("photoForm");
const fotoInput = document.getElementById("foto");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const mensaje = document.getElementById("mensaje");
const submitBtn = document.getElementById("submitBtn");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw36ho_ZiBIsADtLZAyoICcaCEsdpL2IZ4SJve4Nf9DbN3TH7WHkaOcyPe2uNHJI55M/exec";
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

  const nombre = document.getElementById("nombre").value.trim();
  const pais = document.getElementById("pais").value.trim();
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
    console.log("Respuesta Apps Script:", result);

    if (result.success) {
      mostrarMensaje("Foto enviada correctamente");
      form.reset();
      previewContainer.classList.add("hidden");
      previewImage.src = "";
    } else {
      mostrarMensaje(result.message || result.error || "Error al enviar");
      console.error("Error Apps Script:", result);
    }

  } catch (error) {
    console.error("Error fetch:", error);
    mostrarMensaje("Error de conexión");
  }

  submitBtn.disabled = false;
});
