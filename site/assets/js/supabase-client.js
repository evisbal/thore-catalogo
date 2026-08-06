// Cliente de Supabase compartido por el catálogo público y el panel
// de admin. La "anon key" es segura de exponer client-side por
// diseño — el acceso real se controla con las políticas de Row
// Level Security definidas en supabase/schema.sql (lectura pública,
// escritura sólo para usuarios logueados).
const SUPABASE_URL = "https://jcsmbklwsgzsohqkftfy.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjc21ia2x3c2d6c29ocWtmdGZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwMjc4MjUsImV4cCI6MjEwMTYwMzgyNX0.cx-XdztGsNP07xFpdWYxFQIbevOh0EWzRpqQD5p3LkI";

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
