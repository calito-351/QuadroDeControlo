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

    supabase.auth.onAuthStateChange((_e, s) => setSession(s));
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

  async function logout() {
    await supabase.auth.signOut();
  }

  if (!session) {
    let email = "";
    let password = "";

    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginBox}>
          <h2>Gestão PRO</h2>
          <input placeholder="Email" onChange={e => (email = e.target.value)} />
          <input type="password" placeholder="Password" onChange={e => (password = e.target.value)} />
          <button onClick={() => supabase.auth.signInWithPassword({ email, password })}>
            Entrar
          </button>
          <button onClick={() => supabase.auth.signUp({ email, password })}>
            Criar Conta
          </button>
        </div>
      </div>
    );
  }

  const total = services.length;
  const risco = services.filter(s => s.kpis?.risco === "alto").length;
  const done = services.filter(s => s.kpis?.progresso === 100).length;

  return (
    <div style={styles.container}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h2 style={{ marginBottom: 30 }}>Gestão PRO</h2>

        <div style={styles.menuActive}>Dashboard</div>
        <div style={styles.menu}>Meus Serviços</div>
        <div style={styles.menu}>Convidar Utilizadores</div>

        <div style={{ marginTop: "auto", cursor: "pointer" }} onClick={logout}>
          Sair
        </div>
      </div>

      {/* MAIN */}
      <div style={styles.main}>
        <h1 style={{ marginBottom: 20 }}>Dashboard</h1>

        {/* KPI */}
        <div style={styles.kpiRow}>
          <div style={{ ...styles.kpiCard, background: "#2563eb" }}>
            <span>Total de Serviços</span>
            <h2>{total}</h2>
          </div>

          <div style={{ ...styles.kpiCard, background: "#f97316" }}>
            <span>Serviços em Risco</span>
            <h2>{risco}</h2>
          </div>

          <div style={{ ...styles.kpiCard, background: "#16a34a" }}>
            <span>Serviços Concluídos</span>
            <h2>{done}</h2>
          </div>
        </div>

        {/* ADD */}
        <div style={{ marginBottom: 20 }}>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Novo serviço"
          />
          <button onClick={addService}>Adicionar</button>
        </div>

        {/* SERVICES */}
        <div style={styles.grid}>
          {services.map(s => (
            <div key={s.id} style={styles.card}>
              
              {/* HEADER */}
              <div style={styles.cardHeader}>
                <h3>{s.name}</h3>
                <span style={styles.tagOwner}>owner</span>
              </div>

              {/* USER */}
              <div style={styles.user}>
                👤 gestor@test.com
              </div>

              {/* INFO */}
              <div style={styles.infoRow}>
                <div>
                  <strong>Progresso:</strong>{" "}
                  <span style={{ color: "#16a34a" }}>
                    {s.kpis?.progresso || 0}%
                  </span>
                </div>
                <div>
                  <strong>Risco:</strong>{" "}
                  <span
                    style={{
                      color:
                        s.kpis?.risco === "alto"
                          ? "red"
                          : s.kpis?.risco === "medio"
                          ? "orange"
                          : "green"
                    }}
                  >
                    {s.kpis?.risco}
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div style={styles.progressBar}>
                <div
                  style={{
                    ...styles.progressFill,
                    width: `${s.kpis?.progresso || 0}%`
                  }}
                />
              </div>

              {/* KPI BAR */}
              <div style={styles.kpiMini}>
                <div style={{ width: "30%", background: "green" }} />
                <div style={{ width: "30%", background: "orange" }} />
                <div style={{ width: "20%", background: "red" }} />
              </div>

              {/* TIMELINE */}
              <div style={styles.timeline}>
                Timeline: Planeamento, Execução
              </div>

              {/* ACTIONS */}
              <div style={styles.actions}>
                <button>Editar</button>
                <button>Detalhes</button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial"
  },
  sidebar: {
    width: 250,
    background: "#1e3a5f",
    color: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column"
  },
  menu: {
    padding: 10,
    cursor: "pointer"
  },
  menuActive: {
    padding: 10,
    background: "#2563eb",
    borderRadius: 6,
    marginBottom: 10
  },
  main: {
    flex: 1,
    padding: 20,
    background: "#f1f5f9"
  },
  kpiRow: {
    display: "flex",
    gap: 20,
    marginBottom: 20
  },
  kpiCard: {
    flex: 1,
    color: "white",
    padding: 20,
    borderRadius: 10
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 20
  },
  card: {
    background: "white",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between"
  },
  tagOwner: {
    background: "#22c55e",
    color: "white",
    padding: "2px 8px",
    borderRadius: 5,
    fontSize: 12
  },
  user: {
    fontSize: 12,
    marginBottom: 10
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10
  },
  progressBar: {
    height: 8,
    background: "#ddd",
    borderRadius: 5,
    marginBottom: 10
  },
  progressFill: {
    height: 8,
    background: "#16a34a",
    borderRadius: 5
  },
  kpiMini: {
    display: "flex",
    height: 6,
    marginBottom: 10
  },
  timeline: {
    fontSize: 12,
    marginBottom: 10
  },
  actions: {
    display: "flex",
    gap: 10
  },
  loginContainer: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center"
  },
  loginBox: {
    padding: 20,
    border: "1px solid #ccc",
    display: "flex",
    flexDirection: "column",
    gap: 10
  }
};

async function createOrgIfNotExists(user) {
  const { data } = await supabase
    .from("memberships")
    .select("*")
    .eq("user_id", user.id);

  if (!data.length) {
    const { data: org } = await supabase
      .from("organizations")
      .insert({ name: "Minha Empresa" })
      .select()
      .single();

    await supabase.from("memberships").insert({
      user_id: user.id,
      org_id: org.id,
      role: "admin"
    });
  }
}

await supabase.from("services").insert({
  name,
  org_id: orgId,
  kpis: { progresso: 0, risco: "baixo" }
});

await supabase.from("invites").insert({
  email: "user@email.com",
  org_id: orgId,
  role: "member"
});

const { data: invites } = await supabase
  .from("invites")
  .select("*")
  .eq("email", user.email)
  .eq("accepted", false);

for (let invite of invites) {
  await supabase.from("memberships").insert({
    user_id: user.id,
    org_id: invite.org_id,
    role: invite.role
  });

  await supabase
    .from("invites")
    .update({ accepted: true })
    .eq("id", invite.id);
}

<input
  type="file"
  onChange={e => handleUpload(e, s.id)}
/>

async function handleUpload(e, serviceId) {
  const file = e.target.files[0];
  if (!file) return;

  const filePath = `${serviceId}/${file.name}`;

  // Upload para storage
  const { error } = await supabase.storage
    .from("files")
    .upload(filePath, file);

  if (error) {
    console.log("Erro upload:", error.message);
    return;
  }

  // Obter URL público
  const { data } = supabase.storage
    .from("files")
    .getPublicUrl(filePath);

  // Guardar na base de dados
  await supabase.from("files").insert({
    service_id: serviceId,
    file_url: data.publicUrl,
    name: file.name
  });

  alert("Upload feito");
}

await supabase.from("services").insert({...});

await supabase.from("notifications").insert({
  user_id: session.user.id,
  text: "Novo serviço criado"
});

await supabase.from("notifications").insert({
  user_id: session.user.id,
  text: "Ficheiro adicionado ao projeto"
});

