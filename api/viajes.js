export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
      }
  
      const { persona, kilometros } = req.body || {};
  
      if (!persona || !kilometros || Number(kilometros) <= 0) {
        return res.status(400).json({
          error: "Datos inválidos",
          recibido: req.body,
        });
      }
  
      const respuesta = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/viajes`,
        {
          method: "POST",
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            persona,
            kilometros: Number(kilometros),
            pagado: false,
          }),
        }
      );
  
      const texto = await respuesta.text();
  
      if (!respuesta.ok) {
        return res.status(500).json({
          error: "Error guardando en Supabase",
          status: respuesta.status,
          detalle: texto,
        });
      }
  
      return res.status(200).json({
        ok: true,
        viaje: texto ? JSON.parse(texto)[0] : null,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error interno guardando viaje",
        detalle: error.message,
      });
    }
  }