const form = document.getElementById("photoForm");
const fotoInput = document.getElementById("foto");
const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");
const mensaje = document.getElementById("mensaje");
const submitBtn = document.getElementById("submitBtn");

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzIpPD4PI0s_jJjnA3wIpjhIGjH0mAh0sVwus2LtoAWOwpzsKPO5nAgnoXBLE03y7l9/exec";

function mostrarMensaje(texto, tipo = "") {
  mensaje.textContent = texto;
  mensaje.className = "";
  if (tipo) {
    mensaje.classList.add(tipo);
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.readAsDataURL(file);
  });
}

function validarArchivo(file) {
  if (!file) {
    return "Debes seleccionar una foto.";
  }

  const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!tiposPermitidos.includes(file.type)) {
    return "Solo se permiten archivos JPG, JPEG o PNG.";
  }

  if (file.size > maxSizeBytes) {
    return "La foto no debe superar los 5 MB.";
  }

  return null;
}

fotoInput.addEventListener("change", () => {
  const file = fotoInput.files[0];
  const error = validarArchivo(file);

  if (error) {
    mostrarMensaje(error, "error");
    fotoInput.value = "";
    previewImage.src = "";
    previewContainer.classList.add("hidden");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    previewImage.src = e.target.result;
    previewContainer.classList.remove("hidden");
    mostrarMensaje("");
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const pais = document.getElementById("pais").value.trim();
  const foto = fotoInput.files[0];

  if (!nombre || !pais || !foto) {
    mostrarMensaje("Completa todos los campos.", "error");
    return;
  }

  const errorArchivo = validarArchivo(foto);
  if (errorArchivo) {
    mostrarMensaje(errorArchivo, "error");
    return;
  }

  submitBtn.disabled = true;
  mostrarMensaje("Enviando foto...", "info");

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
    console.log("Respuesta del script:", result);

    if (result.success) {
      mostrarMensaje("Foto enviada correctamente.", "success");
      form.reset();
      previewImage.src = "";
      previewContainer.classList.add("hidden");
    } else {
      mostrarMensaje(result.message || "Error al enviar la foto.", "error");
    }
  } catch (error) {
    console.error("Error:", error);
    mostrarMensaje("Error de conexión. Intenta nuevamente.", "error");
  } finally {
    submitBtn.disabled = false;
  }
});
