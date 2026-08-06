// Carga hasta 3 productos marcados como "destacado" para la home.
(async function () {
  const grid = document.querySelector("[data-featured-grid]");
  if (!grid) return;

  const { data: products, error } = await db
    .from("products")
    .select("*")
    .eq("featured", true)
    .order("sort_order", { ascending: true })
    .limit(3);

  if (error) {
    console.error(error);
    grid.innerHTML = `<p class="catalog-empty">No pudimos cargar los destacados.</p>`;
    return;
  }

  if (!products || products.length === 0) {
    grid.innerHTML = `<p class="catalog-empty">Todavía no hay productos destacados. Marcalos desde el panel de admin.</p>`;
    return;
  }

  grid.innerHTML = products.map((p) => productCardHTML(p, "h3")).join("");
})();
