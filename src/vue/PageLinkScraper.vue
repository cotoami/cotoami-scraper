<template>
  <div id="page-link-scraper">
    <div id="error" v-if="error">Something went wrong...</div>
    <div id="posted" v-else-if="posted">
      <img src="../images/done.gif"> Posted.
    </div>
    <div id="scraped" v-else-if="scraped">
      <div id="scraped-content">
        <div class="coto">
          <a v-bind:href="url" target="_blank">{{ title }}</a>
        </div>
      </div>
      <div class="buttons">
        <button class="button" v-on:click="cancel()" v-if="!posting">Cancel</button>
        <button
          class="button button-primary"
          v-on:click="post()"
          v-bind:disabled="posting"
        >{{ posting ? 'Posting...' : 'Post' }}</button>
      </div>
    </div>
    <div id="scaping" v-else-if="scaping">Scaping...</div>
  </div>
</template>

<script>
import Utils from "../js/Utils.js";

export default {
  data() {
    return {
      title: "",
      url: "",
      scaping: false,
      scraped: false,
      posting: false,
      posted: false,
      error: null
    };
  },

  methods: {
    scrape() {
      this.scaping = true;
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        this.title = tabs[0].title;
        this.url = tabs[0].url;
        this.scraped = true;
        this.scaping = false;
      });
    },

    cancel() {
      this.$emit("cancel");
    },

    markdown() {
      return `[${this.title}](${this.url})`;
    },

    post() {
      this.posting = true;
      fetch(COTOAMI_URL + "/api/cotos", {
        credentials: "include",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-Cotoami-Client-Id": "dummy"
        },
        body: JSON.stringify({
          coto: {
            content: this.markdown(),
            summary: null,
            cotonoma_id: null
          }
        })
      })
        .then(Utils.checkStatusAndParseBodyAsJson)
        .then(json => {
          this.posting = false;
          this.posted = true;
        })
        .catch(error => {
          console.log("request failed", error);
          this.error = error;
        });
    }
  },

  beforeMount() {
    this.scrape();
  }
};
</script>
