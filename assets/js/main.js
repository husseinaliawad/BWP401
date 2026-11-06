/* تفاعلات الواجهة فقط: لا يوجد خادم ولا إرسال أو تخزين لبيانات النماذج. */
(() => {
  'use strict';
  const { events, categories, team } = window.LAMMA;
  const $ = selector => document.querySelector(selector);
  const escapeHTML = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const categoryOf = event => categories.find(category => category.id === event.category);
  const dateLabel = date => new Intl.DateTimeFormat('ar-SY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Damascus' }).format(new Date(`${date}T12:00:00+03:00`));
  const timeLabel = time => new Intl.DateTimeFormat('ar-SY', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Damascus' }).format(new Date(`2026-11-01T${time}:00+03:00`));
  const storage = {
    get(key) { try { return localStorage.getItem(`lamma-${key}`); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(`lamma-${key}`, value); } catch { /* التصفح الخاص لا يمنع عمل الموقع. */ } },
    remove(key) { try { localStorage.removeItem(`lamma-${key}`); } catch { /* التخزين اختياري. */ } }
  };

  function badge(event) {
    const category = categoryOf(event);
    return `<span class="badge badge-category ${category.color}">${category.name}</span>`;
  }

  function eventCard(event) {
    const day = new Intl.DateTimeFormat('ar-SY', { day: 'numeric' }).format(new Date(`${event.date}T12:00:00`));
    const month = new Intl.DateTimeFormat('ar-SY', { month: 'short' }).format(new Date(`${event.date}T12:00:00`));
    return `<div class="col-lg-4 col-md-6"><article class="card event-card"><div class="card-image-wrap"><a href="event.html?id=${event.id}" tabindex="-1" aria-hidden="true"><img class="card-img-top" src="assets/img/${event.image}" alt="" width="1100" height="733" loading="lazy"></a><span class="date-chip" aria-label="${dateLabel(event.date)}"><b>${day}</b><small>${month}</small></span></div><div class="card-body">${badge(event)}<h3><a href="event.html?id=${event.id}">${escapeHTML(event.title)}</a></h3><div class="event-meta"><span class="meta-icon" aria-hidden="true">◷</span><time datetime="${event.date}T${event.time}:00+03:00">${dateLabel(event.date)} · ${timeLabel(event.time)}</time></div><div class="event-meta"><span class="meta-icon" aria-hidden="true">⌖</span><span>${escapeHTML(event.venue)}</span></div><p>${escapeHTML(event.description)}</p><div class="card-bottom"><span class="free-label">مشاركة مجانية</span><a class="text-link" href="event.html?id=${event.id}" aria-label="تفاصيل ${escapeHTML(event.title)}">التفاصيل <span aria-hidden="true">←</span></a></div></div></article></div>`;
  }

  // تفضيل المظهر مشترك بين الصفحات، ويظل اختياريًا عند حظر localStorage.
  const themeButton = $('#theme-toggle');
  function applyTheme(dark) {
    document.body.classList.toggle('dark-mode', dark);
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
    themeButton.textContent = dark ? '☀' : '☾';
  }
  applyTheme(storage.get('theme') === 'dark');
  themeButton.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark-mode');
    applyTheme(dark);
    storage.set('theme', dark ? 'dark' : 'light');
  });
  document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
  document.querySelectorAll('[data-team]').forEach(element => {
    element.innerHTML = team.map(member => `<div class="col-lg-4"><article class="team-card"><img src="assets/img/avatar.svg" alt="صورة رمزية لعضو الفريق" width="66" height="66" loading="lazy"><div><h3>${escapeHTML(member.name)}</h3><p>${escapeHTML(member.role)}</p><small>الرقم الجامعي: <b><bdi dir="ltr">${escapeHTML(member.id)}</bdi></b></small></div></article></div>`).join('');
  });
  const toTop = $('#to-top');
  window.addEventListener('scroll', () => { toTop.hidden = window.scrollY < 450; }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));

  function initHome() {
    $('#category-grid').innerHTML = categories.map(category => `<a href="events.html?category=${category.id}" class="category-tile"><span class="category-icon ${category.color}" aria-hidden="true">${category.icon}</span>${category.name}</a>`).join('');
    $('#latest-events').innerHTML = [...events].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3).map(eventCard).join('');
    const featured = events.filter(event => event.featured);
    let current = 0;
    function showFeatured() {
      const event = featured[current];
      $('#featured-event').innerHTML = `<article class="featured-shell"><img class="featured-photo" src="assets/img/${event.image}" alt="${escapeHTML(event.alt)}" width="1100" height="733" loading="lazy"><div class="featured-content">${badge(event)}<h3>${escapeHTML(event.title)}</h3><p>${escapeHTML(event.description)}</p><div class="event-meta"><span aria-hidden="true">◷</span><span>${dateLabel(event.date)} · ${timeLabel(event.time)}</span></div><div class="event-meta mb-4"><span aria-hidden="true">⌖</span><span>${escapeHTML(event.city)}</span></div><a class="btn btn-primary" href="event.html?id=${event.id}">اكتشف الفعالية ←</a></div></article>`;
      $('#featured-count').textContent = `${current + 1} / ${featured.length}`;
    }
    $('#featured-next').addEventListener('click', () => { current = (current + 1) % featured.length; showFeatured(); });
    $('#featured-prev').addEventListener('click', () => { current = (current - 1 + featured.length) % featured.length; showFeatured(); });
    showFeatured();
  }

  function initEvents() {
    const form = $('#filters');
    const search = $('#search');
    const category = $('#category');
    const date = $('#date');
    const city = $('#city');
    const remember = $('#remember');
    category.insertAdjacentHTML('beforeend', categories.map(item => `<option value="${item.id}">${item.name}</option>`).join(''));
    const normalize = text => text.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670ـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').trim();
    function readURL() {
      const params = new URLSearchParams(location.search);
      search.value = params.get('q') || '';
      category.value = params.has('category') ? params.get('category') : (storage.get('remember-category') === 'yes' ? storage.get('category') || '' : '');
      date.value = /^\d{4}-\d{2}-\d{2}$/.test(params.get('date') || '') ? params.get('date') : '';
      city.value = params.get('city') || '';
      remember.checked = storage.get('remember-category') === 'yes';
    }
    function render(updateURL = true) {
      const query = normalize(search.value);
      const matches = events.filter(event => (!query || normalize(`${event.title} ${event.description} ${event.venue} ${categoryOf(event).name}`).includes(query)) && (!category.value || event.category === category.value) && (!date.value || event.date === date.value) && (!city.value || event.city === city.value)).sort((a, b) => a.date.localeCompare(b.date));
      $('#events-grid').innerHTML = matches.map(eventCard).join('');
      $('#results-count').textContent = `${matches.length} من ${events.length} فعاليات`;
      $('#empty-state').hidden = matches.length > 0;
      if (remember.checked) storage.set('category', category.value);
      if (updateURL) {
        const url = new URL(location.href);
        url.search = '';
        for (const [key, value] of [['q', search.value.trim()], ['category', category.value], ['date', date.value], ['city', city.value]]) if (value) url.searchParams.set(key, value);
        try { history.replaceState(null, '', url); } catch { /* تبقى الفلترة صالحة عند فتح الملفات مباشرة. */ }
      }
    }
    function clearFilters() {
      search.value = ''; category.value = ''; date.value = ''; city.value = '';
      storage.remove('category');
      render();
    }
    form.addEventListener('submit', event => { event.preventDefault(); render(); });
    form.addEventListener('input', () => render());
    form.addEventListener('change', () => render());
    remember.addEventListener('change', () => {
      storage.set('remember-category', remember.checked ? 'yes' : 'no');
      if (remember.checked) storage.set('category', category.value); else storage.remove('category');
    });
    form.addEventListener('reset', event => { event.preventDefault(); clearFilters(); });
    $('#clear-filters').addEventListener('click', clearFilters);
    window.addEventListener('popstate', () => { readURL(); render(false); });
    readURL(); render(false);
  }

  function initEvent() {
    const id = new URLSearchParams(location.search).get('id');
    const event = id === null ? events[0] : events.find(item => item.id === id);
    if (!event) {
      $('#event-detail').innerHTML = '<section class="unavailable"><div class="container text-center py-5"><span class="eyebrow justify-content-center">الرابط غير متاح</span><h1>لم نجد هذه الفعالية</h1><p>قد يكون الرابط غير صحيح. يمكنك اختيار فعالية من الأجندة.</p><a class="btn btn-primary" href="events.html">عرض كل الفعاليات ←</a></div></section>';
      document.title = 'الفعالية غير موجودة | لمّة';
      return;
    }
    document.title = `${event.title} | لمّة`;
    const related = [...events.filter(item => item.id !== event.id && item.category === event.category), ...events.filter(item => item.id !== event.id && item.category !== event.category)].slice(0, 3);
    $('#event-detail').innerHTML = `<section class="page-intro"><div class="container"><nav aria-label="مسار الصفحة"><ol class="breadcrumb"><li class="breadcrumb-item"><a href="index.html">الرئيسية</a></li><li class="breadcrumb-item"><a href="events.html">الفعاليات</a></li><li class="breadcrumb-item active" aria-current="page">تفاصيل الفعالية</li></ol></nav><span class="eyebrow">${escapeHTML(event.tag)}</span><div class="event-title-line"><h1>${escapeHTML(event.title)}</h1>${badge(event)}</div><p class="mt-3 mb-0">${escapeHTML(event.description)}</p></div></section>
      <section class="pb-4" aria-label="معلومات الفعالية"><div class="container"><img class="detail-hero" src="assets/img/${event.image}" alt="${escapeHTML(event.alt)}" width="1400" height="933"><div class="row g-4 detail-layout"><div class="col-lg-8"><section class="content-panel" aria-labelledby="description-title"><h2 id="description-title">عن هذا اللقاء</h2><p>${escapeHTML(event.full)}</p><p class="notice mb-0">فعالية افتراضية ضمن مشروع تعليمي. المواعيد والأماكن والصور للتوضيح ولا تمثل إعلانًا رسميًا.</p></section><section class="content-panel" aria-labelledby="program-title"><h2 id="program-title">كيف نقضي الوقت معًا؟</h2><ol class="program">${event.program.map(item => `<li>${escapeHTML(item)}</li>`).join('')}</ol></section><section class="content-panel" aria-labelledby="gallery-title"><h2 id="gallery-title">من أجواء اللقاءات</h2><div class="gallery"><img src="assets/img/${event.image}" alt="${escapeHTML(event.alt)}" loading="lazy" width="1100" height="733"><img src="assets/img/${event.category === 'art' ? 'culture.jpg' : 'art.jpg'}" alt="أدوات وألوان لأنشطة إبداعية مشتركة" loading="lazy" width="1100" height="733"></div><p class="notice mt-3 mb-0">صور توضيحية، وليست توثيقًا للفعالية.</p></section><section class="content-panel" aria-labelledby="location-title"><h2 id="location-title">أين نلتقي؟</h2><p>${escapeHTML(event.venue)}</p>${event.city === 'عن بُعد' ? '<div class="alert alert-info mb-0">لقاء افتراضي؛ لا يوجد موقع حضوري أو رابط اجتماع فعلي في النسخة التجريبية.</div>' : '<img class="map-image" src="assets/img/map.svg" alt="خريطة تخطيطية توضيحية تظهر علامة موقع بين الشوارع، ولا تحدد عنوانًا حقيقيًا" width="900" height="480" loading="lazy"><p class="notice mt-3 mb-0">مخطط ثابت توضيحي؛ لا يُستخدم للوصول إلى عنوان فعلي.</p>'}</section></div><div class="col-lg-4"><aside class="event-sidebar content-panel" aria-labelledby="booking-summary-title"><span class="eyebrow">لنترك موعدًا في الأجندة</span><h2 id="booking-summary-title">تفاصيل مشاركتك</h2><ul class="detail-facts"><li><span class="fact-icon" aria-hidden="true">▦</span><div><small>التاريخ</small><strong>${dateLabel(event.date)}</strong></div></li><li><span class="fact-icon" aria-hidden="true">◷</span><div><small>الوقت · بتوقيت دمشق UTC+3</small><strong>${timeLabel(event.time)} – ${timeLabel(event.end)}</strong></div></li><li><span class="fact-icon" aria-hidden="true">⌖</span><div><small>المكان</small><strong>${escapeHTML(event.venue)}</strong></div></li><li><span class="fact-icon" aria-hidden="true">◇</span><div><small>المشاركة</small><strong>مجانية · حجز تجريبي</strong></div></li></ul><div class="detail-actions"><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#bookingModal">احجز مكانك التجريبي ↖</button><button class="btn btn-outline-primary" id="add-calendar" type="button">أضف للتقويم <span aria-hidden="true">＋</span></button><button class="btn btn-outline-primary" id="share-event" type="button">شارك الفعالية ↗</button></div><div id="share-fallback" class="share-box" hidden><label for="share-url" class="form-label">انسخ الرابط لمشاركته</label><input class="form-control" id="share-url" type="url" dir="ltr" readonly><button class="btn btn-primary btn-sm mt-2" id="copy-link" type="button">نسخ الرابط</button></div><div class="alert mt-3 mb-0" id="event-status" role="status" aria-live="polite"></div><p class="detail-notice">لا يُنشئ الحجز التجريبي مقعدًا أو تذكرة حقيقية.</p></aside></div></div></div></section>
      <section class="section section-soft" aria-labelledby="related-title"><div class="container"><div class="section-heading"><div><span class="eyebrow">ربما يعجبك أيضًا</span><h2 id="related-title">لقاءات أخرى تجمعنا</h2></div><a class="text-link" href="events.html">كل الفعاليات ←</a></div><div class="row g-4">${related.map(eventCard).join('')}</div></div></section>`;
    $('#add-calendar').addEventListener('click', () => downloadCalendar(event));
    $('#share-event').addEventListener('click', async () => {
      const url = new URL(`event.html?id=${event.id}`, location.href).href;
      if (navigator.share && location.protocol !== 'file:') {
        try { await navigator.share({ title: event.title, text: event.description, url }); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      $('#share-fallback').hidden = false;
      $('#share-url').value = url;
      $('#share-url').focus(); $('#share-url').select();
    });
    $('#copy-link').addEventListener('click', async () => {
      const field = $('#share-url'); field.focus(); field.select();
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(field.value);
        showAlert($('#event-status'), 'تم نسخ رابط الفعالية.', 'success');
      } catch { showAlert($('#event-status'), 'الرابط محدد؛ انسخه يدويًا من الحقل للمشاركة.', 'info'); }
    });
    initValidatedForm($('#booking-form'), $('#booking-status'), 'اكتملت محاكاة الحجز بنجاح. لم يُحجز مقعد فعلي ولم تُرسل بياناتك.');
  }

  function downloadCalendar(event) {
    const utc = time => new Date(`${event.date}T${time}:00+03:00`).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const icsEscape = text => String(text).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    // RFC 5545: نطوي الأسطر حسب بايتات UTF-8 لتبقى النصوص العربية سليمة.
    const fold = line => {
      const encoder = new TextEncoder(); let output = ''; let length = 0;
      for (const character of line) {
        const size = encoder.encode(character).length;
        if (length + size > 75) { output += '\r\n '; length = 1; }
        output += character; length += size;
      }
      return output;
    };
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lamma//University Events//AR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:${event.id}-2026@lamma.example`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`, `DTSTART:${utc(event.time)}`, `DTEND:${utc(event.end)}`, `SUMMARY:${icsEscape(`تجريبي: ${event.title}`)}`, `DESCRIPTION:${icsEscape(`${event.description}\nموعد افتراضي ضمن مشروع BWP401؛ لا يمثل فعالية حقيقية.`)}`, `LOCATION:${icsEscape(event.venue)}`, 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR'];
    const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = `lamma-${event.id}.ics`; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showAlert($('#event-status'), 'تم تجهيز موعد تجريبي للتنزيل. افتح ملف ICS في تطبيق التقويم لإضافته.', 'success');
  }

  function showAlert(element, message, type) {
    element.className = `alert alert-${type} mt-3 mb-0`;
    element.textContent = message;
  }

  function initValidatedForm(form, status, success) {
    const fields = [...form.querySelectorAll('input[required], textarea[required]')];
    function validate(field) {
      const value = field.value.trim();
      const valid = field.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && field.validity.valid : value.length >= (field.tagName === 'TEXTAREA' ? 10 : 2) && field.validity.valid;
      field.classList.toggle('is-invalid', !valid); field.classList.toggle('is-valid', valid);
      field.setAttribute('aria-invalid', String(!valid));
      return valid;
    }
    fields.forEach(field => field.addEventListener('input', () => {
      if (field.hasAttribute('aria-invalid')) validate(field);
      if (status.textContent) { status.textContent = ''; status.className = 'alert mt-3 mb-0'; }
    }));
    form.addEventListener('submit', event => {
      event.preventDefault();
      const results = fields.map(validate);
      if (results.every(Boolean)) {
        showAlert(status, success, 'success');
        form.reset();
        fields.forEach(field => { field.classList.remove('is-invalid', 'is-valid'); field.removeAttribute('aria-invalid'); });
        status.focus();
      } else {
        showAlert(status, 'راجع الحقول المحددة ثم حاول مرة أخرى.', 'danger');
        fields[results.indexOf(false)].focus();
      }
    });
  }

  switch (document.body.dataset.page) {
    case 'index': initHome(); break;
    case 'events': initEvents(); break;
    case 'event': initEvent(); break;
    case 'contact':
      if (new URLSearchParams(location.search).get('subject') === 'suggest') $('#subject').value = 'suggest';
      initValidatedForm($('#contact-form'), $('#contact-status'), 'تم التحقق من الرسالة بنجاح. هذا نموذج تجريبي؛ لم تُرسل الرسالة ولم تُخزن بياناتك.');
      break;
  }
})();
