import { examTracks, loadGlobalProfile, locales, saveGlobalProfile, t, type ExamTrack, type Locale } from './global';

let profile = loadGlobalProfile();

function applyLocale() {
  const config = locales.find((item) => item.id === profile.locale) || locales[0];
  document.documentElement.lang = profile.locale;
  document.documentElement.dir = config.dir;
  document.documentElement.dataset.locale = profile.locale;
  localStorage.setItem('sq_lang', profile.locale === 'ar' ? 'ar' : 'en');
  document.title = 'SurgiQuiz — Global Adaptive Surgical Learning';

  const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (description) description.content = t(profile.locale, 'heroBody');
}

function option(value: string, label: string, selected: boolean) {
  return `<option value="${value}" ${selected ? 'selected' : ''}>${label}</option>`;
}

function closeModal() {
  document.querySelector('#global-profile-modal')?.remove();
}

function openModal() {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'global-profile-modal';
  overlay.className = 'global-overlay';
  overlay.innerHTML = `
    <section class="global-modal" role="dialog" aria-modal="true" aria-labelledby="global-title">
      <div class="global-modal-head">
        <div><span class="kicker">SurgiQuiz Global</span><h2 id="global-title">${t(profile.locale, 'globalSettings')}</h2></div>
        <button class="global-close" aria-label="Close">×</button>
      </div>
      <p class="small">${t(profile.locale, 'globalSettingsBody')}</p>
      <div class="global-fields">
        <label><span>${t(profile.locale, 'language')}</span><select id="global-locale">
          ${locales.map((locale) => option(locale.id, `${locale.native} · ${locale.status === 'full' ? t(profile.locale, 'fullContent') : t(profile.locale, 'interfacePreview')}`, locale.id === profile.locale)).join('')}
        </select></label>
        <label><span>${t(profile.locale, 'examTrack')}</span><select id="global-track">
          ${examTracks.map((track) => option(track.id, `${track.title} — ${track.subtitle}`, track.id === profile.examTrack)).join('')}
        </select></label>
        <label><span>${t(profile.locale, 'region')}</span><input id="global-region" value="${profile.region.replace(/"/g, '&quot;')}" autocomplete="country-name" /></label>
      </div>
      <div class="global-note">French and Spanish currently localize the product shell; reviewed medical learning content falls back to English until specialist translation is available.</div>
      <div class="global-actions"><button class="btn global-cancel">Cancel</button><button class="btn primary global-save">${t(profile.locale, 'save')}</button></div>
    </section>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.global-close')?.addEventListener('click', closeModal);
  overlay.querySelector('.global-cancel')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  overlay.querySelector('.global-save')?.addEventListener('click', () => {
    const locale = (overlay.querySelector<HTMLSelectElement>('#global-locale')?.value || 'en') as Locale;
    const examTrack = (overlay.querySelector<HTMLSelectElement>('#global-track')?.value || 'global-core') as ExamTrack;
    const region = overlay.querySelector<HTMLInputElement>('#global-region')?.value.trim() || 'Global';
    profile = { locale, examTrack, region };
    saveGlobalProfile(profile);
    closeModal();
    location.reload();
  });
}

function mountGlobalControl() {
  if (document.querySelector('#global-profile-button')) return;
  const button = document.createElement('button');
  button.id = 'global-profile-button';
  button.className = 'global-profile-button';
  button.type = 'button';
  button.innerHTML = `🌍 <span>${t(profile.locale, 'global')}</span>`;
  button.setAttribute('aria-label', t(profile.locale, 'globalSettings'));
  button.addEventListener('click', openModal);
  document.body.appendChild(button);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
  }
}

applyLocale();
mountGlobalControl();
registerServiceWorker();
