/** Punto de venta compartido: el VENDEDOR vende en mostrador y el CLIENTE compra en línea. */
function iniciarPOS(rol) {
  const u = sesion(rol);
  let productos = [], carrito = [], envio = 0, clientes = [];
  let categoriaActiva = 'TODOS';
  const esCliente = rol === 'CLIENTE';
  const esVendedor = rol === 'VENDEDOR';
  const usaCatalogoVisual = esCliente || esVendedor;
  const escapar = valor => String(valor == null ? '' : valor).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iconoCategoria = categoria => {
    const c = String(categoria || '').toLowerCase();
    if (c.includes('escrit') || c.includes('lápiz') || c.includes('lapiz')) return '✎';
    if (c.includes('oficina')) return '▤';
    if (c.includes('arte') || c.includes('dise')) return '✿';
    if (c.includes('papel')) return '▧';
    if (c.includes('cuaderno') || c.includes('escolar')) return '✐';
    if (c.includes('manual')) return '✂';
    if (c.includes('comput') || c.includes('electr')) return '⌘';
    return '✦';
  };
  const mensaje = (t, ok) => { $('msg').className = 'msg ' + (ok ? 'ok' : 'err'); $('msg').textContent = t; };
  const esDomicilio = () => $('tipoD').checked;

  async function cargar() {
    try {
      productos = (await api('/productos')).filter(p => p.activo && p.stock > 0);
      if (esVendedor && $('clienteVenta')) {
        clientes = (await api('/usuarios')).filter(x => x.rol === 'CLIENTE' && x.activo);
        $('clienteVenta').innerHTML = '<option value="">Venta de mostrador / sin registrar</option>' + clientes.map(c => `<option value="${c.id}">${String(c.nombre || '').replace(/[&<>\"]/g, '')} · ${String(c.usuario || '').replace(/[&<>\"]/g, '')}</option>`).join('');
      }
      if (usaCatalogoVisual) pintarCategorias();
      pintarCatalogo();
    } catch (e) { mensaje('No se pudieron cargar los productos. ' + e.message); }
  }

  function pintarCategorias() {
    const cats = [...new Set(productos.map(p => (p.categoria || 'Otros').trim()).filter(Boolean))].sort((a,b) => a.localeCompare(b,'es'));
    const cont = $('categoryFilters');
    if (cont) {
      cont.innerHTML = cats.map(cat => `<button class="category-filter" type="button" data-category="${escapar(cat)}"><span>${iconoCategoria(cat)}</span> ${escapar(cat)} <b>${productos.filter(p => (p.categoria || 'Otros').trim() === cat).length}</b></button>`).join('');
    }
    const all = $('countAll'); if (all) all.textContent = productos.length;
  }

  function listaFiltrada() {
    const q = $('buscar').value.trim().toLowerCase();
    let lista = productos.filter(p => {
      const cat = (p.categoria || 'Otros').trim();
      const coincideCategoria = categoriaActiva === 'TODOS' || cat.toLocaleLowerCase('es') === categoriaActiva.toLocaleLowerCase('es');
      return coincideCategoria && (String(p.codigo || '').toLowerCase().includes(q) || String(p.nombre || '').toLowerCase().includes(q) || cat.toLowerCase().includes(q));
    });
    const orden = $('ordenCatalogo')?.value || 'destacados';
    if (orden === 'nombre') lista.sort((a,b) => a.nombre.localeCompare(b.nombre,'es'));
    if (orden === 'precioAsc') lista.sort((a,b) => a.precioVenta - b.precioVenta);
    if (orden === 'precioDesc') lista.sort((a,b) => b.precioVenta - a.precioVenta);
    return lista;
  }

  function pintarCatalogo() {
    const lista = listaFiltrada();
    if (usaCatalogoVisual) {
      const cont = $('catalogo');
      if (!cont) return;
      cont.innerHTML = lista.map((p, i) => {
        const img = p.imagenUrl ? `<img class="product-photo" src="${escapar(p.imagenUrl)}" alt="${escapar(p.nombre)}" loading="lazy" onerror="this.style.display='none'">` : '';
        return `<article class="product-card" style="--card-index:${Math.min(i,12)}">
          <div class="product-visual ${p.imagenUrl ? 'has-photo' : ''}">${img}<div class="product-placeholder placeholder-${i%5}"><span>${iconoCategoria(p.categoria)}</span><small>${escapar(p.categoria || 'Papelería')}</small></div><span class="stock-chip">${p.stock <= 5 ? '¡Últimas unidades!' : 'Disponible'}</span></div>
          <div class="product-info"><span class="product-category">${escapar(p.categoria || 'General')}</span><h4>${escapar(p.nombre)}</h4><p class="product-code">Ref. ${escapar(p.codigo)}</p>
            <div class="product-buy-row"><div><strong>${fmt(p.precioVenta)}</strong><small>${p.stock} disponibles</small></div><div class="product-add"><input class="qty" type="number" min="1" max="${p.stock}" value="1" id="q${p.id}" aria-label="Cantidad de ${escapar(p.nombre)}"><button class="btn ok" data-add="${p.id}" aria-label="Agregar ${escapar(p.nombre)} al pedido">+</button></div></div>
          </div>
        </article>`;
      }).join('') || '<div class="empty-catalog"><span>⌕</span><h3>No encontramos productos</h3><p>Prueba otra búsqueda o selecciona otra categoría.</p></div>';
      const summary = $('catalogSummary'); if (summary) summary.textContent = categoriaActiva === 'TODOS' ? (esVendedor ? 'Selecciona artículos para la venta' : 'Encuentra tus artículos favoritos') : 'Categoría: ' + categoriaActiva;
      const results = $('resultsCount'); if (results) results.textContent = lista.length + (lista.length === 1 ? ' producto' : ' productos');
      return;
    }
    $('catalogo').innerHTML = lista
      .map(p => `<tr><td>${escapar(p.codigo)}</td>
        <td>${p.imagenUrl ? `<img src="${escapar(p.imagenUrl)}" alt="${escapar(p.nombre)}" onerror="this.style.display='none'">` : ''}${escapar(p.nombre)}</td>
        <td>${fmt(p.precioVenta)}</td><td>${p.stock}</td>
        <td><input class="qty" type="number" min="1" max="${p.stock}" value="1" id="q${p.id}" aria-label="Cantidad de ${escapar(p.nombre)}"></td>
        <td><button class="btn ok" data-add="${p.id}">Agregar</button></td></tr>`).join('')
      || '<tr><td colspan="6">No hay productos que coincidan con la búsqueda.</td></tr>';
  }

  function agregar(id) {
    const p = productos.find(x => x.id === id);
    if (!p) return mensaje('No se encontró el producto seleccionado');
    const campo = $('q' + id);
    const cant = parseInt(campo ? campo.value : '1', 10);
    const enCarrito = carrito.find(x => x.p.id === id);
    const total = (enCarrito ? enCarrito.cant : 0) + cant;
    if (!cant || cant <= 0) return mensaje('Escribe una cantidad válida');
    if (total > p.stock) return mensaje('Solo hay ' + p.stock + ' unidades de ' + p.nombre);
    if (enCarrito) enCarrito.cant = total; else carrito.push({ p, cant });
    mensaje((esCliente ? p.nombre + ' se agregó a tu pedido.' : p.nombre + ' agregado a la venta.'), true);
    pintarCarrito();
  }

  function pintarCarrito() {
    if (usaCatalogoVisual) {
      const cont = $('carrito');
      cont.innerHTML = carrito.map((x, i) => {
        const miniatura = x.p.imagenUrl
          ? `<img class="cart-item-photo" src="${escapar(x.p.imagenUrl)}" alt="" loading="lazy" onerror="this.remove();this.parentElement.classList.add('no-photo')">`
          : '';
        return `<div class="cart-item"><div class="cart-item-icon ${x.p.imagenUrl ? 'has-cart-photo' : 'no-photo'}">${miniatura}<span class="cart-item-fallback">${iconoCategoria(x.p.categoria)}</span></div><div class="cart-item-copy"><b>${escapar(x.p.nombre)}</b><small>${x.cant} × ${fmt(x.p.precioVenta)}</small><strong>${fmt(x.p.precioVenta * x.cant)}</strong></div><button class="cart-remove" data-del="${i}" aria-label="Quitar ${escapar(x.p.nombre)}">×</button></div>`;
      }).join('')
        || '<div class="cart-empty"><span>🛒</span><b>Tu pedido está vacío</b><small>Agrega productos para comenzar.</small></div>';
      const count = $('cartCount'); if (count) count.textContent = carrito.reduce((s,x) => s+x.cant,0);
    } else {
      $('carrito').innerHTML = carrito.map((x, i) => `<tr><td>${escapar(x.p.nombre)}</td><td>${x.cant}</td>
      <td>${fmt(x.p.precioVenta * x.cant)}</td><td><button class="btn mal" data-del="${i}" aria-label="Quitar">✕</button></td></tr>`).join('')
      || '<tr><td colspan="4">El pedido está vacío. Agrega productos de la lista.</td></tr>';
    }
    totales();
  }

  function subtotal() { return carrito.reduce((s, x) => s + x.p.precioVenta * x.cant, 0); }
  function totales() {
    const e = esDomicilio() ? envio : 0, t = subtotal() + e;
    $('subtotal').textContent = fmt(subtotal());
    $('envio').textContent = fmt(e);
    $('total').textContent = fmt(t);
    const efectivo = $('efectivo');
    const cambio = $('cambio');
    if (efectivo && cambio) {
      const ef = parseFloat(efectivo.value);
      cambio.textContent = isNaN(ef) ? '—' : (ef < t ? 'Faltan ' + fmt(t - ef) : fmt(ef - t));
    }
  }

  $('catalogo').onclick = e => { const b = e.target.closest('[data-add]'); if (b) agregar(+b.dataset.add); };
  $('carrito').onclick = e => { const b = e.target.closest('[data-del]'); if (b) { carrito.splice(+b.dataset.del, 1); pintarCarrito(); } };
  $('buscar').oninput = pintarCatalogo;
  if ($('ordenCatalogo')) $('ordenCatalogo').onchange = pintarCatalogo;
  if (usaCatalogoVisual) {
    document.addEventListener('click', e => {
      const b = e.target.closest('[data-category]');
      if (!b) return;
      categoriaActiva = b.dataset.category || 'TODOS';
      document.querySelectorAll('.category-filter,.category-tile').forEach(el => el.classList.toggle('active', el.dataset.category === categoriaActiva));
      pintarCatalogo();
    });
  }
  if ($('efectivo')) $('efectivo').oninput = totales;
  $('vaciar').onclick = () => { carrito = []; pintarCarrito(); mensaje('', true); };
  document.querySelectorAll('input[name=tipo]').forEach(r => r.onchange = () => { $('panelDom').hidden = !esDomicilio(); totales(); });

  $('calc').onclick = async () => {
    try {
      const r = await api('/domicilio/costo?km=' + encodeURIComponent($('km').value || 0));
      envio = r.costo;
      mensaje(`Envío: ${fmt(r.tarifaBase)} base + ${fmt(r.precioKm)} por km × ${r.distanciaKm} km`, true);
      totales();
    } catch (e) { mensaje(e.message); }
  };

  $('cobrar').onclick = async () => {
    try {
      if (!carrito.length) return mensaje('Agrega al menos un producto al pedido.');
      if (esDomicilio() && (!$('dir').value.trim() || !$('tel').value.trim())) return mensaje('Completa la dirección y el teléfono para el domicilio.');
      const venta = await api('/ventas', { method: 'POST', body: {
        vendedorId: rol === 'VENDEDOR' ? u.id : null,
        clienteId: rol === 'CLIENTE' ? u.id : (esVendedor && $('clienteVenta')?.value ? Number($('clienteVenta').value) : null),
        tipo: esDomicilio() ? 'DOMICILIO' : 'MOSTRADOR',
        efectivo: esVendedor ? (parseFloat($('efectivo').value) || 0) : 0,
        metodoPago: esCliente ? $('metodoPago').value : 'EFECTIVO',
        direccion: $('dir').value, telefono: $('tel').value,
        distanciaKm: parseFloat($('km').value) || 0,
        items: carrito.map(x => ({ productoId: x.p.id, cantidad: x.cant }))
      } });
      carrito = []; envio = 0; if ($('efectivo')) $('efectivo').value = ''; if ($('clienteVenta')) $('clienteVenta').value = ''; 
      mensaje('Venta registrada: ' + venta.numeroFactura, true);
      pintarCarrito(); await cargar(); verFactura(venta);
    } catch (e) { mensaje(e.message); }
  };

  pintarCarrito(); cargar();
}
