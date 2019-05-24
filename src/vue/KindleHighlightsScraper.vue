<template>
  <div id="kindle-highlights-scraper">
    <div id="error" v-if="error">Error: {{ error }}</div>
    <div id="posted" v-else-if="posted">
      <img src="../images/done.gif"> Posted.
    </div>
    <div id="scraped" v-else-if="scraped">
      <div id="scraped-content">
        <div class="coto">{{ title }}</div>
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
    <div id="scaping" v-else-if="scaping">
      <img src="../images/loading.gif">
      Scaping...
    </div>
  </div>
</template>

<script>
import "whatwg-fetch";
import cheerio from "cheerio";
import Utils from "../js/Utils.js";

const _codeToScrapeBasicInfo = `
  var asin = document.getElementById('kp-notebook-annotations-asin').getAttribute('value');
  var deviceType = window.KindleGlobal ? window.KindleGlobal.amazonDeviceType : 'A2CLFWBIMVSE9N';
  [asin, deviceType]
`;

const _initialHighlightsUrl = (hostname, deviceType, asin) =>
  `https://${hostname}/kp/notebook?purpose=NOTEBOOK&amazonDeviceType=${deviceType}&appName=notebook&asin=${asin}&contentLimitState=&`;

const _scrapeAnnotations = ($, annotationDivs) => {
  let annotations = [];
  $(annotationDivs).each(function(index, element) {
    const note = $(this)
      .find("span#note")
      .text()
      .trim();
    const highlight = $(this)
      .find("span#highlight")
      .text()
      .trim();
    const location = $(this)
      .find("input#kp-annotation-location")
      .val();
    if (location) {
      annotations.push({
        note: note,
        highlight: highlight,
        location: location
      });
    }
  });
  console.log("annotations length", annotations.length);
  console.log("annotations", annotations);
  return annotations;
};

export default {
  data() {
    return {
      title: "",
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
        const hostname = new URL(tabs[0].url).hostname;
        chrome.tabs.executeScript(
          tabs[0].id,
          { code: _codeToScrapeBasicInfo },
          ([[asin, deviceType]]) => {
            if (asin) {
              this.doScrape(hostname, deviceType, asin);
            } else {
              this.scraped = true;
              this.scaping = false;
              this.error = "Couldn't get the ASIN.";
            }
          }
        );
      });
    },

    doScrape(hostname, deviceType, asin) {
      const url = _initialHighlightsUrl(hostname, deviceType, asin);
      fetch(url, { credentials: "include" })
        .then(Utils.checkStatusAndGetTextBody.bind(Utils))
        .then(html => {
          console.log("html", html);
          const $ = cheerio.load(html);
          this.title = $("h3.kp-notebook-metadata").text();
          const contentLimitState = $(
            "input.kp-notebook-content-limit-state"
          ).val();
          const nextPageStartToken = $(
            "input.kp-notebook-annotations-next-page-start"
          ).val();
          console.log("doScrape", [contentLimitState, nextPageStartToken]);
          _scrapeAnnotations($, $("#kp-notebook-annotations > div"));
          this.scraped = true;
          this.scaping = false;
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
