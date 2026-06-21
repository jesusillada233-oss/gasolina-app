export default async function handler(req, res) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
  
    const respuesta = await fetch(
      `${url}/rest/v1/precios_combustible?ideess=eq.9966&select=*`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );
  
    const datos = await respuesta.json();
  
    return res.status(200).json(datos[0]);
  }