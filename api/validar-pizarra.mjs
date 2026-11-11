// Extracción en BORRADOR. Jamás modifica planillas.
const ACTIVIDADES=new Set(['Pelador','Matador','Champador','Pintador','Ayudante','Ayudó a champar','Lava cajas','Limpieza general','Desconocida']);
export function normalizarPizarra(raw){
 const tipo=['pizarra','otro','dudosa'].includes(raw?.tipo)?raw.tipo:'dudosa';
 const advertencias=Array.isArray(raw?.advertencias)?raw.advertencias.filter(x=>typeof x==='string').slice(0,20):[];
 if(tipo!=='pizarra')return {tipo,fecha_texto:raw?.fecha_texto||'',filas:[],advertencias:[...advertencias,'Imagen no confirmada como pizarra de producción']};
 const filas=(Array.isArray(raw?.filas)?raw.filas:[]).slice(0,80).map(f=>{
  const nombre=typeof f?.nombre==='string'?f.nombre.trim().slice(0,100):'';
  const actividad=ACTIVIDADES.has(f?.actividad)?f.actividad:'Desconocida';
  const tandas=(Array.isArray(f?.tandas)?f.tandas:[]).slice(0,16).map(v=>Number.isSafeInteger(v)&&v>=0?v:null);
  const total=tandas.length&&tandas.every(v=>v!==null)?tandas.reduce((a,b)=>a+b,0):null;
  const totalEscrito=Number.isSafeInteger(f?.total_escrito)&&f.total_escrito>=0?f.total_escrito:null;
  const observacion=typeof f?.observacion==='string'?f.observacion.slice(0,300):'';
  const estado=!nombre||actividad==='Desconocida'||total===null||(totalEscrito!==null&&totalEscrito!==total)||f?.dudoso===true?'revisar':'verificar';
  return {nombre,actividad,tandas,total,total_escrito:totalEscrito,observacion,estado};
 });
 return {tipo,fecha_texto:typeof raw?.fecha_texto==='string'?raw.fecha_texto.slice(0,70):'',filas,advertencias};
}