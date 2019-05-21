<template>
  <div id="popup">
    <div id="scraped-content" v-if="scraped">
      <div class="coto">
        <a v-bind:href="url" target="_blank">{{ title }}</a>
      </div>
      <div class="buttons">
        <button class="button" v-on:click="cancel()">Cancel</button>
        <button class="button button-primary">Post</button>
      </div>
    </div>
    <div id="scrape-buttons" v-else>
      <div id="scrape-title" v-on:click="scrapeTitle()">
        <button class="button">Title as Link</button>
      </div>
      <div id="scrape-selection">
        <button class="button" disabled>Selection</button>
      </div>
      <div id="scrape-kindle-highlights">
        <button class="button" disabled>Kindle highlights</button>
      </div>
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";

export default {
  data() {
    return {
      scraped: false,
      title: "",
      url: ""
    };
  },

  methods: {
    hello() {
      console.log("hello");
    },

    scrapeTitle() {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        this.title = tabs[0].title;
        this.url = tabs[0].url;
        this.scraped = true;
      });
    },

    cancel() {
      this.title = "";
      this.url = "";
      this.scraped = false;
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
    this.hello();
  }
};
</script>
