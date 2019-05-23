<template>
  <div id="kindle-highlights-scraper">
    <div id="error" v-if="error">Error: {{ error }}</div>
    <div id="posted" v-else-if="posted">
      <img src="../images/done.gif"> Posted.
    </div>
    <div id="scraped" v-else-if="scraped">
      <div id="scraped-content">
        <div class="coto">{{ asin }}</div>
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
import "whatwg-fetch";
import Utils from "../js/Utils.js";

const _codeToScrapeBasicInfo = `
  var asin = document.getElementById('kp-notebook-annotations-asin').getAttribute('value');
  var deviceType = window.KindleGlobal ? window.KindleGlobal.amazonDeviceType : 'A2CLFWBIMVSE9N';
  [asin, deviceType]
`;

const _initialHighlightsUrl = (hostname, deviceType, asin) =>
  `https://${hostname}/kp/notebook?purpose=NOTEBOOK&amazonDeviceType=${deviceType}&appName=notebook&asin=${asin}&contentLimitState=&`;

export default {
  data() {
    return {
      hostname: "",
      asin: null,
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
        this.hostname = new URL(tabs[0].url).hostname;
        chrome.tabs.executeScript(
          tabs[0].id,
          { code: _codeToScrapeBasicInfo },
          ([[asin, deviceType]]) => {
            console.log("deviceType", deviceType);
            this.asin = asin;
            if (this.asin) {
              const url = _initialHighlightsUrl(
                this.hostname,
                deviceType,
                this.asin
              );
              fetch(url, { credentials: "include" })
                .then(Utils.checkStatusAndGetTextBody.bind(Utils))
                .then(html => {
                  console.log("html", html);
                });
              this.scraped = true;
              this.scaping = false;
            } else {
              this.scraped = true;
              this.scaping = false;
              this.error = "Couldn't get the ASIN.";
            }
          }
        );
      });
    },

    cancel() {
      this.$emit("cancel");
    },

    markdown() {
      return this.asin;
    },

    post() {
      this.posting = true;
      Utils.postCoto(this.markdown(), null)
        .then(json => {
          this.posting = false;
          this.posted = true;
        })
        .catch(error => {
          this.error = error;
        });
    }
  },

  beforeMount() {
    this.scrape();
  }
};
</script>
