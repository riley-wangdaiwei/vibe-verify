"use strict";
/* vibe & verify — a working set, not an archive. ✕ = gone forever. */

const LS_KEY = "vibe-verify-v1";

/* Seed updates: bump SEED_VERSION whenever SEED content changes. On load,
   migrateSeeds() replaces example cards that still exist with the new seed
   content (same id), and adds brand-new seed ids on top. It never resurrects
   cards the user deleted, and never touches user-added cards. New seed
   modules arrive only when Mu adds them for one of her tasks — never bulk. */
const SEED_VERSION = 3;

/* ---------------- seed data (tagged EXAMPLE, deletable) ---------------- */

const SEED = {
seedVersion: SEED_VERSION,
sessions: [
{
  id: "s4", isExample: true, track: "both", project: "Gambia Evidence Gap Explorer",
  sessionDate: "2026-10-22", status: "completed",
  title: "EvidenceTensor: one source of truth, two projections",
  objective: "Understand how the Evidence Gap Explorer keeps its two maps honest: one shared tensor, two projections (Missing Evidence + Proxy Alignment).",
  filesChanged: "src/evidence_gap/tensor.py — EvidenceTensor dataclass (records list) + project_gap() / project_proxy() + from_database() SQL JOIN; tests/test_tensor_projections.py — one test pinning that both projections share source_id.",
  whyChosen: "Both views derive from the same records list instead of each keeping a copy. If either view built its own matrix, the two maps could disagree — which is exactly the §14 failure: View A stayed an unsearched matrix while View B showed stored alignments.",
  decisions: "Tensor is a plain dataclass over a list of dicts, not a numpy array: no numeric tensor math exists yet, so a thin wrapper avoids a dependency and keeps the 'tensor' concept (target × population × source) without pretending to compute. Defaults are honest states (NOT_SEARCHED_OR_UNKNOWN, UNKNOWN_REQUIRES_REVIEW) rather than nulls. The synthetic flag is carried through both projections so demo data can never pass as real.",
  tests: "Read test_tensor_projections.py: one test asserts both projections return the same source_id for the same record. Not run here (pytest/Streamlit env unverified on her machine) — and even passing would not prove the app correct, because View A must actually call this code, and §14 says it doesn't yet.",
  concepts: "View as a function of data — derive, don't duplicate",
  principles: "C · H"
},
{
  id: "s1", isExample: true, track: "startup", project: "KIN website",
  sessionDate: "2026-10-19", status: "verified",
  title: "EditorialPage: fixed vs scroll background behavior",
  objective: "Let editorial pages choose whether the hero image stays fixed while text scrolls over it, or scrolls with the page.",
  filesChanged: "src/components EditorialPage — added a `backgroundBehavior` prop ('fixed' | 'scroll') and branched the background layer's positioning on it.",
  whyChosen: "A prop with two literal variants keeps the choice explicit at each call site and lets the compiler reject any third, meaningless value — better than a boolean whose meaning you have to remember.",
  decisions: "Modeled the two variants as a discriminated union so a future variant (e.g. parallax with a speed) can carry its own fields. Kept the default 'scroll' so existing pages render unchanged.",
  tests: "Typecheck and production build passed. Visually checked both variants on an existing page: fixed holds the image while copy scrolls; scroll moves together. No other pages changed appearance.",
  concepts: "Discriminated unions & narrowing",
  principles: "B · D"
},
{
  id: "s2", isExample: true, track: "startup", project: "KIN website",
  sessionDate: "2026-10-18", status: "completed",
  title: "Order email that degrades gracefully without a custom domain",
  objective: "Make sure the order flow never hard-fails for a visitor just because order-confirmation email isn't configured yet.",
  filesChanged: "Order API route — wrapped the mail send in error handling so a mail failure logs and returns a successful order response instead of a 503.",
  whyChosen: "The order itself is the critical action; the email is a notification. Coupling them means an email outage silently loses real orders.",
  decisions: "Chose graceful degradation over retry logic for now: simpler, and the resend-order-email feature is parked until the custom domain exists. Trade-off accepted: a confirmation email can be missed, an order cannot.",
  tests: "Submitted a test order with mail unconfigured: order saved, response 200, failure visible in server logs. Verified the happy path still sends when configured.",
  concepts: "async / await & Promise error handling",
  principles: "C · E"
},
{
  id: "s3", isExample: true, track: "research", project: "Privacy research (ECON 499)",
  sessionDate: "2026-10-17", status: "attempted",
  title: "Consent-partner counts: summarizing the GDPR dataset by country",
  objective: "Produce a per-country summary of tracking-partner counts from the cookie-consent dataset for the thesis draft.",
  filesChanged: "analysis/summarize_consent.py — loaded the CSV with pandas, grouped by country, aggregated mean/median/count of partners, exported a summary table.",
  whyChosen: "groupby + agg expresses 'per-country statistics' directly and keeps the transformation in a few auditable lines instead of a hand-written loop.",
  decisions: "Reported count alongside mean and median after noticing countries differ hugely in sample size — a mean over 12 sites and a mean over 900 sites are not equally trustworthy.",
  tests: "Hand-checked two countries against a spreadsheet pivot: medians matched. Counts did NOT match at first — traced to duplicate rows from a re-scraped site batch; deduplication still open, so results are marked attempted, not verified.",
  concepts: "pandas groupby: split–apply–combine",
  principles: "C · H"
}
],
concepts: [
{
  id: "c9", isExample: true, track: "both", language: "Python",
  title: "View as a function of data — derive, don't duplicate",
  sharedConcept: "Single source of truth — one canonical dataset, every display derived from it.",
  codeExample: `from dataclasses import dataclass

@dataclass
class EvidenceTensor:
    records: list

    def project_gap(self):
        return [{"target": r.get("target_name", "unknown"),
                 "state": r.get("gap_state", "NOT_SEARCHED_OR_UNKNOWN"),
                 "synthetic": r.get("synthetic", False)}
                for r in self.records]

    def project_proxy(self):
        return [{"target": r.get("target_name", "unknown"),
                 "observed": r.get("observed_name", "unknown"),
                 "relation_class": r.get("relation_class", "UNKNOWN_REQUIRES_REVIEW"),
                 "synthetic": r.get("synthetic", False)}
                for r in self.records]`,
  explanation: "Both methods read the same self.records and return different slices of it. A 'view' here is just a function: same input, deterministic output. Nothing is stored twice, so nothing can drift apart. The @dataclass adds nothing but a container — the design lives in the decision that there is exactly one records list.",
  whyUse: "Whenever two screens, reports, or exports must agree: dashboards, maps, tables, exports. Derive each display from the canonical data at render time instead of syncing copies.",
  mistake: "Letting each view query or build its own copy 'for performance' or convenience. Copies drift the moment one path changes — the Evidence Gap §14 bug is the textbook case: View A built its own unsearched matrix while View B read stored alignments, so the two maps told different stories and a passing unit test didn't catch it.",
  connection: "Software construction (single source of truth, modularity) meets research validity (a gap map is only honest if every view reflects the same approval state). In pandas terms: keep one DataFrame and derive groupby views from it, never maintain two DataFrames by hand."
},
{
  id: "c1", isExample: true, track: "startup", language: "TypeScript",
  title: "Discriminated unions & narrowing",
  sharedConcept: "Data modeling — representing variants explicitly instead of with loose optional fields.",
  codeExample: `type Bg =
  | { behavior: "fixed"; image: string }
  | { behavior: "scroll"; image: string; speed: number };

function render(bg: Bg) {
  if (bg.behavior === "scroll") {
    return bg.speed; // OK: narrowed to the scroll variant
  }
  return 0;
}`,
  explanation: "A union type like `fixed | scroll` lets one value be several shapes. TypeScript 'narrows' the type inside a branch where you've checked a distinguishing field (the discriminant), so properties that only exist on one variant become safe to access there — and a compile error everywhere else.",
  whyUse: "When a component or API genuinely has variant shapes. It makes invalid states unrepresentable: you cannot read `speed` for a fixed background because the type says it isn't there.",
  mistake: "Using optional properties everywhere (`speed?: number`) instead of a union. Then every read needs a runtime check, and 'fixed with a speed set' becomes a state the compiler can't reject.",
  connection: "This is abstraction and system design: the type *is* the interface contract between components. The same idea appears in Python as tagged tuples / dataclass variants."
},
{
  id: "c2", isExample: true, track: "startup", language: "TypeScript",
  title: "async / await & Promise error handling",
  sharedConcept: "Error handling — deciding, at each boundary, what failure means and who deals with it.",
  codeExample: `async function sendOrder(id: string) {
  try {
    const res = await api.createOrder({ id });
    return res.confirmation;
  } catch (err) {
    // Network failure OR server error lands here.
    return null; // degrade gracefully instead of crashing
  }
}`,
  explanation: "`await` pauses an async function until a Promise settles, then gives you the value — or throws the rejection reason, which is why `try/catch` works around it. Code after the `await` only runs on success unless you handle the error.",
  whyUse: "Any I/O: network requests, file reads, database calls. Sequential awaits when steps depend on each other; `Promise.all` when they're independent and can run in parallel.",
  mistake: "Forgetting `await` — you get the Promise object itself, and bugs like `[object Promise]` in the UI or a condition that's always truthy because a pending Promise is an object.",
  connection: "Correctness: an unhandled rejection is a silent failure. In research code the parallel is an unchecked file load in Python — the script 'runs' but analyzes nothing."
},
{
  id: "c3", isExample: true, track: "both", language: "JavaScript",
  title: "map / filter / reduce — transforming collections",
  sharedConcept: "Data transformation pipelines — small, composable steps instead of one big loop.",
  codeExample: `const totals = orders
  .filter((o) => o.status === "paid")
  .map((o) => o.amount)
  .reduce((sum, n) => sum + n, 0);`,
  explanation: "These array methods express three distinct intentions: `map` transforms every item (same length out), `filter` selects a subset, `reduce` folds a list into one value. Naming the intention makes code readable and avoids manual index bookkeeping.",
  whyUse: "Whenever you loop only to build a new list or a single aggregate. The chain reads as a pipeline: select → transform → combine — the same shape as a pandas chain.",
  mistake: "Mutating items inside `map` (e.g. `o.amount *= 2; return o`). It modifies the original objects, so other code holding references sees changed data — a classic source of 'impossible' bugs.",
  connection: "In pandas, `.query(...)` ≈ filter, `.assign(...)` ≈ map, `.agg(...)` ≈ reduce. Learn the pattern once, recognize it in every language."
},
{
  id: "c4", isExample: true, track: "research", language: "Python",
  title: "pandas groupby: split–apply–combine",
  sharedConcept: "Aggregation — the same operation as SQL GROUP BY and a JS reduce-into-object.",
  codeExample: `import pandas as pd

df = pd.read_csv("consent.csv")
summary = (
    df.groupby("country")["partners"]
      .agg(["mean", "median", "count"])
      .reset_index()
)
print(summary)`,
  explanation: "`groupby` splits a DataFrame into groups by a key, applies a function (mean, sum, count…) to each group, and combines the results into a new DataFrame. The result is indexed by the group key — which surprises people the first time they try to plot it.",
  whyUse: "Any 'average X per Y' question in research data. `agg` with a list gives several statistics at once and keeps the computation declarative and checkable.",
  mistake: "Averaging over rows that include missing values or duplicated observations without checking `count` — the mean looks precise while quietly describing a different sample than you think. Always look at `count` alongside the mean.",
  connection: "Research validity: groupby results are only as honest as your understanding of what a row represents. Check row provenance before aggregating, not after."
},
{
  id: "c5", isExample: true, track: "research", language: "Python",
  title: "Vectorization vs loops (NumPy)",
  sharedConcept: "Declarative computation — say *what* over the whole dataset, let the library handle *how*.",
  codeExample: `import numpy as np

x = np.array([1.0, 2.0, 3.0])
# Loop version: slow, verbose
# Vectorized: one expression, whole array
growth = (x - x.mean()) / x.std()
print(growth)`,
  explanation: "A Python loop computes one element at a time in interpreted code. NumPy operations describe the whole array at once and execute in compiled code — typically 10–100× faster, and usually shorter to write. The trade-off: you must think in shapes, and broadcasting rules decide what aligns with what.",
  whyUse: "Numerical work on arrays larger than a few hundred elements, and whenever the operation is elementwise or a standard reduction (mean, std, matmul).",
  mistake: "Broadcasting silently succeeding with the wrong shape — e.g. subtracting a (3,1) column from a (3,) row produces a (3,3) matrix instead of an error. Print `.shape` when a result looks off.",
  connection: "Numerical accuracy and reproducibility: vectorized code is deterministic and easier to verify against a hand-computed small case than a long loop."
},
{
  id: "c6", isExample: true, track: "research", language: "Python",
  title: "Standard errors: what a regression is actually claiming",
  sharedConcept: "Uncertainty quantification — an estimate without a measure of its precision is half a result.",
  codeExample: `import statsmodels.formula.api as smf

model = smf.ols("outcome ~ treatment + controls", data=df)
# Cluster-robust SEs when observations group naturally:
fit = model.fit(cov_type="cluster",
                cov_kwds={"groups": df["country"]})
print(fit.summary())`,
  explanation: "A coefficient is a point estimate; the standard error measures how much that estimate would vary across repeated samples. A 'significant' result means the estimate is large relative to its standard error — under the model's assumptions. If observations aren't independent (e.g. clustered by country or firm), plain standard errors are too small and significance is overstated.",
  whyUse: "Every time you report or read a regression table. The choice of standard error is a modeling decision, not a formatting option.",
  mistake: "Treating p < 0.05 as 'the effect is real and important.' It says nothing about effect size, and it collapses entirely if the independence assumption fails.",
  connection: "Research validity (Principle H): implementation correctness (the code ran, the table printed) is not scientific validity (the assumptions hold for this data)."
},
{
  id: "c7", isExample: true, track: "both", language: "Cross-language",
  title: "Pure functions & side effects",
  sharedConcept: "Functions & modularity — the unit of reasoning in every language in this app.",
  codeExample: `// Impure: depends on and mutates outside state
let total = 0;
function addToTotal(n) { total += n; }

// Pure: output depends only on input — trivially testable
function add(a, b) { return a + b; }`,
  explanation: "A pure function returns the same output for the same input and changes nothing outside itself. Side effects — writing files, mutating shared state, calling APIs — are where bugs hide, because behavior then depends on *when* and *in what order* code runs, not just on its inputs.",
  whyUse: "Structure code so the logic is pure and the effects live at the edges (read input → compute purely → write output). That shape is what makes both unit tests and research replication scripts feasible.",
  mistake: "Hiding a side effect inside something named like a pure computation (`calculateTotal()` that also saves to the database). Readers — including future you — will call it in the wrong place.",
  connection: "Modularity: pure cores with effectful shells is the single most reusable architecture idea across startup code and research pipelines."
},
{
  id: "c8", isExample: true, track: "startup", language: "Git",
  title: "Reading a diff like a reviewer",
  sharedConcept: "Verification — comparing an artifact against its specification, in any medium.",
  codeExample: `# Before accepting any change set:
git diff --stat        # which files, how much churn?
git diff               # read every hunk against the task
# Red flags: unrelated files, renamed variables with
# no functional reason, deleted tests, new dependencies.`,
  explanation: "A diff shows exactly what changed, line by line. Reviewing it — your own or AI-generated — means checking each hunk against the intent: does this line serve the task? Is anything changed that shouldn't be? Are deletions intentional? Small, single-purpose commits make this review possible.",
  whyUse: "Every AI-assisted session. The diff is the contract between 'what was asked' and 'what actually happened' — it's the cheapest verification you have.",
  mistake: "Reviewing only the files you expected to change. Unintended edits hide in the files you *didn't* open. `git diff --stat` first, always.",
  connection: "Independent technical judgment (Principle G): you don't need to have written the code to be responsible for it — the diff review is where that responsibility is exercised."
}
],
resources: [
{ id: "r1", isExample: true, track: "both", kind: "Academic",
  title: "MIT EECS — Undergraduate Curriculum", url: "https://www.eecs.mit.edu/academics/undergraduate-programs/curriculum/",
  topic: "Computer science foundations",
  note: "The full map of what a CS degree covers — use it to spot gaps (systems, algorithms, theory) and pick what to learn next, in order." },
{ id: "r2", isExample: true, track: "startup", kind: "Academic",
  title: "MIT 6.3 — Computer Science & Engineering (Software Construction)", url: "https://www.eecs.mit.edu/academics/undergraduate-programs/curriculum/6-3-computer-science-and-engineering/",
  topic: "Software construction",
  note: "MIT's software-construction path: specifications, testing, abstraction, and code review — the closest formal match to 'how experienced engineers write code that lasts.'" },
{ id: "r3", isExample: true, track: "startup", kind: "Practitioner",
  title: "Anthropic — Effective context engineering for AI agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents",
  topic: "AI systems engineering",
  note: "Read when an agent keeps forgetting things mid-task: give the model the smallest set of high-signal tokens, not more tokens." },
{ id: "r4", isExample: true, track: "research", kind: "Official docs",
  title: "Python Tutorial — Data Structures", url: "https://docs.python.org/3/tutorial/datastructures.html",
  topic: "Python language",
  note: "One chapter, not the whole manual: lists, dicts, sets, comprehensions — read before writing data-processing code." },
{ id: "r5", isExample: true, track: "research", kind: "Official docs",
  title: "10 minutes to pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html",
  topic: "Data analysis in Python",
  note: "Ten minutes through Series / DataFrame basics — enough to start, then stop." },
{ id: "r6", isExample: true, track: "startup", kind: "Official docs",
  title: "TypeScript Handbook — Narrowing", url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
  topic: "TypeScript language",
  note: "Read when a type error confuses you: how typeof / instanceof narrow a type branch by branch." },
{ id: "r7", isExample: true, track: "startup", kind: "Official docs",
  title: "MDN — Closures", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures",
  topic: "JavaScript language",
  note: "Read when a function forgets its outer variables: a closure is a function plus the lexical environment it was born in." },
{ id: "r8", isExample: true, track: "startup", kind: "Official docs",
  title: "Pro Git — Branches in a Nutshell", url: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell",
  topic: "Version control",
  note: "Commits are snapshots, a branch is just a pointer — once that clicks, branching stops being magic." },
{ id: "r9", isExample: true, track: "research", kind: "Official docs",
  title: "NumPy — Absolute beginners", url: "https://numpy.org/doc/stable/user/absolute_beginners.html",
  topic: "Numerical computing in Python",
  note: "Arrays and broadcasting, one tutorial page — understanding broadcasting explains half of all shape errors." },
{ id: "r10", isExample: true, track: "research", kind: "Official docs",
  title: "Stata Documentation", url: "https://www.stata.com/features/documentation/",
  topic: "Stata reference",
  note: "For when research work moves to Stata: command syntax, data management, and estimation references. Bookmark it now; you'll need it the first week a collaborator sends a .do file." }
],
exercises: [
{ id: "e7", isExample: true, track: "research", language: "Python", difficulty: "Core",
  title: "What does project_gap return for an unsearched synthetic record?", conceptTitle: "View as a function of data — derive, don't duplicate",
  problem: "A record has target 'savings', no gap_state, and synthetic=True. The app must show it on the Missing Evidence map without ever letting a reader mistake it for real evidence.",
  task: "Write out exactly what project_gap() returns for this record (all five fields it includes), and in one sentence each say why the state default and the synthetic flag are the responsible choices for a research tool.",
  hints: "Read project_gap field by field. What does .get(key, default) do when the key is absent? Which field is the one that stops demo data from passing as real?",
  solution: `{'target': 'savings', 'population': 'unknown', 'state': 'NOT_SEARCHED_OR_UNKNOWN', 'source_id': None, 'synthetic': True}
# population 'unknown' and source_id None are honest unknowns — invented
# values would be worse. The state default says 'we have not searched this
# yet' instead of implying 'no evidence exists' — absence of search is not
# evidence of absence. synthetic=True rides along so the UI can badge it as
# demo and exclude it from any real-evidence export.` },
{ id: "e1", isExample: true, track: "startup", language: "TypeScript", difficulty: "Core",
  title: "Spot the invalid state", conceptTitle: "Discriminated unions & narrowing",
  problem: "A teammate models a file upload as `{ status: string; progress?: number; error?: string; url?: string }`. Almost every combination of fields is nonsense — e.g. status 'done' with an error and no url.",
  task: "Redesign the type as a discriminated union with variants for uploading, done, and failed, so each variant carries exactly the fields that make sense for it. Write a small function that renders a label for each variant using narrowing.",
  hints: "Give each variant a shared literal field (the discriminant) with a different value. In the render function, switch on that field — TypeScript narrows inside each case.",
  solution: `type Upload =
  | { status: "uploading"; progress: number }
  | { status: "done"; url: string }
  | { status: "failed"; error: string };

function label(u: Upload): string {
  switch (u.status) {
    case "uploading": return \`\${u.progress}% uploaded\`;
    case "done": return u.url;
    case "failed": return \`Failed: \${u.error}\`;
  }
}
// 'done' can no longer have an error field — the type forbids it.` },
{ id: "e2", isExample: true, track: "startup", language: "JavaScript", difficulty: "Starter",
  title: "The missing await", conceptTitle: "async / await & Promise error handling",
  problem: "This code logs `[object Promise]` instead of the user's name, and sometimes logs it after 'done':\n\nasync function showName() {\n  const user = fetchUser(7);\n  console.log(user.name);\n  console.log('done');\n}",
  task: "Explain precisely why it fails, then fix it. Then say: what happens to the 'done' log if fetchUser rejects, and where should the error be handled?",
  hints: "What does an async function return the instant it's called, before it finishes? And what does `await` do to a rejection?",
  solution: `// fetchUser is async, so calling it returns a pending Promise
// immediately — user IS the Promise, and Promise.name is undefined
// (printed via the object). Fix: await it.

async function showName() {
  try {
    const user = await fetchUser(7);
    console.log(user.name);
  } catch (err) {
    console.log("Could not load user");
  }
  console.log("done");
}
// Without try/catch, a rejection throws at the await line and
// 'done' never prints — the function itself rejects.` },
{ id: "e3", isExample: true, track: "startup", language: "JavaScript", difficulty: "Starter",
  title: "Rewrite the loop as a pipeline", conceptTitle: "map / filter / reduce — transforming collections",
  problem: "Given `items = [{name, price, inStock}, ...]`, this loop computes the total value of in-stock items by mutating an external variable.",
  task: "Rewrite it with filter → map → reduce, without mutating `items`. Then name one input that would break the original loop version but not yours (or vice versa).",
  hints: "filter keeps objects, map extracts price, reduce needs an initial value — what should it be, and why does it matter for an empty array?",
  solution: `const total = items
  .filter((i) => i.inStock)
  .map((i) => i.price)
  .reduce((sum, p) => sum + p, 0);
// The initial 0 matters: reduce without it throws on an
// empty (or fully filtered-out) array. The loop version
// silently returns 0 in that case but mutates shared state,
// so calling it twice double-counts.` },
{ id: "e4", isExample: true, track: "research", language: "Python", difficulty: "Core",
  title: "Interrogate a groupby result", conceptTitle: "pandas groupby: split–apply–combine",
  problem: "A summary table says Country A averages 998 consent partners and Country B averages 210. A draft sentence concludes 'sites in A expose users to roughly 5× more tracking.'",
  task: "List three things you must check in the data before that sentence is defensible, and the pandas code you'd use for each check.",
  hints: "Think about: how many rows sit behind each mean? Are all rows the same kind of observation? Is the mean the right summary for this distribution?",
  solution: `# 1. Sample size behind each mean
df.groupby("country")["partners"].count()
# 2. Duplicates / mixed observation types
df.duplicated(subset=["site", "country"]).sum()
df["site_type"].value_counts()
# 3. Distribution shape — partner counts are heavily skewed,
#    so compare medians too
df.groupby("country")["partners"].agg(["mean", "median"])
# If A has 12 sites and B has 900, or A's rows include
# re-scraped duplicates, the 5x claim is not defensible yet.` },
{ id: "e5", isExample: true, track: "research", language: "Python", difficulty: "Core",
  title: "Vectorize — then verify", conceptTitle: "Vectorization vs loops (NumPy)",
  problem: "A script standardizes each column of a 10,000×20 matrix with a nested Python loop. It takes minutes and nobody has checked it.",
  task: "Rewrite the standardization with NumPy broadcasting. Then describe how you'd verify the vectorized version on a tiny 3×2 example you can compute by hand — and why that check matters more than the speedup.",
  hints: "Standardizing = subtract the column mean, divide by the column std. What shape must the mean have for broadcasting to align per-column? Watch the ddof default.",
  solution: `import numpy as np

X = np.array([[1., 2.], [3., 4.], [5., 6.]])
Z = (X - X.mean(axis=0)) / X.std(axis=0)
# Hand check, column 1: values 1,3,5 → mean 3,
# std (ddof=0) = sqrt((4+0+4)/3) ≈ 1.633
# Z[0,0] = (1-3)/1.633 ≈ -1.225 ✓ matches Z[0,0].
# The check matters because a broadcasting mistake fails
# SILENTLY — wrong numbers at full speed. pandas .std()
# uses ddof=1, so cross-checking tools disagree unless
# you align that choice deliberately.` },
{ id: "e6", isExample: true, track: "research", language: "Python", difficulty: "Stretch",
  title: "Significant — but of what?", conceptTitle: "Standard errors: what a regression is actually claiming",
  problem: "A regression of wages on a training program across 40 firms (6,000 workers) reports p = 0.01 with plain standard errors. A reviewer asks for clustered standard errors; with clustering by firm, p = 0.21.",
  task: "Explain in plain language why clustering changed the result so much, what assumption the plain SEs were making, and what you'd write in the paper about the effect now.",
  hints: "Workers inside one firm aren't 6,000 independent pieces of evidence. How many *independent units* do you really have?",
  solution: `Plain SEs assume every worker's outcome is independent.
Workers in the same firm share managers, pay policies, and
shocks — their errors correlate. The effective sample is
closer to 40 firms than 6,000 workers, so plain SEs were
far too small and significance was overstated.

Honest write-up: the point estimate is unchanged, but once
uncertainty accounts for within-firm correlation, the data
no longer rule out a zero effect at conventional levels.
Report both, lead with the clustered result, and discuss
effect size rather than the p-value alone.` }
],
quiz: [
{ id: "q9", isExample: true, track: "both", questionType: "Find the bug",
  conceptTitle: "View as a function of data — derive, don't duplicate",
  prompt: "View A (Missing Evidence) and View B (Proxy Alignment) show different source_ids for what should be the same record. The unit test for the tensor passes. What is the most likely cause?",
  codeSnippet: `def test_both_projections_use_same_records():
    tensor = EvidenceTensor([{"target": "savings", "observed": "accounts", "source_id": "s1"}])
    assert tensor.project_gap()[0]["source_id"] == tensor.project_proxy()[0]["source_id"] == "s1"`,
  options: ["The tensor's two methods read different record lists", "One view builds its own data instead of calling the shared tensor", "The test uses a synthetic record", "SQLite returned the rows in a different order"],
  correctIndex: 1,
  explanation: "The test only proves the tensor itself is consistent — both methods read self.records. It says nothing about whether the views actually use the tensor. If View A builds its own matrix (as §14 found), the app can disagree with itself while every unit test passes. Test passing is not system correct: the integration point (view → tensor) is what's untested." },
{ id: "q1", isExample: true, track: "startup", questionType: "Predict output",
  conceptTitle: "map / filter / reduce — transforming collections",
  prompt: "What does this print?",
  codeSnippet: `const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2);
console.log(nums, doubled);`,
  options: ["[2, 4, 6]  [2, 4, 6]", "[1, 2, 3]  [2, 4, 6]", "[1, 2, 3]  [1, 2, 3]", "It throws an error"],
  correctIndex: 1,
  explanation: "map returns a NEW array and does not mutate the original. nums is untouched; doubled holds the transformed values. Mutation inside map would be a side effect — this code has none." },
{ id: "q2", isExample: true, track: "startup", questionType: "Find the bug",
  conceptTitle: "async / await & Promise error handling",
  prompt: "This async function is supposed to return the user's name or 'unknown'. What's wrong?",
  codeSnippet: `async function getName(id) {
  const user = fetchUser(id);
  return user ? user.name : "unknown";
}`,
  options: ["Nothing — it works", "user is a pending Promise, which is always truthy, and user.name is undefined", "fetchUser must be called with await inside a loop", "The ternary is invalid in async functions"],
  correctIndex: 1,
  explanation: "fetchUser is async, so it returns a Promise immediately. A Promise object is always truthy, so the fallback never runs, and .name on a Promise is undefined. Fix: `const user = await fetchUser(id)`." },
{ id: "q3", isExample: true, track: "startup", questionType: "Choose the design",
  conceptTitle: "Discriminated unions & narrowing",
  prompt: "A page background can be: a plain color, an image that stays fixed, or an image that scrolls. Which model best prevents impossible states?",
  codeSnippet: "",
  options: ["One object with optional fields: { color?, image?, fixed? }", "A discriminated union with one variant per kind, each carrying only its own fields", "Three separate boolean flags: isColor, isImage, isFixed", "A string field parsed at render time"],
  correctIndex: 1,
  explanation: "The union makes invalid combinations (color AND image, fixed with no image) unrepresentable — the compiler enforces the design. Optional fields and flag combinations both permit states nobody intended." },
{ id: "q4", isExample: true, track: "startup", questionType: "Explain why",
  conceptTitle: "Reading a diff like a reviewer",
  prompt: "Why review `git diff --stat` BEFORE reading the full diff of an AI-generated change?",
  codeSnippet: "",
  options: ["It shows total lines added, so you can bill for them", "It reveals which files changed at all — unintended edits hide in files you never opened", "It runs the test suite automatically", "It checks the code compiles"],
  correctIndex: 1,
  explanation: "The stat view is a scope check: files, and how much churn in each. Unexpected files or a huge change in an unrelated module are red flags you'd miss if you only read the hunks you expected to see." },
{ id: "q5", isExample: true, track: "research", questionType: "Predict output",
  conceptTitle: "pandas groupby: split–apply–combine",
  prompt: "What is the shape of the result?",
  codeSnippet: `import pandas as pd
df = pd.DataFrame({"g": ["a", "a", "b"], "x": [1, 3, 10]})
out = df.groupby("g")["x"].mean()
print(type(out), list(out.index))`,
  options: ["DataFrame indexed by row number", "Series indexed by ['a', 'b'] with values 2.0 and 10.0", "Series indexed by ['a', 'a', 'b']", "A single float, 4.67"],
  correctIndex: 1,
  explanation: "groupby + mean collapses each group to one row: the result is a Series whose index is the group key ('a', 'b') and whose values are the per-group means (2.0, 10.0). The group key becoming the index is the part that surprises people when plotting." },
{ id: "q6", isExample: true, track: "research", questionType: "Interpret results",
  conceptTitle: "Standard errors: what a regression is actually claiming",
  prompt: "Country A: mean partners 998, count 12. Country B: mean 210, count 940. The most defensible conclusion is:",
  codeSnippet: "",
  options: ["A's sites expose users to ~5× more tracking", "The means aren't comparable yet — check duplicates, medians, and what a 'row' is in each country first", "B's larger count makes its mean wrong", "Nothing can ever be concluded from means"],
  correctIndex: 1,
  explanation: "A mean over 12 rows and a mean over 940 rows carry very different precision, and partner counts are skewed — medians and duplicate checks come first. The comparison may hold up, but it isn't established by the two means alone." },
{ id: "q7", isExample: true, track: "research", questionType: "Find the bug",
  conceptTitle: "Vectorization vs loops (NumPy)",
  prompt: "The goal was to subtract each row's mean from that row. The code runs and returns plausible-looking numbers. Why are they wrong?",
  codeSnippet: `import numpy as np
X = np.array([[1., 2.], [3., 4.]])  # 2 rows x 2 cols
row_means = X.mean(axis=1)  # shape (2,): [1.5, 3.5]
Z = X - row_means`,
  options: ["NumPy cannot subtract a (2,) vector from a (2,2) array", "Broadcasting aligns the (2,) vector with the COLUMNS — each row needs its mean as shape (2,1), otherwise the two row means get mixed across both rows", "mean(axis=1) actually returns the column means", "The values are correct; only the dtype is wrong"],
  correctIndex: 1,
  explanation: "Broadcasting aligns trailing dimensions: (2,2) − (2,) pairs the vector with the columns, so Z[0] = [1−1.5, 2−3.5] — the second element of row 1 had row 2's mean subtracted. Fix: row_means.reshape(2, 1) so each row's mean broadcasts across that row only. Square matrices make this bug silent — shapes match, numbers print, results are wrong. Always verify on a hand-computable example." },
{ id: "q8", isExample: true, track: "both", questionType: "Explain why",
  conceptTitle: "Pure functions & side effects",
  prompt: "Why does structuring code as 'pure core, effects at the edges' make research code more reproducible?",
  codeSnippet: "",
  options: ["Pure code runs faster", "Given the same input file, the pure computation always produces the same output — reruns and reviewers get identical results", "It removes the need for documentation", "Effects at the edges are automatically correct"],
  correctIndex: 1,
  explanation: "Reproducibility fails when results depend on hidden state, ordering, or timing. A pure transformation from input data to output has none of those dependencies — anyone with the input gets the same numbers. (Effects can still be wrong; they're just isolated where you can inspect them.)" }
]
};

const ROADMAP = [
{ t: "Programming fundamentals", d: "Read and understand code, use data structures, write functions, understand how programs execute." },
{ t: "Software construction", d: "Modularity, interfaces, abstraction, testing, debugging, maintainable code." },
{ t: "System understanding", d: "Follow data through a codebase; dependencies, APIs, databases, deployment as relevant." },
{ t: "Verification and reliability", d: "Test AI-generated changes, investigate failures, protect sensitive data, recognize unsupported claims." },
{ t: "Technical problem-solving", d: "Decompose problems, select algorithms and tools, reason about trade-offs." },
{ t: "AI-assisted engineering", d: "Precise specs and context, review generated code, validate results — never treat AI output as authoritative." },
{ t: "Quantitative reasoning", d: "Connect code to mathematics, statistics, empirical evidence, reproducible research." },
{ t: "Continuous learning", d: "Read documentation, learn unfamiliar tools efficiently, transfer concepts between languages." }
];

const PRINCIPLES = [
{ t: "A · Problem decomposition", d: "Turn ambiguity into small, well-defined tasks. Name your assumptions. Define what 'done' looks like before you start." },
{ t: "B · Abstraction & system design", d: "Why does this live in this file, function, or layer? Who owns what, how do parts communicate, what breaks when one changes." },
{ t: "C · Correctness & verification", d: "How do you know it works? Tests, invariants, edge cases, independent checks. Running ≠ behaving correctly." },
{ t: "D · Trade-offs & constraints", d: "Complexity, readability, performance, maintainability, cost. Choose with reasons, not habit." },
{ t: "E · Debugging & failure analysis", d: "Reproduce, isolate, inspect evidence, verify the fix. Don't replace code you don't understand." },
{ t: "F · Maintainability", d: "Will future-you understand this? No duplication, no hidden dependencies, no fragile assumptions." },
{ t: "G · Independent technical judgment", d: "Review AI-generated diffs. Question assumptions. Reject or redesign when it doesn't hold up." },
{ t: "H · Research validity", d: "Correctness ≠ validity. Provenance, transformations, statistical assumptions, uncertainty, reproducibility." }
];

/* ---------------- state ---------------- */

function blankState() { return { sessions: [], concepts: [], resources: [], exercises: [], quiz: [] }; }

/* Replace surviving example cards with new seed content (same id).
   New seed ids are added on top — unless the user deleted that id before.
   Deleted example cards stay deleted; user-added cards are untouched. */
function migrateSeeds(s) {
  const deleted = Array.isArray(s.deletedExampleIds) ? s.deletedExampleIds : [];
  for (const kind of Object.keys(SEED)) {
    if (!Array.isArray(SEED[kind])) continue;
    if (!Array.isArray(s[kind])) s[kind] = [];
    const toAdd = [];
    for (const seed of SEED[kind]) {
      const i = s[kind].findIndex((x) => x.id === seed.id);
      if (i >= 0) {
        if (s[kind][i].isExample) s[kind][i] = JSON.parse(JSON.stringify(seed));
      } else if (!deleted.includes(seed.id)) {
        toAdd.push(JSON.parse(JSON.stringify(seed)));
      }
    }
    if (toAdd.length) s[kind] = [...toAdd, ...s[kind]];
  }
  s.seedVersion = SEED_VERSION;
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
}

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const b = blankState();
      for (const k of Object.keys(b)) if (!Array.isArray(s[k])) s[k] = [];
      if ((s.seedVersion || 0) < SEED_VERSION) migrateSeeds(s);
      return s;
    }
  } catch (e) {}
  const s = JSON.parse(JSON.stringify(SEED));
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch (e) {}
  return s;
}
let S = loadState();
function persist() { try { localStorage.setItem(LS_KEY, JSON.stringify(S)); } catch (e) {} }

/* ---------------- helpers ---------------- */

const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g,
  (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const exTag = (x) => x.isExample ? '<span class="example-tag">EXAMPLE</span>' : "";
const xBtn = (kind, id) => `<button class="x" title="delete forever" onclick="del('${kind}','${id}')">&#10005;</button>`;
const trackName = (t) => t === "startup" ? "startup" : t === "research" ? "research" : "both";

let tab = "feed";
let searchQ = "";
let trackF = "all";
const answered = {};   // quiz answers live in memory only — nothing to keep

function del(kind, id) {
  const victim = S[kind].find((x) => x.id === id);
  if (victim && victim.isExample) {
    // Remember deleted example ids so a future migration never resurrects them.
    if (!Array.isArray(S.deletedExampleIds)) S.deletedExampleIds = [];
    if (!S.deletedExampleIds.includes(id)) S.deletedExampleIds.push(id);
  }
  S[kind] = S[kind].filter((x) => x.id !== id);
  persist(); render();
}
function matchTrack(x) { return trackF === "all" || x.track === trackF || x.track === "both"; }
function matchSearch(x, fields) {
  if (!searchQ) return true;
  const hay = fields.map((f) => String(x[f] || "")).join(" ").toLowerCase();
  return hay.includes(searchQ.toLowerCase());
}

/* ---------------- views ---------------- */

function vFeed() {
  const items = S.sessions.filter(matchTrack);
  const cards = items.map((s) => `
    <div class="card">${xBtn("sessions", s.id)}
      <h3>${esc(s.title)}${exTag(s)}<span class="status">${esc(s.status)}</span></h3>
      <div class="meta">${esc(s.sessionDate)} · ${trackName(s.track)} · ${esc(s.project || "")}${s.principles ? " · principles " + esc(s.principles) : ""}</div>
      <div class="label">objective</div><p>${esc(s.objective)}</p>
      ${s.filesChanged ? `<div class="label">files changed</div><p>${esc(s.filesChanged)}</p>` : ""}
      ${s.whyChosen ? `<div class="label">why this implementation</div><p>${esc(s.whyChosen)}</p>` : ""}
      ${s.decisions ? `<div class="label">decisions</div><p>${esc(s.decisions)}</p>` : ""}
      ${s.tests ? `<div class="label">tests &amp; results</div><p>${esc(s.tests)}</p>` : ""}
      ${s.concepts ? `<div class="label">worth learning</div><p>${esc(s.concepts)}</p>` : ""}
    </div>`).join("");
  return `<div class="count">${items.length} in the working set — ✕ when learned.</div>`
    + (cards || `<p class="empty">empty. add a session below, or enjoy the clean slate.</p>`)
    + addForm("sessions");
}

function vConcepts() {
  const items = S.concepts.filter(matchTrack).filter((x) => matchSearch(x, ["title", "codeExample", "explanation", "language"]));
  const cards = items.map((c) => `
    <div class="card">${xBtn("concepts", c.id)}
      <h3>${esc(c.title)}${exTag(c)}</h3>
      <div class="meta">${esc(c.language)} · ${trackName(c.track)}${c.sharedConcept ? " · " + esc(c.sharedConcept) : ""}</div>
      ${c.codeExample ? `<pre>${esc(c.codeExample)}</pre>` : ""}
      <div class="label">how it works</div><p>${esc(c.explanation)}</p>
      <div class="label">why / when</div><p>${esc(c.whyUse)}</p>
      <div class="label">common mistake</div><p>${esc(c.mistake)}</p>
      ${c.connection ? `<div class="label">connection</div><p>${esc(c.connection)}</p>` : ""}
    </div>`).join("");
  return `<div class="count">${items.length} lessons — ✕ when learned.</div>`
    + (cards || `<p class="empty">nothing matches. delete more, or add below.</p>`)
    + addForm("concepts");
}

function vReading() {
  const groups = ["Official docs", "Academic", "Practitioner"];
  const items = S.resources.filter(matchTrack);
  let html = `<div class="count">${items.length} resources — ✕ the ones you've outgrown.</div>`;
  for (const g of groups) {
    const list = items.filter((r) => r.kind === g).filter((x) => matchSearch(x, ["title", "topic", "note"]));
    if (!list.length) continue;
    html += `<div class="label">${g}</div><ul class="plain">` + list.map((r) => `
      <li>${xBtn("resources", r.id)}
        <a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}</a>${exTag(r)}<br>
        <span class="d">${esc(r.topic)} · ${trackName(r.track)} — ${esc(r.note)}</span>
      </li>`).join("") + `</ul>`;
  }
  if (!items.length) html += `<p class="empty">reading list is empty.</p>`;
  return html + addForm("resources");
}

function vQuiz() {
  const items = S.quiz.filter(matchTrack);
  const cards = items.map((qq, i) => {
    const a = answered[qq.id];
    const opts = qq.options.map((op, oi) => {
      let cls = "";
      if (a !== undefined) {
        if (oi === qq.correctIndex) cls = "right";
        else if (oi === a) cls = "wrong";
        else cls = "dim";
      }
      return `<button class="opt ${cls}" ${a !== undefined ? "disabled" : ""} onclick="answer('${qq.id}',${oi})">${esc(op)}</button>`;
    }).join("");
    const r = answered[qq.id + ":r"];
    return `
    <div class="card">${xBtn("quiz", qq.id)}
      <h3>${i + 1}. ${esc(qq.prompt)}${exTag(qq)}</h3>
      <div class="meta">${esc(qq.questionType)} · ${esc(qq.conceptTitle)} · ${trackName(qq.track)}</div>
      ${qq.codeSnippet ? `<pre>${esc(qq.codeSnippet)}</pre>` : ""}
      <div>${opts}</div>
      ${a !== undefined ? `
        <div class="answer">
          <div class="label">answer</div>
          <p>${esc(qq.options[qq.correctIndex])}</p>
          <div class="label">why</div>
          <p class="explain">${esc(qq.explanation)}</p>
          <div class="rate">
            <button class="${r === "got" ? "picked" : ""}" onclick="rate('${qq.id}','got')">got it</button>
            <button class="${r === "shaky" ? "picked" : ""}" onclick="rate('${qq.id}','shaky')">shaky</button>
            <button class="${r === "missed" ? "picked" : ""}" onclick="rate('${qq.id}','missed')">missed</button>
          </div>
        </div>` : ""}
    </div>`;
  }).join("");
  return `<div class="count">${items.length} questions — answer, then ✕ when learned. nothing is scored.</div>`
    + (cards || `<p class="empty">no questions left. that's the point.</p>`)
    + addForm("quiz");
}

function vPractice() {
  const items = S.exercises.filter(matchTrack);
  const cards = items.map((e) => `
    <div class="card" id="card-${e.id}">${xBtn("exercises", e.id)}
      <h3>${esc(e.title)}${exTag(e)}</h3>
      <div class="meta">${esc(e.language)} · ${esc(e.difficulty)} · ${trackName(e.track)} · from: ${esc(e.conceptTitle || "")}</div>
      <div class="label">problem</div><p style="white-space:pre-wrap">${esc(e.problem)}</p>
      <div class="label">task</div><p style="white-space:pre-wrap">${esc(e.task)}</p>
      ${e.hints ? `<details><summary>hint</summary><p class="hint-text">${esc(e.hints)}</p></details>` : ""}
      <details><summary>solution (look only after trying)</summary><pre>${esc(e.solution)}</pre></details>
      <div class="label">scratch pad — not saved</div>
      <textarea class="work" placeholder="work it out here…"></textarea>
    </div>`).join("");
  return `<div class="count">${items.length} exercises — ✕ when learned.</div>`
    + (cards || `<p class="empty">practice pad is clear.</p>`)
    + addForm("exercises");
}

function vRoadmap() {
  return `<div class="label">8 priorities — durable, not deletable</div>
    <ul class="plain">` + ROADMAP.map((r, i) =>
      `<li><span class="t">${i + 1}. ${esc(r.t)}</span><br><span class="d">${esc(r.d)}</span></li>`).join("") + `</ul>
    <div class="label">8 engineering-mindset principles</div>
    <ul class="plain">` + PRINCIPLES.map((p) =>
      `<li><span class="t">${esc(p.t)}</span><br><span class="d">${esc(p.d)}</span></li>`).join("") + `</ul>
    <p class="empty">roadmap is reference, not working set — it stays.</p>`;
}

/* ---------------- add forms ---------------- */

const FIELDS = {
  sessions: [["title", "title"], ["track", "track:startup"], ["project", "project"], ["sessionDate", "date"], ["status", "status:planned"], ["objective", "textarea:objective"], ["filesChanged", "textarea:files changed"], ["whyChosen", "textarea:why this implementation"], ["decisions", "textarea:decisions"], ["tests", "textarea:tests & results"], ["concepts", "concepts worth learning"], ["principles", "principles (e.g. B · D)"]],
  concepts: [["title", "title"], ["track", "track:startup"], ["language", "language"], ["sharedConcept", "shared concept across languages"], ["codeExample", "textarea:code example"], ["explanation", "textarea:how it works"], ["whyUse", "textarea:why / when"], ["mistake", "textarea:common mistake"], ["connection", "textarea:connection"]],
  resources: [["title", "title"], ["track", "track:both"], ["url", "url"], ["topic", "topic"], ["kind", "kind:Official docs"], ["note", "textarea:what you'll learn"]],
  exercises: [["title", "title"], ["track", "track:startup"], ["language", "language"], ["difficulty", "difficulty:Core"], ["conceptTitle", "from concept"], ["problem", "textarea:problem"], ["task", "textarea:task"], ["hints", "textarea:hints"], ["solution", "textarea:solution"]],
  quiz: [["prompt", "prompt"], ["track", "track:startup"], ["questionType", "type:Predict output"], ["conceptTitle", "concept"], ["codeSnippet", "textarea:code (optional)"], ["opt0", "option 1"], ["opt1", "option 2"], ["opt2", "option 3"], ["opt3", "option 4"], ["correctIndex", "correct option number (1-4)"], ["explanation", "textarea:why"]]
};

function addForm(kind) {
  const fs = FIELDS[kind];
  const inputs = fs.map(([k, spec]) => {
    let type = "text", label = spec;
    if (spec.includes(":")) { const parts = spec.split(":"); type = parts[0]; label = parts.slice(1).join(":"); }
    const id = `f-${kind}-${k}`;
    if (type === "textarea") return `<label>${esc(label)}</label><textarea id="${id}"></textarea>`;
    if (type === "track") return `<label>track</label><select id="${id}"><option value="startup">startup</option><option value="research">research</option><option value="both">both</option></select>`;
    if (type === "status") return `<label>status</label><select id="${id}"><option>planned</option><option>attempted</option><option>completed</option><option>verified</option></select>`;
    if (type === "kind") return `<label>kind</label><select id="${id}"><option>Official docs</option><option>Academic</option><option>Practitioner</option></select>`;
    if (type === "difficulty") return `<label>difficulty</label><select id="${id}"><option>Starter</option><option>Core</option><option>Stretch</option></select>`;
    if (type === "type") return `<label>question type</label><select id="${id}"><option>Predict output</option><option>Find the bug</option><option>Choose the design</option><option>Explain why</option><option>Interpret results</option></select>`;
    if (type === "date") return `<label>date</label><input id="${id}" type="date" value="${new Date().toISOString().slice(0, 10)}">`;
    return `<label>${esc(label)}</label><input id="${id}" type="text">`;
  }).join("");
  return `<details class="addform"><summary>＋ add ${kind === "quiz" ? "question" : kind === "sessions" ? "session" : kind.slice(0, -1)}</summary>
    <div class="inner">${inputs}<button class="submit" onclick="add('${kind}')">add</button></div></details>`;
}

function val(kind, k) { const el = document.getElementById(`f-${kind}-${k}`); return el ? el.value.trim() : ""; }

function add(kind) {
  const item = { id: "u" + Date.now(), isExample: false, track: val(kind, "track") || "startup" };
  for (const [k] of FIELDS[kind]) {
    if (k === "track") continue;
    if (k === "correctIndex") { item[k] = Math.max(0, Math.min(3, (parseInt(val(kind, k), 10) || 1) - 1)); continue; }
    if (k.startsWith("opt")) continue;
    item[k] = val(kind, k);
  }
  if (kind === "quiz") item.options = [val(kind, "opt0"), val(kind, "opt1"), val(kind, "opt2"), val(kind, "opt3")];
  if (!item.title && !item.prompt) return;
  S[kind].unshift(item);
  persist(); render();
  document.getElementById("app").scrollIntoView();
}

/* ---------------- quiz ---------------- */

function answer(qid, idx) { answered[qid] = idx; render(); }
function rate(qid, v) { answered[qid + ":r"] = v; render(); }

/* ---------------- shell ---------------- */

const TABS = [["feed", "feed"], ["concepts", "concepts"], ["reading", "reading"], ["quiz", "quiz"], ["practice", "practice"], ["roadmap", "roadmap"]];
const VIEWS = { feed: vFeed, concepts: vConcepts, reading: vReading, quiz: vQuiz, practice: vPractice, roadmap: vRoadmap };

function renderTabs() {
  document.getElementById("tabs").innerHTML = TABS.map(([id, label]) =>
    `<button class="${tab === id ? "on" : ""}" onclick="go('${id}')">${label}</button>`).join("");
}
function go(id) { tab = id; render(); }
function setSearch(v) { searchQ = v; render(); const el = document.getElementById("sq"); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
function setTrack(v) { trackF = v; render(); }

function toolbar(showSearch) {
  return `<div class="toolbar">
    ${showSearch ? `<input id="sq" placeholder="search…" value="${esc(searchQ)}" oninput="setSearch(this.value)">` : ""}
    <select onchange="setTrack(this.value)">
      <option value="all" ${trackF === "all" ? "selected" : ""}>all tracks</option>
      <option value="startup" ${trackF === "startup" ? "selected" : ""}>startup</option>
      <option value="research" ${trackF === "research" ? "selected" : ""}>research</option>
    </select>
  </div>`;
}

function render() {
  renderTabs();
  const showSearch = tab === "concepts" || tab === "reading";
  const showTrack = tab !== "roadmap";
  document.getElementById("app").innerHTML =
    (showTrack ? toolbar(showSearch) : "") + VIEWS[tab]();
}

render();
