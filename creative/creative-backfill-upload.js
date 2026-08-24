(()=>{
  'use strict';

  const FUNCTION_URL='https://azkshxjgsbtjgwbapcfw.supabase.co/functions/v1/upload-campsite-file';
  const PUBLISHABLE_KEY='sb_publishable_rWbeIqdWJJHHBtphER8bdg__CaS_xGK';
  const RUNTIME_WRITE_NEEDLE='document.open();document.write(html);document.close();';

  const helpers=`
const CREATIVE_BACKFILL_URL='${FUNCTION_URL}';
const CREATIVE_BACKFILL_KEY='${PUBLISHABLE_KEY}';
function creativeBackfillDeviceId(){try{const k='campsite-anonymous-device-id';let v=localStorage.getItem(k);if(!v){v=crypto.randomUUID?.()||('dev-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));localStorage.setItem(k,v)}return v}catch{return''}}
function creativeBackfillParkName(){return String(sourceName||'campsite').replace(/_creative$/i,'').replace(/\\.(kmz|kml|csv)$/i,'').trim()||'campsite'}
async function creativeUploadToBackfill(blob,filename){try{if(!(blob instanceof Blob))return;const active=(records||[]).filter(r=>r&&!r.deleted),existing=active.filter(r=>String(r.layer||'').startsWith('existing-')).length,added=active.filter(r=>String(r.layer||'').startsWith('new-')).length;const form=new FormData();form.append('file',new File([blob],filename,{type:'application/vnd.google-earth.kmz'}));form.append('original_file_name',filename);form.append('anonymous_device_id',creativeBackfillDeviceId());form.append('action_type','creative_mode');form.append('park_name',creativeBackfillParkName());form.append('poi_count',String(active.length));form.append('existing_poi_count',String(existing));form.append('added_poi_count',String(added));const res=await fetch(CREATIVE_BACKFILL_URL,{method:'POST',headers:{apikey:CREATIVE_BACKFILL_KEY,Authorization:'Bearer '+CREATIVE_BACKFILL_KEY},body:form});if(!res.ok){console.warn('Creative Mode backfill upload failed',res.status,await res.text());return}console.info('Creative Mode backfill upload complete',filename)}catch(e){console.warn('Creative Mode backfill upload failed',e)}}
`;

  const runtimePatch=[
    'const creativeBackfillHelpers='+JSON.stringify(helpers)+';',
    "if(!html.includes('function creativeUploadToBackfill(')){if(html.includes('let saveChooser=null;'))html=html.replace('let saveChooser=null;',creativeBackfillHelpers+'let saveChooser=null;');else console.warn('Creative Mode backfill helper target missing');}",
    "const creativeBackfillSaveNeedle='showSaveChooser(blob,filename);';const creativeBackfillSaveHook='void creativeUploadToBackfill(blob,filename);showSaveChooser(blob,filename);';if(!html.includes(creativeBackfillSaveHook)){if(html.includes(creativeBackfillSaveNeedle))html=html.replace(creativeBackfillSaveNeedle,creativeBackfillSaveHook);else console.warn('Creative Mode backfill save target missing');}"
  ].join('\n');

  window.applyCreativeBackfillUpload=src=>{
    if(typeof src!=='string'||!src.includes(RUNTIME_WRITE_NEEDLE))return src;
    return src.replace(RUNTIME_WRITE_NEEDLE,runtimePatch+RUNTIME_WRITE_NEEDLE);
  };
})();
