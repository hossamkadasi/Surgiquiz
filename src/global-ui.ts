import { examTracks, loadGlobalProfile, locales, saveGlobalProfile, t, type ExamTrack, type Locale } from './global';

const hadStoredProfile = Boolean(localStorage.getItem('sq_global_profile'));
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

function openModal(firstRun = false) {
  closeModal();
  const overlay = document.createElement('div');
  overlay.id = 'global-profile-modal';
  overlay.className = 'global-overlay';
  overlay.innerHTML = `
    <section class="global-modal" role="dialog" aria-modal="true" aria-labelledby="global-title">
      <div class="global-modal-head">
        <div><span class="kicker">SurgiQuiz Global</span><h2 id="global-title">${firstRun ? t(profile.locale, 'globalWelcome') : t(profile.locale, 'globalSettings')}</h2></div>
        ${firstRun ? '' : '<button class="global-close" aria-label="Close">×</button>'}
      </div>
      <p class="small">${t(profile.locale, 'globalSettingsBody')}</p>
      <div class="global-fields">
        <label><span>${t(profile.locale, 'language')}</span><select id="global-locale">
          ${locales.map((locale) => option(locale.id, `${locale.native} · ${locale.status === 'full' ? t(profile.locale, 'fullContent') : t(profile.locale, 'interfacePreview')}`, locale.id === profile.locale)).join('')}
        </select></label>
        <label><span>${t(profile.locale, 'examTrack')}</span><select id="global-track">
          ${examTracks.map((track) => option(track.id, `${track.title} — ${track.subtitle}`, track.id === profile.examTrack)).join('')}
        </select></label>
        <label><span>${t(profile.locale, 'region')}</span><input id="global-region" value="${profile.region.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" autocomplete="country-name" /></label>
      </div>
      <div class="global-note">${t(profile.locale, 'translationBoundary')}</div>
      <div class="global-note global-trust-note">${t(profile.locale, 'examBoundary')}</div>
      <div class="global-actions">${firstRun ? '' : '<button class="btn global-cancel">Cancel</button>'}<button class="btn primary global-save">${firstRun ? t(profile.locale, 'continue') : t(profile.locale, 'save')}</button></div>
    </section>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.global-close')?.addEventListener('click', closeModal);
  overlay.querySelector('.global-cancel')?.addEventListener('click', closeModal);
  if (!firstRun) overlay.addEventListener('click', (event) => { if (event.target === overlay) closeModal(); });
  overlay.querySelector<HTMLSelectElement>('#global-locale')?.addEventListener('change', (event) => {
    const locale = (event.currentTarget as HTMLSelectElement).value as Locale;
    profile = { ...profile, locale };
  });
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
  button.addEventListener('click', () => openModal(false));
  document.body.appendChild(button);
}

function mountProfileStrip() {
  const wrap = document.querySelector('.wrap');
  const header = wrap?.querySelector('.top');
  if (!wrap || !header || wrap.querySelector('.global-profile-strip')) return;
  const track = examTracks.find((item) => item.id === profile.examTrack) || examTracks[0];
  const strip = document.createElement('div');
  strip.className = 'global-profile-strip';
  const locale = locales.find((item) => item.id === profile.locale) || locales[0];
  const items = [
    ['🌐', locale.native],
    ['🎯', track.title],
    ['📍', profile.region || 'Global'],
  ];
  for (const [icon, value] of items) {
    const chip = document.createElement('span');
    chip.className = 'global-profile-chip';
    const symbol = document.createElement('span');
    symbol.textContent = icon;
    const label = document.createElement('span');
    label.textContent = value;
    chip.append(symbol, label);
    strip.appendChild(chip);
  }
  const edit = document.createElement('button');
  edit.className = 'global-profile-edit';
  edit.type = 'button';
  edit.textContent = t(profile.locale, 'editProfile');
  edit.addEventListener('click', () => openModal(false));
  strip.appendChild(edit);
  header.insertAdjacentElement('afterend', strip);
}

function mountTrustLinks() {
  const footer = document.querySelector('.footer');
  if (!footer || footer.querySelector('.global-trust-links')) return;
  const links = document.createElement('span');
  links.className = 'global-trust-links';
  links.innerHTML = '<a href="/privacy.html">Privacy</a><a href="/terms.html">Terms</a><a href="/safety.html">Medical Safety</a>';
  footer.appendChild(document.createElement('br'));
  footer.appendChild(links);
}

function mountDynamicEnhancements() {
  mountProfileStrip();
  mountTrustLinks();
}

function observeApp() {
  const root = document.querySelector('#app');
  if (!root) return;
  const observer = new MutationObserver(() => mountDynamicEnhancements());
  observer.observe(root, { childList: true, subtree: true });
  mountDynamicEnhancements();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
  }
}

applyLocale();
mountGlobalControl();
observeApp();
registerServiceWorker();
if (!hadStoredProfile) window.addEventListener('load', () => openModal(true));
