<template>
  <div id="popup">
    <div id="scraped-content" v-if="scraped">
      <div class="coto">
        <a v-bind:href="url" target="_blank">{{ title }}</a>
      </div>
      <div class="buttons">
        <button class="button" v-on:click="clear()" v-if="!posting">Cancel</button>
        <button
          class="button button-primary"
          v-on:click="post()"
          v-bind:disabled="posting"
        >{{ posting ? 'Posting...' : 'Post' }}</button>
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
      url: "",
      posting: false
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

    clear() {
      this.title = "";
      this.url = "";
      this.scraped = false;
      this.posting = false;
    },

    createContent() {
      return `[${this.title}](${this.url})`;
    },

    post() {
      this.posting = true;
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
            content: this.createContent(),
            summary: null,
            cotonoma_id: null
          }
        })
      }).then(data => {
        this.clear();
      });
    }
  },

  beforeMount() {
    this.hello();
  }
};
</script>
