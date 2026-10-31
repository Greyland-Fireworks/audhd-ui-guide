(() => {
  'use strict';
  const groups = window.SKIN_STUDIES;
  const roles = window.STUDY_ROLES;
  const weights = window.STUDY_FONT_WEIGHTS;
  const $ = id => document.getElementById(id);
  const storageKey = 'audhd-skin-studies-v1';
  const defaults = () => Object.fromEntries(groups.map(g => [g.id, {palette:g.variants[0].id, heading:g.variants[0].id, body:g.variants[0].id, finish:g.id === 'golden-child' ? 'brushed' : 'flat', included:false}]));
  let state = defaults();
  let active = groups[0];
  let fontGeneration = 0;
  let storageAvailable = true;
  // AUDHD-10 / ../../GUIDE.md#audhd-10-support-interruptions-and-working-preferences:
  // selectors own choices, previews merely project them. Persist only validated
  // variant IDs; a corrupt/older local record cannot inject markup or mix groups.
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved) for (const group of groups) {
      const value = saved[group.id];
      if (!value) continue;
      for (const part of ['palette', 'heading', 'body']) {
        if (group.variants.some(v => v.id === value[part])) state[group.id][part] = value[part];
      }
      if (group.id === 'golden-child' && ['brushed', 'polished', 'flat'].includes(value.finish)) state[group.id].finish = value.finish;
      state[group.id].included = value.included === true;
    }
  } catch { storageAvailable = false; }

  function luminance(hex) {
    const c = hex.slice(1).match(/../g).map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
  }
  function ratio(a,b) { const [hi,lo]=[luminance(a),luminance(b)].sort((a,b)=>b-a); return (hi+.05)/(lo+.05); }
  function blend(a,b,amount) {
    const x=a.slice(1).match(/../g), y=b.slice(1).match(/../g);
    return '#'+x.map((v,i)=>Math.round(parseInt(v,16)*amount+parseInt(y[i],16)*(1-amount)).toString(16).padStart(2,'0')).join('');
  }
  function choices(group=active) {
    const s=state[group.id];
    return {s,p:group.variants.find(v=>v.id===s.palette),h:group.variants.find(v=>v.id===s.heading),b:group.variants.find(v=>v.id===s.body)};
  }
  function applyLook(node,p,h,b,finish) {
    Object.entries(p.colors).forEach(([role,color])=>node.style.setProperty('--p-'+role,color));
    node.style.setProperty('--p-heading', `'${h.heading}'`);
    node.style.setProperty('--p-body', `'${b.body}'`);
    node.style.setProperty('--p-weight', weights[h.heading]);
    node.style.setProperty('--p-muted',blend(p.colors.ink,p.colors.page,.78));
    node.style.setProperty('--p-line',blend(p.colors.ink,p.colors.page,.48));
    node.style.setProperty('--p-selected',blend(p.colors.accent,p.colors.surface,.09));
    node.style.setProperty('--p-on-action',ratio(p.colors.action,'#ffffff')>ratio(p.colors.action,'#111111')?'#ffffff':'#111111');
    node.dataset.finish=finish;
  }
  function swatches(p,focusable=false) {
    return roles.map(role=>`<span class="swatch" ${focusable?'tabindex="0"':''} aria-label="${role}: ${p.colors[role]}" style="--swatch:${p.colors[role]}"><i aria-hidden="true"></i><span class="swatch-info" aria-hidden="true">${role} · ${p.colors[role]}</span></span>`).join('');
  }

  $('collections').innerHTML=groups.map(g=>`<a href="#${g.id}" data-group="${g.id}"><strong>${g.name}</strong><span class="collection-mini" aria-hidden="true">${['page','action','accent','ornament'].map(r=>`<i style="background:${g.variants[0].colors[r]}"></i>`).join('')}</span></a>`).join('');

  function renderGroup(group) {
    active=group;
    document.querySelectorAll('[data-group]').forEach(link=>{
      if (link.dataset.group===group.id) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current');
    });
    $('collection-kicker').textContent=`Collection ${groups.indexOf(group)+1} of 6`;
    $('collection-title').textContent=group.name;
    $('collection-description').textContent=group.description;
    $('collection-note').textContent=group.note;
    $('finish-control').hidden=group.id!=='golden-child';
    for (const [part,field] of [['palette','name'],['heading','heading'],['body','body']]) {
      $(part+'-choice').innerHTML=group.variants.map(v=>`<option value="${v.id}">${v.id} · ${v[field]}</option>`).join('');
    }
    // Samples contain no fake buttons or tab stops: the real buttons below each
    // card select parts. Their name identifies the part and source variant.
    $('variants').innerHTML=group.variants.map(v=>`<article class="variant" data-variant="${v.id}">
      <div class="variant-top"><span class="variant-id">${v.id}</span><button type="button" data-take="all" data-id="${v.id}" aria-label="Use complete look ${v.id}, ${v.name}">Use complete look</button></div>
      <div class="variant-sample"><h4>${v.name}</h4><p>Body Text · A clear next step.</p><div class="sample-mini"><span class="sample-active">Selected</span><span class="sample-action">Open notes ↗</span></div><div class="swatches" aria-hidden="true">${swatches(v)}</div></div>
      <p class="variant-description">${v.description}</p>
      <div class="take-parts" aria-label="Use parts from ${v.name}"><button type="button" data-take="palette" data-id="${v.id}" aria-label="Use colors from ${v.id}, ${v.name}">Colors</button><button type="button" data-take="heading" data-id="${v.id}" aria-label="Use title font ${v.heading} from ${v.id}">Title</button><button type="button" data-take="body" data-id="${v.id}" aria-label="Use body font ${v.body} from ${v.id}">Body</button></div>
      <p class="font-names">Title: ${v.heading}<br>Body: ${v.body}</p><a class="view-combination" href="#combination">View your combination ↑</a></article>`).join('');
    document.querySelectorAll('.variant').forEach(card=>{
      const v=group.variants.find(v=>v.id===card.dataset.variant);
      applyLook(card.querySelector('.variant-sample'),v,v,v,group.id==='golden-child'?'brushed':'flat');
    });
    $('mix-feedback').textContent='';
    update();
  }
  function update() {
    const {s,p,h,b}=choices();
    ['palette','heading','body','finish'].forEach(part=>$(part+'-choice').value=s[part]);
    $('include-choice').checked=s.included;
    applyLook($('live-preview'),p,h,b,s.finish);
    $('preview-label').textContent=`Colors ${p.id} · Title ${h.id} · Body ${b.id}`;
    $('preview-heading').textContent=active.name;
    $('live-swatches').innerHTML=swatches(p,true);
    $('preview-fonts').textContent=`${h.heading} ${weights[h.heading]} / ${b.body} Regular`;
    document.querySelectorAll('[data-take]').forEach(button=>{
      const part=button.dataset.take;
      const selected=part==='all'?['palette','heading','body'].every(k=>s[k]===button.dataset.id):s[part]===button.dataset.id;
      button.setAttribute('aria-pressed',String(selected));
    });
    document.querySelectorAll('.variant').forEach(card=>card.dataset.selected=String(['palette','heading','body'].every(k=>s[k]===card.dataset.variant)));
    updateReadout();
    // AUDHD-07 / ../../GUIDE.md#audhd-07-distinguish-previews-results-and-runtime-status:
    // never label a fallback as a loaded face. Late font promises cannot replace
    // the status for a newer combination; loading does not recreate the controls.
    const generation=++fontGeneration;
    $('font-state').textContent='Loading selected typefaces…';
    Promise.all([document.fonts.load(`${weights[h.heading]} 24px "${h.heading}"`),document.fonts.load(`400 16px "${b.body}"`)]).then(faces=>{
      if(generation===fontGeneration) $('font-state').textContent=faces.every(f=>f.length)?'Selected typefaces loaded.':'Font unavailable; a fallback is shown.';
    }).catch(()=>{if(generation===fontGeneration) $('font-state').textContent='Font unavailable; a fallback is shown.';});
  }
  function persist() {
    try { localStorage.setItem(storageKey,JSON.stringify(state)); storageAvailable=true; } catch { storageAvailable=false; }
    $('storage-status').textContent=storageAvailable?'Choices are saved in this browser on this address. Copy the brief to keep or share them.':'Browser storage is unavailable. Copy the brief before closing this page.';
  }
  function updateReadout() {
    const included=groups.filter(g=>state[g.id].included);
    $('selection-count').textContent=`${included.length} / 6`;
    $('chosen-total').textContent=`${included.length} collections included`;
    $('selection-summary').innerHTML=groups.map(g=>{
      const {s,p,h,b}=choices(g);
      return `<div class="selection-row"><a href="#${g.id}">${g.name}</a>${s.included?`<div class="summary-colors" aria-hidden="true">${roles.map(r=>`<i style="background:${p.colors[r]}"></i>`).join('')}</div><p>Colors: ${p.id} · ${p.name}</p><p>Title: ${h.id} · ${h.heading}<br>Body: ${b.id} · ${b.body}</p>${g.id==='golden-child'?`<p>Finish: ${s.finish}</p>`:''}`:'<p><small>No combination chosen yet</small></p>'}</div>`;
    }).join('');
    const lines=['SKIN SELECTION BRIEF — v1','Selected from the local skin workbench. These are proposed additions, not installed skins.',''];
    for (const group of included) {
      const {s,p,h,b}=choices(group);
      lines.push(`${group.name}`,`  Palette: ${p.id} — ${p.name}`,`  Title: ${h.id} — ${h.heading}, weight ${weights[h.heading]}`,`  Body: ${b.id} — ${b.body}, weight 400`,`  Mode: ${luminance(p.colors.page)>.4?'Light':'Dark'}`);
      if(group.id==='golden-child') lines.push(`  Finish: ${s.finish}`);
      lines.push(`  Colors: ${roles.map(r=>`${r}=${p.colors[r]}`).join('; ')}`,'');
    }
    const excluded=groups.filter(g=>!state[g.id].included).map(g=>g.name);
    if(excluded.length) lines.push(`Not selected: ${excluded.join(', ')}`);
    lines.push('','Font sources, weights and licenses: examples/skin-workbench/fonts-manifest.json.','Please implement only the selected combinations after checking production contrast and all control states.');
    $('selection-output').value=lines.join('\n');
    $('copy').disabled=!included.length;
    $('copy-result').textContent='';
    persist();
  }
  function selectPart(part,id) {
    const s=state[active.id];
    if(part==='all') ['palette','heading','body'].forEach(k=>s[k]=id); else s[part]=id;
    s.included=true;
    update();
    const v=active.variants.find(v=>v.id===id);
    const label=part==='all'?'Complete look':part==='palette'?'Colors':part==='heading'?'Title typeface':'Body typeface';
    $('mix-feedback').textContent=`${active.name}: ${label} from ${id}, ${v.name}. Preview and selection brief updated.`;
  }
  $('variants').addEventListener('click',event=>{
    const button=event.target.closest('[data-take]');
    if(button) selectPart(button.dataset.take,button.dataset.id);
  });
  ['palette','heading','body'].forEach(part=>$(part+'-choice').addEventListener('change',event=>selectPart(part,event.target.value)));
  $('finish-choice').addEventListener('change',event=>{
    state[active.id].finish=event.target.value;state[active.id].included=true;update();
  });
  $('include-choice').addEventListener('change',event=>{state[active.id].included=event.target.checked;updateReadout();});
  $('select-text').addEventListener('click',()=>{ $('selection-output').focus();$('selection-output').select();$('copy-result').textContent='Text selected. Press Ctrl+C (or Command+C) to copy.'; });
  $('copy').addEventListener('click',async()=>{
    try {
      await navigator.clipboard.writeText($('selection-output').value);
      $('copy-result').textContent='Copied. Paste the brief into the chat.';
    } catch {
      $('selection-output').focus();$('selection-output').select();
      $('copy-result').textContent='Clipboard access unavailable. Text selected; press Ctrl+C (or Command+C).';
    }
  });
  function navigate(initial=false) {
    const id=location.hash.slice(1);
    if(['selections','collection','combination'].includes(id)) { $(id).scrollIntoView(); if(!initial)$(id).focus({preventScroll:true}); return; }
    const group=groups.find(g=>g.id===id)||groups[0];
    renderGroup(group);
    if(!initial) { $('collection').scrollIntoView();$('collection').focus({preventScroll:true}); }
  }
  window.addEventListener('hashchange',()=>navigate());
  // Initialize before handling a deep link to the readout so no UI stays blank.
  renderGroup(groups.find(g=>g.id===location.hash.slice(1))||groups[0]);
  if(location.hash==='#selections') navigate(true);
})();
