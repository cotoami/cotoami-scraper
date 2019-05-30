<template>
  <div id="popup">
    <div id="loading-session" v-if="loadingSession">
      <img src="../images/loading.gif">
    </div>
    <div id="in-session" v-else-if="session">
      <div v-if="scraper">
        <component v-bind:is="scraper" v-bind:cotoami-url="cotoamiUrl" v-on:cancel="closeScraper"></component>
      </div>
      <div id="main-menu" v-else>
        <div id="amishi">
          <img class="avatar" v-bind:src="session.amishi.avatar_url">
          <span class="name">{{ session.amishi.display_name }}</span>
        </div>
        <div id="cotoami-url">{{ cotoamiUrl }}</div>

        <div id="scrape-buttons" v-if="isCotoamiVersionOk()">
          <div id="scrape-title">
            <button class="button" v-on:click="scraper = 'page-link-scraper'">Page link</button>
          </div>
          <div id="scrape-selection">
            <button
              class="button"
              v-on:click="scraper = 'selection-scraper'"
              v-bind:disabled="!textSelected"
            >Selection</button>
          </div>
          <div id="scrape-kindle-highlights">
            <button
              class="button"
              v-on:click="scraper = 'kindle-highlights-scraper'"
              v-bind:disabled="!inKindleHighlights()"
            >Kindle highlights</button>
          </div>
        </div>
        <div id="not-supported-version" v-else>
          <div>This extension requires Cotoami {{ requiredCotoamiVersion() }} or later.</div>
          <div
            class="server-version"
            v-if="session.app_version"
          >(The server version is: {{ session.app_version }})</div>
        </div>
      </div>
    </div>
    <div id="no-session" v-else>
      You need to sign in to:
      <a v-bind:href="cotoamiUrl" target="_blank">{{ cotoamiUrl }}</a>
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";
import Semver from "semver";
import Utils from "../js/Utils.js";
import PageLinkScraper from "./scrapers/PageLinkScraper.vue";
import SelectionScraper from "./scrapers/SelectionScraper.vue";
import KindleHighlightsScraper from "./scrapers/KindleHighlightsScraper.vue";

const REQUIRED_COTOAMI_VERSION = "0.23.0";

export default {
  data() {
    return {
      cotoamiUrl: "",
      url: "",
      loadingSession: true,
      session: null,
      scraper: null,
      textSelected: false
    };
  },

  components: {
    "page-link-scraper": PageLinkScraper,
    "selection-scraper": SelectionScraper,
    "kindle-highlights-scraper": KindleHighlightsScraper
  },

  methods: {
    init() {
      chrome.storage.sync.get("cotoamiUrl", data => {
        this.cotoamiUrl = data.cotoamiUrl;
        this.getUrl();
        this.fetchSession(this.cotoamiUrl);
        this.checkSelection();
      });
    },

    getUrl() {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        this.url = tabs[0].url;
      });
    },

    fetchSession(cotoamiUrl) {
      fetch(cotoamiUrl + "/api/public/session", {
        credentials: "include"
      })
        .then(Utils.checkStatusAndParseBodyAsJson.bind(Utils))
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
        selection => {
          this.textSelected = selection && selection[0] !== "";
        }
      );
    },

    requiredCotoamiVersion() {
      return REQUIRED_COTOAMI_VERSION;
    },

    isCotoamiVersionOk() {
      if (this.session.app_version) {
        return Semver.gte(
          Semver.coerce(this.session.app_version),
          this.requiredCotoamiVersion()
        );
      } else {
        return false;
      }
    },

    inKindleHighlights() {
      return new URL(this.url).hostname.indexOf("read.amazon.") === 0;
    },

    closeScraper() {
      this.scraper = null;
    }
  },

  beforeMount() {
    this.init();
  }
};
</script>
