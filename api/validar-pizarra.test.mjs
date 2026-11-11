import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarPizarra, evaluarCuadre } from './validar-pizarra.mjs';

test('rechaza documentos que no sean pizarra sin importar trabajadores', () => {
  const r=normalizarPizarra({tipo:'otro',filas:[{nombre:'Banco',actividad:'Pelador',tandas:[10],total_escrito:10}]});
  assert.equal(r.filas.length,0);assert.equal(r.tipo,'otro');
});
test('suma las tandas determinísticamente y señala diferencias',()=>{
  const r=normalizarPizarra({tipo:'pizarra',filas:[{nombre:'Juana',actividad:'Pelador',tandas:[209,144],total_escrito:354}]});
  assert.equal(r.filas[0].total,353);assert.equal(r.filas[0].estado,'revisar');
});
test('no convierte números ilegibles a cero',()=>{
  const r=normalizarPizarra({tipo:'pizarra',filas:[{nombre:'X',actividad:'Pelador',tandas:[200,null],total_escrito:null}]});
  assert.equal(r.filas[0].total,null);assert.equal(r.filas[0].estado,'revisar');
});
test('distingue actividades sin cantidades',()=>{
  const r=normalizarPizarra({tipo:'pizarra',filas:[{nombre:'Marcelo',actividad:'Champador',tandas:[],total_escrito:null}]});
  assert.equal(r.filas[0].total,null);
});
test('observación por diferencia menor a diez',()=>{ const r=evaluarCuadre({recibidos:1200,pelados:1195}); assert.equal(r.diferencia,5); assert.equal(r.estado,'observacion'); assert.equal(r.condicion,'preliminar'); });
test('diez exactos activa alerta urgente',()=>{ const r=evaluarCuadre({recibidos:1200,pelados:1190}); assert.equal(r.estado,'urgente'); assert.equal(r.diferencia,10); });
test('exceso de pelado activa alerta urgente',()=>{ const r=evaluarCuadre({recibidos:1200,pelados:1211}); assert.equal(r.estado,'urgente'); assert.equal(r.diferencia,-11); });
test('datos ausentes permanecen pendientes',()=>{assert.equal(evaluarCuadre({recibidos:null,pelados:100}).estado,'pendiente');assert.equal(evaluarCuadre({recibidos:1200,pelados:null}).estado,'pendiente');});
test('existencias cambian comparación y estado a conciliado',()=>{const r=evaluarCuadre({recibidos:1200,pelados:1190,saldoInicial:0,bajas:10,saldoFinal:0});assert.equal(r.diferencia,0);assert.equal(r.estado,'coincide');assert.equal(r.condicion,'conciliado');});
