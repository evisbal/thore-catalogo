// Login del panel de admin contra Supabase Auth. El registro público
// está desactivado (ver supabase/schema.sql), así que sólo entran
// las cuentas creadas a mano desde el dashboard de Supabase.
(async function () {
  // Si ya hay sesión activa, saltar directo al panel.
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    window.location.href = "index.html";
    return;
  }

  const form = document.querySelector("[data-login-form]");
  const errorEl = document.querySelector("[data-login-error]");
  const btn = document.querySelector("[data-login-submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    btn.disabled = true;
    btn.textContent = "Ingresando…";

    const email = document.getElementById("f-email").value.trim();
    const password = document.getElementById("f-password").value;

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      errorEl.textContent = "Email o contraseña incorrectos.";
      errorEl.hidden = false;
      btn.disabled = false;
      btn.textContent = "Ingresar";
      return;
    }

    window.location.href = "index.html";
  });
})();
