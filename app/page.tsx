 "use client";

import React, { useEffect, useMemo, useState } from "react";

import {
  createDefaultPlan,
  createDefaultRoadmap,
  NotesMap,
  RoadmapPhase,
  WeekPlan
} from "../lib/plan-template";

type TabName = "week" | "tasks" | "roadmap" | "context" | "settings";

type ProjectSummary = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type ProjectData = {
  id: string;
  name: string;
  targetOutcome: string;
  plan: WeekPlan[];
  roadmap: RoadmapPhase[];
  notes: NotesMap;
  context: {
    whyThisExists: string;
    primaryGoal: string;
    operatingSystem: string[];
    toolStrategy: string[];
    weeklyRhythm: string[];
    guardrails: string[];
    nearTermOutcomes: string[];
  };
};


const TAB_KEY = "daves-pm-tab-v1";
const WEEK_KEY = "daves-pm-selected-week-v1";
const PROJECT_KEY = "daves-pm-selected-project-v1";
const AVAILABLE_TABS: TabName[] = ["week", "tasks", "roadmap", "context", "settings"];

export default function Page() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedProjectName, setSelectedProjectName] = useState<string>("Dave's Project Management");
  const [selectedProjectTargetOutcome, setSelectedProjectTargetOutcome] = useState<string>("");
  const [plan, setPlan] = useState<WeekPlan[]>(createDefaultPlan());
  const [projectRoadmap, setProjectRoadmap] = useState<RoadmapPhase[]>(createDefaultRoadmap(52));
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [notes, setNotes] = useState<NotesMap>({});
  const [projectContext, setProjectContext] = useState<ProjectData["context"]>({
    whyThisExists: "",
    primaryGoal: "",
    operatingSystem: [],
    toolStrategy: [],
    weeklyRhythm: [],
    guardrails: [],
    nearTermOutcomes: []
  });
  const [tab, setTab] = useState<TabName>("week");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskWhy, setNewTaskWhy] = useState("");
  const [newTaskOutcome, setNewTaskOutcome] = useState("");
  const [assignWeek, setAssignWeek] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectWeeks, setNewProjectWeeks] = useState<number>(12);
  const [settingsProjectName, setSettingsProjectName] = useState("");
  const [settingsTargetOutcome, setSettingsTargetOutcome] = useState("");
  const [settingsTotalWeeks, setSettingsTotalWeeks] = useState<number>(12);
  const [settingsContext, setSettingsContext] = useState<ProjectData["context"]>({
    whyThisExists: "",
    primaryGoal: "",
    operatingSystem: [],
    toolStrategy: [],
    weeklyRhythm: [],
    guardrails: [],
    nearTermOutcomes: []
  });
  const [settingsWeeks, setSettingsWeeks] = useState<WeekPlan[]>([]);
  const [settingsStatus, setSettingsStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [noteSaveStatus, setNoteSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const currentWeek = useMemo(
    () => plan.find((week) => week.week === selectedWeek) ?? plan[0],
    [plan, selectedWeek]
  );

  const overallProgress = useMemo(() => {
    const allTasks = plan.flatMap((week) => week.tasks);
    const doneCount = allTasks.filter((task) => task.done).length;
    return allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;
  }, [plan]);

  useEffect(() => {
    const boot = async () => {
      try {
        const savedTab = window.localStorage.getItem(TAB_KEY);
        const savedWeek = parseInt(window.localStorage.getItem(WEEK_KEY) || "1", 10);
        const savedProjectId = window.localStorage.getItem(PROJECT_KEY);

        if (savedTab && AVAILABLE_TABS.includes(savedTab as TabName)) {
          setTab(savedTab as TabName);
        }
        if (!Number.isNaN(savedWeek)) {
          setSelectedWeek(savedWeek);
          setAssignWeek(savedWeek);
        }

        const projectsResponse = await fetch("/api/projects");
        const projectsData = (await projectsResponse.json()) as { projects: ProjectSummary[] };
        setProjects(projectsData.projects);
        if (!projectsData.projects.length) return;

        const chosenProjectId =
          savedProjectId && projectsData.projects.some((project) => project.id === savedProjectId)
            ? savedProjectId
            : projectsData.projects[0].id;

        await loadProject(chosenProjectId);
      } catch {
        setError("Unable to load project data.");
      } finally {
        setLoading(false);
      }
    };

    void boot();
  }, []);

  useEffect(() => {
    window.localStorage.setItem(TAB_KEY, tab);
    window.localStorage.setItem(WEEK_KEY, String(selectedWeek));
    if (selectedProjectId) {
      window.localStorage.setItem(PROJECT_KEY, selectedProjectId);
    }
  }, [tab, selectedWeek, selectedProjectId]);

  useEffect(() => {
    setAssignWeek(selectedWeek);
  }, [selectedWeek]);

  useEffect(() => {
    setSettingsWeeks((prev) => {
      if (!prev.length) return prev;
      const totalWeeks = Math.max(1, Math.min(104, Math.floor(settingsTotalWeeks || 1)));
      const defaults = createDefaultPlan(totalWeeks);
      if (totalWeeks <= prev.length) {
        return prev.slice(0, totalWeeks);
      }
      return [...prev, ...defaults.slice(prev.length)];
    });
  }, [settingsTotalWeeks]);

  const loadProject = async (projectId: string) => {
    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) throw new Error("project not found");
    const data = (await response.json()) as { project: ProjectData };
    setSelectedProjectId(data.project.id);
    setSelectedProjectName(data.project.name);
    setSelectedProjectTargetOutcome(data.project.targetOutcome);
    setPlan(data.project.plan);
    setProjectRoadmap(data.project.roadmap || createDefaultRoadmap(data.project.plan.length));
    setNotes(data.project.notes || {});
    setProjectContext(data.project.context);
    setSettingsProjectName(data.project.name);
    setSettingsTargetOutcome(data.project.targetOutcome || "");
    setSettingsTotalWeeks(data.project.plan.length);
    setSettingsContext(data.project.context);
    setSettingsWeeks(data.project.plan.map((week) => ({
      ...week,
      deliverables: [...week.deliverables],
      tasks: week.tasks.map((task) => ({ ...task }))
    })));
    setSettingsStatus("idle");
  };

  const refreshProjectList = async () => {
    const projectsResponse = await fetch("/api/projects");
    const projectsData = (await projectsResponse.json()) as { projects: ProjectSummary[] };
    setProjects(projectsData.projects);
    return projectsData.projects;
  };

  const createProject = async () => {
    const name = newProjectName.trim();
    if (!name) return;
    const weeks = Math.max(1, Math.min(104, Math.floor(newProjectWeeks)));
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, weeks })
    });
    if (!response.ok) {
      setError("Unable to create project.");
      return;
    }
    const data = (await response.json()) as { project: ProjectData };
    await refreshProjectList();
    await loadProject(data.project.id);
    setNewProjectName("");
    setNewProjectWeeks(12);
  };

  const deleteCurrentProject = async () => {
    if (!selectedProjectId) return;
    if (!window.confirm(`Delete project "${selectedProjectName}"?`)) return;

    const response = await fetch(`/api/projects/${selectedProjectId}`, {
      method: "DELETE"
    });
    if (!response.ok) {
      setError("Unable to delete project.");
      return;
    }

    const updatedProjects = await refreshProjectList();
    if (updatedProjects.length) {
      await loadProject(updatedProjects[0].id);
    }
  };

  const syncProject = (project: ProjectData) => {
    setSelectedProjectId(project.id);
    setSelectedProjectName(project.name);
    setSelectedProjectTargetOutcome(project.targetOutcome);
    setPlan(project.plan);
    setProjectRoadmap(project.roadmap || createDefaultRoadmap(project.plan.length));
    setNotes(project.notes || {});
    setProjectContext(project.context);
    setSettingsProjectName(project.name);
    setSettingsTargetOutcome(project.targetOutcome || "");
    setSettingsTotalWeeks(project.plan.length);
    setSettingsContext(project.context);
    setSettingsWeeks(project.plan.map((week) => ({
      ...week,
      deliverables: [...week.deliverables],
      tasks: week.tasks.map((task) => ({ ...task }))
    })));
    setSettingsStatus("idle");
  };

  const updateTask = async (payload: Record<string, unknown>) => {
    if (!selectedProjectId) return;
    const response = await fetch(`/api/projects/${selectedProjectId}/tasks`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setError("Unable to save task update.");
      return;
    }
    const data = (await response.json()) as { project: ProjectData };
    syncProject(data.project);
  };

  const toggleTask = async (week: number, taskId: string) => {
    await updateTask({ action: "toggle", week, taskId });
  };

  const addTask = async () => {
    if (!newTaskTitle.trim() || !selectedProjectId) return;
    await updateTask({
      action: "add",
      week: assignWeek,
      title: newTaskTitle.trim(),
      why: newTaskWhy.trim(),
      outcome: newTaskOutcome.trim()
    });
    setNewTaskTitle("");
    setNewTaskWhy("");
    setNewTaskOutcome("");
  };

  const removeTask = async (week: number, taskId: string) => {
    await updateTask({ action: "remove", week, taskId });
  };

  const persistNote = async (week: number, value: string) => {
    if (!selectedProjectId) return;
    setNoteSaveStatus("saving");
    const response = await fetch(`/api/projects/${selectedProjectId}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week, value })
    });
    if (!response.ok) {
      setError("Unable to save note.");
      setNoteSaveStatus("error");
      return;
    }
    const data = (await response.json()) as { project: ProjectData };
    syncProject(data.project);
    setNoteSaveStatus("saved");
  };

  const updateNote = (week: number, value: string) => {
    setNotes((prev) => ({ ...prev, [week]: value }));
    setNoteSaveStatus("idle");
  };

  const saveCurrentWeekNote = async () => {
    await persistNote(currentWeek.week, notes[currentWeek.week] || "");
  };

  const parseLines = (value: string) =>
    value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

  const updateSettingsContextList = (
    key: "operatingSystem" | "toolStrategy" | "weeklyRhythm" | "guardrails" | "nearTermOutcomes",
    value: string
  ) => {
    setSettingsContext((prev) => ({
      ...prev,
      [key]: parseLines(value)
    }));
  };

  const updateSettingsWeek = (weekNumber: number, updater: (week: WeekPlan) => WeekPlan) => {
    setSettingsWeeks((prev) => prev.map((week) => (week.week === weekNumber ? updater(week) : week)));
  };

  const saveProjectSettings = async () => {
    if (!selectedProjectId) return;
    setSettingsStatus("saving");
    const payload = {
      action: "settings",
      name: settingsProjectName.trim() || selectedProjectName,
      targetOutcome: settingsTargetOutcome.trim(),
      totalWeeks: Math.max(1, Math.min(104, Math.floor(settingsTotalWeeks || 1))),
      context: settingsContext,
      plan: settingsWeeks.slice(0, Math.max(1, Math.min(104, Math.floor(settingsTotalWeeks || 1))))
    };
    const response = await fetch(`/api/projects/${selectedProjectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      setSettingsStatus("error");
      setError("Unable to save project settings.");
      return;
    }
    const data = (await response.json()) as { project: ProjectData };
    syncProject(data.project);
    setSettingsStatus("saved");
  };

  const tabButton = (name: TabName, label: string) => (
    <button
      onClick={() => setTab(name)}
      style={{
        padding: "10px 14px",
        borderRadius: 12,
        border: tab === name ? "2px solid #2563eb" : "1px solid #cbd5e1",
        background: tab === name ? "#eff6ff" : "white",
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      {label}
    </button>
  );

  const weekCardStyle = (isSelected: boolean) => ({
    textAlign: "left" as const,
    border: isSelected ? "2px solid #2563eb" : "1px solid #cbd5e1",
    borderRadius: 14,
    padding: 12,
    background: isSelected ? "#eff6ff" : "white",
    cursor: "pointer"
  });

  if (loading) {
    return (
      <main style={{ fontFamily: "Inter, Arial, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a", padding: 24 }}>
        Loading project...
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "Inter, Arial, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#0f172a" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: 24 }}>
        <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)", marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Dave's Project Management</div>
          <h1 style={{ margin: 0, fontSize: 34 }}>{selectedProjectName}</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, marginTop: 12 }}>
            Track what you are doing this week, why it matters, and what outcome it should create.
          </p>
          {error && <div style={{ color: "#b91c1c", marginBottom: 10 }}>{error}</div>}
          <div style={{ background: "#f8fafc", borderRadius: 16, padding: 14, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10 }}>Projects</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={selectedProjectId}
                onChange={(event) => {
                  void loadProject(event.target.value);
                }}
                style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px", background: "white", minWidth: 320, fontWeight: 600 }}
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <input
                value={newProjectName}
                onChange={(event) => setNewProjectName(event.target.value)}
                placeholder="New project name"
                style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px", background: "white", minWidth: 260 }}
              />
              <input
                type="number"
                min={1}
                max={104}
                value={newProjectWeeks}
                onChange={(event) => setNewProjectWeeks(Number(event.target.value))}
                style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: "10px 12px", background: "white", width: 120 }}
                aria-label="Project week count"
              />
              <button
                onClick={() => {
                  void createProject();
                }}
                style={{ border: "none", background: "#2563eb", color: "white", borderRadius: 12, padding: "10px 14px", cursor: "pointer", fontWeight: 700 }}
              >
                Add project
              </button>
              <button
                onClick={() => {
                  void deleteCurrentProject();
                }}
                style={{ border: "1px solid #cbd5e1", background: "white", borderRadius: 12, padding: "10px 12px", cursor: "pointer", fontWeight: 600 }}
              >
                Delete project
              </button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Target outcome</div>
              <div style={{ lineHeight: 1.6 }}>{selectedProjectTargetOutcome}</div>
            </div>
            <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Overall progress</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{overallProgress}%</div>
              <div style={{ height: 10, background: "#e2e8f0", borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
                <div style={{ width: `${overallProgress}%`, background: "#2563eb", height: "100%" }} />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            {tabButton("week", "Week View")}
            {tabButton("tasks", "Tasks")}
            {tabButton("roadmap", "Roadmap")}
            {tabButton("context", "Context")}
            {tabButton("settings", "Settings")}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "stretch" }}>
          <aside
            style={{
              background: "white",
              borderRadius: 24,
              padding: 18,
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              height: "calc(100vh - 36px)",
              overflowY: "auto"
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Weeks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {plan.map((w) => (
                <button
                  key={w.week}
                  onClick={() => { setSelectedWeek(w.week); setTab("week"); }}
                  style={weekCardStyle(selectedWeek === w.week)}
                >
                  <div style={{ fontSize: 12, color: "#64748b" }}>Week {w.week}</div>
                  <div style={{ fontWeight: 700, marginTop: 4, fontSize: 18, lineHeight: 1.25 }}>{w.title}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                    {w.tasks.filter((t) => t.done).length}/{w.tasks.length} tasks done
                  </div>
                </button>
              ))}
            </div>

          </aside>

          <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {tab === "week" && (
              <>
                <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>Current week</div>
                  <h2 style={{ marginTop: 8, marginBottom: 10 }}>Week {currentWeek.week}: {currentWeek.title}</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Objective</div>
                      <div>{currentWeek.objective}</div>
                    </div>
                    <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Why this week exists</div>
                      <div>{currentWeek.whyThisWeek}</div>
                    </div>
                  </div>
                  <div style={{ background: "#eff6ff", borderRadius: 16, padding: 16, marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: "#1d4ed8", marginBottom: 8 }}>Intended development outcome</div>
                    <div>{currentWeek.developmentOutcome}</div>
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Deliverables</div>
                    <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                      {currentWeek.deliverables.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ marginTop: 16, background: "#f8fafc", borderRadius: 16, padding: 16 }}>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Week notes</div>
                    <textarea
                      value={notes[currentWeek.week] || ""}
                      onChange={(e) => updateNote(currentWeek.week, e.target.value)}
                      placeholder="Write notes for this week..."
                      style={{
                        width: "100%",
                        minHeight: 170,
                        borderRadius: 12,
                        border: "1px solid #cbd5e1",
                        padding: 12,
                        fontSize: 14,
                        lineHeight: 1.6,
                        background: "white"
                      }}
                    />
                    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 10 }}>
                      <button
                        onClick={() => {
                          void saveCurrentWeekNote();
                        }}
                        style={{
                          border: "none",
                          background: "#2563eb",
                          color: "white",
                          borderRadius: 12,
                          padding: "8px 12px",
                          cursor: "pointer",
                          fontWeight: 700
                        }}
                      >
                        Save note
                      </button>
                      {noteSaveStatus === "saving" && <div style={{ fontSize: 13, color: "#475569" }}>Saving...</div>}
                      {noteSaveStatus === "saved" && <div style={{ fontSize: 13, color: "#166534" }}>Saved for week {currentWeek.week}.</div>}
                      {noteSaveStatus === "error" && <div style={{ fontSize: 13, color: "#991b1b" }}>Save failed. Try again.</div>}
                    </div>
                    <div style={{ color: "#64748b", marginTop: 8, fontSize: 12 }}>
                      Capture decisions, reflections, what worked, what failed, and what should become reusable.
                    </div>
                  </div>
                </div>

                <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ marginTop: 0 }}>Tasks for week {currentWeek.week}</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {currentWeek.tasks.map((task) => (
                      <div key={task.id} style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleTask(currentWeek.week, task.id)}
                            style={{ marginTop: 4 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</div>
                            <div style={{ marginTop: 8, color: "#475569" }}><strong>Why:</strong> {task.why}</div>
                            <div style={{ marginTop: 6, color: "#475569" }}><strong>Outcome:</strong> {task.outcome}</div>
                          </div>
                          {task.userCreated && (
                            <button
                              onClick={() => removeTask(currentWeek.week, task.id)}
                              style={{
                                border: "1px solid #cbd5e1",
                                background: "white",
                                borderRadius: 10,
                                padding: "6px 10px",
                                cursor: "pointer"
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === "tasks" && (
              <>
                <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ marginTop: 0 }}>Create a task</h3>
                  <p style={{ color: "#475569", lineHeight: 1.7 }}>
                    Create a custom task, assign it to a week, and it will persist inside that week and in the sidebar counts.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Task title</label>
                      <input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Ex: Compare three orchestration tools"
                        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Assign to week</label>
                      <select
                        value={assignWeek}
                        onChange={(e) => setAssignWeek(Number(e.target.value))}
                        style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: 12, background: "white" }}
                      >
                        {plan.map((w) => (
                          <option key={w.week} value={w.week}>
                            Week {w.week}: {w.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / span 2" }}>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Why</label>
                      <textarea
                        value={newTaskWhy}
                        onChange={(e) => setNewTaskWhy(e.target.value)}
                        placeholder="Why does this task matter?"
                        style={{ width: "100%", minHeight: 90, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / span 2" }}>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Outcome</label>
                      <textarea
                        value={newTaskOutcome}
                        onChange={(e) => setNewTaskOutcome(e.target.value)}
                        placeholder="What will this produce or teach?"
                        style={{ width: "100%", minHeight: 90, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={addTask}
                    style={{
                      marginTop: 14,
                      border: "none",
                      background: "#2563eb",
                      color: "white",
                      borderRadius: 12,
                      padding: "12px 16px",
                      cursor: "pointer",
                      fontWeight: 700
                    }}
                  >
                    Add task
                  </button>
                </div>

                <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ marginTop: 0 }}>Tasks in selected week</h3>
                  <p style={{ color: "#475569", lineHeight: 1.7 }}>
                    Currently viewing tasks for week {selectedWeek}. Click a week in the sidebar to switch context.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {currentWeek.tasks.map((task) => (
                      <div key={task.id} style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                          <input
                            type="checkbox"
                            checked={task.done}
                            onChange={() => toggleTask(currentWeek.week, task.id)}
                            style={{ marginTop: 4 }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, textDecoration: task.done ? "line-through" : "none" }}>{task.title}</div>
                            <div style={{ marginTop: 8, color: "#475569" }}><strong>Why:</strong> {task.why}</div>
                            <div style={{ marginTop: 6, color: "#475569" }}><strong>Outcome:</strong> {task.outcome}</div>
                          </div>
                          {task.userCreated && (
                            <button
                              onClick={() => removeTask(currentWeek.week, task.id)}
                              style={{
                                border: "1px solid #cbd5e1",
                                background: "white",
                                borderRadius: 10,
                                padding: "6px 10px",
                                cursor: "pointer"
                              }}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === "roadmap" && (
              <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <h3 style={{ marginTop: 0 }}>Project roadmap</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {projectRoadmap.map((phase) => (
                    <div key={phase.id} style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b" }}>
                        Weeks {phase.startWeek}-{phase.endWeek}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 18, marginTop: 4 }}>{phase.title}</div>
                      <div style={{ marginTop: 10, color: "#475569" }}><strong>Objective:</strong> {phase.objective}</div>
                      <div style={{ marginTop: 6, color: "#475569" }}><strong>Why:</strong> {phase.why}</div>
                      <div style={{ marginTop: 6, color: "#475569" }}><strong>Outcome:</strong> {phase.outcome}</div>
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6 }}>Deliverables</div>
                        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                          {phase.deliverables.map((d) => <li key={d}>{d}</li>)}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "settings" && (
              <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <h3 style={{ marginTop: 0 }}>Project settings</h3>
                <p style={{ color: "#475569", lineHeight: 1.7 }}>
                  Configure project scope, context, targets, and weekly setup. Changes apply only to the selected project.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Project name</label>
                    <input
                      value={settingsProjectName}
                      onChange={(event) => setSettingsProjectName(event.target.value)}
                      style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Total weeks</label>
                    <input
                      type="number"
                      min={1}
                      max={104}
                      value={settingsTotalWeeks}
                      onChange={(event) => setSettingsTotalWeeks(Number(event.target.value))}
                      style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                    />
                  </div>
                  <div style={{ gridColumn: "1 / span 2" }}>
                    <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Target outcome</label>
                    <textarea
                      value={settingsTargetOutcome}
                      onChange={(event) => setSettingsTargetOutcome(event.target.value)}
                      style={{ width: "100%", minHeight: 90, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <h4 style={{ marginTop: 0 }}>Context and targets for Context tab</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Why this exists</label>
                      <textarea
                        value={settingsContext.whyThisExists}
                        onChange={(event) => setSettingsContext((prev) => ({ ...prev, whyThisExists: event.target.value }))}
                        style={{ width: "100%", minHeight: 100, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Primary goal</label>
                      <textarea
                        value={settingsContext.primaryGoal}
                        onChange={(event) => setSettingsContext((prev) => ({ ...prev, primaryGoal: event.target.value }))}
                        style={{ width: "100%", minHeight: 100, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Operating system (one per line)</label>
                      <textarea
                        value={settingsContext.operatingSystem.join("\n")}
                        onChange={(event) => updateSettingsContextList("operatingSystem", event.target.value)}
                        style={{ width: "100%", minHeight: 120, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Tool strategy (one per line)</label>
                      <textarea
                        value={settingsContext.toolStrategy.join("\n")}
                        onChange={(event) => updateSettingsContextList("toolStrategy", event.target.value)}
                        style={{ width: "100%", minHeight: 120, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Weekly rhythm (one per line)</label>
                      <textarea
                        value={settingsContext.weeklyRhythm.join("\n")}
                        onChange={(event) => updateSettingsContextList("weeklyRhythm", event.target.value)}
                        style={{ width: "100%", minHeight: 120, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Guardrails (one per line)</label>
                      <textarea
                        value={settingsContext.guardrails.join("\n")}
                        onChange={(event) => updateSettingsContextList("guardrails", event.target.value)}
                        style={{ width: "100%", minHeight: 120, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / span 2" }}>
                      <label style={{ display: "block", fontSize: 13, color: "#64748b", marginBottom: 6 }}>Targets (one per line)</label>
                      <textarea
                        value={settingsContext.nearTermOutcomes.join("\n")}
                        onChange={(event) => updateSettingsContextList("nearTermOutcomes", event.target.value)}
                        style={{ width: "100%", minHeight: 120, border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <h4 style={{ marginTop: 0 }}>Week setup</h4>
                  <p style={{ color: "#475569", lineHeight: 1.6, marginTop: 0 }}>
                    Edit each week's title, objective, why, outcome, and deliverables.
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                    {settingsWeeks.map((week) => (
                      <div key={week.week} style={{ border: "1px solid #cbd5e1", borderRadius: 12, padding: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 10 }}>Week {week.week}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <input
                            value={week.title}
                            onChange={(event) => updateSettingsWeek(week.week, (item) => ({ ...item, title: event.target.value }))}
                            placeholder="Week title"
                            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                          />
                          <input
                            value={week.objective}
                            onChange={(event) => updateSettingsWeek(week.week, (item) => ({ ...item, objective: event.target.value }))}
                            placeholder="Objective"
                            style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                          />
                          <textarea
                            value={week.whyThisWeek}
                            onChange={(event) => updateSettingsWeek(week.week, (item) => ({ ...item, whyThisWeek: event.target.value }))}
                            placeholder="Why this week exists"
                            style={{ minHeight: 80, border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                          />
                          <textarea
                            value={week.developmentOutcome}
                            onChange={(event) => updateSettingsWeek(week.week, (item) => ({ ...item, developmentOutcome: event.target.value }))}
                            placeholder="Intended development outcome"
                            style={{ minHeight: 80, border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                          />
                          <div style={{ gridColumn: "1 / span 2" }}>
                            <textarea
                              value={week.deliverables.join("\n")}
                              onChange={(event) =>
                                updateSettingsWeek(week.week, (item) => ({
                                  ...item,
                                  deliverables: parseLines(event.target.value)
                                }))
                              }
                              placeholder="Deliverables (one per line)"
                              style={{ width: "100%", minHeight: 90, border: "1px solid #cbd5e1", borderRadius: 10, padding: 10 }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
                  <button
                    onClick={() => {
                      void saveProjectSettings();
                    }}
                    style={{ border: "none", background: "#2563eb", color: "white", borderRadius: 12, padding: "10px 14px", cursor: "pointer", fontWeight: 700 }}
                  >
                    Save settings
                  </button>
                  {settingsStatus === "saving" && <div style={{ fontSize: 13, color: "#475569" }}>Saving...</div>}
                  {settingsStatus === "saved" && <div style={{ fontSize: 13, color: "#166534" }}>Saved project settings.</div>}
                  {settingsStatus === "error" && <div style={{ fontSize: 13, color: "#991b1b" }}>Save failed. Try again.</div>}
                </div>
              </div>
            )}

            {tab === "context" && (
              <>
                <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ marginTop: 0 }}>Project context</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div style={{ background: "#f8fafc", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Why this exists</div>
                      <div style={{ lineHeight: 1.6 }}>{projectContext.whyThisExists}</div>
                    </div>
                    <div style={{ background: "#eff6ff", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#1d4ed8", marginBottom: 8 }}>Primary goal</div>
                      <div style={{ lineHeight: 1.6 }}>{projectContext.primaryGoal}</div>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Operating system</div>
                      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                        {projectContext.operatingSystem.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Tool strategy</div>
                      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                        {projectContext.toolStrategy.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Weekly rhythm</div>
                      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                        {projectContext.weeklyRhythm.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", borderRadius: 16, padding: 16 }}>
                      <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>Guardrails</div>
                      <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                        {projectContext.guardrails.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div style={{ background: "white", borderRadius: 24, padding: 24, boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <h3 style={{ marginTop: 0 }}>Targets</h3>
                  <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
                    {projectContext.nearTermOutcomes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
