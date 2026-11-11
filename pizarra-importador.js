/* VIYEDI — prototipo de importación revisable; jamás guarda en la planilla. */
(function(){
const page=document.querySelector('#page-production');if(!page||document.getElementById('pizOpen'))return;
const b=document.createElement('button');b.id='pizOpen';b.className='btn outline';b.textContent='📷 Importar pizarra (prueba)';
(page.querySelector('.head')||page).append(b);
const styles=document.createElement('style');
styles.textContent='#pizModal{display:none;position:fixed;inset:0;background:#172331bc;z-index:110;align-items:center;justify-content:center;padding:12px}#pizModal.show{display:flex}#pizModal .panel{background:white;border-radius:20px;width:min(1100px,100%);max-height:95vh;overflow:auto;padding:18px}#pizModal .flex{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}#pizModal .actions{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}#pizModal .pizRow{display:grid;grid-template-columns:1.2fr 1fr 1.3fr .7fr 1.2fr auto;gap:8px;padding:10px;margin:8px 0;border:1px solid #ddd;border-radius:12px}#pizModal .pizRow label{font-size:10px}#pizModal .pizRow input,#pizModal .pizRow select{min-width:0}#pizPreview{max-height:220px;max-width:100%;object-fit:contain;border:1px solid #ddd;border-radius:12px;margin:10px 0}#pizStatus{background:#fff8ea;padding:10px;border-radius:12px;font-size:12px}#pizTotals{background:#edf7f0;padding:10px;border-radius:12px;font-weight:bold}#pizModal small{font-size:11px;color:#965600}@media(max-width:800px){#pizModal .pizRow{grid-template-columns:1fr 1fr}#pizModal .pizRow>div:first-child{grid-column:1/-1}}';
styles.textContent+='#pizNameBox{display:none;position:fixed;inset:0;background:#172331c9;z-index:200;align-items:center;justify-content:center;padding:14px}#pizNameBox.show{display:flex}#pizNameBox .nameCard{background:white;border-radius:18px;max-width:440px;width:100%;padding:20px}#pizCuadre{margin:12px 0;padding:12px;border:1px solid #ddd;border-radius:12px}#pizCuadreOut{margin-top:8px;font-weight:700}';
document.head.append(styles);
const m=document.createElement('div');m.id='pizModal';
m.innerHTML='<div class="panel"><div class="flex"><div><h2 style="margin:0">Importación de pizarra · Producción</h2><div class="muted">Borrador revisable; nada afecta la planilla hasta aprobar la implementación definitiva.</div></div><button class="btn outline" id="pizClose">Cerrar</button></div><div class="grid g2" style="margin:12px 0"><div><label>Fotografía JPG, PNG o WEBP (máx. 5 MB)</label><input type="file" id="pizFile" accept="image/jpeg,image/png,image/webp"></div><div><label>Fecha real del trabajo</label><input type="date" id="pizDate"></div></div><img id="pizPreview" class="hidden" alt="Fotografía subida"><div class="actions"><button id="pizAI" class="btn orange">Analizar con IA</button><button id="pizExample" class="btn outline">Ejemplo manual</button><button id="pizAdd" class="btn outline">+ Fila</button></div><div id="pizStatus">Seleccioná una foto. Si no hay API, podés ingresar los datos manualmente.</div><h3>Filas de trabajo para revisar</h3><div id="pizRows"></div><div id="pizTotals"></div><div id="pizCuadre"><strong>Comparación preliminar · pollo vivo vs. pelado</strong><div class="muted">Se suman las boletas del día. Si no hay boleta, podés simular un número sin guardarlo.</div><label>Pollos de boleta (solo simulación si faltan boletas)</label><input type="number" min="0" id="pizBoletaDemo" placeholder="Ej.: 1200"><div id="pizCuadreOut">Sin datos para comparar</div></div><div class="actions"><button class="btn red" id="pizExport">Descargar borrador revisado</button></div><div class="muted">No crea trabajadores ni guarda salarios. Las coincidencias de nombres se deben revisar.</div></div>';
document.body.append(m);
const unknown=document.createElement('div');unknown.id='pizNameBox';unknown.innerHTML='<div class="nameCard" role="dialog" aria-modal="true" aria-labelledby="pizNameTitle"><h3 id="pizNameTitle">Trabajador no reconocido</h3><p id="pizNamePrompt"></p><p class="muted">Primero comprobá que no sea un apodo de un trabajador existente.</p><div class="actions"><button class="btn green" id="pizYes">Sí, dar de alta</button><button class="btn orange" id="pizNo">No, es eventual</button><button class="btn outline" id="pizLater">Revisar después</button></div><div class="muted">En esta prueba solo se marca la decisión en el borrador: no se crean fichas de personal reales.</div></div>';document.body.append(unknown);
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const types=['Pelador','Matador','Champador','Pintador','Ayudante','Ayudó a champar','Lava cajas','Limpieza general','Desconocida'];
const known=()=>typeof S!=='undefined'&&Array.isArray(S.workers)?S.workers.filter(w=>w.type==='Producción'||w.area==='Producción'||w.branch==='Matadero'||['Pelador','Matador','Champador','Pintador','Ayudante','Limpieza','Lava cajas'].includes(w.section)).map(w=>w.name).filter(Boolean):[];
let image=null,filename='',rows=[],seen=new Set(),semanticSeen=new Set(),personIndex=-1;
const total=f=>f.tandas.length&&f.tandas.every(n=>Number.isSafeInteger(n)&&n>=0)?f.tandas.reduce((a,n)=>a+n,0):null;
const state=f=>{const d=!f.nombre||f.actividad==='Desconocida'||total(f)===null||(f.total_escrito!==null&&f.total_escrito!==total(f));const identidad=f.tipoPersona==='eventual'?'Eventual (solo esta jornada)':f.tipoPersona==='alta_pendiente'?'Pendiente de alta':f.worker?'Identificado':'Pendiente de identificar';return identidad+(d?' · ⚠ Revisar cantidades/actividad':'');};
function abrirDesconocido(i){
 if(!rows[i]||!rows[i].nombre||rows[i].worker)return;
 personIndex=i;document.getElementById('pizNamePrompt').textContent='Se leyó «'+rows[i].nombre+'». ¿Deseás agregarlo a la lista de trabajadores?';unknown.classList.add('show');
}
function cerrarDesconocido(){unknown.classList.remove('show');personIndex=-1;}
function fingerprint(fecha,filas){return JSON.stringify({fecha,filas:filas.map(f=>({nombre:String(f.nombre||'').trim().toLowerCase(),actividad:f.actividad,tandas:f.tandas})).sort((a,b)=>a.nombre.localeCompare(b.nombre)||a.actividad.localeCompare(b.actividad))});}
function cuadre(){
 const d=$('pizDate').value,boletas=(typeof S!=='undefined'&&Array.isArray(S.liveEntries)?S.liveEntries:[]).filter(e=>e.date===d);
 const recibido=boletas.length?boletas.reduce((a,e)=>a+(Number(e.birds)||0),0):($('pizBoletaDemo').value.trim()===''?null:Number($('pizBoletaDemo').value));
 const peladores=rows.filter(f=>f.actividad==='Pelador'),incompleto=!peladores.length||peladores.some(f=>total(f)===null||!f.nombre);
 const pelado=incompleto?null:peladores.reduce((a,f)=>a+total(f),0);
 const box=$('pizCuadreOut');if(recibido===null||incompleto||!Number.isSafeInteger(recibido)||recibido<0){box.textContent='Comparación pendiente: faltan boletas o cantidades verificadas de pelado.';box.style.color='#775900';return;}
 const diff=recibido-pelado,m=Math.abs(diff),nivel=m>=10?'REVISIÓN URGENTE':m>0?'Observación':'Coincide';
 box.style.color=m>=10?'#c62828':m>0?'#a83422':'#23884b';
 box.textContent=nivel+' · '+recibido+' recibidos · '+pelado+' pelados · Diferencia '+(diff>0?'+':'')+diff+' pollos. PRELIMINAR: verificar saldos, bajas y producción de otros días.';
}
function render(){
 $('pizRows').innerHTML='';
 rows.forEach((f,i)=>{
  const d=document.createElement('div');d.className='pizRow';
  d.innerHTML='<div><label>Nombre de la foto</label><input data-k="nombre" value="'+esc(f.nombre)+'"></div>'+
   '<div><label>Actividad</label><select data-k="actividad">'+types.map(t=>'<option '+(t===f.actividad?'selected':'')+'>'+esc(t)+'</option>').join('')+'</select></div>'+
   '<div><label>Tandas separadas por coma (? = ilegible)</label><input data-k="tandas" placeholder="233, 169" value="'+esc(f.tandas.map(n=>n===null?'?':n).join(', '))+'"></div>'+
   '<div><label>Total en pizarra</label><input type="number" min="0" data-k="total_escrito" value="'+(f.total_escrito??'')+'"></div>'+
   '<div><label>Vincular a trabajador</label><select data-k="worker"><option value="">Pendiente</option>'+known().map(n=>'<option value="'+esc(n)+'" '+(f.worker===n?'selected':'')+'>'+esc(n)+'</option>').join('')+'</select><small>'+esc(state(f))+' · suma: '+(total(f)??'?')+'</small></div>'+
   '<div><button class="btn outline" data-remove="1">✕</button><button class="btn outline" data-identify="1" style="margin-top:5px">Identificar</button></div>';
  d.querySelectorAll('[data-k]').forEach(input=>input.addEventListener('change',()=>{
   const k=input.dataset.k,v=input.value;
   if(k==='tandas')f.tandas=v.trim()?v.split(',').map(s=>/^\d+$/.test(s.trim())?Number(s):null):[];
   else if(k==='total_escrito')f[k]=v.trim()===''?null:Number(v);
   else {const anterior=f[k];f[k]=v;if(k==='worker'&&v)f.tipoPersona='';if(k==='nombre'&&v!==anterior)f.tipoPersona='';}
   render();
  }));
  d.querySelector('[data-remove]').onclick=()=>{rows.splice(i,1);render();};
  const identity=d.querySelector('[data-identify]');identity.style.display=f.worker?'none':'';identity.onclick=()=>abrirDesconocido(i);
  $('pizRows').append(d);
 });
 const pelado=rows.filter(x=>x.actividad==='Pelador'),sum=pelado.reduce((s,x)=>s+(total(x)||0),0),faltan=pelado.filter(x=>total(x)===null).length;
 $('pizTotals').textContent='Pelado: '+sum+' pollos'+(faltan?' · '+faltan+' cantidades pendientes':'')+' · '+rows.length+' actividades extraídas. No guardado.';
 cuadre();
}
function add(f={}){rows.push({nombre:f.nombre||'',actividad:f.actividad||'Desconocida',tandas:Array.isArray(f.tandas)?f.tandas:[],total_escrito:f.total_escrito??null,worker:f.worker||'',tipoPersona:f.tipoPersona||''});render();}
function notify(t){$('pizStatus').textContent=t;}
b.onclick=()=>m.classList.add('show');
$('pizClose').onclick=()=>m.classList.remove('show');
$('pizYes').onclick=()=>{if(personIndex>=0){rows[personIndex].tipoPersona='alta_pendiente';notify('Alta solicitada como trabajador habitual. Queda pendiente completar su ficha y autorización.');}cerrarDesconocido();render();};
$('pizNo').onclick=()=>{if(personIndex>=0){rows[personIndex].tipoPersona='eventual';rows[personIndex].worker='';notify('Registrado como eventual SOLO para la fecha seleccionada. No se añade a nómina permanente.');}cerrarDesconocido();render();};
$('pizLater').onclick=cerrarDesconocido;
$('pizDate').onchange=cuadre;$('pizBoletaDemo').oninput=cuadre;
m.onclick=e=>{if(e.target===m)m.classList.remove('show');};
$('pizDate').value=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/La_Paz',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
$('pizFile').onchange=async()=>{
 const f=$('pizFile').files[0];if(!f)return;
 if(!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>5*1024*1024){notify('Imagen inválida o mayor a 5 MB');return;}
 image=await new Promise((ok,no)=>{const reader=new FileReader();reader.onload=()=>ok(reader.result);reader.onerror=no;reader.readAsDataURL(f);});
 filename=f.name;$('pizPreview').src=image;$('pizPreview').classList.remove('hidden');
 if(window.crypto?.subtle){const digest=await crypto.subtle.digest('SHA-256',await f.arrayBuffer());const hash=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
  if(seen.has(hash))notify('Posible duplicado: esta imagen ya fue seleccionada en esta sesión.');else {seen.add(hash);notify('Fotografía lista. Revisá la fecha.');}}
 else notify('Fotografía lista. No fue posible comprobar duplicados.');
};
$('pizAI').onclick=async()=>{
 if(!image){notify('Primero seleccioná una fotografía.');return;}
 $('pizAI').disabled=true;notify('Consultando IA…');
 try{
  const url=window.VIYEDI_PIZARRA_API||'http://127.0.0.1:8787/api/pizarra';
  const r=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image})});
  const j=await r.json();if(!r.ok)throw Error(j.error||'Error del servidor');
  if(j.tipo!=='pizarra'){rows=[];render();notify('Imagen ajena o dudosa: no se importó ninguna jornada.');return;}
  rows=(j.filas||[]).map(x=>({nombre:x.nombre||'',actividad:x.actividad||'Desconocida',tandas:x.tandas||[],total_escrito:x.total_escrito??null,worker:known().find(n=>n.toLowerCase()===(x.nombre||'').toLowerCase())||''}));
  const key=fingerprint($('pizDate').value,rows);const duplicado=semanticSeen.has(key);semanticSeen.add(key);
  render();notify(duplicado?'Posible jornada DUPLICADA: ya analizaste los mismos nombres y tandas en esta sesión. Revisá el registro anterior.':'Datos propuestos por IA: '+rows.length+' filas. Corregí nombres y cantidades antes de exportar.');
  const nuevo=rows.findIndex(f=>f.nombre&&!f.worker&&!f.tipoPersona);if(nuevo>=0)abrirDesconocido(nuevo);
 }catch(e){notify('API no disponible: '+e.message+'. Podés usar el registro manual o el ejemplo.');}
 finally{$('pizAI').disabled=false;}
};
$('pizExample').onclick=()=>{
 rows=[];[{nombre:'Dabeiba',tandas:[233,169],total_escrito:402},{nombre:'Miguel',tandas:[140,85],total_escrito:225},{nombre:'Marcelo',tandas:[78,62],total_escrito:140},{nombre:'Juana',tandas:[209,144],total_escrito:353}].forEach(x=>add({...x,actividad:'Pelador'}));
 add({nombre:'Macayo (?)',actividad:'Matador',tandas:[]});$('pizDate').value='2026-11-09';notify('Ejemplo cargado manualmente (no leído por IA). Total del pelado 1.120.');abrirDesconocido(rows.length-1);
};
$('pizAdd').onclick=()=>add();
$('pizExport').onclick=()=>{
 if(!rows.length){notify('No hay filas para exportar.');return;}
 const payload={estado:'BORRADOR_SIN_GUARDAR',fecha:$('pizDate').value,archivo:filename,filas:rows.map(x=>({...x,total_calculado:total(x),pendiente:!x.worker||x.tipoPersona==='alta_pendiente'||x.actividad==='Desconocida'||total(x)===null||(x.total_escrito!==null&&x.total_escrito!==total(x)),tipoPersona:x.tipoPersona||''})),nota:'Comparación con boletas solo preliminar: no determina faltantes ni autoriza descuentos'};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');
 a.href=url;a.download='borrador_viyedi_pizarra.json';a.click();URL.revokeObjectURL(url);notify('Descargado el borrador; la planilla real no cambió.');
};
render();
})();