import "whatwg-fetch";

export default class {
  static checkStatusAndParseBodyAsJson(response) {
    if (response.status >= 200 && response.status < 300) {
      return response.json();
    } else {
      var error = new Error(response.statusText);
      error.response = response;
      throw error;
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
      .then(this.checkStatusAndParseBodyAsJson)
  }
}