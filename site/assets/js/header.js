// Comportamiento del header:
// 1) Transparente sobre el hero, sólido al hacer scroll (sólo en páginas
//    cuyo <header> tiene la clase "is-transparent", por ahora la home).
// 2) Menú hamburguesa en mobile: togglea la nav y fuerza el header sólido
//    mientras el menú está abierto para que se lea bien sobre el hero.
(function () {
  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");

  var isTransparentPage = header && header.classList.contains("is-transparent");

  function onScroll() {
    if (!isTransparentPage) return;
    if (window.scrollY > 60) {
      header.classList.remove("is-transparent");
    } else if (!menuOpen) {
      header.classList.add("is-transparent");
    }
  }

  var menuOpen = false;

  function setMenu(open) {
    menuOpen = open;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    if (isTransparentPage) {
      if (open) {
        header.classList.add("force-solid");
        header.classList.remove("is-transparent");
      } else {
        header.classList.remove("force-solid");
        onScroll();
      }
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(!menuOpen);
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    // Escape cierra el menú y devuelve el foco al botón que lo abrió.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menuOpen) {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  if (isTransparentPage) {
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();
