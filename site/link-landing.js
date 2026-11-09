(function (w, d) {
  'use strict';
  try {
    var url = new URL(w.location.href);
    var click = url.searchParams.get('_go');
    var name = 'link_landed';
    if (click && /^[A-Za-z0-9]{8}$/.test(click)) {
      url.searchParams.delete('_go');
      w.history.replaceState(w.history.state, '', url.pathname + url.search + url.hash);
    } else {
      var cookie = d.cookie.match(/(?:^|;\s*)go_cid=([A-Za-z0-9]{8})/);
      if (!cookie || w.sessionStorage.getItem('go_ret')) return;
      w.sessionStorage.setItem('go_ret', '1');
      click = cookie[1];
      name = 'link_return';
    }
    var tries = 0;
    (function send() {
      if (w.umami && typeof w.umami.track === 'function') {
        w.umami.track(name, { click: click });
      } else if (tries++ < 100) {
        w.setTimeout(send, 100);
      }
    })();
  } catch (e) { /* measurement never affects the page */ }
})(window, document);
