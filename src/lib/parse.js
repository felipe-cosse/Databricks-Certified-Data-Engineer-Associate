export function parseQuestions(markdown, defaultSection = null) {
  const chunks = markdown.split(/^###\s+(?:Q|D)\d{2}\s*$/gm).slice(1);
  return chunks.map((chunk, index) => {
    const metaMatch = chunk.match(/<!--\s*meta:\s*([^>]+)-->/);
    const meta = {};

    if (metaMatch) {
      for (const item of metaMatch[1].split(";")) {
        const [key, ...value] = item.trim().split("=");
        if (key && value.length) meta[key] = value.join("=").trim();
      }
    }

    const questionMatch = chunk.match(/\*\*Question:\*\*\s*([\s\S]*?)(?=\nA\.\s)/);
    const rationaleMatch = chunk.match(
      /\*\*Rationale:\*\*\s*([\s\S]*?)(?=\n\*\*Reference:\*\*|\n###|$)/,
    );
    const referenceMatch = chunk.match(/\*\*Reference:\*\*\s*([^\n]+)/);
    const options = {};

    for (const match of chunk.matchAll(/^([A-D])\.\s+(.+)$/gm)) {
      options[match[1]] = match[2].trim();
    }

    return {
      id: `Q${String(index + 1).padStart(2, "0")}`,
      number: index + 1,
      section: Number(meta.section || defaultSection),
      objective: meta.objective || "",
      answer: meta.answer || "",
      question: questionMatch?.[1].trim() || "",
      options,
      rationale: rationaleMatch?.[1].trim() || "",
      reference: referenceMatch?.[1].trim() || "",
    };
  });
}

export function scoreQuestions(questions, answers) {
  const bySection = {};
  let correct = 0;

  for (const question of questions) {
    const isCorrect = answers[question.id] === question.answer;
    if (isCorrect) correct += 1;
    if (!bySection[question.section]) {
      bySection[question.section] = { correct: 0, total: 0 };
    }
    bySection[question.section].total += 1;
    if (isCorrect) bySection[question.section].correct += 1;
  }

  return {
    correct,
    total: questions.length,
    percent: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    bySection,
  };
}

export function formatTime(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

