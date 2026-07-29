import { Fragment } from "react";
import { findGlossaryTerms } from "../lib/glossary";

function TermTooltip({ definition, focusable, text }) {
  return (
    <span
      className="term-tooltip"
      data-definition={definition}
      aria-label={focusable ? text : undefined}
      aria-description={focusable ? definition : undefined}
      tabIndex={focusable ? 0 : undefined}
      title={focusable ? definition : undefined}
    >
      {text}
    </span>
  );
}

export function GlossaryText({ text, focusable = true }) {
  return findGlossaryTerms(text).map((segment, index) => (
    segment.definition ? (
      <TermTooltip
        definition={segment.definition}
        focusable={focusable}
        key={`${segment.term}-${index}`}
        text={segment.text}
      />
    ) : (
      <Fragment key={`text-${index}`}>{segment.text}</Fragment>
    )
  ));
}
