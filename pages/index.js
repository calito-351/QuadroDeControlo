import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [session, setSession] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newProject, setNewProject] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (session) loadProjects();
  }, [session]);

  async function loadProjects() {
    const { data } = await supabase.from("services").select("*");
    setProjects(data || []);
  }

  async function addProject() {
    if (!newProject) return;

    await supabase.from("services").insert({
      name: newProject,
      kpis: { progresso: 0, risco: "baixo" },
      timeline: [],
      tasks: [
        { title: "Tarefa 1", status: "todo" }
      ]
    });

    setNewProject("");
    loadProjects();
  }

  async function updateTasks(project, tasks) {
    await supabase
      .from("services")
      .update({ tasks })
      .eq("id", project.id);

    loadProjects();
  }

  function moveTask(project, taskIndex, newStatus) {
    const tasks = [...(project.tasks || [])];
    tasks[taskIndex].status = newStatus;
    updateTasks(project, tasks);
  }

  async function addTask(project) {
    const tasks = [...(project.tasks || [])];
    tasks.push({ title: "Nova tarefa", status: "todo" });
    updateTasks(project, tasks);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  if (!session) {
    let email = "";
    let password = "";

    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center" }}>
        <div style={{ padding: 30, border: "1px solid #ccc" }}>
          <h2>Login</h2>
          <input placeholder="Email" onChange={e => (email = e.target.value)} />
          <br />
          <input type="password" placeholder="Password" onChange={e => (password = e.target.value)} />
          <br />
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

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* SIDEBAR */}
      <div style={{ width: 250, background: "#1f2937", color: "white", padding: 15 }}>
        <h2>Projetos</h2>

        <input
          value={newProject}
          onChange={e => setNewProject(e.target.value)}
          placeholder="Novo projeto"
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button onClick={addProject}>Criar</button>

        <div style={{ marginTop: 20 }}>
          {projects.map(p => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                padding: 10,
                cursor: "pointer",
                background: selected?.id === p.id ? "#374151" : "transparent"
              }}
            >
              {p.name}
            </div>
          ))}
        </div>

        <button onClick={logout} style={{ marginTop: 20 }}>
          Logout
        </button>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: 20, background: "#f3f4f6" }}>
        {!selected ? (
          <h2>Seleciona um projeto</h2>
        ) : (
          <>
            <h1>{selected.name}</h1>

            {/* KPI */}
            <div style={{ marginBottom: 20 }}>
              <strong>Progresso:</strong> {selected.kpis?.progresso || 0}%
            </div>

            {/* KANBAN */}
            <div style={{ display: "flex", gap: 20 }}>
              
              {["todo", "doing", "done"].map(status => (
                <div key={status} style={{ flex: 1, background: "white", padding: 10 }}>
                  <h3>{status.toUpperCase()}</h3>

                  {(selected.tasks || [])
                    .filter(t => t.status === status)
                    .map((t, i) => (
                      <div key={i} style={{ border: "1px solid #ccc", padding: 5, marginBottom: 5 }}>
                        {t.title}

                        <div>
                          {["todo", "doing", "done"].map(s => (
                            <button key={s} onClick={() => moveTask(selected, i, s)}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                  <button onClick={() => addTask(selected)}>+ Tarefa</button>
                </div>
              ))}

            </div>
          </>
        )}
      </div>
    </div>
  );
}
