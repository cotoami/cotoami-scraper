<template>
  <div id="popup">
    <div id="in-session" v-if="session">
      <div id="posted" v-if="posted">
        <img src="./images/done.gif"> Posted.
      </div>
      <div v-else>
        <div v-if="scraper">
          <div id="scraped" v-if="scraper.scraped">
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
          <div id="scaping" v-else-if="scraper.scaping">Scaping...</div>
        </div>
        <div id="main-menu" v-else>
          <div id="amishi">
            <img class="avatar" v-bind:src="session.amishi.avatar_url">
            <span class="name">{{session.amishi.display_name}}</span>
          </div>
          <div id="scrape-buttons">
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
import PageLinkScraper from "./PageLinkScraper.js";

export default {
  data() {
    return {
      cotoamiUrl: COTOAMI_URL,
      session: null,
      scraper: null,
      textSelected: false,
      posting: false,
      posted: false
    };
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
    this.fetchSession();
    this.checkSelection();
  }
};
</script>
