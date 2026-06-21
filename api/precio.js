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
      `${url}/rest/v1/precios_combustible?ideess=eq.9966&select=*`,
      {
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

    return res.status(200).json(datos[0]);
  } catch (error) {
    return res.status(500).json({
      error: "Error interno en /api/precio",
      detalle: error.message,
    });
  }
}