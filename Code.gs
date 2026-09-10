// CONFIGURACIÓN: Reemplaza con tu ID de Google Sheet
const SPREADSHEET_ID = "TU_ID_DE_HOJA_DE_CALCULO"; // Obtén esto del URL de tu Google Sheet

/**
 * Función que sirve como punto de entrada cuando se accede a la web app
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("index")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Función principal que recibe y procesa los datos del formulario
 * @param {Object} datos - Objeto con los datos del formulario
 */
function procesarJustificante(datos) {
  try {
    Logger.log("✅ Datos recibidos:", JSON.stringify(datos));
    
    // Guardar en hoja de cálculo
    guardarEnHojaCalculo(datos);
    
    // Si hay archivo, guardarlo en Google Drive
    if (datos.archivoBase64 && datos.archivoMimeType) {
      guardarArchivo(datos);
    }
    
    // Generar y enviar PDF si lo necesitas (función opcional)
    // generarPDF(datos);
    
    return "✅ Solicitud enviada correctamente. ¡El justificante se ha registrado!";
    
  } catch(error) {
    Logger.log("❌ Error:", error.toString());
    throw new Error("No se pudo procesar la solicitud: " + error.toString());
  }
}

/**
 * Guardar datos en Google Sheets
 */
function guardarEnHojaCalculo(datos) {
  try {
    let ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName("Justificantes");
    
    // Si la hoja no existe, la crea
    if (!sheet) {
      sheet = ss.insertSheet("Justificantes");
      // Agregar encabezados
      sheet.appendRow([
        "Fecha",
        "Nombre",
        "Matrícula",
        "Fecha Inicio",
        "Fecha Fin",
        "¿Médico?",
        "Motivo",
        "Archivo Subido"
      ]);
    }
    
    // Agregar fila con los datos
    sheet.appendRow([
      new Date(),
      datos.nombreAlumno,
      datos.matricula,
      datos.fechaInicio,
      datos.fechaFin,
      datos.esMedico,
      datos.motivo,
      datos.archivoBase64 ? "Sí" : "No"
    ]);
    
    Logger.log("✅ Datos guardados en Google Sheets");
    
  } catch(error) {
    Logger.log("❌ Error al guardar:", error);
    throw error;
  }
}

/**
 * Guardar archivo en Google Drive
 */
function guardarArchivo(datos) {
  try {
    // Convertir Base64 a Blob
    let base64Data = datos.archivoBase64.split(",")[1]; // Remover el prefijo "data:..."
    let blob = Utilities.newBlob(Utilities.base64Decode(base64Data), datos.archivoMimeType);
    
    // Obtener la carpeta donde guardar los archivos
    let folder = DriveApp.getRootFolder(); // O especifica una carpeta: DriveApp.getFolderById("FOLDER_ID")
    
    // Nombre del archivo
    let nombreArchivo = `${datos.nombreAlumno}_${datos.matricula}_${new Date().getTime()}`;
    blob.setName(nombreArchivo);
    
    // Guardar en Drive
    folder.createFile(blob);
    
    Logger.log("✅ Archivo guardado en Google Drive");
    
  } catch(error) {
    Logger.log("❌ Error al guardar archivo:", error);
    throw error;
  }
}

/**
 * Función opcional: Generar PDF con los datos
 */
function generarPDF(datos) {
  try {
    let pdfContent = `
      JUSTIFICANTE ESCOLAR
      =====================
      
      Nombre: ${datos.nombreAlumno}
      Matrícula: ${datos.matricula}
      Fecha Inicio: ${datos.fechaInicio}
      Fecha Fin: ${datos.fechaFin}
      ¿Cuestión Médica?: ${datos.esMedico}
      Motivo: ${datos.motivo}
      Fecha de Registro: ${new Date().toLocaleString("es-ES")}
    `;
    
    Logger.log("PDF generado:", pdfContent);
    
  } catch(error) {
    Logger.log("❌ Error al generar PDF:", error);
  }
}