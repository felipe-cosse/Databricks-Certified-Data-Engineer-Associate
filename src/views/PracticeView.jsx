import { useMemo, useState } from "react";
import { diagnosticMarkdown } from "../content";
import { sections } from "../data";
import { parseQuestions, scoreQuestions } from "../lib/parse";
import { usePersistentState } from "../hooks/usePersistentState";
import { Icon } from "../components/Icon";

function DiagnosticSession({ section, questions, onExit, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const result = submitted ? scoreQuestions(questions, answers) : null;
  const answerCount = Object.keys(answers).length;

  function submit() {
    if (answerCount !== questions.length) return;
    const next = scoreQuestions(questions, answers);
    setSubmitted(true);
    onComplete(section.id, next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restart() {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="practice-session page-contained">
      <div className="page-toolbar">
        <button className="text-button back" onClick={onExit}><Icon name="left" size={16} /> All diagnostics</button>
        <span>{answerCount}/{questions.length} answered</span>
      </div>
      <div className="practice-heading">
        <div>
          <span className="eyebrow">Section {section.id} diagnostic · {section.weight}%</span>
          <h1>{section.title}</h1>
          <p>Choose one answer for every question. Explanations appear only after you submit.</p>
        </div>
        {submitted && (
          <div className={`score-orb ${result.percent >= 80 ? "pass" : ""}`}>
            <strong>{result.percent}%</strong>
            <span>{result.correct}/{result.total}</span>
          </div>
        )}
      </div>

      {submitted && (
        <div className={result.percent >= 80 ? "result-banner success" : "result-banner repair"}>
          <Icon name={result.percent >= 80 ? "check" : "target"} />
          <div>
            <strong>{result.percent >= 80 ? "Diagnostic cleared" : "Repair before moving on"}</strong>
            <p>{result.percent >= 80 ? "Explain every correct choice, then complete the mapped lab." : "Review every miss by objective, revisit the lesson, and retry without notes."}</p>
          </div>
        </div>
      )}

      <div className="diagnostic-list">
        {questions.map((question) => (
          <section className="quiz-question" key={question.id}>
            <header>
              <span>Question {question.number} of {questions.length}</span>
              <small>Objective {question.objective}</small>
            </header>
            <h2>{question.question}</h2>
            <div className="choice-list" role="radiogroup" aria-label={`Question ${question.number}`}>
              {Object.entries(question.options).map(([letter, label]) => {
                const selected = answers[question.id] === letter;
                const correct = submitted && letter === question.answer;
                const incorrect = submitted && selected && letter !== question.answer;
                return (
                  <button
                    key={letter}
                    className={`choice ${selected ? "selected" : ""} ${correct ? "correct" : ""} ${incorrect ? "incorrect" : ""}`}
                    onClick={() => !submitted && setAnswers((previous) => ({ ...previous, [question.id]: letter }))}
                    role="radio"
                    aria-checked={selected}
                    disabled={submitted}
                  >
                    <span className="choice-letter">{letter}</span>
                    <span>{label}</span>
                    {correct && <Icon name="check" size={18} />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="rationale">
                <span className="eyebrow">{answers[question.id] === question.answer ? "Correct" : `Correct answer: ${question.answer}`}</span>
                <p>{question.rationale}</p>
                {question.reference && <p className="reference-line">{question.reference}</p>}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="session-actions">
        {submitted ? (
          <>
            <button className="button secondary" onClick={onExit}>Back to diagnostics</button>
            <button className="button primary" onClick={restart}><Icon name="reset" size={17} /> Retry diagnostic</button>
          </>
        ) : (
          <>
            <span>{questions.length - answerCount} unanswered</span>
            <button className="button primary" disabled={answerCount !== questions.length} onClick={submit}>
              Submit answers
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function PracticeView() {
  const [activeSection, setActiveSection] = useState(null);
  const [scores, setScores] = usePersistentState("dea-diagnostic-scores", {});
  const diagnostics = useMemo(
    () => diagnosticMarkdown.map((markdown, index) => parseQuestions(markdown, index + 1)),
    [],
  );

  if (activeSection) {
    const section = sections[activeSection - 1];
    return (
      <DiagnosticSession
        section={section}
        questions={diagnostics[activeSection - 1]}
        onExit={() => setActiveSection(null)}
        onComplete={(id, result) =>
          setScores((previous) => ({
            ...previous,
            [id]: {
              percent: Math.max(previous[id]?.percent || 0, result.percent),
              latest: result.percent,
              attempts: (previous[id]?.attempts || 0) + 1,
            },
          }))
        }
      />
    );
  }

  const cleared = sections.filter((section) => (scores[section.id]?.percent || 0) >= 80).length;
  return (
    <div className="hub page-contained">
      <div className="hub-heading">
        <div>
          <span className="eyebrow">Practice by section</span>
          <h1>Diagnose before you deep-dive.</h1>
          <p>Seven ten-question checks isolate weak objectives. Complete them closed-note; use the rationale only after committing to an answer.</p>
        </div>
        <div className="hub-stat">
          <strong>{cleared}/7</strong>
          <span>sections at 80%+</span>
        </div>
      </div>

      <div className="practice-table">
        <div className="practice-table-head">
          <span>Section</span><span>Weight</span><span>Best</span><span />
        </div>
        {sections.map((section) => {
          const score = scores[section.id];
          return (
            <div className="practice-table-row" key={section.id}>
              <div className="practice-section-name">
                <span className="section-index">{String(section.id).padStart(2, "0")}</span>
                <span><strong>{section.title}</strong><small>{section.objectives.length} objectives · 10 questions</small></span>
              </div>
              <span className="weight-cell">{section.weight}%</span>
              <span className={`best-cell ${(score?.percent || 0) >= 80 ? "pass" : ""}`}>
                {score ? `${score.percent}%` : "—"}
                {score && <small>{score.attempts} attempt{score.attempts === 1 ? "" : "s"}</small>}
              </span>
              <button className="button secondary" onClick={() => setActiveSection(section.id)}>
                {score ? "Retry" : "Start"} <Icon name="right" size={16} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="learning-loop">
        <span className="eyebrow">Step 4 · five-part loop</span>
        <div>
          {["Orient", "Diagnose", "Deep dive", "Practice", "Repair"].map((step, index) => (
            <span key={step}><i>{index + 1}</i>{step}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

