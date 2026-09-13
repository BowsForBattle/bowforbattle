/* ============================================================
   Bows for Battle - "Share with a Vet" button
   ------------------------------------------------------------
   Any element with [data-share-vet] shares a link to the
   eligibility page. Uses the native share sheet when available
   (phones), otherwise copies the link to the clipboard.
   ============================================================ */
(function () {
  'use strict';

  var SHARE_TITLE = 'Bows for Battle - Veteran Sign-Up';
  var SHARE_TEXT = 'Bows for Battle supports veterans through archery. Any veteran, any era, free. Here is how to sign up:';

  function targetUrl(el) {
    // Resolve relative to the current page so it works on any host/domain.
    var href = el.getAttribute('data-share-url') || 'eligibility.html';
    return new URL(href, window.location.href).href;
  }

  function flash(el, message) {
    var original = el.getAttribute('data-label') || el.textContent;
    if (!el.getAttribute('data-label')) {
      el.setAttribute('data-label', original);
    }
    el.textContent = message;
    window.setTimeout(function () {
      el.textContent = el.getAttribute('data-label');
    }, 2200);
  }

  function copyFallback(el, url) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        flash(el, 'Link copied!');
      }, function () {
        window.prompt('Copy this link to share:', url);
      });
      return;
    }
    window.prompt('Copy this link to share:', url);
  }

  function onShare(event) {
    var el = event.currentTarget;
    var url = targetUrl(el);
    if (navigator.share) {
      navigator.share({ title: SHARE_TITLE, text: SHARE_TEXT, url: url })
        .catch(function () { /* user dismissed the share sheet; do nothing */ });
      return;
    }
    copyFallback(el, url);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var buttons = document.querySelectorAll('[data-share-vet]');
    Array.prototype.forEach.call(buttons, function (el) {
      el.addEventListener('click', onShare);
    });
  });
})();
