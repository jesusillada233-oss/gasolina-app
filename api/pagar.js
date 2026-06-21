export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
      }
  
      const url = process.env.SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
      const consumo = 8.0;
  
      const precioRes = await fetch(
        `${url}/rest/v1/precios_combustible?select=precio&limit=1`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        }
      );
  
      const precios = await precioRes.json();
      const precioActual = Number(precios[0].precio);
  
      const viajesRes = await fetch(
        `${url}/rest/v1/viajes?pagado=eq.false&select=*`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        }
      );
  
      const viajes = await viajesRes.json();
  
      const kmAdriana = viajes
        .filter((v) => v.persona === "Adriana")
        .reduce((t, v) => t + Number(v.kilometros), 0);
  
      const kmSamuel = viajes
        .filter((v) => v.persona === "Samuel")
        .reduce((t, v) => t + Number(v.kilometros), 0);
  
      const totalAdriana = (kmAdriana * consumo * precioActual) / 100;
      const totalSamuel = (kmSamuel * consumo * precioActual) / 100;
      const totalGeneral = totalAdriana + totalSamuel;
  
      await fetch(`${url}/rest/v1/pagos`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          km_adriana: kmAdriana,
          km_samuel: kmSamuel,
          precio_gasoil: precioActual,
          consumo,
          total_adriana: totalAdriana,
          total_samuel: totalSamuel,
          total_general: totalGeneral,
        }),
      });
  
      const marcarRes = await fetch(
        `${url}/rest/v1/viajes?pagado=eq.false`,
        {
          method: "PATCH",
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            pagado: true,
          }),
        }
      );
  
      const marcadosTexto = await marcarRes.text();
  
      if (!marcarRes.ok) {
        return res.status(500).json({
          error: "No se pudieron marcar los viajes como pagados",
          detalle: marcadosTexto,
        });
      }
  
      return res.status(200).json({
        ok: true,
        viajes_marcados: JSON.parse(marcadosTexto),
      });
    } catch (error) {
      return res.status(500).json({
        error: "Error realizando pago",
        detalle: error.message,
      });
    }
  }