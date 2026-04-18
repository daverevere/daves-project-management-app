import { randomUUID } from "crypto";
import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";

import {
  createDefaultPlan,
  createDefaultRoadmap,
  createEmptyNotes,
  NotesMap,
  RoadmapPhase,
  WeekPlan
} from "./plan-template";

export type ProjectContext = {
  whyThisExists: string;
  primaryGoal: string;
  operatingSystem: string[];
  toolStrategy: string[];
  weeklyRhythm: string[];
  guardrails: string[];
  nearTermOutcomes: string[];
};

export type ProjectData = {
  id: string;
  name: string;
  targetOutcome: string;
  plan: WeekPlan[];
  roadmap: RoadmapPhase[];
  notes: NotesMap;
  context: ProjectContext;
  createdAt: string;
  updatedAt: string;
};

type StoreData = {
  projects: ProjectData[];
};

const DATA_DIR = path.join(process.cwd(), "data");
const LEGACY_DATA_FILE = path.join(DATA_DIR, "projects.json");
const DB_FILE = path.join(DATA_DIR, "projects.db");
const DEFAULT_PROJECT_NAME = "Career Quest: Dave AI Governance";
let dbInstance: Database.Database | null = null;

function createDefaultTargetOutcome(name: string, totalWeeks: number): string {
  if (name === "Career Quest: Dave AI Governance") {
    return "Within 12 months, I operate a reliable AI governance workbench that improves chatbot safety and eval quality, produces committee-ready decisions and controls, and provides portfolio-grade evidence for resilient AI governance roles.";
  }
  if (name === "Agentic Engineering Implementation") {
    return "In 4 weeks, I reliably run a disciplined agentic engineering workflow (plan -> implement -> verify -> review), complete high-quality personal project deliverables, and show measurable improvement in execution quality and consistency.";
  }
  return `By week ${totalWeeks}, ${name} has delivered durable outcomes with clear evidence of progress, reusable workflows, and measurable impact.`;
}

function createDefaultContext(name: string): ProjectContext {
  if (name === "Career Quest: Dave AI Governance") {
    return {
      whyThisExists:
        "This project exists to define and execute a practical AI governance development path rooted in real chatbot, eval, and safety work so that both humans and LLMs can clearly understand scope, decisions, and intent.",
      primaryGoal:
        "Use live engineering work to build governance competence, committee-ready artifacts, and portable evidence for long-term AI governance career transitions.",
      operatingSystem: [
        "Current role: Staff AI engineer working on chatbots, evaluations, and safety behaviors.",
        "Current opportunity: participate in Sondermind's AI governance committee.",
        "Primary domain: AI systems used in sensitive mental-health-adjacent workflows.",
        "Development frame: production lane, learning lane, and career-proof lane run in parallel."
      ],
      toolStrategy: [
        "Primary coding workflow: Claude Code + VS Code + Bedrock stack.",
        "Secondary review workflow: Gemini as adversarial or second-pass check.",
        "Knowledge storage: AI-Lab workspace with reusable templates, checklists, and artifact history.",
        "Execution rule: every major output should leave a traceable file artifact."
      ],
      weeklyRhythm: [
        "Primary stakeholder: self (project owner and accountable reviewer).",
        "Core collaborators: engineering peers and governance committee participants.",
        "Secondary audience: future hiring managers evaluating governance readiness.",
        "LLM audience: assistants that need unambiguous project context and constraints."
      ],
      guardrails: [
        "Never treat one model output as truth; cross-check important decisions.",
        "Avoid generic project language; tie weekly work to real production scenarios.",
        "Keep personal practice data and work-repo data clearly separated.",
        "Human accountability and oversight are mandatory for governance decisions."
      ],
      nearTermOutcomes: [
        "Relevant standards and references should be attached to artifacts where possible.",
        "Each month should produce one portfolio-grade governance output with evidence.",
        "Project context should remain readable to both humans and LLM copilots.",
        "Update context when role scope, systems, or stakeholder landscape changes."
      ]
    };
  }

  if (name === "Agentic Engineering Implementation") {
    return {
      whyThisExists:
        "This project converts Sondermind agentic engineering training into a practical personal operating system that can be used across real projects with repeatable quality.",
      primaryGoal:
        "Internalize and implement a production-grade human-in-the-loop workflow for AI-assisted engineering while creating durable templates, checklists, and implementation evidence.",
      operatingSystem: [
        "Execution loop: spec -> implement -> verify -> review -> capture reusable learning.",
        "Quality loop: tests, linting, code review, and explicit acceptance criteria on every meaningful change.",
        "Control loop: risk framing, verification evidence, and documented human decisions for high-impact work."
      ],
      toolStrategy: [
        "Primary implementation lane: Cursor/Codex for repo-aware execution and edits.",
        "Second-pass lane: cross-model review for assumptions, missing edge cases, and risk checks.",
        "Evidence lane: maintain markdown artifacts for specs, reviews, postmortems, and reusable playbooks."
      ],
      weeklyRhythm: [
        "Plan work with explicit acceptance criteria before implementation.",
        "Ship one high-quality, verified artifact each week with evidence attached.",
        "Run a weekly review to identify failures, bottlenecks, and required process upgrades.",
        "Update templates/checklists so each week compounds prior learning."
      ],
      guardrails: [
        "Never trust fluent output without verification.",
        "Use least-privilege behavior and treat untrusted content as potentially adversarial.",
        "For sensitive or high-impact actions, require human approval and recorded rationale.",
        "Prefer small, reversible changes with measurable outcomes."
      ],
      nearTermOutcomes: [
        "One hardened weekly execution pattern you can run without drift.",
        "A validated set of templates and checklists for future work.",
        "At least one high-quality decision artifact and one implementation-quality artifact.",
        "Clear proof of improvement in delivery reliability and review quality."
      ]
    };
  }

  if (name === "Career Quest: Holly Case Management") {
    return {
      whyThisExists:
        "This project is Holly's education-plus-AI case management operating system. It exists to move from generic chatbot usage to ethical, verified, human-first AI-assisted case support.",
      primaryGoal:
        "Build a practical pathway into sustainable case management while using AI as a bounded co-pilot for documentation, planning, and resource navigation.",
      operatingSystem: [
        "Education lane: choose and validate one realistic case-management entry path.",
        "Workflow lane: build repeatable AI-assisted workflows for notes, emails, and plans.",
        "Verification lane: enforce cross-checking before using any external detail."
      ],
      toolStrategy: [
        "Use AI for intake summaries, follow-up planning, and client-resource organization.",
        "Use AI to draft clear communication and easy-read explanations.",
        "Use at least one second source/model before trusting outputs.",
        "Confirm policy/program details against official sources before action."
      ],
      weeklyRhythm: [
        "Week plan starts with one lane-specific objective and one deliverable.",
        "Run one note-to-summary workflow and one research-and-verify workflow each week.",
        "Capture reusable templates for case summaries, emails, and resource plans.",
        "End each week with reflection on what reduced admin load while keeping human quality high."
      ],
      guardrails: [
        "AI supports human care; it does not replace the relationship.",
        "Do not trust first answer fluency; verify details before use.",
        "Stay in practical, bounded, ethically sound use cases.",
        "Protect client trust, clarity, and emotional sustainability."
      ],
      nearTermOutcomes: [
        "Complete a clear lane decision and entry-path research summary.",
        "Build a starter toolkit for documentation and resource workflows.",
        "Produce one sample ethical case-support portfolio packet.",
        "Demonstrate disciplined verification habits in every workflow."
      ]
    };
  }

  return {
    whyThisExists:
      `${name} exists to deliver measurable outcomes through a disciplined weekly execution system with clear context for both humans and LLM copilots.`,
    primaryGoal:
      `Build a reliable, evidence-backed project operating rhythm for ${name}.`,
    operatingSystem: [
      "Define a weekly objective, why, and concrete outcome before starting work.",
      "Execute with small, verifiable deliverables rather than broad vague goals.",
      "Capture decisions, learnings, and reusable assets at the end of each week."
    ],
    toolStrategy: [
      "Use AI tools to accelerate drafting, analysis, and implementation.",
      "Verify critical outputs using tests, references, and second-pass review.",
      "Prefer reusable templates and checklists over ad-hoc prompting."
    ],
    weeklyRhythm: [
      "Start the week with scope and definition of done.",
      "Ship one main deliverable with verification evidence.",
      "End the week with reflection and next-week transition notes."
    ],
    guardrails: [
      "Do not ship unverified AI output.",
      "Use least privilege for tools and sensitive operations.",
      "Maintain clear ownership and human accountability."
    ],
    nearTermOutcomes: [
      "A repeatable weekly workflow with measurable progress.",
      "A small library of reusable project templates.",
      "Clear evidence of delivery and quality improvements."
    ]
  };
}

function createProject(name: string): ProjectData {
  return createProjectWithWeeks(name, 52);
}

function createProjectWithWeeks(name: string, weeks: number): ProjectData {
  const now = new Date().toISOString();
  const totalWeeks = Math.max(1, Math.min(104, Math.floor(weeks)));
  const plan = createDefaultPlan(totalWeeks);
  return {
    id: randomUUID(),
    name,
    targetOutcome: createDefaultTargetOutcome(name, totalWeeks),
    plan,
    roadmap: createDefaultRoadmap(totalWeeks),
    notes: createEmptyNotes(),
    context: createDefaultContext(name),
    createdAt: now,
    updatedAt: now
  };
}

function normalizeProject(project: ProjectData): ProjectData {
  const inferredWeeks = Math.max(1, project.plan?.length || 52);
  const normalizedPlan = (project.plan && project.plan.length ? project.plan : createDefaultPlan(inferredWeeks)).map((week) => ({
    ...week,
    deliverables: Array.isArray(week.deliverables) ? week.deliverables : [],
    tasks: Array.isArray(week.tasks)
      ? week.tasks.map((task) => ({
          ...task,
          done: Boolean(task.done)
        }))
      : []
  }));
  return {
    ...project,
    targetOutcome: project.targetOutcome || createDefaultTargetOutcome(project.name, inferredWeeks),
    plan: normalizedPlan,
    roadmap: Array.isArray(project.roadmap) && project.roadmap.length ? project.roadmap : createDefaultRoadmap(inferredWeeks),
    notes: project.notes || createEmptyNotes(),
    context: project.context || createDefaultContext(project.name),
    createdAt: project.createdAt || new Date().toISOString(),
    updatedAt: project.updatedAt || new Date().toISOString()
  };
}

function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_FILE);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      data TEXT NOT NULL
    );
  `);

  bootstrapDatabase(db);
  dbInstance = db;
  return db;
}

function bootstrapDatabase(db: Database.Database): void {
  const row = db.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number };
  if (row.count > 0) return;

  if (migrateLegacyJsonStore(db)) return;

  const initialProject = createProject(DEFAULT_PROJECT_NAME);
  persistProject(db, initialProject);
}

function migrateLegacyJsonStore(db: Database.Database): boolean {
  if (!existsSync(LEGACY_DATA_FILE)) return false;

  try {
    const raw = readFileSync(LEGACY_DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    const projects = (parsed.projects || []).map(normalizeProject);
    if (!projects.length) return false;

    const tx = db.transaction((items: ProjectData[]) => {
      for (const project of items) {
        persistProject(db, project);
      }
    });
    tx(projects);
    return true;
  } catch {
    return false;
  }
}

function persistProject(db: Database.Database, project: ProjectData): void {
  const normalized = normalizeProject(project);
  db.prepare(`
    INSERT INTO projects (id, name, created_at, updated_at, data)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      created_at = excluded.created_at,
      updated_at = excluded.updated_at,
      data = excluded.data
  `).run(
    normalized.id,
    normalized.name,
    normalized.createdAt,
    normalized.updatedAt,
    JSON.stringify(normalized)
  );
}

function hydrateProjectFromRow(row: { data: string } | undefined): ProjectData | null {
  if (!row) return null;
  const parsed = JSON.parse(row.data) as ProjectData;
  return normalizeProject(parsed);
}

export async function listProjects(): Promise<Array<Pick<ProjectData, "id" | "name" | "createdAt" | "updatedAt">>> {
  const db = getDb();
  const rows = db
    .prepare("SELECT id, name, created_at AS createdAt, updated_at AS updatedAt FROM projects ORDER BY created_at ASC")
    .all() as Array<{ id: string; name: string; createdAt: string; updatedAt: string }>;
  return rows;
}

export async function getProject(projectId: string): Promise<ProjectData | null> {
  const db = getDb();
  const row = db.prepare("SELECT data FROM projects WHERE id = ?").get(projectId) as { data: string } | undefined;
  return hydrateProjectFromRow(row);
}

export async function createNewProject(name: string, weeks: number = 52): Promise<ProjectData> {
  const db = getDb();
  const project = createProjectWithWeeks(name, weeks);
  persistProject(db, project);
  return project;
}

export async function updateProject(
  projectId: string,
  updater: (project: ProjectData) => ProjectData
): Promise<ProjectData | null> {
  const db = getDb();
  const existing = await getProject(projectId);
  if (!existing) return null;

  const updatedProject = normalizeProject(updater(existing));
  updatedProject.id = existing.id;
  updatedProject.createdAt = existing.createdAt;
  updatedProject.updatedAt = new Date().toISOString();
  persistProject(db, updatedProject);
  return updatedProject;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const db = getDb();
  const tx = db.transaction((id: string) => {
    const deletion = db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    if (deletion.changes === 0) return false;

    const remaining = db.prepare("SELECT COUNT(*) AS count FROM projects").get() as { count: number };
    if (remaining.count === 0) {
      const fallback = createProject(DEFAULT_PROJECT_NAME);
      persistProject(db, fallback);
    }
    return true;
  });
  return tx(projectId);
}
