/* ================================================================
   NOTIFICATIES — Browser push notifications
   Geladen op elke pagina via ui.js na initialisatie.
   Vereist: supabase.js + ui.js vóór dit bestand.
   ================================================================ */

async function initNotificaties() {
  // Controleer of notificaties ingeschakeld zijn in instellingen
  if (localStorage.getItem('notifs_enabled') === 'false') return;

  // Toestemming vragen als nog niet gegeven
  if (Notification.permission === 'default') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') return;

  // Sla per dag op welke notificaties al verstuurd zijn
  const vandaag  = new Date().toISOString().split('T')[0];
  const sleutel  = 'notified_' + vandaag;
  const verzonden = JSON.parse(localStorage.getItem(sleutel) || '[]');

  function stuurNotif(id, titel, tekst) {
    if (verzonden.includes(id)) return;
    new Notification(titel, { body: tekst, icon: '' });
    verzonden.push(id);
    localStorage.setItem(sleutel, JSON.stringify(verzonden));
  }

  // ---- Examens -----------------------------------------------
  const { data: examens } = await db
    .from('exams')
    .select('id, title, date, subjects(name)')
    .gte('date', vandaag)
    .order('date')
    .limit(30);

  const dagIntervals = JSON.parse(localStorage.getItem('notifs_dagen') || '[1,3,7]');

  (examens || []).forEach(e => {
    const d = dagenTot(e.date);
    dagIntervals.forEach(dag => {
      if (d === dag) {
        stuurNotif(
          `exam_${e.id}_${dag}`,
          `📅 Examen over ${dag} dag${dag !== 1 ? 'en' : ''}`,
          `${e.title}${e.subjects?.name ? ' — ' + e.subjects.name : ''}`
        );
      }
    });
  });

  // ---- Deadlines morgen ------------------------------------
  const morgen = new Date();
  morgen.setDate(morgen.getDate() + 1);
  const morgenStr = morgen.toISOString().split('T')[0];

  const { data: deadlines } = await db
    .from('deadlines')
    .select('id, title, subjects(name)')
    .eq('due_date', morgenStr)
    .eq('completed', false);

  (deadlines || []).forEach(d => {
    stuurNotif(
      `deadline_${d.id}_morgen`,
      `⏰ Deadline morgen`,
      `${d.title}${d.subjects?.name ? ' — ' + d.subjects.name : ''}`
    );
  });

  // ---- Dagelijkse studieherinnering ------------------------
  const herinnerTijd = localStorage.getItem('notifs_herinner_tijd') || '18:00';
  const [uur, min]   = herinnerTijd.split(':').map(Number);
  const nu           = new Date();
  const doelTijd     = new Date();
  doelTijd.setHours(uur, min, 0, 0);

  // Stuur de herinnering als het nu binnen 5 minuten van de ingestelde tijd is
  const verschil = Math.abs(nu - doelTijd) / 60000;
  if (verschil <= 5) {
    stuurNotif('studie_herinner_' + vandaag, '📚 Tijd om te studeren!', 'Plan je studiesessie voor vandaag.');
  }
}
