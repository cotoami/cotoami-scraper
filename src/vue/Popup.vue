<template>
  <div id="popup">
    <div id="in-session" v-if="session">
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
            <button class="button" v-bind:disabled="textSelected">Selection</button>
          </div>
          <div id="scrape-kindle-highlights">
            <button class="button" disabled>Kindle highlights</button>
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
import PageLinkScraper from "./PageLinkScraper.vue";

export default {
  data() {
    return {
      cotoamiUrl: COTOAMI_URL,
      session: null,
      scraper: null,
      textSelected: false
    };
  },

  components: {
    "page-link-scraper": PageLinkScraper
  },

  methods: {
    fetchSession() {
      fetch(COTOAMI_URL + "/api/public/session", {
        credentials: "include"
      })
        .then(response => {
          if (response.status >= 200 && response.status < 300) {
            return response.json();
          } else {
            var error = new Error(response.statusText);
            error.response = response;
            throw error;
          }
        })
        .then(json => {
          console.log("session", json);
          this.session = json;
        })
        .catch(error => {
          console.log("request failed", error);
        });
    },

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

    closeScraper() {
      this.scraper = null;
    }
  },

  beforeMount() {
    this.fetchSession();
    this.checkSelection();
  }
};
</script>