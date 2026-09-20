
/* NOTA002_PROTOTIPO — Usuarios, estructura organizativa y auditoría resumida */
(function(){
const qsa=s=>[...document.querySelectorAll(s)];
S.audit=S.audit||[];
S.users=S.users||[];
S.workers=S.workers||[];
S.workers=S.workers.map((w,i)=>({...w,id:w.id||('wrk-'+i+'-'+String(w.name||'').toLowerCase().replace(/\s+/g,'-')),status:w.status||'Activo',phone:w.phone||'',ci:w.ci||'',skills:w.skills||[],notes:w.notes||'',startDate:w.startDate||''}));
S.users=S.users.map((u,i)=>({...u,id:u.id||('usr-'+i+'-'+String(u.username||'').toLowerCase()),profile:u.profile||'Sin definir',scope:u.scope||'one',branches:u.branches||((u.branch&&u.branch!=='Todas')?[u.branch]:[]),lastLogin:u.lastLogin||'',lastActivity:u.lastActivity||''}));
S.audit=S.audit.filter(a=>!a.at||Date.now()-new Date(a.at).getTime()<=90*24*60*60*1000);
persist();

let currentSession=JSON.parse(sessionStorage.getItem('viyediSession')||'null');
let selectedUserId=null;

function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function when(v){if(!v)return '—';let d=new Date(v);return d.toLocaleString('es-BO',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function nowISO(){return new Date().toISOString()}
function actor(){if(currentSession?.root)return 'Victor (raíz)';let u=S.users.find(x=>x.id===currentSession?.userId);return u?.name||u?.username||'Sin identificar'}
function audit(action,detail,userId=currentSession?.userId||null){
  let at=nowISO(),who=actor();
  S.audit.unshift({id:'aud-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),userId,user:who,at,action,detail});
  S.audit=S.audit.filter(a=>Date.now()-new Date(a.at).getTime()<=90*24*60*60*1000).slice(0,1500);
  if(userId){let u=S.users.find(x=>x.id===userId);if(u)u.lastActivity=at}
  persist();
}
async function hashText(t){
  if(!window.crypto?.subtle) return 'fallback:'+btoa(unescape(encodeURIComponent(t)));
  let data=new TextEncoder().encode(t),buf=await crypto.subtle.digest('SHA-256',data);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function passwordSuggestion(){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out='';for(let i=0;i<8;i++)out+=chars[Math.floor(Math.random()*chars.length)];
  return out.slice(0,4)+'-'+out.slice(4);
}
function cleanName(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9 ]/g,' ').trim()}
function usernameSuggestion(name){
  let parts=cleanName(name).toUpperCase().split(/\s+/).filter(Boolean),base=(parts[0]||'USER').slice(0,12);
  let used=S.users.map(u=>String(u.username||'').toUpperCase());
  if(used.some(u=>u.startsWith(base))&&parts.length>1)base=(parts[0][0]+parts[parts.length-1]).slice(0,12);
  let n=1,candidate='';do{candidate=base+String(n).padStart(2,'0');n++}while(used.includes(candidate));
  return candidate;
}
function branchesAll(){return ['Matadero',...S.branches.map(b=>b.name)]}
function fill002(){
  if($('uWorker'))$('uWorker').innerHTML=S.workers.map(w=>'<option value="'+esc(w.id)+'">'+esc(w.name)+' · '+esc(w.section)+'</option>').join('');
  if($('aBranch'))$('aBranch').innerHTML=branchesAll().map(b=>'<option>'+esc(b)+'</option>').join('');
  if($('uBranchChecks'))$('uBranchChecks').innerHTML=branchesAll().map(b=>'<label><input class="ubranch" type="checkbox" value="'+esc(b)+'"> '+esc(b)+'</label>').join('');
}
const baseFill=fillSelects;fillSelects=function(){baseFill();fill002()};

function syncUserSource(){
  let worker=$('uSource').value==='worker';
  $('uWorkerWrap').classList.toggle('hidden',!worker);
  $('uNameWrap').classList.toggle('hidden',worker);
  if(worker){
    let w=S.workers.find(x=>x.id===$('uWorker').value)||S.workers[0];
    if(w){$('uName').value=w.name;$('uProfile').value=w.section==='Producción'?'Producción':'Tienda / Sucursal'}
  }
  suggestUsername();
}
function syncScope(){
  let s=$('uScope').value;
  $('uBranchWrap').classList.toggle('hidden',s==='all'||s==='multi');
  $('uBranchMultiWrap').classList.toggle('hidden',s!=='multi');
}
function suggestUsername(){
  let name=$('uSource').value==='worker'?(S.workers.find(x=>x.id===$('uWorker').value)?.name||''):$('uName').value;
  if(name)$('uUser').value=usernameSuggestion(name);
}
function resetUserForm(){
  $('uSource').value='direct';$('uName').value='';$('uUser').value='';delete $('uUser').dataset.manual;
  $('uPass').value=passwordSuggestion();$('uProfile').value='Propietario';$('uScope').value='all';
  qsa('#userModal .perm').forEach(x=>x.checked=false);qsa('.ubranch').forEach(x=>x.checked=false);
  syncUserSource();syncScope();
}
$('uSource').onchange=syncUserSource;
$('uWorker').onchange=syncUserSource;
$('uScope').onchange=syncScope;
$('uName').oninput=()=>{if(!$('uUser').dataset.manual)suggestUsername()};
$('uUser').oninput=()=>$('uUser').dataset.manual='1';
$('suggestUser').onclick=()=>{delete $('uUser').dataset.manual;suggestUsername()};
$('suggestPass').onclick=()=>$('uPass').value=passwordSuggestion();
qsa('[data-open="userModal"]').forEach(b=>b.addEventListener('click',()=>{fill002();resetUserForm()}));

$('saveUser').onclick=async()=>{
  let source=$('uSource').value,worker=source==='worker'?S.workers.find(x=>x.id===$('uWorker').value):null;
  let name=(worker?.name||$('uName').value).trim(),username=$('uUser').value.trim(),pass=$('uPass').value.trim();
  if(!name||!username||!pass)return toast('Faltan nombre, usuario o contraseña');
  if(S.users.some(x=>String(x.username).toLowerCase()===username.toLowerCase()))return toast('Ese usuario ya existe');
  let scope=$('uScope').value,branches=scope==='all'?[]:scope==='one'?[$('uBranch').value]:qsa('.ubranch:checked').map(x=>x.value);
  if(scope!=='all'&&!branches.length)return toast('Elegí al menos una sucursal');
  let perms=qsa('#userModal .perm:checked').map(x=>x.value);
  let u={id:'usr-'+Date.now(),name,username,profile:$('uProfile').value,workerId:worker?.id||null,scope,branches,branch:scope==='all'?'Todas':branches.join(', '),perms,status:'Activo',passwordHash:await hashText(pass),mustChange:true,createdAt:nowISO(),lastLogin:'',lastActivity:''};
  S.users.push(u);persist();audit('Usuario creado',name+' · '+username+' · '+u.profile,u.id);
  $('userModal').classList.remove('show');render();toast('Usuario creado');
};

function syncWorkerForm(){
  let prod=$('wType').value==='Producción';
  $('wSection').value=$('wType').value;
  $('wSkillsWrap').classList.toggle('hidden',!prod);
  if(prod&&$('wBranch'))$('wBranch').value='Matadero';
}
$('wType').onchange=syncWorkerForm;
qsa('[data-open="workerModal"]').forEach(b=>b.addEventListener('click',()=>{
  $('wType').value='Tienda / Sucursal';$('wName').value='';$('wCi').value='';$('wPhone').value='';$('wStart').value=today();$('wStatus').value='Activo';$('wNotes').value='';qsa('.wskill').forEach(x=>x.checked=false);syncWorkerForm()
}));
$('saveWorker').onclick=()=>{
  let name=$('wName').value.trim(),type=$('wType').value;if(!name)return toast('Falta nombre');
  S.workers.push({id:'wrk-'+Date.now(),name,section:type,branch:$('wBranch').value||'Matadero',ci:$('wCi').value.trim(),phone:$('wPhone').value.trim(),startDate:$('wStart').value||today(),status:$('wStatus').value,skills:qsa('.wskill:checked').map(x=>x.value),notes:$('wNotes').value.trim(),rate:'Según actividad diaria'});
  persist();audit('Trabajador creado',name+' · '+type);$('workerModal').classList.remove('show');render();toast('Trabajador creado');
};

renderWorkers=function(){
  $('workerBody').innerHTML=S.workers.filter(w=>wf==='Todos'||w.section===wf).map(w=>'<tr><td><b>'+esc(w.name)+'</b></td><td>'+esc(w.section||'—')+'</td><td>'+esc(w.branch||'—')+'</td><td>'+esc(w.phone||'—')+'</td><td><span class="badge '+(w.status==='Activo'?'ok':'off')+'">'+esc(w.status||'Activo')+'</span></td></tr>').join('')||'<tr><td colspan="5" class="muted">Sin trabajadores registrados.</td></tr>';
};

function permissionLabel(p){
  let m={'users.view':'Usuarios · Ver','users.manage':'Usuarios · Administrar','logistics.view':'Logística · Ver despachos','logistics.register':'Logística · Registrar despachos','production.live.view':'Pollo vivo · Ver','production.live.register':'Pollo vivo · Registrar','production.live.edit':'Pollo vivo · Editar','production.live.receipt':'Pollo vivo · Ver boleta','production.daily.view':'Producción diaria · Ver','production.daily.register':'Producción diaria · Registrar','production.daily.edit':'Producción diaria · Editar','production.week.view':'Planilla · Ver','production.week.edit':'Planilla · Modificar','production.week.advance':'Planilla · Adelantos','production.week.discount':'Planilla · Descuentos','production.week.control':'Planilla · Control vivo/pelado','production.week.export':'Planilla · Exportar','commercial.view':'Clientes/Cobranza · Ver','commercial.collect':'Clientes/Cobranza · Cobrar','commercial.approve':'Clientes · Aprobar','branches.view':'Sucursales · Ver','workers.view':'Trabajadores · Ver','workers.advance':'Trabajadores · Adelantos','reports.view':'Reportes · Ver'};
  return m[p]||p
}
function userScopeText(u){if(u.scope==='all'||u.branch==='Todas')return 'Todas';return (u.branches||[]).join(', ')||u.branch||'—'}
function renderUsers002(){
  $('userBody').innerHTML=S.users.map(u=>'<tr class="click-row user-row" data-id="'+esc(u.id)+'"><td><b>'+esc(u.name)+'</b></td><td>'+esc(u.username)+'</td><td>'+esc(u.profile||'—')+'</td><td>'+esc(userScopeText(u))+'</td><td>'+when(u.lastLogin)+'</td><td><span class="badge '+(u.status==='Activo'?'ok':'off')+'">'+esc(u.status)+'</span></td></tr>').join('')||'<tr><td colspan="6" class="muted">Todavía no hay usuarios creados.</td></tr>';
  qsa('.user-row').forEach(r=>r.onclick=()=>openUserDetail(r.dataset.id));
}
function auditFor(u){return S.audit.filter(a=>a.userId===u.id).slice(0,20)}
function renderDetailPerms(u){
  const groups=[
    ['Usuarios',['users.view','users.manage']],['Logística',['logistics.view','logistics.register']],['Pollo vivo',['production.live.view','production.live.register','production.live.edit','production.live.receipt']],
    ['Producción diaria',['production.daily.view','production.daily.register','production.daily.edit']],['Planilla semanal',['production.week.view','production.week.edit','production.week.advance','production.week.discount','production.week.control','production.week.export']],
    ['Clientes y Cobranza',['commercial.view','commercial.collect','commercial.approve']],['Sucursales',['branches.view']],['Trabajadores',['workers.view','workers.advance']],['Reportes',['reports.view']]
  ];
  $('udPerms').innerHTML=groups.map(g=>{
    let name=g[0],ps=g[1];
    return '<div class="perm-group"><b>'+name+'</b>'+ps.map(p=>'<label><input class="udperm" type="checkbox" value="'+p+'" '+((u.perms||[]).includes(p)?'checked':'')+'> '+permissionLabel(p).split(' · ').slice(-1)[0]+'</label>').join('')+'</div>'
  }).join('');
}
function openUserDetail(id){
  selectedUserId=id;let u=S.users.find(x=>x.id===id);if(!u)return;
  $('udTitle').textContent=u.name;
  $('udSubtitle').textContent=u.username+' · '+(u.profile||'Sin perfil')+' · '+userScopeText(u);
  $('udLastLogin').textContent=when(u.lastLogin);$('udLastActivity').textContent=when(u.lastActivity);$('udStatus').textContent=u.status;
  $('udAccess').innerHTML='<b>Perfil:</b> '+esc(u.profile||'—')+'<br><b>Ámbito:</b> '+esc(userScopeText(u))+'<br><b>Vinculado:</b> '+(u.workerId?'Trabajador':'Persona administrativa/directiva');
  let items=auditFor(u);
  $('udAudit').innerHTML=items.length?items.map(a=>'<div class="discount-item"><b>'+esc(a.action)+' · '+when(a.at)+'</b><span>'+esc(a.detail||'')+'</span></div>').join(''):'<div class="muted">Sin actividad importante registrada.</div>';
  $('udTempPass').classList.add('hidden');renderDetailPerms(u);$('userDetailModal').classList.add('show');
}
$('udSavePerms').onclick=()=>{
  let u=S.users.find(x=>x.id===selectedUserId);if(!u)return;
  u.perms=qsa('.udperm:checked').map(x=>x.value);persist();audit('Permisos modificados',u.username+': '+u.perms.length+' permisos',u.id);openUserDetail(u.id);render();toast('Permisos guardados')
};
$('udToggleStatus').onclick=()=>{
  let u=S.users.find(x=>x.id===selectedUserId);if(!u)return;
  u.status=u.status==='Activo'?'Bloqueado':'Activo';persist();audit('Estado de usuario modificado',u.username+': '+u.status,u.id);openUserDetail(u.id);render();toast('Estado actualizado')
};
$('udResetPass').onclick=async()=>{
  let u=S.users.find(x=>x.id===selectedUserId);if(!u)return;
  let pass=passwordSuggestion();u.passwordHash=await hashText(pass);u.mustChange=true;persist();audit('Contraseña temporal generada',u.username,u.id);
  $('udTempPass').textContent='Contraseña temporal: '+pass+' · Se muestra para que la copies ahora.';$('udTempPass').classList.remove('hidden');toast('Contraseña temporal generada')
};

$('saveAdvance').onclick=()=>{
  let amount=num($('aAmount').value),worker=$('aWorker').value,reason=$('aReason').value.trim(),d=stamp(),date=$('aDate').value||d.date;
  if(amount<=0)return toast('Monto inválido');if(!worker)return toast('Elegí trabajador');if(!reason)return toast('Escribí el detalle / motivo');
  let a={worker,amount,date,time:d.time,type:$('aType').value,branch:$('aBranch').value,reason,by:actor(),status:'Pendiente'};
  S.advances.unshift(a);persist();audit('Adelanto registrado',worker+' · '+money(amount)+' · '+a.type+' · '+reason);
  $('advanceModal').classList.remove('show');render();renderWeek();toast('Adelanto registrado');
};

const baseRender=render;
render=function(){
  baseRender();fill002();renderUsers002();renderWorkers();
  $('advanceBody').innerHTML=S.advances.map(a=>'<tr><td><b>'+esc(a.worker)+'</b></td><td>'+money(a.amount)+'</td><td>'+esc(a.date)+' '+esc(a.time||'')+'</td><td>'+esc(a.type||'—')+'</td><td>'+esc(a.reason||'—')+'<br><span class="muted">'+esc(a.branch||'')+'</span></td><td>'+esc(a.by||'—')+'</td><td><span class="badge '+(a.status==='Pendiente'?'wait':'ok')+'">'+esc(a.status||'Pendiente')+'</span></td></tr>').join('')||'<tr><td colspan="7" class="muted">Sin adelantos registrados.</td></tr>';
};

function accessPrefix(page){return {users:'users.',dispatch:'logistics.',production:'production.',commercial:'commercial.',branches:'branches.',workers:'workers.',reports:'reports.'}[page]||''}
function applyAccess(){
  qsa('.nav[data-page]').forEach(b=>{
    let p=b.dataset.page;
    if(p==='home'||currentSession?.root){b.style.display='';return}
    let u=S.users.find(x=>x.id===currentSession?.userId),prefix=accessPrefix(p);
    b.style.display=(u&&(u.perms||[]).some(x=>x.startsWith(prefix)))?'':'none'
  })
}
$('loginButton').onclick=async()=>{
  let un=$('loginUser').value.trim(),pw=$('loginPass').value;
  if(un==='victor28'&&pw==='demo123'){
    currentSession={root:true,userId:null,name:'Victor'};
    sessionStorage.setItem('viyediSession',JSON.stringify(currentSession));
    $('loginError').classList.remove('show');$('loginScreen').classList.add('hidden');$('appShell').classList.remove('hidden');
    audit('Inicio de sesión','Administrador raíz');applyAccess();render();return
  }
  let u=S.users.find(x=>String(x.username).toLowerCase()===un.toLowerCase());
  if(!u||u.status!=='Activo'||!u.passwordHash||u.passwordHash!==await hashText(pw)){$('loginError').classList.add('show');return}
  u.lastLogin=nowISO();u.lastActivity=u.lastLogin;currentSession={root:false,userId:u.id,name:u.name};
  sessionStorage.setItem('viyediSession',JSON.stringify(currentSession));persist();audit('Inicio de sesión','Acceso correcto',u.id);
  $('loginError').classList.remove('show');$('loginScreen').classList.add('hidden');$('appShell').classList.remove('hidden');applyAccess();render()
};
$('logoutButton').onclick=()=>{
  if(currentSession)audit('Cierre de sesión','Sesión cerrada');
  currentSession=null;sessionStorage.removeItem('viyediSession');$('appShell').classList.add('hidden');$('loginScreen').classList.remove('hidden');qsa('.nav[data-page]').forEach(b=>b.style.display='')
};

fill002();syncScope();syncWorkerForm();render();applyAccess();
})();
