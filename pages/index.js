import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [session, setSession] = useState(null);
  const [services, setServices] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  async function updateProgress(id, value, kpis) {
    await supabase
      .from("services")
      .update({ kpis: { ...kpis, progresso: value } })
      .eq("id", id);

    loadServices();
  }

  async function updateRisk(id, value, kpis) {
    await supabase
      .from("services")
      .update({ kpis: { ...kpis, risco: value } })
      .eq("id", id);

    loadServices();
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  if (!session) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ padding: 30, background: "white", borderRadius: 10, width: 300 }}>
          <h2 style={{ textAlign: "center" }}>Login</h2>

          <input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <button
            style={{ width: "100%", background: "#007bff", color: "white", marginBottom: 10 }}
            onClick={() => supabase.auth.signInWithPassword({ email, password })}
          >
            Entrar
          </button>

          <button
            style={{ width: "100%", background: "#6c757d", color: "white" }}
            onClick={() => supabase.auth.signUp({ email, password })}
          >
            Criar Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, background: "#f0f2f5", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <h1>Dashboard</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Novo serviço"
        />
        <button onClick={addService}>Adicionar</button>
      </div>

      {services.map(s => (
        <div
          key={s.id}
          style={{
            background: "white",
            padding: 15,
            marginBottom: 10,
            borderRadius: 10,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
          }}
        >
          <h3>{s.name}</h3>

          <div>
            <strong>Progresso:</strong> {s.kpis?.progresso || 0}%
            <input
              type="range"
              min="0"
              max="100"
              value={s.kpis?.progresso || 0}
              onChange={e =>
                updateProgress(s.id, Number(e.target.value), s.kpis)
              }
            />
          </div>

          <div>
            <strong>Risco:</strong>
            {["baixo", "medio", "alto"].map(r => (
              <button
                key={r}
                style={{
                  marginLeft: 5,
                  background:
                    r === "alto"
                      ? "red"
                      : r === "medio"
                      ? "orange"
                      : "green",
                  color: "white"
                }}
                onClick={() => updateRisk(s.id, r, s.kpis)}
              >
                {r}
              </button>
            ))}
          </div>

          {s.kpis?.progresso < 50 && s.kpis?.risco === "alto" && (
            <div style={{ color: "red", marginTop: 10 }}>
              Projeto em risco
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
