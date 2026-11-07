/* GA4 loads only after the visitor accepts analytics. */
(() => {
  'use strict';
  const key = 'jolaball-analytics-consent-v1';
  const measurementId = 'G-Z233X8GGCC';
  let consent;
  let started = false;
  try { consent = localStorage.getItem(key); } catch (_) { /* Keep choice in memory. */ }

  function start() {
    if (started || consent !== 'granted') return;
    started = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    // Keep campaign tags, but omit other query values and URL fragments.
    window.gtag('config', measurementId, {
      page_location: campaignLocation(),
      page_referrer: cleanReferrer(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.append(script);
  }
  function campaignLocation() {
    const url = new URL(location.href);
    const safe = new URL(url.origin + url.pathname);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
      if (url.searchParams.has(key)) safe.searchParams.set(key, url.searchParams.get(key));
    });
    return safe.href;
  }
  function cleanReferrer() {
    try {
      const url = new URL(document.referrer);
      return url.origin + url.pathname;
    } catch (_) { return ''; }
  }
  window.jolaballTrack = function (name) {
    if (consent === 'granted' && started && name === 'generate_lead') {
      window.gtag('event', name, { send_to: measurementId });
    }
  };

  const style = document.createElement('style');
  style.textContent = '.analytics-choice{position:fixed;bottom:16px;left:16px;right:16px;z-index:1000;max-width:620px;padding:20px;background:#fff;color:#173c32;border:1px solid #bccbc4;border-radius:14px;box-shadow:0 4px 24px #0003;font:16px/1.5 system-ui}.analytics-choice[hidden]{display:none}.analytics-choice p{margin:0 0 14px}.analytics-choice div{display:flex;flex-wrap:wrap;gap:10px}.analytics-choice button,.analytics-settings{font:inherit;cursor:pointer}.analytics-choice button{padding:10px 16px;border:1px solid #173c32;border-radius:8px;background:#fff;color:#173c32}.analytics-choice button:focus-visible,.analytics-settings:focus-visible{outline:3px solid #ca942d;outline-offset:3px}.analytics-settings{display:block;margin:12px auto;background:transparent;border:0;color:inherit;text-decoration:underline}';
  document.head.append(style);
  const panel = document.createElement('aside');
  panel.className = 'analytics-choice';
  panel.setAttribute('aria-label', 'Val um vefmælingar');
  panel.innerHTML = '<p>Við notum Google Analytics, með þínu samþykki, til að sjá hvaðan heimsóknir koma og hvort þær leiða til fyrirspurna. Google fær upplýsingar um notkun síðunnar og vistar mælingakökur í vafranum. Þú getur breytt valinu neðst á síðunni. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">Persónuvernd hjá Google</a>.</p><div><button type="button" data-choice="denied">Hafna mælingum</button><button type="button" data-choice="granted">Samþykkja mælingar</button></div>';
  panel.hidden = consent === 'granted' || consent === 'denied';
  panel.addEventListener('click', event => {
    const choice = event.target.dataset.choice;
    if (choice !== 'granted' && choice !== 'denied') return;
    consent = choice;
    try { localStorage.setItem(key, choice); } catch (_) { /* Keep choice in memory. */ }
    panel.hidden = true;
    if (choice === 'granted') start();
    else if (started) {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
      // Clear this site's Analytics cookies when consent is withdrawn.
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        if (!/^_ga(?:_|$)/.test(name)) return;
        ['', location.hostname, '.' + location.hostname, '.jolaball.is'].forEach(domain => {
          document.cookie = name + '=; Max-Age=0; path=/' + (domain ? '; domain=' + domain : '');
        });
      });
      location.reload();
    }
    settings.focus({ preventScroll: true });
  });
  const settings = document.createElement('button');
  settings.type = 'button';
  settings.className = 'analytics-settings';
  settings.textContent = 'Stillingar vefmælinga';
  settings.addEventListener('click', () => {
    panel.hidden = false;
    panel.querySelector('button').focus({ preventScroll: true });
  });
  document.body.append(panel);
  (document.querySelector('footer') || document.body).append(settings);
  start();
})();
