import 'whatwg-fetch'

let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function (data) {
  changeColor.style.backgroundColor = data.color;
  changeColor.setAttribute('value', data.color);
});

changeColor.onclick = function (element) {
  fetch('http://localhost:4000/api/cotos', {
    credentials: 'include',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Cotoami-Client-Id': 'dummy'
    },
    body: JSON.stringify({
      coto: {
        content: "Hello from Cotoami Scraper!",
        summary: null,
        cotonoma_id: null
      }
    })
  })
    .then((data) => data.json())
    .then((data) => console.log('data', data))


  let color = element.target.value;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(
      tabs[0].id,
      { code: 'document.body.style.backgroundColor = "' + color + '";' });
  });
};
