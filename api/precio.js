export default async function handler(req, res) {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;

    if (!url || !key) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
        supabaseUrlExiste: Boolean(url),
        supabaseAnonKeyExiste: Boolean(key),
      });
    }

    const respuesta = await fetch(
`${url}/rest/v1/precios_combustible?select=*`,      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    const texto = await respuesta.text();

    if (!respuesta.ok) {
      return res.status(500).json({
        error: "Supabase respondió con error",
        status: respuesta.status,
        respuesta: texto,
      });
    }

    const datos = JSON.parse(texto);

    if (!datos || datos.length === 0) {
      return res.status(404).json({
        error: "No se encontró la fila IDEESS 9966",
        datos,
      });
    }

    const fila = datos[0];

    const precioNumero = Number(
      String(fila.precio ?? "0")
        .replace(",", ".")
        .trim()
    );

    return res.status(200).json({
      ideess: fila.ideess,
      estacion: fila.estacion || "DISA Padre Anchieta",
      direccion: fila.direccion,
      municipio: fila.municipio,
      precio: precioNumero,
      fecha_api: fila.fecha_api,
      actualizado_en: fila.actualizado_en,
      debug_original: fila,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error interno en /api/precio",
      detalle: error.message,
    });
  }
}