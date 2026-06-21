import { useEffect, useState } from "react";

export default function App() {
  const [km, setKm] = useState("");
  const [precioGasoil, setPrecioGasoil] = useState(null);
  const [estado, setEstado] = useState("Cargando precio...");
  const [estacion, setEstacion] = useState("");

  const consumo = 5.8; // cambia aquí el consumo real del coche
  const ideess = "9966";

  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function cargarPrecio() {
      try {
        const res = await fetch(
          "https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/"
        );

        const datos = await res.json();
        const estaciones = datos.ListaEESSPrecio || [];

        const estacionEncontrada = estaciones.find(
          (e) => String(e.IDEESS) === ideess
        );

        if (!estacionEncontrada) {
          setEstado("No se encontró la estación con IDEESS 9966.");
          return;
        }

        const precioTexto = estacionEncontrada["Precio Gasoleo A"];

        if (!precioTexto) {
          setEstado("No se encontró el precio de Gasóleo A.");
          return;
        }

        const precio = Number(precioTexto.replace(",", "."));

        setPrecioGasoil(precio);
        setEstacion(estacionEncontrada["Rótulo"] || "DISA Padre Anchieta");
        setEstado("Precio actualizado automáticamente.");
      } catch (error) {
        console.error(error);
        setEstado("No se pudo cargar el precio automáticamente.");
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