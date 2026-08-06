// Carga un producto puntual según el slug en la URL
// (producto.html?slug=xxx) y arma la página de detalle, incluyendo
// el mensaje de WhatsApp pre-armado con el nombre real del producto
// y hasta 3 productos relacionados.
(async function () {
  const root = document.querySelector("[data-product-root]");
  if (!root) return;

  const slug = new URLSearchParams(window.location.search).get("slug");

  if (!slug) {
    root.innerHTML = `<p class="catalog-empty">No se especificó un producto. <a href="catalogo.html">Volver al catálogo</a>.</p>`;
    return;
  }

  const { data: product, error } = await db
    .from("products")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !product) {
    if (error) console.error(error);
    root.innerHTML = `<p class="catalog-empty">No encontramos ese producto. <a href="catalogo.html">Volver al catálogo</a>.</p>`;
    return;
  }

  document.title = product.name + " | Thoré";

  document.querySelector("[data-breadcrumb-current]").textContent = product.name;

  const img = document.querySelector("[data-product-image]");
  img.src = product.image_url || "assets/img/favicon.png";
  img.alt = product.name;

  document.querySelector("[data-product-name]").textContent = product.name;
  document.querySelector("[data-product-price]").innerHTML = priceHTML(product);

  const availabilityEl = document.querySelector("[data-product-availability]");
  if (product.availability && product.badge !== "sold-out") {
    availabilityEl.textContent = product.availability;
    availabilityEl.hidden = false;
  }

  document.querySelector("[data-product-description]").textContent =
    product.description || "";

  const ctaWrap = document.querySelector("[data-product-cta-wrap]");
  if (product.badge === "sold-out") {
    ctaWrap.innerHTML = `<button class="btn btn--disabled btn--block" disabled>Agotado</button>`;
  } else {
    const message = encodeURIComponent(
      `Hola, me interesa el producto: ${product.name}`
    );
    ctaWrap.innerHTML = `
      <a
        href="https://wa.me/000000000000?text=${message}"
        class="btn btn--accent btn--block"
        target="_blank"
        rel="noopener noreferrer"
      >
        Consultar por WhatsApp
        <svg class="icon-whatsapp" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false"><path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34q-.171-.007-.334-.007c-.114 0-.297.043-.454.213-.155.17-.596.582-.596 1.418 0 .836.61 1.64.696 1.752.086.114 1.204 1.837 2.919 2.577.408.176.727.28.976.36.41.13.784.11 1.079.067.329-.049 1.014-.414 1.157-.815.144-.4.144-.744.101-.815-.043-.072-.156-.116-.328-.202"/></svg>
      </a>
    `;
  }

  // Relacionados: hasta 3 productos, excluyendo el actual.
  const { data: related } = await db
    .from("products")
    .select("*")
    .neq("slug", slug)
    .limit(3);

  const relatedSection = document.querySelector("[data-related-section]");
  if (related && related.length > 0) {
    document.querySelector("[data-related-grid]").innerHTML = related
      .map((p) => productCardHTML(p, "h3"))
      .join("");
  } else if (relatedSection) {
    relatedSection.hidden = true;
  }
})();
