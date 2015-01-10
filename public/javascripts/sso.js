window.addEventListener('load', function() {
  navigator.id.logout();
});

document.querySelector('#persona').addEventListener('click', function() {
  navigator.id.request();
});

navigator.id.watch({
  onlogin: function(ass) {
    window.location.replace('/sso/persona?ass=' + encodeURIComponent(ass));
  }
});
