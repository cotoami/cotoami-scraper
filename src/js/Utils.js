import "whatwg-fetch";

const _throwStatusError = response => {
  var error = new Error(response.statusText);
  error.response = response;
  throw error;
}

export default class {
  static isAbsoluteUrl(url) {
    return /^[a-z][a-z\d+.-]*:/.test(url);
  }

  static checkStatusAndParseBodyAsJson(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      _throwStatusError(response);
    }
  }

  static checkStatusAndGetTextBody(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.text();
    } else {
      _throwStatusError(response);
    }
  }

  static postCoto(content, cotonomaId) {
    return fetch(COTOAMI_URL + "/api/cotos", {
      credentials: "include",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-Cotoami-Client-Id": "dummy"
      },
      body: JSON.stringify({
        coto: {
          content: content,
          summary: null,
          cotonoma_id: cotonomaId
        }
      })
    })
      .then(this.checkStatusAndParseBodyAsJson.bind(this))
  }
}