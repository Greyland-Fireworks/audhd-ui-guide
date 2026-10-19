export default async (page) => {
 const results=[];
 for(const port of [new URL(page.url()).port]) {
  await page.goto(`http://127.0.0.1:${port}/`); await page.reload();
  const nav=page.getByRole('navigation',{name:'Workspace sections',exact:true});
  const prefs=nav.getByRole('link',{name:'Workspace preferences',exact:true});
  const check=async (id,visible)=>{
   const actual=await page.locator(id).evaluate(el=>({focused:el===document.activeElement,outline:getComputedStyle(el).outlineStyle}));
   if(!actual.focused || (actual.outline!=='none')!==visible) throw Error(JSON.stringify({port,id,visible,actual}));
  };
  await prefs.click(); await check('#page-heading',false);
  await nav.getByRole('link',{name:'Recordings',exact:true}).click(); await check('#review-heading',false);
  await prefs.focus(); await page.keyboard.press('Enter'); await check('#page-heading',true);
  await page.emulateMedia({forcedColors:'active'});
  const recordings=nav.getByRole('link',{name:'Recordings',exact:true});
  await recordings.focus(); await page.keyboard.press('Enter'); await check('#review-heading',true);
  await page.emulateMedia({forcedColors:'none'});
  results.push({port,pointerOutline:false,keyboardOutline:true,forcedColorsOutline:true,navigationFocus:true});
 }
 return results;
}
