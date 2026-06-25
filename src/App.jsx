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

      const precio = Number(datos.precio);

      if (Number.isNaN(precio)) {
        setEstado("El precio recibido no es válido.");
        return;
      }

      setPrecioGasoil(precio);
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

    const res = await fetch("/api/guardar-viaje", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona,
        kilometros: Number(km),
      }),
    });

    if (!res.ok) {
      alert("No se pudo guardar el viaje.");
      return;
    }

    setKm("");
    await cargarViajes();
  }

  async function pagar() {
    if (!precioGasoil) {
      alert("Todavía no se ha cargado el precio del gasóleo.");
      return;
    }

    if (totalKm === 0) {
      alert("No hay kilómetros pendientes para pagar.");
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

    const res = await fetch("/api/pagar", {
      method: "POST",
    });

    if (!res.ok) {
      alert("No se pudo cerrar el pago.");
      return;
    }

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

  const kmActual = Number(km) || 0;

  const costeViajeActual =
    precioGasoil === null ? 0 : (kmActual * consumo * precioGasoil) / 100;

  function estiloBotonPersona(nombre) {
    const seleccionado = persona === nombre;

    return {
      flex: 1,
      padding: "14px",
      fontSize: "18px",
      fontWeight: "bold",
      background: seleccionado ? "white" : "#111",
      color: seleccionado ? "#111" : "white",
      border: "2px solid #111",
      borderRadius: "12px",
      cursor: "pointer",
    };
  }

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
          style={estiloBotonPersona("Adriana")}
        >
          Adriana
        </button>

        <button
          onClick={() => setPersona("Samuel")}
          style={estiloBotonPersona("Samuel")}
        >
          Samuel
        </button>
      </div>

      <p>
        Conductor seleccionado: <strong>{persona}</strong>
      </p>

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

      <div
        style={{
          background: "#f2f2f2",
          padding: "14px",
          borderRadius: "12px",
          marginBottom: "14px",
        }}
      >
        <p style={{ margin: "0 0 6px 0", fontWeight: "bold" }}>
          Este viaje costaría:
        </p>

        <h2 style={{ margin: "0" }}>{costeViajeActual.toFixed(2)} €</h2>
      </div>

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
          cursor: "pointer",
        }}
      >
        Guardar viaje
      </button>

      <hr />

      <h2>Cuenta pendiente</h2>

      <p>
        Adriana: {kmAdriana.toFixed(1)} km → {totalAdrianaEuros.toFixed(2)} €
      </p>

      <p>
        Samuel: {kmSamuel.toFixed(1)} km → {totalSamuelEuros.toFixed(2)} €
      </p>

      <h3>
        Total: {totalKm.toFixed(1)} km → {totalGeneral.toFixed(2)} €
      </h3>

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
          cursor: "pointer",
        }}
      >
        Pagar
      </button>

      <hr style={{ marginTop: "24px" }} />

      <p>Consumo: {consumo} L/100 km</p>

      <p>
        Precio gasóleo hoy, {fechaHoy}:{" "}
        {precioGasoil === null
          ? "cargando..."
          : `${precioGasoil.toFixed(3)} €/L`}
      </p>

      <p>{estacion}</p>

      <p style={{ fontSize: "14px", color: "#666" }}>{estado}</p>
    </div>
  );
}