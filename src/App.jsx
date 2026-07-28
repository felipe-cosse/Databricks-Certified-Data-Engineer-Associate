import { useEffect, useState } from "react";
import { CourseView } from "./views/CourseView";
import { PracticeView } from "./views/PracticeView";
import { ExamsView } from "./views/ExamsView";
import { StudyPlanView } from "./views/StudyPlanView";
import { usePersistentState } from "./hooks/usePersistentState";
import { Icon } from "./components/Icon";
import { objectiveCount } from "./data/curriculum";

const routes = [
  ["course", "Course", "book"],
  ["practice", "Practice", "pencil"],
  ["exams", "Mock Exams", "clipboard"],
  ["plan", "Study Plan", "calendar"],
];

function routeFromHash() {
  const value = window.location.hash.replace("#/", "");
  return routes.some(([route]) => route === value) ? value : "course";
}

export default function App() {
  const [route, setRoute] = useState(routeFromHash);
  const [objectiveProgress, setObjectiveProgress] = usePersistentState(
    "dea-objective-progress",
    {},
  );
  const completed = Object.values(objectiveProgress).filter(Boolean).length;

  useEffect(() => {
    const sync = () => setRoute(routeFromHash());
    window.addEventListener("hashchange", sync);
    if (!window.location.hash) window.history.replaceState(null, "", "#/course");
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function navigate(nextRoute) {
    window.location.hash = `/${nextRoute}`;
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetStudyData() {
    const approved = window.confirm(
      "Reset all objective progress, quiz scores, mock exams, study-plan checks, and journal entries?",
    );
    if (!approved) return;
    for (const key of Object.keys(window.localStorage)) {
      if (key.startsWith("dea-")) window.localStorage.removeItem(key);
    }
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand" onClick={() => navigate("course")} aria-label="DEA Study Lab home">
          <span className="brand-mark"><Icon name="layers" size={23} /></span>
          <span>
            <strong>DEA Study Lab</strong>
            <small>Associate · May 2026 blueprint</small>
          </span>
        </button>

        <nav className="top-nav" aria-label="Primary navigation">
          {routes.map(([value, label]) => (
            <button
              key={value}
              className={route === value ? "active" : ""}
              onClick={() => navigate(value)}
              aria-current={route === value ? "page" : undefined}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <span className="header-progress" title={`${completed} of ${objectiveCount} objectives`}>
            <span>{completed}/{objectiveCount}</span>
            <span className="mini-progress"><i style={{ width: `${(completed / objectiveCount) * 100}%` }} /></span>
          </span>
          <button className="icon-button" onClick={resetStudyData} aria-label="Reset all study data" title="Reset study data">
            <Icon name="reset" size={19} />
          </button>
        </div>
      </header>

      <main className="app-main">
        {route === "course" && (
          <CourseView
            objectiveProgress={objectiveProgress}
            setObjectiveProgress={setObjectiveProgress}
            navigate={navigate}
          />
        )}
        {route === "practice" && <PracticeView />}
        {route === "exams" && <ExamsView />}
        {route === "plan" && <StudyPlanView />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {routes.map(([value, label, icon]) => (
          <button
            key={value}
            className={route === value ? "active" : ""}
            onClick={() => navigate(value)}
            aria-current={route === value ? "page" : undefined}
          >
            <Icon name={icon} size={19} />
            <span>{label === "Mock Exams" ? "Exams" : label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
