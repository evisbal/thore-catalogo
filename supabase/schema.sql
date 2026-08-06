-- ============================================================
-- Thoré Catálogo — esquema inicial de Supabase
-- Ejecutar completo en: Dashboard > SQL Editor > New query > Run
-- ============================================================

-- Tabla de productos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  price numeric(10,2) not null,
  original_price numeric(10,2),
  description text,
  image_url text,
  badge text check (badge in ('sale', 'sold-out')),
  availability text,
  category text,
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Mantiene updated_at al día en cada edición
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at
before update on products
for each row execute function set_updated_at();

-- Row Level Security: el catálogo público puede leer,
-- sólo un usuario logueado (el admin) puede escribir.
alter table products enable row level security;

drop policy if exists "Public read access" on products;
create policy "Public read access"
on products for select
using (true);

drop policy if exists "Authenticated insert" on products;
create policy "Authenticated insert"
on products for insert
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated update" on products;
create policy "Authenticated update"
on products for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated delete" on products;
create policy "Authenticated delete"
on products for delete
using (auth.role() = 'authenticated');

-- Bucket de Storage para las fotos de producto (lectura pública)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Authenticated insert product images" on storage.objects;
create policy "Authenticated insert product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated update product images" on storage.objects;
create policy "Authenticated update product images"
on storage.objects for update
using (bucket_id = 'product-images' and auth.role() = 'authenticated');

drop policy if exists "Authenticated delete product images" on storage.objects;
create policy "Authenticated delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and auth.role() = 'authenticated');
