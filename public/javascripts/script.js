window.addEventListener('load', function () {
  if ($('#persona')) {
    navigator.id.logout()

    $('#persona').addEventListener('click', function () {
      navigator.id.request()
    })

    navigator.id.watch({
      onlogin: function (assertion) {
        post('login/persona', {
          assertion: assertion
        })
      }
    })
  }
})

function $ (selector) {
  return document.querySelector(selector)
}

// adapted from http://stackoverflow.com/a/133997
function post (path, body) {
  var form = document.createElement('form')
  form.setAttribute('method', 'post')
  form.setAttribute('action', path)

  for (var key in body) {
    var input = document.createElement('input')
    input.setAttribute('name', key)
    input.setAttribute('value', body[key])
    input.setAttribute('type', 'hidden')
    form.appendChild(input)
  }

  document.body.appendChild(form)
  form.submit()
}
