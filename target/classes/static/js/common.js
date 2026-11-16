const $ = id => document.getElementById(id);
const fmt = n => '$' + Math.round(n || 0).toLocaleString('es-CO');

/** Llama a la API REST y devuelve el JSON. Si el servidor responde error, lanza Error con el mensaje. */
async function api(ruta, opciones = {}) {
  const r = await fetch('/api' + ruta, {
    method: opciones.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: opciones.body ? JSON.stringify(opciones.body) : undefined
  });
  const texto = await r.text();
  const datos = texto ? JSON.parse(texto) : null;
  if (!r.ok) throw new Error((datos && datos.mensaje) || 'Error ' + r.status);
  return datos;
}

/** Devuelve el usuario en sesión; si no hay sesión o el rol no corresponde, regresa al login. */
function sesion(rol) {
  const u = JSON.parse(sessionStorage.getItem('u') || 'null');
  if (!u || u.rol !== rol) { location.href = 'index.html'; throw new Error('Sin sesión'); }
  $('quien').textContent = { ADMIN: 'Administrador', VENDEDOR: 'Vendedor', CLIENTE: 'Cliente' }[rol] + ': ' + u.nombre;
  return u;
}
function salir() { sessionStorage.clear(); location.href = 'index.html'; }

/** Muestra la factura en una ventana emergente lista para imprimir. */
function verFactura(v) {
  const L = '═'.repeat(48), l = '─'.repeat(48);
  const f = new Date(v.fecha).toLocaleString('es-CO');
  let t = `${L}\n        PAPELERÍA EL PUNTO\n     Cartagena, Bolívar — Colombia\n${L}\n`;
  t += `Factura N°: ${v.numeroFactura}\nFecha:      ${f}\n`;
  t += `Vendedor:   ${v.vendedor ? v.vendedor.nombre : 'Tienda en línea'}\nCliente:    ${v.cliente ? v.cliente.nombre : 'Mostrador'}\n`;
  t += `Tipo:       ${v.tipoVenta === 'DOMICILIO' ? 'Domicilio' : 'Mostrador'}\n`;
  t += `Pago:       ${{EFECTIVO:'Efectivo',TRANSFERENCIA:'Transferencia',TARJETA:'Tarjeta'}[v.metodoPago] || 'No especificado'}\n`;
  if (v.tipoVenta === 'DOMICILIO') t += `Dirección:  ${v.direccionDomicilio}\nTeléfono:   ${v.telefonoDomicilio}\nDistancia:  ${v.distanciaKm} km\n`;
  t += `${l}\n${'PRODUCTO'.padEnd(24)}${'CANT'.padStart(5)}${'TOTAL'.padStart(19)}\n${l}\n`;
  v.detalles.forEach(d => {
    t += `${d.producto.nombre.slice(0, 23).padEnd(24)}${String(d.cantidad).padStart(5)}${fmt(d.subtotal).padStart(19)}\n`;
  });
  t += `${l}\n${'Subtotal'.padEnd(29)}${fmt(v.subtotal).padStart(19)}\n`;
  if (v.tipoVenta === 'DOMICILIO') t += `${'Domicilio'.padEnd(29)}${fmt(v.costoDomicilio).padStart(19)}\n`;
  t += `${L}\n${'TOTAL A PAGAR'.padEnd(29)}${fmt(v.total).padStart(19)}\n${L}\n`;
  if (v.vendedor) t += `${'Efectivo recibido'.padEnd(29)}${fmt(v.efectivoRecibido).padStart(19)}\n${'Cambio'.padEnd(29)}${fmt(v.cambio).padStart(19)}\n`;
  t += `${l}\n  ¡Gracias por su compra!\n`;

  const m = document.createElement('div');
  m.className = 'modal';
  m.innerHTML = '<div class="factura"><pre></pre><div class="acciones"><button class="btn" onclick="window.print()">Imprimir</button><button class="btn gris" onclick="this.closest(\'.modal\').remove()">Cerrar</button></div></div>';
  m.querySelector('pre').textContent = t;
  document.body.append(m);
}


/** Permite ocultar/mostrar el menú lateral sin cambiar las funciones del panel. */
function configurarMenuLateral() {
  const boton = $('toggleMenu');
  const layout = document.querySelector('.layout');
  if (!boton || !layout) return;
  const aplicar = compacto => {
    layout.classList.toggle('menu-mini', compacto);
    layout.classList.remove('menu-oculto');
    boton.setAttribute('aria-expanded', String(!compacto));
    boton.setAttribute('aria-label', compacto ? 'Expandir menú lateral' : 'Contraer menú lateral');
    boton.setAttribute('title', compacto ? 'Expandir menú' : 'Dejar solo iconos');
    boton.classList.toggle('is-open', !compacto);
  };
  boton.addEventListener('click', () => aplicar(!layout.classList.contains('menu-mini')));
  aplicar(false);
}
