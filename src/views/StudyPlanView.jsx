import { aiPrepSteps, labs, renamedProducts, sections } from "../data/curriculum";
import { usePersistentState } from "../hooks/usePersistentState";
import { Icon } from "../components/Icon";

const initialPlan = {
  startDate: "",
  examDate: "",
  steps: {},
  labs: {},
  confidence: {},
  journal: "",
};

function calculatePhase(startDate, examDate) {
  if (!startDate || !examDate) return { label: "Set your dates", percent: 0, detail: "The planner will identify your current 25/50/25 phase." };
  const start = new Date(`${startDate}T00:00:00`).getTime();
  const exam = new Date(`${examDate}T00:00:00`).getTime();
  const now = Date.now();
  if (!Number.isFinite(start) || !Number.isFinite(exam) || exam <= start) {
    return { label: "Check the date range", percent: 0, detail: "The exam date must be after the study start date." };
  }
  const percent = Math.max(0, Math.min(100, ((now - start) / (exam - start)) * 100));
  if (percent < 25) return { label: "Diagnose", percent, detail: "First quarter: establish baselines and rank gaps by exam weight." };
  if (percent < 75) return { label: "Deep dive & build", percent, detail: "Middle half: study weak objectives and complete the hands-on evidence." };
  return { label: "Timed practice & repair", percent, detail: "Final quarter: take timed mocks and repair every missed objective." };
}

export function StudyPlanView() {
  const [plan, setPlan] = usePersistentState("dea-study-plan", initialPlan);
  const phase = calculatePhase(plan.startDate, plan.examDate);
  const completedSteps = Object.values(plan.steps).filter(Boolean).length;
  const completedLabs = Object.values(plan.labs).filter(Boolean).length;

  function update(field, value) {
    setPlan((previous) => ({ ...previous, [field]: value }));
  }

  function toggle(group, key) {
    setPlan((previous) => ({
      ...previous,
      [group]: { ...previous[group], [key]: !previous[group]?.[key] },
    }));
  }

  return (
    <div className="plan-page page-contained">
      <div className="hub-heading">
        <div>
          <span className="eyebrow">Six-step AI preparation system</span>
          <h1>Turn the blueprint into a schedule.</h1>
          <p>Track the process, not just reading time. Dates, evidence, confidence, and repair notes stay in this browser.</p>
        </div>
        <div className="hub-stat"><strong>{completedSteps}/6</strong><span>prep steps complete</span></div>
      </div>

      <section className="plan-dates">
        <div className="date-fields">
          <label>
            <span>Study start date</span>
            <input
              type="date"
              value={plan.startDate}
              onInput={(event) => update("startDate", event.currentTarget.value)}
              onChange={(event) => update("startDate", event.currentTarget.value)}
            />
          </label>
          <label>
            <span>Certification exam date</span>
            <input
              type="date"
              value={plan.examDate}
              onInput={(event) => update("examDate", event.currentTarget.value)}
              onChange={(event) => update("examDate", event.currentTarget.value)}
            />
          </label>
        </div>
        <div className="phase-panel">
          <span className="eyebrow">Current 25/50/25 phase</span>
          <h2>{phase.label}</h2>
          <p>{phase.detail}</p>
          <span className="phase-track">
            <i style={{ width: `${phase.percent}%` }} />
            <b style={{ left: "25%" }}>25</b><b style={{ left: "75%" }}>75</b>
          </span>
        </div>
      </section>

      <section className="plan-section">
        <div className="section-heading">
          <div><span className="eyebrow">Official AI prep workflow</span><h2>Six steps</h2></div>
          <strong>{completedSteps}/6</strong>
        </div>
        <div className="prep-steps">
          {aiPrepSteps.map(([title, description], index) => (
            <button
              key={title}
              className={plan.steps[index] ? "complete" : ""}
              onClick={() => toggle("steps", index)}
              aria-pressed={Boolean(plan.steps[index])}
            >
              <span className="check-box">{plan.steps[index] && <Icon name="check" size={15} />}</span>
              <span><small>Step {index + 1}</small><strong>{title}</strong><p>{description}</p></span>
            </button>
          ))}
        </div>
      </section>

      <section className="plan-section">
        <div className="section-heading">
          <div><span className="eyebrow">Self-assessment</span><h2>Confidence by blueprint section</h2></div>
          <span className="confidence-key">0 unknown · 4 transfer</span>
        </div>
        <div className="confidence-table">
          {sections.map((section) => {
            const value = Number(plan.confidence[section.id] || 0);
            return (
              <div key={section.id}>
                <span><strong>S{section.id} · {section.shortTitle}</strong><small>{section.weight}% of exam</small></span>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={value}
                  aria-label={`${section.title} confidence`}
                  onChange={(event) => setPlan((previous) => ({
                    ...previous,
                    confidence: { ...previous.confidence, [section.id]: Number(event.target.value) },
                  }))}
                />
                <output>{value}</output>
              </div>
            );
          })}
        </div>
      </section>

      <section className="plan-section">
        <div className="section-heading">
          <div><span className="eyebrow">Hands-on minimum</span><h2>Ten evidence-producing labs</h2></div>
          <strong>{completedLabs}/10</strong>
        </div>
        <div className="lab-checklist">
          {labs.map((lab, index) => (
            <button
              key={lab}
              className={plan.labs[index] ? "complete" : ""}
              onClick={() => toggle("labs", index)}
              aria-pressed={Boolean(plan.labs[index])}
            >
              <span className="check-box">{plan.labs[index] && <Icon name="check" size={15} />}</span>
              <span><small>Lab {index + 1}</small><strong>{lab}</strong></span>
            </button>
          ))}
        </div>
      </section>

      <section className="plan-section">
        <div className="section-heading">
          <div><span className="eyebrow">Terminology defense</span><h2>Renamed products</h2></div>
        </div>
        <div className="table-scroll">
          <table className="rename-table">
            <thead><tr><th>Older name</th><th>Current name</th></tr></thead>
            <tbody>
              {renamedProducts.map(([oldName, currentName]) => (
                <tr key={oldName}><td>{oldName}</td><td><Icon name="right" size={15} /> {currentName}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="trap-note"><strong>Critical trap:</strong> SQL <code>DENY</code> is not supported for Unity Catalog objects; it belongs to the legacy <code>hive_metastore</code>.</p>
      </section>

      <section className="plan-section journal-section">
        <div className="section-heading">
          <div><span className="eyebrow">Repair log</span><h2>Study journal</h2></div>
          <span>{plan.journal.length} characters</span>
        </div>
        <label className="journal-label" htmlFor="study-journal">Record the objective, your wrong mental model, the evidence that corrected it, and how you will recognize the pattern next time.</label>
        <textarea
          id="study-journal"
          value={plan.journal}
          onChange={(event) => update("journal", event.target.value)}
          placeholder={"Example:\nObjective 2.3 — I confused schemaLocation with checkpointLocation...\nEvidence — ...\nRecognition rule — ..."}
        />
        <span className="autosave-note"><Icon name="check" size={14} /> Autosaved locally</span>
      </section>
    </div>
  );
}
