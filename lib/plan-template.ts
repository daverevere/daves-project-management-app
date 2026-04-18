export type WeekTask = {
  id: string;
  title: string;
  why: string;
  outcome: string;
  done: boolean;
  userCreated?: boolean;
};

export type WeekPlan = {
  week: number;
  title: string;
  objective: string;
  whyThisWeek: string;
  developmentOutcome: string;
  deliverables: string[];
  tasks: WeekTask[];
};

export type MonthRoadmap = {
  month: number;
  title: string;
  objective: string;
  why: string;
  outcome: string;
  deliverables: string[];
};

export type NotesMap = Record<number, string>;

export type RoadmapPhase = {
  id: string;
  title: string;
  startWeek: number;
  endWeek: number;
  objective: string;
  why: string;
  outcome: string;
  deliverables: string[];
};

function makeWeek(
  week: number,
  title: string,
  objective: string,
  whyThisWeek: string,
  developmentOutcome: string,
  deliverables: string[],
  tasks: Array<{ id: string; title: string; why: string; outcome: string }>
): WeekPlan {
  return {
    week,
    title,
    objective,
    whyThisWeek,
    developmentOutcome,
    deliverables,
    tasks: tasks.map((task) => ({ ...task, done: false }))
  };
}

const Q1_WEEKS: WeekPlan[] = [
  makeWeek(
    1,
    "Build the foundation",
    "Set up your personal AI-Lab and establish tool boundaries.",
    "You need a clean, personal system outside work so learning and portfolio-building do not live in chats, tmp folders, or company spend.",
    "You understand where your work lives, how tools are separated, and how your system will be extended.",
    ["AI-Lab folder tree created", "Cursor switched to personal account", "README explaining your system"],
    [
      { id: "w1t1", title: "Unlink Cursor from your work account and sign in with your personal account", why: "Your learning and governance portfolio need to live in a personal environment you control.", outcome: "Clear separation between company work and personal career system." },
      { id: "w1t2", title: "Create the AI-Lab folder tree on your machine", why: "A file-based system gives you stable storage for workflows, notes, templates, and artifacts.", outcome: "You know where every future note, template, and artifact belongs." },
      { id: "w1t3", title: "Create a top-level README that explains the purpose of each folder", why: "A good system is understandable at a glance and maintainable by Cursor later.", outcome: "A documented structure that can be extended without guesswork." },
      { id: "w1t4", title: "Write your 12-month target outcome in one paragraph", why: "Tasks make more sense when tied to an explicit target state.", outcome: "A clear north star for the whole system." }
    ]
  ),
  makeWeek(
    2,
    "Install the workflow pattern",
    "Create the markdown-first workflow templates and run your first disciplined AI cycle.",
    "The goal is not just doing tasks. It is learning the pattern: spec -> implement -> verify -> review.",
    "You understand the difference between agentic engineering and random tool use.",
    ["Spec template", "Review template", "Governance memo template", "One finished workflow example"],
    [
      { id: "w2t1", title: "Create spec_template.md", why: "You need to define goals, constraints, risks, and done criteria before using AI seriously.", outcome: "You can start any serious task with structure." },
      { id: "w2t2", title: "Create review_template.md", why: "You need a repeatable way to verify output instead of trusting fluency.", outcome: "You have a checklist for validation and second-pass review." },
      { id: "w2t3", title: "Create governance_memo_template.md", why: "Your future pivot depends on artifacts that demonstrate governance thinking, not just code generation.", outcome: "A reusable starting point for portfolio memos." },
      { id: "w2t4", title: "Run one full workflow using Cursor/Claude and Gemini on the same task", why: "Comparing models teaches judgment and exposes blind spots early.", outcome: "One saved example of spec -> implementation -> review." }
    ]
  ),
  makeWeek(3, "Extract your trainings", "Turn your SonderMind training notes into reusable principles and templates.", "You already have material. This week converts passive notes into active system parts.", "You begin transforming existing knowledge into leverage.", ["One distilled learning note", "One checklist", "One principles file"], [
    { id: "w3t1", title: "Move your training notes into 01_learning", why: "Important learning should live in your system, not a temporary folder.", outcome: "Training material becomes part of your long-term knowledge base." },
    { id: "w3t2", title: "Extract 5 principles from the agentic engineering training", why: "Principles guide future judgment better than raw transcripts.", outcome: "A short principles file you can review weekly." },
    { id: "w3t3", title: "Create one reusable checklist from the training", why: "Checklists reduce cognitive load and make good habits repeatable.", outcome: "A practical tool you can use immediately." }
  ]),
  makeWeek(4, "Model comparison discipline", "Build a reliable process for cross-model review.", "You want to learn to use AI like a pro, and pros do not trust one answer path.", "You learn when Claude is enough, when Gemini adds value, and how to compare outputs.", ["Prompt comparison log", "Review notes on differences"], [
    { id: "w4t1", title: "Create a prompt_comparison_template.md", why: "You need a standard way to compare outputs rather than relying on vague impressions.", outcome: "A reproducible comparison process." },
    { id: "w4t2", title: "Compare Claude and Gemini on one governance question", why: "This creates direct experience with strengths, weaknesses, and review habits.", outcome: "A saved comparison with your conclusions." }
  ]),
  makeWeek(5, "Governance artifact #1", "Write your first portfolio-quality governance artifact.", "Your pivot will come from proof, not aspiration.", "You have your first credible artifact for future job conversations.", ["One portfolio memo"], [
    { id: "w5t1", title: "Write a memo on human-in-the-loop requirements for sensitive AI systems", why: "This shows judgment, risk awareness, and product reasoning.", outcome: "A publishable portfolio artifact." }
  ]),
  makeWeek(6, "Workflow automation starter", "Automate one small repeatable task on your machine.", "Career leverage grows when you build systems, not just documents.", "You prove you can connect AI to real workflow improvement.", ["One working local automation"], [
    { id: "w6t1", title: "Pick one tiny workflow to automate", why: "Small wins build confidence without creating tool chaos.", outcome: "A repeatable automation target." },
    { id: "w6t2", title: "Implement and document the automation", why: "The value is not only the script. It is the repeatable pattern.", outcome: "One working tool plus documentation." }
  ]),
  makeWeek(7, "Governance artifact #2", "Create a risk register for an AI product you understand well.", "Risk registers translate engineering knowledge into governance language.", "You practice speaking across technical and governance boundaries.", ["One risk register artifact"], [
    { id: "w7t1", title: "Create a risk register for an AI product you understand well", why: "This builds directly from your domain experience.", outcome: "A strong domain-relevant governance artifact." }
  ]),
  makeWeek(8, "Job market mapping", "Translate your developing system into target roles and hiring language.", "You need to know what roles your new artifacts support.", "You can name 10 realistic role targets and the evidence each one needs.", ["Target role list", "Gap analysis"], [
    { id: "w8t1", title: "Identify 10 target AI governance / eval / oversight roles", why: "A pivot needs targets, not just self-improvement.", outcome: "A role map grounded in actual job types." },
    { id: "w8t2", title: "Map each role to missing skills or missing evidence", why: "This turns vague ambition into measurable preparation.", outcome: "A gap analysis you can act on." }
  ]),
  makeWeek(9, "Governance artifact #3", "Build an evaluation rubric or oversight checklist.", "You want artifacts that look like the work of the role you want.", "You strengthen your portfolio with practical governance documentation.", ["One evaluation rubric"], [
    { id: "w9t1", title: "Create an AI oversight rubric for a system with meaningful human impact", why: "Rubrics show your ability to operationalize judgment.", outcome: "A concrete governance artifact." }
  ]),
  makeWeek(10, "Career narrative", "Rewrite your resume story around governance, evaluation, and oversight.", "A pivot succeeds when the story is legible to other people.", "You can explain why your background qualifies you for governance roles.", ["Career narrative draft", "Resume bullets draft"], [
    { id: "w10t1", title: "Write a pivot narrative: engineer -> governance/evals/oversight", why: "Hiring managers need to understand the bridge.", outcome: "A concise story you can reuse in applications and conversations." },
    { id: "w10t2", title: "Draft 6 governance-oriented resume bullets from your existing work", why: "You need evidence phrased in the language of the new target.", outcome: "A starting point for resume revision." }
  ]),
  makeWeek(11, "Governance artifact #4", "Create one incident response or escalation framework.", "Governance work is not only policy. It is operational response.", "You add a process-oriented artifact to your portfolio.", ["One incident response framework"], [
    { id: "w11t1", title: "Design an escalation workflow for unsafe AI behavior", why: "This demonstrates practical thinking about real-world oversight.", outcome: "A process artifact useful in interviews or portfolio review." }
  ]),
  makeWeek(12, "Quarter review and reset", "Review the first quarter, refine the system, and set the next 3-month block.", "A sustainable system improves itself instead of becoming stale.", "You know what is actually working and what should change.", ["Quarter review", "Next-quarter priorities"], [
    { id: "w12t1", title: "Review all completed work and note what created real leverage", why: "You need evidence about what is actually helping your pivot.", outcome: "A practical review, not just a feeling." },
    { id: "w12t2", title: "Set the next 12 weeks based on role gaps and strongest progress", why: "The system should evolve from evidence, not random inspiration.", outcome: "A focused next-quarter roadmap." }
  ])
];

function generateAdditionalWeeks(startWeek: number, totalWeeks: number): WeekPlan[] {
  const plans: WeekPlan[] = [];
  const cycleTitles = [
    "Scope and plan",
    "Build and execute",
    "Refine and verify",
    "Package and review"
  ];

  for (let week = startWeek; week <= totalWeeks; week += 1) {
    const index = (week - startWeek) % 4;
    const cycleNumber = Math.floor((week - startWeek) / 4) + 1;
    const title = `Cycle ${cycleNumber} / ${cycleTitles[index]}`;
    const weeklyObjectives = [
      "Scope this cycle precisely and choose one concrete, high-leverage deliverable.",
      "Do the main implementation work for this cycle.",
      "Review, refine, and improve quality before finalizing.",
      "Package the month's work, summarize lessons learned, and prepare the next cycle."
    ];
    const weeklyOutcomes = [
      "You have a concrete scoped plan and clear definition of done.",
      "You have real, visible work in progress instead of only planning.",
      "You have stronger, more polished output with fewer weak spots.",
      "You have a finished package and a clean transition into the next cycle."
    ];
    const weeklyTasks = [
      [
        {
          title: `Define the exact scope for cycle ${cycleNumber}`,
          why: "Each cycle needs a manageable scope so the work does not stay abstract.",
          outcome: "A precise weekly target connected to a meaningful objective."
        },
        {
          title: "Choose the one deliverable that matters most first",
          why: "A focused system makes better progress than a scattered one.",
          outcome: "A highest-value deliverable selected for the week."
        }
      ],
      [
        {
          title: `Do the main build work for cycle ${cycleNumber}`,
          why: "Career momentum comes from making real things, not just organizing systems.",
          outcome: "A substantial portion of the cycle deliverable exists."
        },
        {
          title: "Capture one reusable workflow or note from the work",
          why: "Each cycle should compound your system, not just produce output.",
          outcome: "One reusable asset added to your AI-Lab."
        }
      ],
      [
        {
          title: "Review and refine the cycle's work",
          why: "The difference between rough work and portfolio-quality work is refinement and verification.",
          outcome: "A sharper, cleaner, more credible deliverable."
        },
        {
          title: "Run second-pass review using another model or your own checklist",
          why: "Cross-checking improves judgment and catches blind spots.",
          outcome: "One reviewed and improved artifact."
        }
      ],
      [
        {
          title: "Package and summarize the cycle's work",
          why: "Packaging makes work visible and easier to use later.",
          outcome: "A finished cycle package with notes and outputs."
        },
        {
          title: "Write the transition note into next month",
          why: "A year-long system needs continuity between cycles.",
          outcome: "The next month begins with clarity instead of re-orientation."
        }
      ]
    ];

    plans.push({
      week,
      title,
      objective: weeklyObjectives[index],
      whyThisWeek: "This week exists to create compounding progress in a repeatable and maintainable way.",
      developmentOutcome: weeklyOutcomes[index],
      deliverables: [
        "One concrete deliverable",
        "One quality check or review artifact",
        "One transition note for the next cycle"
      ],
      tasks: weeklyTasks[index].map((task, taskIndex) => ({
        id: `w${week}t${taskIndex + 1}`,
        title: task.title,
        why: task.why,
        outcome: task.outcome,
        done: false
      }))
    });
  }

  return plans;
}

function cloneWeekPlan(week: WeekPlan): WeekPlan {
  return {
    ...week,
    deliverables: [...week.deliverables],
    tasks: week.tasks.map((task) => ({ ...task }))
  };
}

export function createDefaultPlan(totalWeeks: number = 52): WeekPlan[] {
  const safeWeeks = Math.max(1, Math.min(104, Math.floor(totalWeeks)));
  const q1Slice = Q1_WEEKS.slice(0, Math.min(safeWeeks, Q1_WEEKS.length));
  const additional = safeWeeks > q1Slice.length ? generateAdditionalWeeks(q1Slice.length + 1, safeWeeks) : [];
  const basePlan = [...q1Slice, ...additional];
  return basePlan.map(cloneWeekPlan);
}

export function createEmptyNotes(): NotesMap {
  return {};
}

export function createDefaultRoadmap(totalWeeks: number): RoadmapPhase[] {
  const safeWeeks = Math.max(1, Math.floor(totalWeeks));
  const phaseCount = safeWeeks <= 8 ? safeWeeks : safeWeeks <= 24 ? 4 : 6;
  const phases: RoadmapPhase[] = [];
  const basePhaseSize = Math.floor(safeWeeks / phaseCount);
  let remainder = safeWeeks % phaseCount;
  let cursor = 1;

  for (let index = 0; index < phaseCount; index += 1) {
    const extra = remainder > 0 ? 1 : 0;
    const span = basePhaseSize + extra;
    remainder -= extra;
    const startWeek = cursor;
    const endWeek = cursor + span - 1;
    phases.push({
      id: `phase-${index + 1}`,
      title: `Phase ${index + 1}`,
      startWeek,
      endWeek,
      objective: `Complete the highest-leverage outcomes for weeks ${startWeek}-${endWeek}.`,
      why: "Chunking work into bounded phases keeps scope realistic and progress measurable.",
      outcome: "You complete a coherent set of deliverables and carry forward reusable lessons.",
      deliverables: [
        "Primary deliverable for this phase",
        "Verification evidence (tests/review/checklist)",
        "Transition note for the next phase"
      ]
    });
    cursor = endWeek + 1;
  }

  return phases;
}

