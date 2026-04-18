import { randomUUID } from "crypto";
import { promises as fs } from "fs";
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
const DATA_FILE = path.join(DATA_DIR, "projects.json");
const DEFAULT_PROJECT_NAME = "Career Quest: Dave AI Governance";

function createDefaultTargetOutcome(name: string, totalWeeks: number): string {
  return `By week ${totalWeeks}, ${name} has delivered durable outcomes with clear evidence of progress, reusable workflows, and measurable impact.`;
}

function createDefaultContext(name: string): ProjectContext {
  if (name === "Career Quest: Dave AI Governance") {
    return {
      whyThisExists:
        "This project is a personal AI governance operating system that turns learning into visible career proof and resume-ready evidence. It exists to make weekly work repeatable, measurable, and portfolio-generating instead of scattered across chats and temporary notes.",
      primaryGoal:
        "Build a 12-month governance workbench that leverages current work strengths, produces resume artifacts, supports a lower-stress trajectory, and transitions into resilient AI governance roles.",
      operatingSystem: [
        "Production lane: directly leverage current strengths in evals, user-facing chat apps, and governance committee participation.",
        "Learning lane: train continuously on prompting, orchestration, model evaluation, and automation.",
        "Career-proof lane: ship one governance artifact each month for interview and resume-quality evidence.",
        "Store reusable prompts, templates, checklists, and outputs in the AI-Lab file system."
      ],
      toolStrategy: [
        "Use personal Claude for personal learning, planning, and governance writing.",
        "Use Claude Code for repo-aware implementation and terminal-heavy execution.",
        "Use Gemini as second-pass review and adversarial comparison.",
        "Use one lightweight workflow stack first; avoid over-buying tooling."
      ],
      weeklyRhythm: [
        "Monday: refine one real workflow used at work.",
        "Tuesday: learn one orchestration/tooling concept.",
        "Wednesday: compare outputs across 2-3 models on one task.",
        "Thursday: build or revise one governance artifact.",
        "Friday: write portfolio note with lessons, automation wins, and risks learned."
      ],
      guardrails: [
        "Agentic engineering over vibe coding: plan -> spec -> implement -> verify -> review.",
        "Never trust one polished answer; cross-check against another model or source.",
        "Keep personal practice separate from work spend and work repos.",
        "AI is a tool, not authority; accountability and human oversight are mandatory."
      ],
      nearTermOutcomes: [
        "Become AI-native with disciplined prompt/system instruction habits while leveraging real job projects.",
        "Build reusable workflow templates and automation helpers.",
        "Ship governance artifacts: risk register, eval rubric, incident workflow, policy memo, and resume-ready outcome summaries.",
        "Grow role-ready evidence for governance/evals/oversight opportunities with a sustainable workload profile."
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
      "This project is Akira's four-pillar AI curriculum with an animal mission and strong human values. It exists to build real tool fluency, technical intuition, skepticism, and healthy human-centered use of AI.",
    primaryGoal:
      "Develop Akira's Wild AI Ranger Academy: Use AI. Help Animals. Stay Human.",
    operatingSystem: [
      "Pillar 1 - AI Explorer: questioning, prompting, research, and creative AI usage.",
      "Pillar 2 - Builder Brain: coding logic, data basics, and how systems work.",
      "Pillar 3 - Truth Detective: verification, anti-gullibility, and source checking.",
      "Pillar 4 - Human Heart: real people/animals first, AI as a tool not companion."
    ],
    toolStrategy: [
      "Use multiple AI tools to compare answers and teach critical thinking.",
      "Build age-appropriate mini projects around animals and habitat support.",
      "Introduce simple automation and project-based learning over time.",
      "Use AI to enhance creativity without replacing real-world connection."
    ],
    weeklyRhythm: [
      "One exploration session: ask and refine better questions.",
      "One building session: create or code something simple.",
      "One truth session: compare answers and verify what is real.",
      "One human session: apply learning to animals, nature, or community."
    ],
    guardrails: [
      "Smooth confidence is not the same as truth.",
      "AI is a tool, not a best friend.",
      "Verify high-impact claims with trusted sources.",
      "Protect attention, curiosity, compassion, and real-world relationships."
    ],
    nearTermOutcomes: [
      "Establish clear four-pillar curriculum checkpoints.",
      "Create first set of animal-centered AI projects.",
      "Build strong verification habits early.",
      "Keep learning exciting, ethical, and grounded in human values."
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

async function ensureStoreFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    const initialStore: StoreData = {
      projects: [createProject(DEFAULT_PROJECT_NAME)]
    };
    await fs.writeFile(DATA_FILE, JSON.stringify(initialStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<StoreData> {
  await ensureStoreFile();
  const raw = await fs.readFile(DATA_FILE, "utf8");
  const parsed = JSON.parse(raw) as StoreData;
  return {
    projects: (parsed.projects || []).map(normalizeProject)
  };
}

async function writeStore(data: StoreData): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function listProjects(): Promise<Array<Pick<ProjectData, "id" | "name" | "createdAt" | "updatedAt">>> {
  const store = await readStore();
  return store.projects.map((project) => ({
    id: project.id,
    name: project.name,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  }));
}

export async function getProject(projectId: string): Promise<ProjectData | null> {
  const store = await readStore();
  return store.projects.find((project) => project.id === projectId) ?? null;
}

export async function createNewProject(name: string, weeks: number = 52): Promise<ProjectData> {
  const store = await readStore();
  const project = createProjectWithWeeks(name, weeks);
  store.projects.push(project);
  await writeStore(store);
  return project;
}

export async function updateProject(
  projectId: string,
  updater: (project: ProjectData) => ProjectData
): Promise<ProjectData | null> {
  const store = await readStore();
  const index = store.projects.findIndex((project) => project.id === projectId);
  if (index === -1) return null;

  const updatedProject = updater(store.projects[index]);
  updatedProject.updatedAt = new Date().toISOString();
  store.projects[index] = updatedProject;
  await writeStore(store);
  return updatedProject;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  const store = await readStore();
  const existingLength = store.projects.length;
  store.projects = store.projects.filter((project) => project.id !== projectId);
  if (store.projects.length === existingLength) return false;
  if (!store.projects.length) {
    store.projects = [createProject(DEFAULT_PROJECT_NAME)];
  }
  await writeStore(store);
  return true;
}
