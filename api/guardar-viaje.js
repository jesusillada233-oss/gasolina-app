export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
      }
  
      const { persona, kilometros } = req.body;
  
      if (!persona || !kilometros || kilometros <= 0) {
        return res.status(400).json({ error: "Datos inválidos" });
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
            kilometros,
            pagado: false,
          }),
        }
      );
  
      const datos = await respuesta.json();
  
      if (!respuesta.ok) {
        return res.status(500).json(datos);
      }
  
      return res.status(200).json(datos[0]);
    } catch (error) {
      return res.status(500).json({ error: "Error guardando viaje" });
    }
  }