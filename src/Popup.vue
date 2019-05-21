<template>
  <div id="popup">
    <div id="posted" v-if="posted">
      <img src="./done.gif"> Posted.
    </div>
    <div id="scraped" v-else-if="scraper && scraper.scraped">
      <div id="scraped-content" v-html="scraper.html()"></div>
      <div class="buttons">
        <button class="button" v-on:click="cancel()" v-if="!posting">Cancel</button>
        <button
          class="button button-primary"
          v-on:click="post()"
          v-bind:disabled="posting"
        >{{ posting ? 'Posting...' : 'Post' }}</button>
      </div>
    </div>
    <div id="scaping" v-else-if="scraper && scraper.scaping">Scaping...</div>
    <div id="scrape-buttons" v-else>
      <div id="scrape-title" v-on:click="scrape(createPageLinkScraper())">
        <button class="button">Page link</button>
      </div>
      <div id="scrape-selection">
        <button class="button" v-bind:disabled="textSelected">Selection</button>
      </div>
      <div id="scrape-kindle-highlights">
        <button class="button" disabled>Kindle highlights</button>
      </div>
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";
import PageLinkScraper from "./PageLinkScraper.js";

export default {
  data() {
    return {
      scraper: null,
      textSelected: false,
      posting: false,
      posted: false
    };
  },

  methods: {
    checkSelection() {
      chrome.tabs.executeScript(
        {
          code: "window.getSelection().toString();"
        },
        ([selection]) => {
          this.textSelected = !selection;
        }
      );
    },

    createPageLinkScraper() {
      return new PageLinkScraper();
    },

    scrape(scraper) {
      this.scraper = scraper;
      this.scraper.scrape();
    },

    cancel() {
      this.scraper = null;
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
            content: this.scraper.markdown(),
            summary: null,
            cotonoma_id: null
          }
        })
      }).then(data => {
        this.posting = false;
        this.posted = true;
      });
    }
  },

  beforeMount() {
    this.checkSelection();
  }
};
</script>
