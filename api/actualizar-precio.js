export default async function handler(req, res) {
    try {
      const IDEESS = "9966";
  
      const respuesta = await fetch(
        "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/"
      );
  
      const datos = await respuesta.json();
      const estaciones = datos.ListaEESSPrecio || [];
  
      const estacion = estaciones.find((e) => String(e.IDEESS) === IDEESS);
  
      if (!estacion) {
        return res.status(404).json({ error: "Estación no encontrada" });
      }
  
      const precio = Number(estacion["Precio Gasoleo A"].replace(",", "."));
  
      const supabaseRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/precios_combustible`,
        {
          method: "POST",
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "resolution=merge-duplicates",
          },
          body: JSON.stringify({
            ideess: IDEESS,
            estacion: estacion["Rótulo"],
            direccion: estacion["Dirección"],
            municipio: estacion["Municipio"],
            precio,
            fecha_api: datos.Fecha,
            actualizado_en: new Date().toISOString(),
          }),
        }
      );
  
      if (!supabaseRes.ok) {
        return res.status(500).json({ error: "Error guardando en Supabase" });
      }
  
      return res.status(200).json({ ok: true, precio });
    } catch (error) {
      return res.status(500).json({ error: "Error actualizando precio" });
    }
  }