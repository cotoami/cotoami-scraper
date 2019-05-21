<template>
  <div id="scrape-buttons">
    <div id="scrape-title">
      <button>Title as Link</button>
    </div>
    <div id="scrape-selection">
      <button>Selection</button>
    </div>
    <div id="scrape-kindle-highlights">
      <button>Kindle highlights</button>
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";

export default {
  data() {
    return {
      color: ""
    };
  },

  methods: {
    setColor() {
      console.log("setColor");
      chrome.storage.sync.get("color", data => {
        this.color = data.color;
      });
    },

    onClick(element) {
      fetch("http://localhost:4000/api/cotos", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Cotoami-Client-Id": "dummy"
        },
        body: JSON.stringify({
          coto: {
            content: "Hello from Cotoami Scraper!",
            summary: null,
            cotonoma_id: null
          }
        })
      })
        .then(data => data.json())
        .then(data => console.log("data", data));

      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        chrome.tabs.executeScript(tabs[0].id, {
          code: 'document.body.style.backgroundColor = "' + this.color + '";'
        });
      });
    }
  },

  beforeMount() {
    this.setColor();
  }
};
</script>

<style>
#scrape-buttons {
  padding: 1rem;
}

button {
  width: 200px;
}
</style>
