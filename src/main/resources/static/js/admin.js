/**
 * Panel del administrador. Cada pestaña se describe con un objeto en TABS:
 *  url    → endpoint de la API        cols   → columnas de la tabla [clave, título, formateador]
 *  campos → campos del formulario     leer   → convierte una fila de la API en valores del formulario
 *  cuerpo → convierte el formulario en el JSON que espera la API
 * Así una sola función (ir) dibuja todas las pestañas.
 */
const u = sesion('ADMIN');
const si = v => v ? 'Sí' : 'No';
const nombre = x => x ? x.nombre : '—';

const TABS = {
  dashboard: { titulo: 'Resumen' },
  reportes: { titulo: 'Reportes de ventas', reporte: true },
  productos: { titulo: 'Productos', url: '/productos',
    cols: [['codigo', 'Código'], ['nombre', 'Nombre'], ['categoria', 'Categoría'], ['precioVenta', 'P. venta', fmt], ['precioCosto', 'P. costo', fmt], ['stock', 'Stock'], ['proveedor', 'Proveedor', nombre], ['activo', 'Activo', si]],
    campos: [{ k: 'codigo', l: 'Código' }, { k: 'nombre', l: 'Nombre' }, { k: 'categoria', l: 'Categoría' },
      { k: 'precioVenta', l: 'Precio de venta', t: 'number' }, { k: 'precioCosto', l: 'Precio de costo', t: 'number' },
      { k: 'stock', l: 'Stock', t: 'number' }, { k: 'stockMinimo', l: 'Stock mínimo', t: 'number' }, { k: 'imagenUrl', l: 'URL de la imagen' },
      { k: 'proveedorId', l: 'Proveedor', t: 'select', src: '/proveedores', etiqueta: p => p.nombre },
      { k: 'activo', l: 'Activo', t: 'select', lista: [['true', 'Sí'], ['false', 'No']] }],
    leer: r => ({ ...r, proveedorId: r.proveedor ? r.proveedor.id : '', activo: String(r.activo) }),
    cuerpo: v => ({ ...v, activo: v.activo !== 'false', proveedor: v.proveedorId ? { id: +v.proveedorId } : null }) },
  proveedores: { titulo: 'Proveedores', url: '/proveedores',
    cols: [['nombre', 'Nombre'], ['nit', 'NIT'], ['telefono', 'Teléfono'], ['email', 'Correo'], ['activo', 'Activo', si]],
    campos: [{ k: 'nombre', l: 'Nombre' }, { k: 'nit', l: 'NIT' }, { k: 'telefono', l: 'Teléfono' }, { k: 'email', l: 'Correo' }, { k: 'direccion', l: 'Dirección' }],
    leer: r => r, cuerpo: v => v },
  ventas: { titulo: 'Ventas', url: '/ventas', soloLectura: true,
    cols: [['numeroFactura', 'Factura'], ['fecha', 'Fecha', f => new Date(f).toLocaleString('es-CO')], ['vendedor', 'Vendedor', x => x ? x.nombre : 'Tienda en línea'], ['cliente', 'Cliente', x => x ? x.nombre : 'Mostrador'], ['tipoVenta', 'Tipo'], ['total', 'Total', fmt], ['gananciaTotal', 'Ganancia', fmt], ['estado', 'Estado']],
    extra: [['Ver factura', 'info', v => verFactura(v)],
      ['Cancelar venta', 'mal', async v => { if (confirm('¿Cancelar esta venta? El stock volverá al inventario.')) { await api('/ventas/' + v.id + '/cancelar', { method: 'PUT' }); ir('ventas'); } }]] },
  usuarios: { titulo: 'Usuarios', url: '/usuarios',
    cols: [['nombre', 'Nombre'], ['usuario', 'Usuario'], ['rol', 'Rol'], ['salario', 'Salario', fmt], ['telefono', 'Teléfono'], ['activo', 'Activo', si]],
    campos: [{ k: 'nombre', l: 'Nombre' }, { k: 'usuario', l: 'Usuario' }, { k: 'password', l: 'Contraseña (vacía = no cambiar)', t: 'password' },
      { k: 'rol', l: 'Rol', t: 'select', lista: [['ADMIN', 'Administrador'], ['VENDEDOR', 'Vendedor'], ['CLIENTE', 'Cliente']] },
      { k: 'salario', l: 'Salario (vendedores)', t: 'number' }, { k: 'direccion', l: 'Dirección' }, { k: 'telefono', l: 'Teléfono' },
      { k: 'activo', l: 'Activo', t: 'select', lista: [['true', 'Sí'], ['false', 'No']] }],
    leer: r => ({ ...r, password: '', activo: String(r.activo) }),
    cuerpo: v => ({ ...v, activo: v.activo !== 'false' }) },
  pagos: { titulo: 'Pagos a empleados', url: '/pagos',
    cols: [['empleado', 'Empleado', nombre], ['periodo', 'Periodo'], ['salarioBase', 'Salario base', fmt], ['bonificacion', 'Bonificación', fmt], ['deducciones', 'Deducciones', fmt], ['totalPago', 'Total pagado', fmt], ['fecha', 'Fecha']],
    campos: [{ k: 'empleadoId', l: 'Empleado', t: 'select', src: '/usuarios', filtro: x => x.rol === 'VENDEDOR' && x.activo, etiqueta: x => x.nombre },
      { k: 'periodo', l: 'Periodo (ej: Octubre 2026)' }, { k: 'salarioBase', l: 'Salario base', t: 'number' },
      { k: 'bonificacion', l: 'Bonificación', t: 'number' }, { k: 'deducciones', l: 'Deducciones', t: 'number' }, { k: 'concepto', l: 'Concepto' }],
    leer: r => ({ ...r, empleadoId: r.empleado ? r.empleado.id : '' }),
    cuerpo: v => ({ ...v, empleado: v.empleadoId ? { id: +v.empleadoId } : null }) },
  gastos: { titulo: 'Gastos operativos', url: '/gastos',
    cols: [['fecha', 'Fecha'], ['categoria', 'Categoría'], ['descripcion', 'Descripción'], ['total', 'Total', fmt]],
    campos: [{ k: 'fecha', l: 'Fecha', t: 'date' }, { k: 'categoria', l: 'Categoría' }, { k: 'descripcion', l: 'Descripción' },
      { k: 'detallesTxt', l: 'Detalle: una línea por gasto → concepto;cantidad;valor unitario', t: 'textarea' }],
    leer: r => ({ ...r, detallesTxt: r.detalles.map(d => [d.concepto, d.cantidad, d.valorUnitario].join(';')).join('\n') }),
    cuerpo: v => ({ fecha: v.fecha || null, categoria: v.categoria, descripcion: v.descripcion,
      detalles: (v.detallesTxt || '').split('\n').filter(l => l.trim()).map(l => { const [c, q, p] = l.split(';'); return { concepto: c.trim(), cantidad: +q || 1, valorUnitario: +p || 0 }; }) }) }
};

let tab = 'dashboard', filas = [], opciones = {}, seleccion = null;

const ICONOS_MENU = {
  dashboard:'<path d="M3 3h7v7H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 14h7v7H3z"/>',
  reportes:'<path d="M4 19V5M4 19h17M8 15v-4M13 15V7M18 15V3"/>',
  productos:'<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5M12 13v8"/>',
  proveedores:'<path d="M3 21V5l9-3 9 3v16"/><path d="M8 21v-5h8v5M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01"/>',
  ventas:'<path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/>',
  usuarios:'<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  pagos:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
  gastos:'<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'
};
const iconoMenu = k => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONOS_MENU[k] || ICONOS_MENU.dashboard}</svg>`;
$('menu').innerHTML = Object.entries(TABS).map(([k, t]) => `<button data-t="${k}" title="${t.titulo}" aria-label="${t.titulo}"><span class="nav-icon">${iconoMenu(k)}</span><span class="nav-label">${t.titulo}</span></button>`).join('');
if (typeof configurarMenuLateral === 'function') configurarMenuLateral();
$('menu').onclick = e => { const b = e.target.closest('button[data-t]'); if (b) ir(b.dataset.t); };

async function ir(nombreTab) {
  tab = nombreTab; seleccion = null;
  document.querySelectorAll('#menu button').forEach(b => b.classList.toggle('on', b.dataset.t === tab));
  $('titulo').textContent = TABS[tab].titulo;
  try {
    if (tab === 'dashboard') return await dashboard();
    if (tab === 'reportes') return await pintarReportes();
    const t = TABS[tab];
    filas = await api(t.url);
    for (const c of (t.campos || []).filter(c => c.src)) opciones[c.k] = (await api(c.src)).filter(c.filtro || (() => true));
    pintar();
  } catch (e) { $('contenido').innerHTML = `<div class="msg err">${e.message}</div>`; }
}

function tablaHtml(cols, datos, conIndice) {
  return `<div class="tabla-wrap"><table><thead><tr>${cols.map(c => `<th>${c[1]}</th>`).join('')}</tr></thead><tbody>` +
    (datos.map((r, i) => `<tr ${conIndice ? `data-i="${i}"` : ''}>${cols.map(c => `<td>${(c[2] ? c[2](r[c[0]]) : r[c[0]]) ?? ''}</td>`).join('')}</tr>`).join('')
      || `<tr><td colspan="${cols.length}">Aún no hay registros.</td></tr>`) + '</tbody></table></div>';
}

function pintar() {
  const t = TABS[tab];
  let h = tablaHtml(t.cols, filas, true);
  if (t.soloLectura) {
    h += `<div class="acciones">${t.extra.map((x, i) => `<button class="btn ${x[1]}" data-x="${i}">${x[0]}</button>`).join('')}</div><div class="msg" id="msg"></div>`;
  } else {
    h += '<div class="panel"><div class="form">' + t.campos.map(c => {
      let ctl;
      if (c.t === 'select') {
        const lista = c.lista || [['', '— Sin selección —'], ...opciones[c.k].map(o => [o.id, c.etiqueta(o)])];
        ctl = `<select id="f_${c.k}">${lista.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>`;
      } else if (c.t === 'textarea') ctl = `<textarea id="f_${c.k}" rows="4"></textarea>`;
      else if (tab === 'productos' && c.k === 'categoria') ctl = `<input id="f_${c.k}" list="categorias-sugeridas" placeholder="Ej. Escritura, Cuadernos, Arte..."><datalist id="categorias-sugeridas">${[...new Set(filas.map(p => p.categoria).filter(Boolean))].sort().map(c => `<option value="${String(c).replace(/[&<>"]/g, '')}">`).join('')}</datalist>`;
      else ctl = `<input id="f_${c.k}" type="${c.t || 'text'}" ${c.t === 'number' ? 'step="any"' : ''}>`;
      return `<div><label for="f_${c.k}">${c.l}</label>${ctl}</div>`;
    }).join('') + '</div><div class="acciones"><button class="btn ok" id="guardar">Guardar</button><button class="btn gris" id="nuevo">Nuevo</button>' +
      (tab === 'pagos' || tab === 'gastos' ? '' : '<button class="btn mal" id="borrar">Desactivar</button>') + '</div><div class="msg" id="msg"></div></div>';
  }
  $('contenido').innerHTML = h;
}

$('contenido').onclick = async e => {
  const t = TABS[tab], tr = e.target.closest('tr[data-i]');
  if (tr) {
    seleccion = filas[+tr.dataset.i];
    document.querySelectorAll('tbody tr').forEach(r => r.classList.toggle('sel', r === tr));
    if (!t.soloLectura) { const v = t.leer(seleccion); t.campos.forEach(c => { $('f_' + c.k).value = v[c.k] ?? ''; }); }
  }
  try {
    if (e.target.dataset.x !== undefined) {
      if (!seleccion) return aviso('Selecciona una fila primero');
      await t.extra[+e.target.dataset.x][2](seleccion);
    }
    if (e.target.id === 'nuevo') { seleccion = null; pintar(); }
    if (e.target.id === 'guardar') {
      const v = {};
      t.campos.forEach(c => { const x = $('f_' + c.k).value; v[c.k] = c.t === 'number' ? (x === '' ? 0 : parseFloat(x)) : x; });
      await api(t.url + (seleccion ? '/' + seleccion.id : ''), { method: seleccion ? 'PUT' : 'POST', body: t.cuerpo(v) });
      await ir(tab); aviso('Guardado correctamente', true);
    }
    if (e.target.id === 'borrar') {
      if (!seleccion) return aviso('Selecciona una fila primero');
      if (confirm('¿Desactivar este registro? Seguirá guardado pero ya no se usará.')) { await api(t.url + '/' + seleccion.id, { method: 'DELETE' }); await ir(tab); aviso('Registro desactivado', true); }
    }
  } catch (err) { aviso(err.message); }
};

function aviso(t, ok) { const m = $('msg'); if (m) { m.className = 'msg ' + (ok ? 'ok' : 'err'); m.textContent = t; } }

async function pintarReportes() {
  const [ventas, dashboardData] = await Promise.all([api('/ventas'), api('/dashboard')]);
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;
  $('contenido').innerHTML = `
    <section class="dash-welcome"><div><span class="dash-eyebrow"><i></i> INFORMES DEL NEGOCIO</span><h2>Ventas con datos claros.</h2><p>Filtra las facturas por fecha, revisa ingresos y ganancias estimadas, y exporta los resultados a CSV para abrirlos en Excel.</p></div></section>
    <section class="dash-panel" style="padding:22px;margin-bottom:18px"><div class="form"><div><label for="reporteDesde">Desde</label><input id="reporteDesde" type="date" value="${new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().slice(0,10)}"></div><div><label for="reporteHasta">Hasta</label><input id="reporteHasta" type="date" value="${fechaHoy}"></div><div><label for="reporteEstado">Estado</label><select id="reporteEstado"><option value="TODAS">Todas las ventas</option><option value="COMPLETADA">Completadas</option><option value="EN_CAMINO">En camino</option><option value="CANCELADA">Canceladas</option></select></div></div><div class="acciones"><button class="btn ok" id="aplicarReporte">Aplicar filtros</button><button class="btn info" id="exportarReporte">Exportar CSV para Excel</button></div></section>
    <div id="reporteResultados"></div>`;
  const pintar = () => {
    const desde = $('reporteDesde').value, hasta = $('reporteHasta').value, estado = $('reporteEstado').value;
    if (desde && hasta && desde > hasta) { $('reporteResultados').innerHTML = '<div class="msg err">La fecha inicial no puede ser posterior a la fecha final.</div>'; return []; }
    const datos = ventas.filter(v => { const dia = String(v.fecha || '').slice(0,10); return (!desde || dia >= desde) && (!hasta || dia <= hasta) && (estado === 'TODAS' || v.estado === estado); });
    const activas = datos.filter(v => v.estado !== 'CANCELADA');
    const ingresos = activas.reduce((a,v)=>a+Number(v.total||0),0);
    const ganancia = activas.reduce((a,v)=>a+Number(v.gananciaTotal||0),0);
    const fmtFecha = v => v.fecha ? new Date(v.fecha).toLocaleString('es-CO') : '—';
    const esc = v => String(v ?? '').replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
    $('reporteResultados').innerHTML = `<section class="dash-kpis">${[["Ventas filtradas",datos.length,"▤"],["Ingresos (no canceladas)",fmt(ingresos),"↗"],["Ganancia bruta estimada",fmt(ganancia),"◈"]].map((x,i)=>`<article class="dash-kpi" style="--kpi:${['#6d63ff','#16b8a6','#f59e0b'][i]}"><div class="kpi-top"><span>${x[0]}</span><i>${x[2]}</i></div><strong>${x[1]}</strong><small>${i===0?'Según los filtros seleccionados':i===1?'Excluye ventas canceladas':'Antes de gastos y nómina'}</small></article>`).join('')}</section><section class="dash-panel" style="padding:22px"><div class="dash-panel-head"><div><span class="panel-kicker">DETALLE DE FACTURAS</span><h3>Resultado del periodo</h3><p>La ganancia se calcula con los costos registrados al momento de la venta.</p></div></div><div class="tabla-wrap"><table><thead><tr><th>Factura</th><th>Fecha</th><th>Vendedor</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Ganancia</th></tr></thead><tbody>${datos.slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).map(v=>`<tr><td>${esc(v.numeroFactura||v.id)}</td><td>${esc(fmtFecha(v))}</td><td>${esc(v.vendedor?.nombre||'—')}</td><td>${esc(v.cliente?.nombre||'Mostrador')}</td><td>${esc(v.estado||'—')}</td><td><b>${fmt(v.total)}</b></td><td>${fmt(v.gananciaTotal)}</td></tr>`).join('')||'<tr><td colspan="7">No hay ventas para estos filtros.</td></tr>'}</tbody></table></div></section>`;
    return datos;
  };
  let filtradas = pintar();
  $('aplicarReporte').onclick = () => { filtradas = pintar(); };
  $('exportarReporte').onclick = () => {
    filtradas = pintar(); if (!Array.isArray(filtradas)) return;
    const columnas = ['Factura','Fecha','Vendedor','Cliente','Tipo','Estado','Subtotal','Domicilio','Total','Ganancia bruta'];
    const celdas = v => `"${String(v ?? '').replace(/"/g,'""')}"`;
    const filasCsv = filtradas.map(v => [v.numeroFactura,v.fecha,v.vendedor?.nombre||'',v.cliente?.nombre||'Mostrador',v.tipoVenta,v.estado,v.subtotal,v.costoDomicilio,v.total,v.gananciaTotal].map(celdas).join(';'));
    const blob = new Blob(['\ufeff'+[columnas.map(celdas).join(';'),...filasCsv].join('\r\n')], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href=url; a.download='reporte-ventas-el-punto.csv'; a.click(); URL.revokeObjectURL(url);
  };
}

async function dashboard() {
  const d = await api('/dashboard');
  let ventas = [];
  try { ventas = await api('/ventas'); if (!Array.isArray(ventas)) ventas = []; } catch (_) { ventas = []; }

  const esc = v => String(v ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const card = (t, v, icon, trend, color, i) => `<article class="dash-kpi" style="--kpi:${color};--delay:${i*70}ms"><div class="kpi-top"><span>${t}</span><i>${icon}</i></div><strong>${v}</strong><small>${trend}</small><span class="kpi-glow"></span></article>`;
  const meses = [];
  const ahora = new Date();
  for (let i=5;i>=0;i--) { const dt = new Date(ahora.getFullYear(), ahora.getMonth()-i, 1); meses.push({key:`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`, label:dt.toLocaleDateString('es-CO',{month:'short'}).replace('.',''), total:0, count:0}); }
  ventas.forEach(v => {
    if (!v || !v.fecha || String(v.estado||'').toUpperCase()==='CANCELADA') return;
    const dt = new Date(v.fecha); if (Number.isNaN(dt.getTime())) return;
    const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
    const m = meses.find(x=>x.key===key); if (m) { m.total += Number(v.total||0); m.count++; }
  });
  const maxTotal = Math.max(1,...meses.map(m=>m.total));
  const bars = meses.map((m,i) => {
    const h = Math.max(4,(m.total/maxTotal)*126), x=48+i*76;
    return `<g class="chart-bar" style="--bar-delay:${i*90}ms"><rect x="${x}" y="${155-h}" width="32" height="${h}" rx="7" fill="url(#barGradient)"><title>${m.label}: ${fmt(m.total)}</title></rect><text x="${x+16}" y="179" text-anchor="middle">${esc(m.label)}</text></g>`;
  }).join('');
  const points = meses.map((m,i)=>`${64+i*76},${145-(m.total/maxTotal)*100}`).join(' ');
  const lineDots = meses.map((m,i)=>`<circle cx="${64+i*76}" cy="${145-(m.total/maxTotal)*100}" r="4"><title>${m.label}: ${fmt(m.total)}</title></circle>`).join('');
  const totalPeriodo = meses.reduce((a,m)=>a+m.total,0);
  const ventaPeriodo = meses.reduce((a,m)=>a+m.count,0);
  const promedio = ventaPeriodo ? totalPeriodo/ventaPeriodo : 0;
  const top = (d.topProductos||[]).slice(0,5);
  const topMax = Math.max(1,...top.map(p=>Number(p.unidades||0)));
  const topHtml = top.length ? top.map((p,i)=>`<div class="top-product" style="--delay:${i*75}ms"><div class="top-product-head"><span class="rank">${String(i+1).padStart(2,'0')}</span><div class="top-product-name"><b>${esc(p.producto)}</b><small>${Number(p.unidades||0)} unidades vendidas</small></div><strong>${fmt(p.ingresos)}</strong></div><div class="mini-track"><span style="width:${Math.max(3,Number(p.unidades||0)/topMax*100)}%"></span></div></div>`).join('') : '<p class="empty-chart">Todavía no hay suficientes ventas para mostrar el ranking.</p>';
  const stock = d.stockBajo||[];
  const stockHtml = stock.length ? stock.slice(0,5).map((p,i)=>`<div class="stock-row" style="--delay:${i*65}ms"><span class="stock-dot"></span><div><b>${esc(p.nombre)}</b><small>${esc(p.codigo||'Sin código')}</small></div><span class="stock-level">${Number(p.stock||0)} <small>/ mín. ${Number(p.stockMinimo||0)}</small></span></div>`).join('') : '<p class="empty-chart">No hay productos con stock bajo.</p>';
  const recent = ventas.slice().sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).slice(0,5);
  const recentHtml = recent.length ? recent.map((v,i)=>`<tr style="--delay:${i*55}ms"><td><span class="invoice-tag">#${esc(v.numeroFactura||v.id||'—')}</span></td><td>${new Date(v.fecha).toLocaleDateString('es-CO')}</td><td>${esc(v.cliente?.nombre || 'Mostrador')}</td><td><b>${fmt(v.total)}</b></td><td><span class="status-pill ${String(v.estado||'').toUpperCase()==='CANCELADA'?'status-off':'status-on'}">${esc(v.estado||'Completada')}</span></td></tr>`).join('') : '<tr><td colspan="5">No hay ventas registradas todavía.</td></tr>';

  $('contenido').innerHTML = `
  <section class="dash-welcome"><div><span class="dash-eyebrow"><i></i> CENTRO DE CONTROL</span><h2>Tu negocio, <em>en perspectiva.</em></h2><p>Resumen de rendimiento, ventas e inventario de Papelería El Punto.</p></div><div class="dash-date"><span>HOY</span><b>${ahora.toLocaleDateString('es-CO',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</b></div><div class="welcome-orb orb-one"></div><div class="welcome-orb orb-two"></div></section>
  <section class="dash-kpis">
    ${card('Ingresos totales',fmt(d.ingresos),'↗','Acumulado de ventas','#6d63ff',0)}
    ${card('Ganancia bruta',fmt(d.gananciaBruta),'◈','Antes de gastos operativos','#16b8a6',1)}
    ${card('Utilidad neta',fmt(d.utilidadNeta),'✦','Después de gastos y pagos','#f59e0b',2)}
    ${card('Ventas realizadas',Number(d.numeroVentas||0).toLocaleString('es-CO'),'▤','Transacciones registradas','#3b82f6',3)}
    ${card('Pagos a empleados',fmt(d.pagosEmpleados),'↗','Nómina acumulada','#ec4899',4)}
    ${card('Productos activos',Number(d.productosActivos||0).toLocaleString('es-CO'),'▦','Referencias en catálogo','#8b5cf6',5)}
  </section>
  <section class="dash-chart-grid">
    <article class="dash-panel revenue-panel"><div class="dash-panel-head"><div><span class="panel-kicker">ANÁLISIS DE INGRESOS</span><h3>Movimiento de ventas</h3><p>Comportamiento de los últimos seis meses</p></div><span class="live-pill"><i></i> Actualizado</span></div>
      <div class="chart-summary"><strong>${fmt(totalPeriodo)}</strong><span>Ingresos en el periodo</span><small>${ventaPeriodo} ventas · Ticket medio ${fmt(promedio)}</small></div>
      <div class="svg-chart-wrap"><svg class="sales-bars" viewBox="0 0 500 195" role="img" aria-label="Gráfica de barras de ingresos mensuales" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#7367f0"/><stop offset="100%" stop-color="#b4adff"/></linearGradient></defs>${[30,70,110,150].map(y=>`<line x1="35" y1="${y}" x2="490" y2="${y}" stroke="#edf0f7" stroke-dasharray="4 6"/>`).join('')}${bars}</svg></div>
    </article>
    <article class="dash-panel trend-panel"><div class="dash-panel-head"><div><span class="panel-kicker">TENDENCIA</span><h3>Ritmo de ingresos</h3><p>Curva mensual de ventas</p></div><span class="chart-icon">⌁</span></div>
      <div class="trend-total">${fmt(totalPeriodo)}<small> en 6 meses</small></div>
      <div class="svg-chart-wrap trend-svg"><svg viewBox="0 0 500 195" role="img" aria-label="Gráfica de tendencia mensual" preserveAspectRatio="xMidYMid meet"><defs><linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#24b8a7" stop-opacity=".25"/><stop offset="100%" stop-color="#24b8a7" stop-opacity="0"/></linearGradient></defs>${[35,75,115,155].map(y=>`<line x1="35" y1="${y}" x2="490" y2="${y}" stroke="#edf0f7" stroke-dasharray="4 6"/>`).join('')}<polygon points="64,170 ${points} 444,170" fill="url(#areaGradient)"/><polyline points="${points}" fill="none" stroke="#20b7a5" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${lineDots}</svg></div>
      <div class="trend-legend"><span><i></i> Ingresos mensuales</span><span>Últimos 6 meses</span></div>
    </article>
  </section>
  <section class="dash-lower-grid">
    <article class="dash-panel"><div class="dash-panel-head"><div><span class="panel-kicker">RENDIMIENTO</span><h3>Productos más vendidos</h3><p>Los productos que más se mueven</p></div><span class="panel-icon violet">↗</span></div><div class="top-products">${topHtml}</div></article>
    <article class="dash-panel"><div class="dash-panel-head"><div><span class="panel-kicker">INVENTARIO</span><h3>Atención de stock</h3><p>Productos que necesitan reposición</p></div><span class="panel-icon amber">!</span></div><div class="stock-list">${stockHtml}</div><div class="stock-footer"><span>${stock.length} referencias requieren atención</span><button type="button" class="text-action" onclick="ir('productos')">Ver inventario →</button></div></article>
  </section>
  <section class="dash-panel recent-panel"><div class="dash-panel-head"><div><span class="panel-kicker">ACTIVIDAD RECIENTE</span><h3>Últimas ventas</h3><p>Las transacciones más recientes del negocio</p></div><button type="button" class="text-action" onclick="ir('ventas')">Ver todas →</button></div><div class="tabla-wrap"><table class="recent-sales"><thead><tr><th>Factura</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Estado</th></tr></thead><tbody>${recentHtml}</tbody></table></div></section>`;
}

ir('dashboard');
