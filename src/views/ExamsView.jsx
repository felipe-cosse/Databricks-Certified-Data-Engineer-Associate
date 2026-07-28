import { useEffect, useMemo, useState } from "react";
import { examMarkdown } from "../content";
import { sections } from "../data";
import { formatTime, parseQuestions, scoreQuestions } from "../lib/parse";
import { usePersistentState } from "../hooks/usePersistentState";
import { Icon } from "../components/Icon";

const EXAM_SECONDS = 90 * 60;

function Results({ attempt, questions, onClose, onRetry }) {
  const result = scoreQuestions(questions, attempt.answers);
  const [reviewIndex, setReviewIndex] = useState(0);
  const question = questions[reviewIndex];
  const selected = attempt.answers[question.id];

  return (
    <div className="results-page page-contained">
      <div className="page-toolbar">
        <button className="text-button back" onClick={onClose}><Icon name="left" size={16} /> Mock exams</button>
        <span>Submitted {new Date(attempt.submittedAt).toLocaleString()}</span>
      </div>
      <div className="results-hero">
        <div>
          <span className="eyebrow">Practice Exam {attempt.examIndex + 1} results</span>
          <h1>{result.percent}%</h1>
          <p>{result.correct} correct of {result.total}. This is a study score, not an official Databricks scaled score or passing prediction.</p>
        </div>
        <button className="button primary" onClick={onRetry}><Icon name="reset" size={17} /> New attempt</button>
      </div>
      <div className="section-score-strip">
        {sections.map((section) => {
          const score = result.bySection[section.id];
          const percent = Math.round((score.correct / score.total) * 100);
          return (
            <button key={section.id} onClick={() => setReviewIndex(questions.findIndex((item) => item.section === section.id))}>
              <span>S{section.id}</span><strong>{score.correct}/{score.total}</strong><small>{percent}%</small>
            </button>
          );
        })}
      </div>
      <div className="review-layout">
        <aside className="review-nav">
          <span className="eyebrow">Question review</span>
          <div className="number-grid">
            {questions.map((item, index) => (
              <button
                key={item.id}
                className={`${index === reviewIndex ? "current" : ""} ${attempt.answers[item.id] === item.answer ? "correct" : "incorrect"}`}
                onClick={() => setReviewIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </aside>
        <section className="review-question">
          <header><span>Question {question.number}</span><small>Section {question.section} · Objective {question.objective}</small></header>
          <h2>{question.question}</h2>
          <div className="choice-list">
            {Object.entries(question.options).map(([letter, label]) => (
              <div
                key={letter}
                className={`choice ${letter === question.answer ? "correct" : ""} ${selected === letter && letter !== question.answer ? "incorrect" : ""}`}
              >
                <span className="choice-letter">{letter}</span><span>{label}</span>
                {letter === question.answer && <Icon name="check" size={18} />}
              </div>
            ))}
          </div>
          <div className="rationale">
            <span className="eyebrow">
              {selected === question.answer
                ? "Your answer was correct"
                : `${selected ? `You chose ${selected}` : "Unanswered"}; correct answer ${question.answer}`}
            </span>
            <p>{question.rationale}</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function ExamSession({ attempt, questions, setAttempt, onExit, onSubmit }) {
  const [now, setNow] = useState(Date.now());
  const remaining = Math.max(0, EXAM_SECONDS - Math.floor((now - attempt.startedAt) / 1000));
  const question = questions[attempt.current];
  const answered = Object.keys(attempt.answers).length;

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (remaining === 0 && !attempt.submittedAt) onSubmit();
  }, [remaining, attempt.submittedAt, onSubmit]);

  function patch(updates) {
    setAttempt((previous) => ({ ...previous, ...updates }));
  }

  function select(letter) {
    patch({ answers: { ...attempt.answers, [question.id]: letter } });
  }

  function toggleFlag() {
    const flags = { ...attempt.flags };
    if (flags[question.id]) delete flags[question.id];
    else flags[question.id] = true;
    patch({ flags });
  }

  const statusBySection = sections.map((section) => {
    const sectionQuestions = questions.filter((item) => item.section === section.id);
    return {
      section,
      answered: sectionQuestions.filter((item) => attempt.answers[item.id]).length,
      total: sectionQuestions.length,
    };
  });

  return (
    <div className="exam-shell">
      <div className="exam-bar">
        <button className="text-button back" onClick={onExit}><Icon name="left" size={16} /> Save & exit</button>
        <span>Practice Exam {attempt.examIndex + 1}</span>
        <span className={`exam-clock ${remaining < 600 ? "urgent" : ""}`} aria-live="polite"><Icon name="clock" size={17} /> {formatTime(remaining)}</span>
      </div>
      <div className="exam-layout">
        <aside className="exam-navigator">
          <div><span className="eyebrow">Navigator</span><strong>{answered}/45 answered</strong></div>
          <div className="number-grid">
            {questions.map((item, index) => (
              <button
                key={item.id}
                className={`${index === attempt.current ? "current" : ""} ${attempt.answers[item.id] ? "answered" : ""} ${attempt.flags[item.id] ? "flagged" : ""}`}
                onClick={() => patch({ current: index })}
                aria-label={`Question ${index + 1}${attempt.answers[item.id] ? ", answered" : ""}${attempt.flags[item.id] ? ", flagged" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <div className="navigator-key"><span><i className="answered" />Answered</span><span><i className="flagged" />Flagged</span></div>
        </aside>

        <section className="exam-question">
          <header>
            <div><span className="eyebrow">Question {question.number} of 45</span><small>Section {question.section} · Objective {question.objective}</small></div>
            <button className={`flag-button ${attempt.flags[question.id] ? "active" : ""}`} onClick={toggleFlag}>
              <Icon name="flag" size={17} /> {attempt.flags[question.id] ? "Flagged" : "Flag"}
            </button>
          </header>
          <h1>{question.question}</h1>
          <div className="choice-list" role="radiogroup">
            {Object.entries(question.options).map(([letter, label]) => (
              <button
                key={letter}
                role="radio"
                aria-checked={attempt.answers[question.id] === letter}
                className={`choice ${attempt.answers[question.id] === letter ? "selected" : ""}`}
                onClick={() => select(letter)}
              >
                <span className="choice-letter">{letter}</span><span>{label}</span>
              </button>
            ))}
          </div>
          <div className="exam-question-actions">
            <button className="button secondary" disabled={attempt.current === 0} onClick={() => patch({ current: attempt.current - 1 })}>
              <Icon name="left" size={16} /> Previous
            </button>
            <button className="button primary" disabled={attempt.current === questions.length - 1} onClick={() => patch({ current: attempt.current + 1 })}>
              Next <Icon name="right" size={16} />
            </button>
          </div>
        </section>

        <aside className="exam-status">
          <span className="eyebrow">Exam status</span>
          <h2>{Math.round((answered / 45) * 100)}% complete</h2>
          <span className="progress-track"><i style={{ width: `${(answered / 45) * 100}%` }} /></span>
          <div className="status-sections">
            {statusBySection.map(({ section, answered: sectionAnswered, total }) => (
              <button
                key={section.id}
                onClick={() => patch({ current: questions.findIndex((item) => item.section === section.id && !attempt.answers[item.id]) >= 0
                  ? questions.findIndex((item) => item.section === section.id && !attempt.answers[item.id])
                  : questions.findIndex((item) => item.section === section.id) })}
              >
                <span>S{section.id} · {section.shortTitle}</span><strong>{sectionAnswered}/{total}</strong>
              </button>
            ))}
          </div>
          <button className="button primary full" disabled={answered !== questions.length} onClick={onSubmit}>
            {answered === questions.length ? "Submit exam" : `${45 - answered} unanswered`}
          </button>
          <p className="fine-print">The timer auto-submits at 00:00. Your attempt is saved in this browser.</p>
        </aside>
      </div>
    </div>
  );
}

export function ExamsView() {
  const questionsByExam = useMemo(() => examMarkdown.map((markdown) => parseQuestions(markdown)), []);
  const [attempt, setAttempt] = usePersistentState("dea-active-exam", null);
  const [history, setHistory] = usePersistentState("dea-exam-history", {});
  const [sessionVisible, setSessionVisible] = useState(true);

  function startExam(examIndex, replace = false) {
    if (attempt && !replace) {
      const approved = window.confirm("Replace the saved in-progress mock exam with a new attempt?");
      if (!approved) return;
    }
    setAttempt({
      examIndex,
      startedAt: Date.now(),
      answers: {},
      flags: {},
      current: 0,
      submittedAt: null,
    });
    setSessionVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submitExam() {
    setAttempt((previous) => {
      if (!previous || previous.submittedAt) return previous;
      const finished = { ...previous, submittedAt: Date.now() };
      const score = scoreQuestions(questionsByExam[previous.examIndex], previous.answers);
      setHistory((old) => ({
        ...old,
        [previous.examIndex]: {
          attempts: (old[previous.examIndex]?.attempts || 0) + 1,
          best: Math.max(old[previous.examIndex]?.best || 0, score.percent),
          latest: score.percent,
        },
      }));
      return finished;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (attempt?.submittedAt) {
    return (
      <Results
        attempt={attempt}
        questions={questionsByExam[attempt.examIndex]}
        onClose={() => setAttempt(null)}
        onRetry={() => startExam(attempt.examIndex, true)}
      />
    );
  }

  if (attempt && sessionVisible) {
    return (
      <ExamSession
        attempt={attempt}
        questions={questionsByExam[attempt.examIndex]}
        setAttempt={setAttempt}
        onExit={() => setSessionVisible(false)}
        onSubmit={submitExam}
      />
    );
  }

  return (
    <div className="hub page-contained exam-hub">
      <div className="hub-heading">
        <div>
          <span className="eyebrow">Timed simulation</span>
          <h1>Three full mock exams.</h1>
          <p>Each original exam mirrors the published 45-question count, 90-minute limit, section weighting, and current May 2026 objective vocabulary.</p>
        </div>
        <div className="hub-stat"><strong>135</strong><span>original questions</span></div>
      </div>
      {attempt && (
        <div className="resume-exam">
          <div>
            <span className="eyebrow">Saved attempt</span>
            <strong>Practice Exam {attempt.examIndex + 1} · {Object.keys(attempt.answers).length}/45 answered</strong>
          </div>
          <button className="button primary" onClick={() => setSessionVisible(true)}>
            Resume <Icon name="right" size={16} />
          </button>
        </div>
      )}
      <div className="exam-list">
        {["Foundation & Selection", "Operations & Reliability", "Integration & Transfer"].map((name, index) => {
          const record = history[index];
          return (
            <article key={name}>
              <span className="exam-number">0{index + 1}</span>
              <div>
                <span className="eyebrow">Practice exam {index + 1}</span>
                <h2>{name}</h2>
                <p>45 questions · 90 minutes · all seven blueprint sections</p>
              </div>
              <div className="exam-history">
                {record ? <><strong>{record.best}%</strong><small>best · {record.attempts} attempt{record.attempts === 1 ? "" : "s"}</small></> : <><strong>—</strong><small>not attempted</small></>}
              </div>
              <button className="button primary" onClick={() => startExam(index)}>
                Start exam <Icon name="right" size={16} />
              </button>
            </article>
          );
        })}
      </div>
      <div className="exam-rules">
        <div><Icon name="clock" /><strong>2:00 per item</strong><span>60 min first pass, 25 min review, 5 min final check.</span></div>
        <div><Icon name="flag" /><strong>Flag uncertainty</strong><span>Do not sacrifice unseen easy questions for one hard item.</span></div>
        <div><Icon name="target" /><strong>Repair by objective</strong><span>A score matters less than the exact misconception behind each miss.</span></div>
      </div>
    </div>
  );
}
