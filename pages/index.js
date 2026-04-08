import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [session, setSession] = useState(null);
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) loadServices();
  }, [session]);

  async function loadServices() {
    const { data } = await supabase.from("services").select("*");
    setServices(data || []);
  }

  async function addService() {
    if (!name) return;

    await supabase.from("services").insert({
      name,
      kpis: { progresso: 0, risco: "baixo" },
      timeline: []
    });

    setName("");
    loadServices();
  }

  if (!session) {
    let email = "";
    let password = "";

    return (
      <div style={{ padding: 40 }}>
        <h2>Login</h2>
        <input placeholder="Email" onChange={e => (email = e.target.value)} />
        <br />
        <input type="password" placeholder="Password" onChange={e => (password = e.target.value)} />
        <br />
        <button onClick={() => supabase.auth.signInWithPassword({ email, password })}>
          Entrar
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Dashboard</h1>

      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Novo serviço"
      />
      <button onClick={addService}>Adicionar</button>

      {services.map(s => (
        <div key={s.id} style={{ border: "1px solid #ccc", marginTop: 10, padding: 10 }}>
          <h3>{s.name}</h3>
          <p>Progresso: {s.kpis?.progresso || 0}%</p>
        </div>
      ))}
    </div>
  );
}
