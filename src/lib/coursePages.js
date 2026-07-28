const topicPlanBySection = {
  4: {
    "4.1": ["4.3"],
    "4.2": ["4.1", "4.2"],
    "4.3": ["4.4"],
    "4.4": ["4.5", "4.6", "4.7"],
  },
  5: {
    "5.1": ["5.1", "5.2"],
    "5.2": ["5.3", "5.4"],
    "5.3": ["5.4"],
    "5.4": ["5.5", "5.6"],
  },
  6: {
    "6.1": ["6.1"],
    "6.2": ["6.2"],
    "6.3": ["6.3"],
    "6.4": ["6.4", "6.5"],
    "6.5": ["6.3", "6.6", "6.7"],
  },
};

function splitAtLevelTwoHeadings(markdown) {
  const headingPattern = /^##\s+(.+)$/gm;
  const matches = [...markdown.matchAll(headingPattern)];

  if (matches.length === 0) {
    return { preamble: markdown, topics: [] };
  }

  return {
    preamble: markdown.slice(0, matches[0].index).trim(),
    topics: matches.map((match, index) => {
      const end = matches[index + 1]?.index ?? markdown.length;
      const heading = match[1].trim();
      return {
        heading,
        key: heading.match(/^(\d+\.\d+)\b/)?.[1] ?? null,
        markdown: markdown.slice(match.index, end).trim(),
      };
    }),
  };
}

function removeTopicNumber(markdown) {
  return markdown.replace(/^##\s+\d+\.\d+\s+/, "## ");
}

export function buildObjectivePages(markdown, section) {
  const { preamble, topics } = splitAtLevelTwoHeadings(markdown);
  const orientation = topics.find((topic) => topic.heading === "Orientation");
  const sharedTopics = topics.filter((topic) => !topic.key && topic !== orientation);
  const configuredPlan = topicPlanBySection[section.id];

  return section.objectives.map(([id, label], index) => {
    const topicKeys = configuredPlan?.[id] ?? [id];
    const objectiveTopics = topics.filter(
      (topic) => topic.key && topicKeys.includes(topic.key),
    );
    const parts = [];

    if (index === 0) {
      if (preamble) parts.push(preamble);
      if (orientation) parts.push(orientation.markdown);
    }

    parts.push(...objectiveTopics.map((topic) => removeTopicNumber(topic.markdown)));

    if (index === section.objectives.length - 1) {
      parts.push(...sharedTopics.map((topic) => topic.markdown));
    }

    return {
      id,
      label,
      markdown: parts.filter(Boolean).join("\n\n"),
    };
  });
}
