// Carga el catálogo completo desde Supabase y arma la grilla de
// producto.html (reemplaza el HTML fijo que había antes).
(async function () {
  const grid = document.querySelector("[data-catalog-grid]");
  if (!grid) return;

  try {
    const { data: products, error } = await db
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (!products || products.length === 0) {
      grid.innerHTML = `<p class="catalog-empty">Todavía no hay productos cargados.</p>`;
      return;
    }

    grid.innerHTML = products.map((p) => productCardHTML(p, "h2")).join("");
  } catch (err) {
    // Captura tanto errores de la API (ej. RLS) como fallas de red
    // (ej. el proyecto de Supabase caído), que de otro modo dejaban
    // la página trabada en "Cargando productos…" para siempre.
    console.error(err);
    grid.innerHTML = `<p class="catalog-empty">No pudimos cargar el catálogo. Intenta recargar la página.</p>`;
  }
})();
