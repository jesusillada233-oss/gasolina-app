export default async function handler(req, res) {
    try {
      const respuesta = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/viajes?select=*&order=creado_en.desc`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
  
      const texto = await respuesta.text();
  
      if (!respuesta.ok) {
        return res.status(500).json({
          error: "Error leyendo viajes",
          status: respuesta.status,
          detalle: texto,
        });
      }
  
      const datos = JSON.parse(texto);
      return res.status(200).json(datos);
    } catch (error) {
      return res.status(500).json({
        error: "Error interno cargando viajes",
        detalle: error.message,
      });
    }
  }