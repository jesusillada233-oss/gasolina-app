export default async function handler(req, res) {
    try {
      const respuesta = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/viajes?select=*&order=creado_en.desc`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
  
      const datos = await respuesta.json();
  
      return res.status(200).json(datos);
    } catch (error) {
      return res.status(500).json({ error: "Error cargando viajes" });
    }
  }