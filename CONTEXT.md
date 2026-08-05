# Proyecto: Catálogo e-commerce (sin pasarela de pago) en WordPress + WooCommerce

## Contexto general
Cliente necesita una página tipo e-commerce, pero SOLO como catálogo de productos.
No debe incluir carrito ni pasarela de pago funcional. El objetivo principal es que
el cliente pueda gestionar el contenido (productos, fotos, precios, categorías)
de forma fácil, sin depender de un desarrollador para cada cambio.

## Stack decidido
- **WordPress** como CMS base (motor de contenido, panel de administración).
- **WooCommerce** como plugin sobre WordPress para estructurar los "productos"
  (nombre, precio, fotos, categorías, atributos, inventario), sin activar
  ninguna pasarela de pago real.
- **Modo catálogo**: se logra ocultando el botón "Agregar al carrito" y
  reemplazándolo por un botón de "Consultar" / "Solicitar cotización"
  (por ejemplo enlazado a WhatsApp o a un formulario de contacto).
  - Camino recomendado: plugin especializado tipo "YITH WooCommerce Catalog Mode"
    o similar (rápido de implementar, gratis en versión básica).
  - Alternativa: configuración manual sin activar pasarela de pago, editando
    plantillas o usando hooks/filtros en functions.php (más control, más trabajo).
  - Alternativa más liviana (solo si el catálogo es muy simple, sin variaciones
    ni inventario): Custom Post Type nativo + Advanced Custom Fields (ACF) en
    vez de WooCommerce completo.

## Opciones descartadas y por qué
- **Webflow (CMS)**: editor visual muy bueno, pero más caro. Plan Premium
  ronda los $25/mes (anual) + Workspace plan aparte para poder editar/colaborar.
  Válido solo si el cliente valora mucho la estética/experiencia de edición
  y el presupuesto lo permite.
- **Shopify en modo catálogo**: no tiene sentido económico, se pagaría la
  suscripción completa de Shopify solo para no usar la mayoría de sus
  funciones de venta.
- **CMS headless custom (Strapi/Directus/Sanity) + frontend propio**: tiene
  sentido solo si se planea reutilizar como plantilla para futuros clientes,
  o si el diseño/interacción requerido es muy a medida. Para un catálogo
  estándar es más trabajo de desarrollo y soporte del que vale la pena.

## Flujo de trabajo acordado
1. Diseñar y construir la página base (HTML/CSS, y lógica PHP si aplica)
   en Claude Code, iterando rápido fuera de la fricción del admin de WP.
2. Convertir el diseño aprobado en la estructura de tema de WordPress:
   `style.css`, `index.php`, `functions.php`, y plantillas de WooCommerce
   como `archive-product.php` y `single-product.php`.
3. Deploy (lo hace el usuario, no Claude, por temas de credenciales):
   - Subir el tema como .zip desde wp-admin → Apariencia → Temas → Añadir
     nuevo → Subir tema, o por FTP/File Manager a `/wp-content/themes/`.
   - Activar el tema, instalar WooCommerce y el plugin de modo catálogo
     desde el repositorio oficial de plugins.
4. Configuración final de WooCommerce (moneda, categorías, catálogo) desde
   el panel normal de wp-admin.
5. Ajustes posteriores de estilo: se iteran con screenshots o código real
   una vez el sitio esté visible en vivo.

## Punto abierto / decisión pendiente
Definir si se parte de un tema base ya compatible con WooCommerce y liviano
(ej. Astra o GeneratePress) haciendo overrides puntuales de CSS/templates,
o si se construye un tema completamente custom desde cero. La opción de
tema base simplifica mucho el deploy inicial (instalar desde el repositorio
oficial) y reduce el trabajo a los ajustes específicos.

## Restricciones importantes
- Claude no puede hacer login en wp-admin, hosting, ni manejar credenciales
  del cliente. Todo el deploy real (subir archivos, activar plugins,
  configuración en el panel) lo ejecuta el usuario.
- Prioridad: bajo costo, facilidad de gestión de contenido para alguien
  no técnico, y evitar reinventar funcionalidad que WooCommerce ya resuelve.
