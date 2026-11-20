/* ============================================================
   Bows for Battle - form submission
   ------------------------------------------------------------
   Every form.email-form posts to Netlify Forms, which stores
   the submission and emails it to the board. If the send fails,
   the visitor gets a pre-filled email link instead.
   Email format is checked by the browser (required + pattern
   on each email input in build.py).
   ============================================================ */
(function () {
  'use strict';

  var TO = [
    'jessehall@bowsforbattle.org',
    'dustinlangsdorf@bowsforbattle.org',
    'jasonturner@bowsforbattle.org',
    'amberhall@bowsforbattle.org',
    'tanya@bowsforbattle.org'
  ];

  var MIN_CLIENT_MS = 2500;
  var SUBMIT_COOLDOWN_MS = 20000;

  function now() {
    return Date.now();
  }

  function setStatus(form, message, ok, link) {
    var status = form.querySelector('.form-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'form-status';
      status.setAttribute('aria-live', 'polite');
      status.style.marginTop = '0.8rem';
      form.appendChild(status);
    }
    status.textContent = message;
    status.style.color = ok ? '#1f6f43' : '#8e1f1f';
    if (link) {
      var a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.text;
      status.appendChild(document.createTextNode(' '));
      status.appendChild(a);
    }
  }

  // Pre-filled email with the visitor's answers, used only if Netlify fails.
  function mailtoUrl(form) {
    var title = form.getAttribute('data-form-title') || 'Website Form';
    var lines = ['New website submission', 'Form: ' + title, 'Page: ' + window.location.href, ''];
    Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (field) {
      if (!field.name || field.type === 'hidden' || field.name === 'company_website') { return; }
      var label = field.id && form.querySelector('label[for="' + field.id + '"]');
      // Select options have no value attribute, so field.value is the visible text.
      var value = field.value.trim();
      if (value) {
        lines.push('- ' + (label ? label.textContent.replace(/\s+/g, ' ').trim() : field.name) + ': ' + value);
      }
    });
    return 'mailto:' + TO.join(',') +
      '?subject=' + encodeURIComponent('Bows for Battle - ' + title) +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  function cooldownKey(form) {
    return 'bfb-form-last-submit:' + (form.getAttribute('name') || 'form');
  }

  function blockedByCooldown(form) {
    try {
      var prev = Number(window.localStorage.getItem(cooldownKey(form)) || 0);
      return prev > 0 && (now() - prev) < SUBMIT_COOLDOWN_MS;
    } catch (err) {
      return false;
    }
  }

  function markSubmitted(form) {
    try {
      window.localStorage.setItem(cooldownKey(form), String(now()));
    } catch (err) {
      /* no-op when storage is unavailable */
    }
  }

  async function submit(form) {
    if (now() - Number(form.getAttribute('data-started-at')) < MIN_CLIENT_MS) {
      setStatus(form, 'Please wait a moment and try again.', false);
      return;
    }

    if (blockedByCooldown(form)) {
      setStatus(form, 'Please wait a few seconds before submitting again.', false);
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    setStatus(form, 'Sending your message...', true);

    try {
      // Netlify Forms expects URL-encoded fields, including form-name.
      var response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData(form)).toString()
      });
      if (!response.ok) {
        throw new Error('Request failed: ' + response.status);
      }
      markSubmitted(form);
      form.reset();
      form.setAttribute('data-started-at', String(now()));
      setStatus(form, 'Message sent. Thank you.', true);
    } catch (err) {
      // Keep the visitor's entries and offer a pre-filled email instead.
      setStatus(form, 'We could not send this right now.', false,
        { url: mailtoUrl(form), text: 'Click here to send it by email instead.' });
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = btnText; }
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.forEach.call(document.querySelectorAll('form.email-form'), function (form) {
      form.setAttribute('data-started-at', String(now()));
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        submit(form);
      });
    });
  });
})();
