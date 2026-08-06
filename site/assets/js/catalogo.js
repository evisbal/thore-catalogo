// Carga el catálogo completo desde Supabase y arma la grilla de
// producto.html (reemplaza el HTML fijo que había antes).
(async function () {
  const grid = document.querySelector("[data-catalog-grid]");
  if (!grid) return;

  const { data: products, error } = await db
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    grid.innerHTML = `<p class="catalog-empty">No pudimos cargar el catálogo. Probá recargar la página.</p>`;
    return;
  }

  if (!products || products.length === 0) {
    grid.innerHTML = `<p class="catalog-empty">Todavía no hay productos cargados.</p>`;
    return;
  }

  grid.innerHTML = products.map((p) => productCardHTML(p, "h2")).join("");
})();
