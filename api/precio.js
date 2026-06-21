export default async function handler(req, res) {
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
      return res.status(500).json({
        error: "Faltan variables de entorno",
        supabaseUrlExiste: Boolean(url),
        serviceRoleExiste: Boolean(key),
      });
    }

    const respuesta = await fetch(
      `${url}/rest/v1/precios_combustible?select=ideess,estacion,direccion,municipio,precio,fecha_api,actualizado_en`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    const datos = await respuesta.json();

    if (!Array.isArray(datos) || datos.length === 0) {
      return res.status(404).json({
        error: "No se encontró ningún registro",
        datos,
      });
    }

    const fila =
      datos.find((item) => String(item.ideess).trim() === "9966") || datos[0];

    return res.status(200).json({
      ideess: fila.ideess,
      estacion: fila.estacion,
      direccion: fila.direccion,
      municipio: fila.municipio,
      precio: Number(fila.precio),
      fecha_api: fila.fecha_api,
      actualizado_en: fila.actualizado_en,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error interno en /api/precio",
      detalle: error.message,
    });
  }
}