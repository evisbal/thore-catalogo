// Utilidades compartidas para formatear y renderizar productos.
// Las usan catalogo.js, producto.js, home-products.js y el panel
// de admin.

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

function formatPrice(value) {
  // Pesos colombianos: sin centavos, puntos como separador de miles
  // (ej. $50.000). Se redondea al peso entero antes de formatear.
  const rounded = Math.round(Number(value));
  return "$" + rounded.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

function priceHTML(product) {
  let html = formatPrice(product.price);
  if (product.original_price) {
    html += ` <span class="product-card__price--original">${formatPrice(product.original_price)}</span>`;
  }
  return html;
}

function badgeHTML(product) {
  if (product.badge === "sale") return '<span class="badge">Oferta</span>';
  if (product.badge === "sold-out") return '<span class="badge">Agotado</span>';
  if (product.availability) {
    return `<span class="badge badge--muted">${escapeHTML(product.availability)}</span>`;
  }
  return "";
}

// headingTag: el nivel de encabezado correcto depende de dónde se
// use la tarjeta (h2 en catálogo, h3 en destacados/relacionados),
// para no romper la jerarquía de la página.
function productCardHTML(product, headingTag) {
  const tag = headingTag || "h3";
  const image = product.image_url || "assets/img/favicon.png";
  return `
    <a href="producto.html?slug=${encodeURIComponent(product.slug)}" class="product-card">
      <div class="product-card__image">
        <img src="${escapeHTML(image)}" alt="${escapeHTML(product.name)}" loading="lazy" />
      </div>
      <div class="product-card__meta">
        <${tag} class="product-card__title">${escapeHTML(product.name)}</${tag}>
        ${badgeHTML(product)}
      </div>
      <p class="product-card__price">${priceHTML(product)}</p>
    </a>
  `;
}
