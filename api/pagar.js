export default async function handler(req, res) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Método no permitido" });
      }
  
      const precioRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/precios_combustible?ideess=eq.9966&select=*`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );
  
      const precios = await precioRes.json();
      const precioActual = Number(precios[0].precio);
      const consumo = 8.0;
  
      const viajesRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/viajes?pagado=eq.false&select=*`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
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
  
      const pagoRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/pagos`,
        {
          method: "POST",
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
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
        }
      );
  
      const pago = await pagoRes.json();
  
      if (!pagoRes.ok) {
        return res.status(500).json(pago);
      }
  
      await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/viajes?pagado=eq.false`,
        {
          method: "PATCH",
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pagado: true,
          }),
        }
      );
  
      return res.status(200).json({
        ok: true,
        pago: pago[0],
      });
    } catch (error) {
      return res.status(500).json({ error: "Error realizando pago" });
    }
  }