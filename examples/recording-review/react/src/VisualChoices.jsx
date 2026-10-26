import ContextHelp from './ContextHelp.jsx';
export default function VisualChoices({name, value, options, kind, onChange, helpTopic, helpText, textSize, defaultSkin}) {
  return <div className="visual-choices" role="group" aria-labelledby={`${name.replaceAll(' ', '-')}-heading`}><div className="choice-heading"><h4 id={`${name.replaceAll(' ', '-')}-heading`}>{name}</h4>{helpTopic && <ContextHelp topic={helpTopic} text={helpText} textSize={textSize} />}</div>
    <div className="choice-grid">{options.map(option => <label className="choice-card" key={option.value}>
      <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} aria-label={option.label} aria-describedby={`${name.replaceAll(' ', '-')}-${option.value.replace(':','-')}-description`} />
      <span className="choice-name">{option.label}</span>
      <span className="choice-preview" aria-hidden="true" data-kind={kind} data-choice={option.value} data-audhd-ui="" data-skin={kind === 'appearance' && option.value === 'system' ? defaultSkin : option.skin}>
        <span className="sample-heading">{kind === 'style' ? 'Heading' : 'Review a recording'}</span><span className="sample-body">{kind === 'style' ? 'Body' : 'Keep your work in view.'}</span>
        {kind === 'appearance' && <><span className="sample-bands"><i /><i /><i /></span><span className="sample-action">Action</span><span className="sample-selection">Current selection</span></>}
      </span>
      <span className="choice-description" id={`${name.replaceAll(' ', '-')}-${option.value.replace(':','-')}-description`}>{option.description}</span>
      <span className="choice-state" aria-hidden="true">{value === option.value ? '✓ ACTIVE' : 'Inactive'}</span>
    </label>)}</div>
  </div>;
}
