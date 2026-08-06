(async function () {
  // ---- Guard: sin sesión, afuera ----
  const {
    data: { session },
  } = await db.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  document.querySelector("[data-admin-email]").textContent = session.user.email;

  document.querySelector("[data-logout]").addEventListener("click", async () => {
    await db.auth.signOut();
    window.location.href = "login.html";
  });

  // ---- Elementos ----
  const listEl = document.querySelector("[data-product-list]");
  const modal = document.querySelector("[data-product-modal]");
  const form = document.querySelector("[data-product-form]");
  const formTitle = document.querySelector("[data-form-title]");
  const formError = document.querySelector("[data-form-error]");
  const submitBtn = document.querySelector("[data-submit-btn]");
  const imagePreview = document.querySelector("[data-image-preview]");
  const imageInput = document.getElementById("f-image");

  let products = [];
  let currentImageUrl = "";
  let slugTouched = false;

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // ---- Cargar y listar ----
  async function loadProducts() {
    listEl.innerHTML = `<p class="catalog-empty">Cargando productos…</p>`;
    const { data, error } = await db
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      listEl.innerHTML = `<p class="catalog-empty">Error al cargar: ${escapeHTML(error.message)}</p>`;
      return;
    }

    products = data || [];

    if (products.length === 0) {
      listEl.innerHTML = `<p class="catalog-empty">Todavía no cargaste ningún producto. Usá "+ Nuevo producto" para empezar.</p>`;
      return;
    }

    listEl.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th></th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Estado</th>
            <th>Destacado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p) => `
            <tr>
              <td><img class="admin-table__thumb" src="${escapeHTML(p.image_url || "../assets/img/favicon.png")}" alt="" /></td>
              <td>${escapeHTML(p.name)}</td>
              <td>${formatPrice(p.price)}</td>
              <td>${p.badge === "sale" ? "Oferta" : p.badge === "sold-out" ? "Agotado" : "—"}</td>
              <td>${p.featured ? "Sí" : "—"}</td>
              <td class="admin-table__actions">
                <button type="button" class="admin-link-btn" data-edit="${p.id}">Editar</button>
                <button type="button" class="admin-link-btn admin-link-btn--danger" data-delete="${p.id}">Borrar</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  }

  await loadProducts();

  // ---- Abrir / cerrar modal ----
  function openModal() {
    modal.hidden = false;
  }

  function closeModal() {
    modal.hidden = true;
    form.reset();
    formError.hidden = true;
    imagePreview.hidden = true;
    currentImageUrl = "";
    slugTouched = false;
  }

  document.querySelectorAll("[data-modal-close]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.querySelector("[data-new-product]").addEventListener("click", () => {
    form.reset();
    form.elements.id.value = "";
    formTitle.textContent = "Nuevo producto";
    imagePreview.hidden = true;
    currentImageUrl = "";
    slugTouched = false;
    openModal();
  });

  // Auto-generar el slug desde el nombre, salvo que ya lo hayan
  // tocado a mano.
  form.elements.name.addEventListener("input", () => {
    if (slugTouched) return;
    form.elements.slug.value = slugify(form.elements.name.value);
  });
  form.elements.slug.addEventListener("input", () => {
    slugTouched = true;
  });

  // ---- Editar / borrar ----
  listEl.addEventListener("click", async (e) => {
    const editId = e.target.getAttribute("data-edit");
    const deleteId = e.target.getAttribute("data-delete");

    if (editId) {
      const p = products.find((x) => x.id === editId);
      if (!p) return;
      form.elements.id.value = p.id;
      form.elements.name.value = p.name;
      form.elements.slug.value = p.slug;
      form.elements.price.value = p.price;
      form.elements.original_price.value = p.original_price || "";
      form.elements.description.value = p.description || "";
      form.elements.category.value = p.category || "";
      form.elements.badge.value = p.badge || "";
      form.elements.availability.value = p.availability || "";
      form.elements.featured.checked = !!p.featured;
      currentImageUrl = p.image_url || "";
      slugTouched = true;

      if (currentImageUrl) {
        imagePreview.src = currentImageUrl;
        imagePreview.hidden = false;
      } else {
        imagePreview.hidden = true;
      }

      formTitle.textContent = "Editar producto";
      openModal();
    }

    if (deleteId) {
      const p = products.find((x) => x.id === deleteId);
      if (!p) return;
      const ok = window.confirm(`¿Borrar "${p.name}"? Esta acción no se puede deshacer.`);
      if (!ok) return;

      const { error } = await db.from("products").delete().eq("id", deleteId);
      if (error) {
        alert("No se pudo borrar: " + error.message);
        return;
      }
      await loadProducts();
    }
  });

  // ---- Vista previa de la imagen elegida ----
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result;
      imagePreview.hidden = false;
    };
    reader.readAsDataURL(file);
  });

  // ---- Guardar (alta o edición) ----
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.hidden = true;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Guardando…";

    try {
      const fd = new FormData(form);
      const id = fd.get("id");
      let imageUrl = currentImageUrl;

      const file = fd.get("image_file");
      if (file && file.size > 0) {
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const path = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
        const { error: uploadError } = await db.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = db.storage.from("product-images").getPublicUrl(path);
        imageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        name: fd.get("name").trim(),
        slug: fd.get("slug").trim(),
        price: parseFloat(fd.get("price")),
        original_price: fd.get("original_price") ? parseFloat(fd.get("original_price")) : null,
        description: fd.get("description").trim() || null,
        category: fd.get("category").trim() || null,
        badge: fd.get("badge") || null,
        availability: fd.get("availability").trim() || null,
        featured: fd.get("featured") === "on",
        image_url: imageUrl || null,
      };

      let error;
      if (id) {
        ({ error } = await db.from("products").update(payload).eq("id", id));
      } else {
        ({ error } = await db.from("products").insert(payload));
      }
      if (error) throw error;

      closeModal();
      await loadProducts();
    } catch (err) {
      formError.textContent = err.message || "Ocurrió un error al guardar.";
      formError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Guardar";
    }
  });
})();
