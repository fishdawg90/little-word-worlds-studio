import {validateItems} from './core.mjs';
const liveCatalog='https://fishdawg90.github.io/little-word-worlds/packs/catalog.json';
export async function fetchCatalog(fetcher=fetch){
  try{const r=await fetcher(liveCatalog+'?t='+Date.now(),{signal:AbortSignal.timeout(10000),cache:'no-store'});if(!r.ok)throw Error('Catalogue unavailable');const c=await r.json();if(!Array.isArray(c.packs))throw Error('Invalid catalogue');return {...c,source:'live',checked_at:new Date().toISOString()};}
  catch{const r=await fetcher('./catalog.json');if(!r.ok)throw Error('Could not load catalogue');return {...await r.json(),source:'bundled',checked_at:new Date().toISOString()};}
}
async function api(key,endpoint,body,fetcher){
  let r;try{r=await fetcher('https://api.openai.com/v1/'+endpoint,{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(240000)})}catch{throw Error('Could not reach OpenAI. Check your connection; on a phone keep this page in the foreground. Finished assets are saved.')}
  if(!r.ok){let d;try{d=await r.json()}catch{}throw Error(`OpenAI ${r.status}: ${d?.error?.message||r.statusText}`)}return r;
}
function base64(bytes){let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s)}
export function pcmWav(chunks){const length=chunks.reduce((n,c)=>n+c.length,0),out=new Uint8Array(44+length),v=new DataView(out.buffer),text=(offset,s)=>[...s].forEach((c,i)=>out[offset+i]=c.charCodeAt(0));text(0,'RIFF');v.setUint32(4,36+length,true);text(8,'WAVEfmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,24000,true);v.setUint32(28,48000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);text(36,'data');v.setUint32(40,length,true);let offset=44;for(const c of chunks){out.set(c,offset);offset+=c.length}return out}
export async function speech(key,b,fetcher=fetch,Socket=WebSocket){
  // The full project key is used only for this HTTPS request; the socket gets a short-lived token.
  const response=await api(key,'realtime/client_secrets',{expires_after:{anchor:'created_at',seconds:60},session:{type:'realtime',model:b.model,audio:{output:{voice:b.voice,format:{type:'audio/pcm',rate:24000}}}}},fetcher);
  const secret=await response.json();if(!secret.value)throw Error('OpenAI did not return a voice session token.');
  return new Promise((resolve,reject)=>{const ws=new Socket('wss://api.openai.com/v1/realtime?model='+encodeURIComponent(b.model),['realtime','openai-insecure-api-key.'+secret.value]);const chunks=[];let settled=false,transcript='';const done=(err,result)=>{if(settled)return;settled=true;clearTimeout(timer);ws.close();err?reject(err):resolve(result)};const timer=setTimeout(()=>done(Error('Voice generation timed out.')),120000);
    ws.addEventListener('error',()=>done(Error('Voice connection failed. Check your API project’s model permissions and network.')));
    ws.addEventListener('close',()=>{if(!settled)done(Error('Voice connection closed early. Try again; completed assets are saved.'))});
    ws.addEventListener('message',message=>{try{const e=JSON.parse(message.data);
      if(e.type==='session.created')ws.send(JSON.stringify({type:'response.create',response:{output_modalities:['audio'],input:[],instructions:'Read exactly this text in '+(b.language==='it'?'Italian':'English')+'. Do not translate, answer, or add words. '+b.instructions+'\nText to read: '+JSON.stringify(b.text)}}));
      if(e.type==='response.output_audio.delta')chunks.push(Uint8Array.from(atob(e.delta),c=>c.charCodeAt(0)));
      if(e.type==='response.output_audio_transcript.delta')transcript+=e.delta;
      if(e.type==='error')done(Error(e.error?.message||'Voice generation failed.'));
      if(e.type==='response.done'){if(e.response?.status!=='completed'||!chunks.length)done(Error(e.response?.status_details?.error?.message||'No completed audio returned.'));else done(null,{mime:'audio/wav',base64:base64(pcmWav(chunks)),transcript});}
    }catch(err){done(err)}});
  });
}
export async function requestOpenAI(route,b,key,{fetcher=fetch,Socket=globalThis.WebSocket}={}){
  key=key.trim();if(!key)throw Error('Enter your OpenAI API key first.');
  if(route==='names'){
    const count=Number(b.count);if(!Number.isInteger(count)||count<4||count>52)throw Error('Choose 4–52 items.');if(!b.topic?.trim()||b.topic.length>300)throw Error('Enter a topic of up to 300 characters.');
    const c=await fetchCatalog(fetcher),merged=new Map(c.packs.map(p=>[p.id,p]));for(const p of b.catalog?.packs||[])if(!merged.has(p.id))merged.set(p.id,p);c.packs=[...merged.values()];
    const avoid=c.packs.flatMap(p=>p.items.flatMap(i=>[i.en,i.it,...(i.aliases||[])]));
    const prompt=`Create exactly ${count} distinct, easily pictured vocabulary items about ${JSON.stringify(b.topic)} for a toddler learning English and Italian. Exclude these existing names AND their synonyms: ${JSON.stringify(avoid)}. Use singular nouns where natural, correct Italian articles in full questions, and visually unambiguous items. Return ONLY JSON with an items array of objects with key (English lowercase hyphenated ID), en, it, prompt_en, prompt_it, aliases (array of common English and Italian synonyms). English question: Where is the ...? Italian: Dov'è ...? No markup.`;
    const r=await api(key,'responses',{model:b.model||'gpt-6-luna',input:prompt,text:{format:{type:'json_object'}}},fetcher);const d=await r.json(),out=d.output?.flatMap(o=>o.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('');const parsed=JSON.parse(out);validateItems(parsed.items,c);if(parsed.items.length!==count)throw Error('The model returned a different item count. Try again.');return {items:parsed.items,catalog:c};
  }
  if(route==='image'){const r=await api(key,'images/generations',{model:b.model||'gpt-image-2.5-flare',prompt:b.prompt,size:'1024x1024',quality:b.quality||'low',output_format:'webp',n:1},fetcher);const d=await r.json();if(!d.data?.[0]?.b64_json)throw Error('No image returned.');return{mime:'image/webp',base64:d.data[0].b64_json};}
  if(route==='speech'){if(b.model?.startsWith('gpt-realtime'))return speech(key,b,fetcher,Socket);const r=await api(key,'audio/speech',{model:b.model||'gpt-4o-mini-tts',voice:b.voice,input:b.text,instructions:b.instructions,response_format:'mp3'},fetcher);return{mime:'audio/mpeg',base64:base64(new Uint8Array(await r.arrayBuffer()))};}
  throw Error('Unknown operation.');
}
