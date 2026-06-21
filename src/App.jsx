import { useEffect, useState } from "react";

export default function App() {
  const [km, setKm] = useState("");
  const [precioGasoil, setPrecioGasoil] = useState(null);
  const [estado, setEstado] = useState("Cargando precio...");
  const [estacion, setEstacion] = useState("");

  const consumo = 8.0;

  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function cargarPrecio() {
      try {
        const res = await fetch("/api/precio");

        if (!res.ok) {
          throw new Error("Error en /api/precio");
        }

        const datos = await res.json();

        if (!datos || !datos.precio) {
          setEstado("No hay precio guardado en Supabase.");
          return;
        }

        setPrecioGasoil(Number(datos.precio));
        setEstacion(datos.estacion || "DISA Padre Anchieta");
        setEstado("Precio cargado desde Supabase.");
      } catch (error) {
        console.error(error);
        setEstado("No se pudo cargar el precio desde Supabase.");
      }
    }

    cargarPrecio();
  }, []);

  const coste =
    km === "" || precioGasoil === null
      ? 0
      : ((Number(km) * consumo) / 100) * precioGasoil;

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "50px auto",
        padding: "24px",
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      <h1>GASOLINIWI</h1>

      <input
        type="number"
        placeholder="Kilómetros"
        value={km}
        onChange={(e) => setKm(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "20px",
          marginBottom: "20px",
          boxSizing: "border-box",
        }}
      />

      <h2>€ {coste.toFixed(2)}</h2>

      <p>Consumo: {consumo} L/100 km</p>

      <p>
        Precio gasóleo hoy, {fechaHoy}:{" "}
        {precioGasoil === null ? "cargando..." : `${precioGasoil.toFixed(3)} €/L`}
      </p>

      <p>{estacion}</p>

      <p style={{ fontSize: "14px", color: "#666" }}>{estado}</p>
    </div>
  );
}