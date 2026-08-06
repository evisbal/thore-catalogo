# Proyecto: Catálogo Thoré (sin pasarela de pago)

## Contexto general
Cliente (marca "Thoré", bolsos tejidos a mano — @thorehandmade) necesita una
página tipo catálogo de productos. No debe incluir carrito ni pasarela de
pago real — el CTA de cada producto es "Consultar por WhatsApp". El objetivo
principal es que el cliente pueda gestionar el contenido (productos, fotos,
precios, estado) de forma fácil, sin depender de un desarrollador para cada
cambio.

## Stack decidido (actualizado — ver "Historial de decisiones" abajo)
- **Frontend**: sitio estático (HTML/CSS/JS plano, sin build step), en
  `site/`. Diseño propio inspirado en la identidad de marca real
  (Instagram @thorehandmade: blush `#d4b2a7`, cremas cálidos, negro elegante).
- **Backend**: [Supabase](https://supabase.com) (Postgres + Auth + Storage,
  free tier). Esquema en `supabase/schema.sql`.
  - Tabla `products`: nombre, slug, precio, precio anterior (ofertas),
    descripción, foto, categoría, badge (oferta/agotado), destacado.
  - RLS: lectura pública (catálogo), escritura sólo para usuarios logueados.
  - **Registro público desactivado** — sólo entran cuentas creadas a mano
    desde el dashboard de Supabase (por eso "logueado" == "el admin").
  - Bucket de Storage `product-images` (lectura pública) para las fotos.
- **Panel de admin**: `site/admin/` (login.html + index.html), CRUD de
  productos con subida de fotos, construido en HTML/JS plano contra el
  cliente JS de Supabase (via CDN, sin bundler).
- **Hosting**: [Netlify](https://netlify.com) (free tier), deploy automático
  conectado al repo de GitHub — cada push a `main` publica solo.
- **Repo**: [github.com/evisbal/thore-catalogo](https://github.com/evisbal/thore-catalogo)
  (rama `main`, publish directory `site`).
- **Modo catálogo**: cada botón de acción (header, detalle de producto,
  banda de contacto) es un link a WhatsApp (`wa.me`) con `target="_blank"`,
  con mensaje pre-armado incluyendo el nombre real del producto.

## Costo mensual
$0/mes (Supabase free tier + Netlify free tier). Único costo real: el
dominio propio (~$10-15/año) cuando se decida comprar uno — mientras tanto
funciona con el subdominio gratuito de Netlify.

## Historial de decisiones

### Plan original (descartado): WordPress + WooCommerce
Se había decidido WordPress + WooCommerce (con un plugin de modo catálogo
tipo YITH) como stack, con la idea de convertir el HTML/CSS aprobado en un
tema custom. Se descartó porque instalar WooCommerce y subir un tema propio
en WordPress.com requiere el plan **Business ($25/mes = $300/año)** — el
cliente lo consideró demasiado caro para un negocio recién empezando.
Alternativa de WordPress autoalojado (hosting propio + WordPress.org
gratis) quedó sin explorar porque el camino de Supabase + sitio estático
resultó más simple y directamente gratuito.

### Opciones descartadas (de la etapa de WordPress, siguen aplicando)
- **Webflow**: Plan Premium ~$25/mes + Workspace aparte. Válido sólo si el
  cliente valora mucho la experiencia de edición visual y el presupuesto
  lo permite — no es el caso acá.
- **Shopify en modo catálogo**: no tiene sentido económico, se pagaría la
  suscripción completa de Shopify sólo para no usar la mayoría de sus
  funciones de venta.
- **CMS headless custom (Strapi/Directus/Sanity) + frontend propio**: el
  camino elegido (Supabase) es, en la práctica, una versión ligera de esta
  idea — base de datos + auth + storage administrados, sin mantener un
  servidor propio, y gratis para este volumen de tráfico/datos.

## Restricciones importantes
- Claude no maneja contraseñas, tokens secretos ni credenciales del
  cliente — la `anon` `public` key de Supabase es la única credencial
  embebida en el código, y es segura por diseño (protegida por RLS).
- Claude no puede crear cuentas (GitHub, Netlify, Supabase) en nombre del
  usuario — las crea y loguea el usuario, Claude sólo hace push de código
  y da instrucciones.
- Prioridad: bajo costo (ideal: $0/mes), facilidad de gestión de contenido
  para alguien no técnico vía el panel de admin propio.
