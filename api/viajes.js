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
        `${url}/rest/v1/viajes?select=id,persona,kilometros,pagado,creado_en&pagado=eq.false&order=creado_en.desc`,
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
          error: "Error leyendo viajes en Supabase",
          status: respuesta.status,
          detalle: texto,
        });
      }
  
      const datos = JSON.parse(texto);
  
      return res.status(200).json(Array.isArray(datos) ? datos : []);
    } catch (error) {
      return res.status(500).json({
        error: "Error interno cargando viajes",
        detalle: error.message,
      });
    }
  }