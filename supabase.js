/* ================================================================
   SUPABASE CLIENT
   
   !! VÓÓR JE DE SITE OPENT: vul hieronder de twee waarden in.
   !! Hoe: zie setup.html voor stap-voor-stap uitleg.
   ================================================================ */

const SUPABASE_URL = 'https://lcryhydrrohywjvkktdy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcnloeWRycm9oeXdqdmtrdGR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4MTU2MTcsImV4cCI6MjEwMzM5MTYxN30.mnoEyl0QbY5OPfhxYvzsVPaOgkVdjOprDMuGumKkAl4';       // lange jwt-string

const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Auth guard — roep aan bovenaan elke beveiligde pagina.
   Geen sessie = doorsturen naar index.html. */
async function requireAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (!session) { window.location.replace('./index.html'); return null; }
  return session;
}

/* Uitloggen */
async function logout() {
  await db.auth.signOut();
  window.location.replace('./index.html');
}

/* Huidige gebruiker */
async function huidigGebruiker() {
  const { data: { user } } = await db.auth.getUser();
  return user;
}
