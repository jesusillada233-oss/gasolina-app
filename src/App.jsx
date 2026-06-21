import { useEffect, useState } from "react";

export default function App() {
  const [persona, setPersona] = useState("Adriana");
  const [km, setKm] = useState("");
  const [precioGasoil, setPrecioGasoil] = useState(null);
  const [estacion, setEstacion] = useState("");
  const [estado, setEstado] = useState("Cargando precio...");
  const [viajes, setViajes] = useState([]);

  const consumo = 8.0;

  const fechaHoy = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    cargarPrecio();
    cargarViajes();
  }, []);

  async function cargarPrecio() {
    try {
      const res = await fetch("/api/precio");
      const datos = await res.json();

      setPrecioGasoil(Number(datos.precio));
      setEstacion(datos.estacion || "DISA Padre Anchieta");
      setEstado("Precio cargado desde Supabase.");
    } catch (error) {
      console.error(error);
      setEstado("No se pudo cargar el precio.");
    }
  }

  async function cargarViajes() {
    try {
      const res = await fetch("/api/viajes");
      const datos = await res.json();
  
      if (Array.isArray(datos)) {
        setViajes(datos);
      } else {
        console.error("La API /api/viajes no devolvió un array:", datos);
        setViajes([]);
        setEstado("Error cargando viajes.");
      }
    } catch (error) {
      console.error(error);
      setViajes([]);
      setEstado("Error cargando viajes.");
    }
  }

  async function guardarViaje() {
    if (!km || Number(km) <= 0) {
      alert("Introduce los kilómetros.");
      return;
    }

    await fetch("/api/guardar-viaje", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona,
        kilometros: Number(km),
      }),
    });

    setKm("");
    await cargarViajes();
  }

  async function pagar() {
    if (!precioGasoil) {
      alert("Todavía no se ha cargado el precio del gasóleo.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que quieres marcar como pagado?\n\nAdriana: ${totalAdrianaEuros.toFixed(
        2
      )} €\nSamuel: ${totalSamuelEuros.toFixed(
        2
      )} €\n\nSe cerrará este periodo y la cuenta volverá a 0.`
    );

    if (!confirmar) return;

    await fetch("/api/pagar", {
      method: "POST",
    });

    await cargarViajes();
  }

  const viajesPendientes = viajes.filter((v) => !v.pagado);

  const kmAdriana = viajesPendientes
    .filter((v) => v.persona === "Adriana")
    .reduce((total, v) => total + Number(v.kilometros), 0);

  const kmSamuel = viajesPendientes
    .filter((v) => v.persona === "Samuel")
    .reduce((total, v) => total + Number(v.kilometros), 0);

  const totalKm = kmAdriana + kmSamuel;

  const totalAdrianaEuros =
    precioGasoil === null ? 0 : (kmAdriana * consumo * precioGasoil) / 100;

  const totalSamuelEuros =
    precioGasoil === null ? 0 : (kmSamuel * consumo * precioGasoil) / 100;

  const totalGeneral = totalAdrianaEuros + totalSamuelEuros;

  return (
    <div
      style={{
        maxWidth: "430px",
        margin: "30px auto",
        padding: "24px",
        fontFamily: "Arial",
        textAlign: "center",
      }}
    >
      <h1>GASOLINIWI</h1>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          onClick={() => setPersona("Adriana")}
          style={{
            flex: 1,
            padding: "14px",
            fontSize: "18px",
            fontWeight: "bold",
            background: persona === "Adriana" ? "#111" : "#eee",
            color: persona === "Adriana" ? "white" : "black",
            border: "none",
            borderRadius: "12px",
          }}
        >
          Adriana
        </button>

        <button
          onClick={() => setPersona("Samuel")}
          style={{
            flex: 1,
            padding: "14px",
            fontSize: "18px",
            fontWeight: "bold",
            background: persona === "Samuel" ? "#111" : "#eee",
            color: persona === "Samuel" ? "white" : "black",
            border: "none",
            borderRadius: "12px",
          }}
        >
          Samuel
        </button>
      </div>

      <p>Conductor seleccionado: <strong>{persona}</strong></p>

      <input
        type="number"
        placeholder="Kilómetros recorridos"
        value={km}
        onChange={(e) => setKm(e.target.value)}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "20px",
          marginBottom: "14px",
          boxSizing: "border-box",
          borderRadius: "12px",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={guardarViaje}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "18px",
          fontWeight: "bold",
          borderRadius: "12px",
          border: "none",
          background: "#007aff",
          color: "white",
          marginBottom: "24px",
        }}
      >
        Guardar viaje
      </button>

      <hr />

      <h2>Cuenta pendiente</h2>

      <p>Adriana: {kmAdriana.toFixed(1)} km → {totalAdrianaEuros.toFixed(2)} €</p>
      <p>Samuel: {kmSamuel.toFixed(1)} km → {totalSamuelEuros.toFixed(2)} €</p>

      <h3>Total: {totalKm.toFixed(1)} km → {totalGeneral.toFixed(2)} €</h3>

      <button
        onClick={pagar}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "18px",
          fontWeight: "bold",
          borderRadius: "12px",
          border: "none",
          background: "#34c759",
          color: "white",
          marginTop: "10px",
        }}
      >
        Pagar
      </button>

      <hr style={{ marginTop: "24px" }} />

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