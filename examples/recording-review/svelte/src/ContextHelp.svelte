<script>
  import { Tooltip } from 'bits-ui';
  let { topic, text, textSize, kind = 'information' } = $props();
  let expanded = $state(false);
  const id = $props.id();
</script>

<!-- AUDHD-09: Bits owns hover/focus, description association, Escape and floating
     placement. The same Help button opens inline text on click/tap, so reading
     does not depend on hover or precise pointer placement. Local disclosure
     state is independent of drafts, selection, navigation and pending saves. -->
<Tooltip.Provider delayDuration={500}>
  <Tooltip.Root disabled={expanded}>
    <Tooltip.Trigger type="button" class="context-help-button" aria-label={`About ${topic}`}
      data-help-kind={kind} aria-expanded={expanded} aria-controls={expanded ? id : undefined}
      onclick={() => expanded = !expanded}
      onkeydown={event => { if (event.key === 'Escape') expanded = false; }}>
      <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          {#if kind === 'question'}<path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4" /><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />{:else if kind === 'warning'}<path d="M12 7v6" /><circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />{:else}<path d="M12 11v6" /><circle cx="12" cy="7" r="0.8" fill="currentColor" stroke="none" />{/if}
        </svg>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <!-- This pinned primitive supplies association and placement; set the role explicitly. -->
      <Tooltip.Content role="tooltip" class="context-tooltip" side="top" sideOffset={6} collisionPadding={16} data-text-size={textSize}>
        {text}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
{#if expanded}<p {id} class="context-help-detail">{text}</p>{/if}
