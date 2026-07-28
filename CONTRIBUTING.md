# Contributing

Thank you for helping improve the Databricks Data Engineer Associate Study Lab.

## Before you start

- Search existing issues before opening a new one.
- Keep contributions within the current Associate exam blueprint.
- Use current Databricks product names and behavior.
- Cite official Databricks documentation for technical corrections.
- Never submit leaked, recalled, or copied live certification questions.
- Do not copy paid course material or other copyrighted training content.

## Types of contributions

### Content corrections

Use the content-correction issue template. Include:

- The affected file and heading
- The statement that should change
- The corrected explanation
- A current official source
- Whether the correction changes a question, answer, or rationale

### New practice scenarios

Questions must:

- Map to one published objective
- Be original and scenario-based
- Have exactly one defensible answer
- Include three plausible distractors
- Explain why the correct answer wins
- Avoid trivia outside the exam blueprint

### Application changes

Keep the Markdown curriculum as the source of truth. New lesson content should not be hard-coded only inside React components.

Preserve:

- Keyboard-accessible controls
- Visible focus states
- Responsive behavior
- Local-only persistence
- Hidden rationales before diagnostic submission
- Resumable mock-exam state

## Local development

```bash
npm ci
npm run dev
```

Before submitting:

```bash
make verify
```

Container-related changes should also pass:

```bash
make docker-config
make docker-build
make docker-up
make health
make docker-down
```

## Pull-request checklist

- [ ] The change is scoped to the published exam objectives.
- [ ] Technical claims use current terminology.
- [ ] Content corrections cite an official source.
- [ ] New questions are original.
- [ ] Tests pass.
- [ ] The production build succeeds.
- [ ] UI changes were checked at desktop and mobile widths.
- [ ] Screenshots or documentation were updated when the UI changed.

## Reporting security issues

This project is a client-only learning application and stores study state in the browser. If you find a security or privacy problem, avoid including sensitive information in a public issue. Open a concise issue describing how maintainers can contact you for details.
