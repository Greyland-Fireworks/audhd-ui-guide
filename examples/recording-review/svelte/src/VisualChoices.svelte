<script>
  import ContextHelp from './ContextHelp.svelte';
  // AUDHD-11 (../../../../GUIDE.md#audhd-11-keep-controls-readable-and-operable).
  // Native radios retain single-choice keyboard behavior inside full-card labels.
  // The label and description convey meaning; aria-hidden samples and ACTIVE text
  // do not create a second announced control or replace checked state. App owns the
  // effective value. ../../shared/visual-choices.css owns selection/focus geometry.
  let {name, value, options, kind, onChange, helpTopic, helpText, textSize, defaultSkin} = $props();
</script>
<div class="visual-choices" role="group" aria-labelledby={`${name.replaceAll(' ', '-')}-heading`}><div class="choice-heading"><h4 id={`${name.replaceAll(' ', '-')}-heading`}>{name}</h4>{#if helpTopic}<ContextHelp topic={helpTopic} text={helpText} {textSize} />{/if}</div>
  <div class="choice-grid">{#each options as option (option.value)}<label class="choice-card">
    <input type="radio" {name} value={option.value} checked={value === option.value} onchange={() => onChange(option.value)} aria-label={option.label} aria-describedby={`${name.replaceAll(' ', '-')}-${option.value.replace(':','-')}-description`} />
    <span class="choice-name">{option.label}</span>
    <span class="choice-preview" aria-hidden="true" data-kind={kind} data-choice={option.value} data-audhd-ui="" data-skin={kind === 'appearance' && option.value === 'system' ? defaultSkin : option.skin}>
      <span class="sample-heading">{kind === 'style' ? 'Heading' : 'Review a recording'}</span><span class="sample-body">{kind === 'style' ? 'Body' : 'Keep your work in view.'}</span>
      {#if kind === 'appearance'}<span class="sample-bands"><i></i><i></i><i></i></span><span class="sample-action">Action</span><span class="sample-selection">Current selection</span>{/if}
    </span>
    <span class="choice-description" id={`${name.replaceAll(' ', '-')}-${option.value.replace(':','-')}-description`}>{option.description}</span>
    <span class="choice-state" aria-hidden="true">{value === option.value ? '✓ ACTIVE' : 'Inactive'}</span>
  </label>{/each}</div>
</div>
