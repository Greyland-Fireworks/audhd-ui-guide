import { useId, useState } from 'react';
import { Button, Tooltip, TooltipTrigger } from 'react-aria-components';

// AUDHD-09: brief help supplements the visible label and scope. The library owns
// hover/focus, description association, Escape and collision-aware positioning.
// Pressing the same button exposes an inline explanation for touch or sustained
// reading; no interactive content is squeezed into the tooltip. This local state
// never modifies review data or requests focus elsewhere in the workspace.
export default function ContextHelp({ topic, text, textSize, kind = 'information' }) {
  const [expanded, setExpanded] = useState(false);
  const id = useId();
  return <>
    <TooltipTrigger delay={500} closeDelay={150} isDisabled={expanded}>
      <Button type="button" className="context-help-button" aria-label={`About ${topic}`}
        data-help-kind={kind} aria-expanded={expanded} aria-controls={expanded ? id : undefined}
        onPress={() => setExpanded(value => !value)}
        onKeyDown={event => { if (event.key === 'Escape') setExpanded(false); }}>
        <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          {kind === 'question' ? <><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4" /><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" /></> : kind === 'warning' ? <><path d="M12 7v6" /><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" /></> : <><path d="M12 11v6" /><circle cx="12" cy="7" r="0.8" fill="currentColor" stroke="none" /></>}
        </svg>
      </Button>
      <Tooltip className="context-tooltip" placement="top" offset={6} containerPadding={16} data-text-size={textSize}>
        {text}
      </Tooltip>
    </TooltipTrigger>
    {expanded && <p id={id} className="context-help-detail">{text}</p>}
  </>;
}
