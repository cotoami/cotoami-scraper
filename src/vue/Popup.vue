<template>
  <div id="popup">
    <div id="loading-session" v-if="loadingSession">
      <img src="../images/loading.gif">
    </div>
    <div id="in-session" v-else-if="session">
      <div v-if="scraper">
        <component v-bind:is="scraper" v-on:cancel="closeScraper"></component>
      </div>
      <div id="main-menu" v-else>
        <div id="amishi">
          <img class="avatar" v-bind:src="session.amishi.avatar_url">
          <span class="name">{{session.amishi.display_name}}</span>
        </div>
        <div id="scrape-buttons">
          <div id="scrape-title" v-on:click="scraper = 'page-link-scraper'">
            <button class="button">Page link</button>
          </div>
          <div id="scrape-selection">
            <button
              class="button"
              v-on:click="scraper = 'selection-scraper'"
              v-bind:disabled="!textSelected"
            >Selection</button>
          </div>
          <div id="scrape-kindle-highlights">
            <button class="button" v-bind:disabled="!inKindleHighlights()">Kindle highlights</button>
          </div>
        </div>
      </div>
    </div>
    <div id="no-session" v-else>
      You need to sign in to:
      <a v-bind:href="cotoamiUrl" target="_blank">{{cotoamiUrl}}</a>
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";
import Utils from "../js/Utils.js";
import PageLinkScraper from "./PageLinkScraper.vue";
import SelectionScraper from "./SelectionScraper.vue";

export default {
  data() {
    return {
      cotoamiUrl: COTOAMI_URL,
      url: "",
      loadingSession: true,
      session: null,
      scraper: null,
      textSelected: false
    };
  },

  components: {
    "page-link-scraper": PageLinkScraper,
    "selection-scraper": SelectionScraper
  },

  methods: {
    getUrl() {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        this.url = tabs[0].url;
      });
    },

    inKindleHighlights() {
      return new URL(this.url).hostname.indexOf("read.amazon.") === 0;
    },

    fetchSession() {
      fetch(COTOAMI_URL + "/api/public/session", {
        credentials: "include"
      })
        .then(Utils.checkStatusAndParseBodyAsJson)
        .then(json => {
          this.session = json;
          this.loadingSession = false;
        })
        .catch(error => {
          console.log("request failed", error);
          this.loadingSession = false;
        });
    },

    checkSelection() {
      chrome.tabs.executeScript(
        {
          code: "window.getSelection().toString();"
        },
        ([selection]) => {
          this.textSelected = selection && selection !== "";
        }
      );
    },

    closeScraper() {
      this.scraper = null;
    }
  },

  beforeMount() {
    this.getUrl();
    this.fetchSession();
    this.checkSelection();
  }
};
</script>
