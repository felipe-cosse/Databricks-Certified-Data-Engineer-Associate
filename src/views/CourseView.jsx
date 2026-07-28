import { useEffect, useRef, useState } from "react";
import { lessons, supportingResources } from "../data/contentCatalog";
import { objectiveCount, sections } from "../data/curriculum";
import { usePersistentState } from "../hooks/usePersistentState";
import { buildObjectivePages } from "../lib/coursePages";
import { Icon } from "../components/Icon";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

const allObjectives = sections.flatMap((section) => section.objectives);
const lessonPages = sections.map((section, index) => (
  buildObjectivePages(lessons[index], section)
));

function SectionRow({ section, selected, objectiveProgress, onClick }) {
  const complete = section.objectives.filter(([id]) => objectiveProgress[id]).length;
  const percent = (complete / section.objectives.length) * 100;
  return (
    <button
      className={`section-row ${selected ? "active" : ""}`}
      onClick={onClick}
      aria-current={selected ? "true" : undefined}
    >
      <span className="section-index">{String(section.id).padStart(2, "0")}</span>
      <span className="section-row-body">
        <span className="section-row-title">{section.shortTitle}</span>
        <span className="section-row-meta">{section.weight}% · {complete}/{section.objectives.length}</span>
        <span className="section-progress"><i style={{ width: `${percent}%` }} /></span>
      </span>
      <Icon name="chevron" size={16} />
    </button>
  );
}

export function CourseView({ objectiveProgress, setObjectiveProgress, navigate }) {
  const [selection, setSelection] = usePersistentState("dea-course-selection", "section-1");
  const [currentObjective, setCurrentObjective] = usePersistentState("dea-current-objective", "1.1");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const readerRef = useRef(null);

  const selectedSection = selection.startsWith("section-")
    ? sections[Number(selection.split("-")[1]) - 1]
    : null;
  const support = supportingResources.find((item) => item.id === selection);
  const selectedObjectiveIndex = selectedSection
    ? Math.max(
        0,
        selectedSection.objectives.findIndex(([id]) => id === currentObjective),
      )
    : -1;
  const activeObjective = selectedSection?.objectives[selectedObjectiveIndex];
  const activeObjectiveId = activeObjective?.[0];
  const objectivePage = selectedSection
    ? lessonPages[selectedSection.id - 1][selectedObjectiveIndex]
    : null;
  const markdown = objectivePage?.markdown || support?.markdown;
  const title = selectedSection
    ? `${activeObjectiveId} · ${activeObjective[1]}`
    : support?.title || "Course guide";
  const eyebrow = selectedSection
    ? `Section ${selectedSection.id} · Page ${selectedObjectiveIndex + 1} of ${selectedSection.objectives.length} · ${selectedSection.weight}% of exam`
    : support?.eyebrow;

  const completed = allObjectives.filter(([id]) => objectiveProgress[id]).length;

  useEffect(() => {
    readerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [selection, activeObjectiveId]);

  function choose(next) {
    setSelection(next);
    if (next.startsWith("section-")) {
      const section = sections[Number(next.split("-")[1]) - 1];
      setCurrentObjective(section.objectives[0][0]);
    }
    setDrawerOpen(false);
  }

  function toggleObjective(id) {
    setObjectiveProgress((previous) => ({ ...previous, [id]: !previous[id] }));
    setCurrentObjective(id);
  }

  function openObjective(id) {
    const sectionId = Number(id.split(".")[0]);
    setCurrentObjective(id);
    setSelection(`section-${sectionId}`);
  }

  function markSection() {
    if (!selectedSection) return;
    const allDone = selectedSection.objectives.every(([id]) => objectiveProgress[id]);
    setObjectiveProgress((previous) => {
      const next = { ...previous };
      selectedSection.objectives.forEach(([id]) => { next[id] = !allDone; });
      return next;
    });
  }

  function openCourseLink(href) {
    if (href.includes("diagnostics/")) {
      navigate("practice");
      return;
    }
    const resources = {
      "course-guide.md": "guide",
      "objective-coverage.md": "coverage",
      "ai-prep-system.md": "ai-prep",
      "renamed-products.md": "renames",
      "hands-on-labs.md": "labs",
      "final-review.md": "review",
    };
    const resource = Object.entries(resources).find(([filename]) => href.endsWith(filename));
    if (resource) {
      choose(resource[1]);
      return;
    }
    const lesson = href.match(/0([1-7])-/);
    if (lesson) choose(`section-${lesson[1]}`);
  }

  const currentIndex = allObjectives.findIndex(([id]) => id === activeObjectiveId);
  function moveObjective(direction) {
    const next = allObjectives[Math.min(allObjectives.length - 1, Math.max(0, currentIndex + direction))];
    if (!next) return;
    openObjective(next[0]);
  }

  return (
    <div className="course-layout">
      <button className="mobile-course-menu" onClick={() => setDrawerOpen(true)}>
        <Icon name="menu" size={19} /> Course contents
      </button>
      {drawerOpen && <button className="drawer-backdrop" aria-label="Close course menu" onClick={() => setDrawerOpen(false)} />}

      <aside className={`course-sidebar ${drawerOpen ? "open" : ""}`}>
        <div className="rail-heading">
          <div>
            <span className="eyebrow">Blueprint</span>
            <h2>Seven sections</h2>
          </div>
          <button className="drawer-close icon-button" onClick={() => setDrawerOpen(false)} aria-label="Close course menu">
            <Icon name="close" />
          </button>
        </div>
        <div className="overall-progress">
          <div><span>Objective progress</span><strong>{completed}/{objectiveCount}</strong></div>
          <span className="progress-track"><i style={{ width: `${(completed / objectiveCount) * 100}%` }} /></span>
        </div>
        <div className="section-list">
          {sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              selected={selectedSection?.id === section.id}
              objectiveProgress={objectiveProgress}
              onClick={() => choose(`section-${section.id}`)}
            />
          ))}
        </div>
        <div className="resource-list">
          <span className="rail-label">Course resources</span>
          {supportingResources.map((resource) => (
            <button
              key={resource.id}
              className={selection === resource.id ? "active" : ""}
              onClick={() => choose(resource.id)}
            >
              <span>{resource.title}</span>
              <small>{resource.eyebrow}</small>
            </button>
          ))}
        </div>
      </aside>

      <article className="course-reader" ref={readerRef}>
        <div className="reader-inner">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          {selectedSection && (
            <p className="lesson-summary">
              {selectedSection.title}. Study this objective, mark it complete with evidence, then continue to the next page.
            </p>
          )}
          <MarkdownRenderer markdown={markdown || ""} hideTitle onInternalLink={openCourseLink} />
        </div>
      </article>

      <aside className="progress-rail">
        {selectedSection ? (
          <>
            <span className="eyebrow">Section progress</span>
            <h2>{selectedSection.shortTitle}</h2>
            <div className="objective-spine">
              {selectedSection.objectives.map(([id, label]) => (
                <button
                  key={id}
                  className={`${objectiveProgress[id] ? "complete" : ""} ${activeObjectiveId === id ? "current" : ""}`}
                  onClick={() => openObjective(id)}
                  aria-current={activeObjectiveId === id ? "page" : undefined}
                  aria-label={`Open objective ${id}: ${label}`}
                >
                  <span className="objective-node">
                    {objectiveProgress[id] ? <Icon name="check" size={13} /> : id.split(".")[1]}
                  </span>
                  <span><strong>{id}</strong>{label}</span>
                </button>
              ))}
            </div>
            <button className="button secondary full" onClick={markSection}>
              {selectedSection.objectives.every(([id]) => objectiveProgress[id])
                ? "Clear section progress"
                : "Mark section complete"}
            </button>
            <div className="rail-callout">
              <span className="eyebrow">Quick check</span>
              <p>Ten questions test decisions from this section. Rationales stay hidden until submission.</p>
              <button className="text-button" onClick={() => navigate("practice")}>
                Open diagnostic <Icon name="right" size={15} />
              </button>
            </div>
          </>
        ) : (
          <>
            <span className="eyebrow">How to use this</span>
            <h2>Read, do, explain</h2>
            <ol className="plain-steps">
              <li><span>1</span>Read the relevant objective.</li>
              <li><span>2</span>Complete its workspace task.</li>
              <li><span>3</span>Explain the tradeoff without notes.</li>
              <li><span>4</span>Mark it complete only with evidence.</li>
            </ol>
          </>
        )}
      </aside>

      {selectedSection && (
        <div className="objective-footer">
          <button className="footer-arrow" onClick={() => moveObjective(-1)} disabled={currentIndex <= 0} aria-label="Previous objective">
            <Icon name="left" />
          </button>
          <div>
            <span className="eyebrow">Objective page</span>
            <strong>{activeObjectiveId} · {allObjectives[currentIndex]?.[1]}</strong>
          </div>
          <button className="button primary" onClick={() => toggleObjective(activeObjectiveId)}>
            <Icon name={objectiveProgress[activeObjectiveId] ? "check" : "right"} size={17} />
            {objectiveProgress[activeObjectiveId] ? "Completed" : "Mark complete"}
          </button>
          <button className="footer-arrow" onClick={() => moveObjective(1)} disabled={currentIndex >= allObjectives.length - 1} aria-label="Next objective">
            <Icon name="right" />
          </button>
        </div>
      )}
    </div>
  );
}
