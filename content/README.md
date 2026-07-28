# Learning Content

The curriculum is organized by learning purpose rather than application implementation.

```text
content/
├── course/
│   ├── guides/          # Course guide, blueprint map, study method, terminology, and review
│   ├── labs/            # Hands-on workspace exercises
│   └── sections/        # Seven lessons aligned to the certification blueprint
└── assessments/
    ├── diagnostics/     # Ten-question checks for each section
    └── practice-exams/  # Three timed mock exams and the scorecard
```

These Markdown files are the source of truth for both the public repository and the interactive website. The application catalog in `src/data/contentCatalog.js` imports them as raw content.

Start with the [Course Guide](course/guides/course-guide.md), then use the [Objective Coverage Map](course/guides/objective-coverage.md) to plan your study sequence.
