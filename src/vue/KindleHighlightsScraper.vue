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
import _ from "lodash";
import cheerio from "cheerio";
import Utils from "../js/Utils.js";

const _codeToScrapeBasicInfo = `
  var asin = document.getElementById('kp-notebook-annotations-asin').getAttribute('value');
  var deviceType = window.KindleGlobal ? window.KindleGlobal.amazonDeviceType : 'A2CLFWBIMVSE9N';
  [asin, deviceType]
`;

const _initialHighlightsUrl = (hostname, deviceType, asin) =>
  `https://${hostname}/kp/notebook?purpose=NOTEBOOK&amazonDeviceType=${deviceType}&appName=notebook&asin=${asin}&contentLimitState=&`;

const _nextHighlightsUrl = (hostname, asin, limitState, token, index) =>
  `https://${hostname}/kp/notebook?asin=${asin}&contentLimitState=${limitState}&token=${token}&index=${index}`;

const _scrapePageInfo = $ => {
  return [
    $("input.kp-notebook-content-limit-state").val(),
    $("input.kp-notebook-annotations-next-page-start").val()
  ];
};

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
        note: note && note !== "" ? note : null,
        highlight: highlight && highlight !== "" ? highlight : null,
        location: location
      });
    }
  });
  return annotations;
};

const _finishScrapedAnnotations = annotations => {
  annotations = _.filter(annotations, a => !_.isNil(a.location));
  return _.uniqWith(annotations, _.isEqual);
};

export default {
  data() {
    return {
      hostname: null,
      deviceType: null,
      asin: null,
      title: "",
      annotations: null,
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
            if (asin) {
              this.asin = asin;
              this.deviceType = deviceType;
              this.doScrape();
            } else {
              this.scraped = true;
              this.scaping = false;
              this.error = "Couldn't get the ASIN.";
            }
          }
        );
      });
    },

    doScrape() {
      const url = _initialHighlightsUrl(
        this.hostname,
        this.deviceType,
        this.asin
      );
      fetch(url, { credentials: "include" })
        .then(Utils.checkStatusAndGetTextBody.bind(Utils))
        .then(html => {
          const $ = cheerio.load(html);
          this.title = $("h3.kp-notebook-metadata").text();
          const [contentLimitState, nextPageStartToken] = _scrapePageInfo($);
          const annotations = _scrapeAnnotations(
            $,
            $("#kp-notebook-annotations > div")
          );
          this.scrapeNextPage(
            contentLimitState,
            nextPageStartToken,
            annotations
          );
        });
    },

    scrapeNextPage(contentLimitState, nextPageStartToken, annotations) {
      if (nextPageStartToken) {
        const url = _nextHighlightsUrl(
          this.hostname,
          this.asin,
          contentLimitState,
          nextPageStartToken,
          annotations.length
        );
        fetch(url, { credentials: "include" })
          .then(Utils.checkStatusAndGetTextBody.bind(Utils))
          .then(html => {
            const $ = cheerio.load(html);
            const [contentLimitState, nextPageStartToken] = _scrapePageInfo($);
            const nextAnnotations = _scrapeAnnotations(
              $,
              $("div.a-row.a-spacing-base")
            );
            this.scrapeNextPage(
              contentLimitState,
              nextPageStartToken,
              annotations.concat(nextAnnotations)
            );
          });
      } else {
        this.annotations = _finishScrapedAnnotations(annotations);
        this.scraped = true;
        this.scaping = false;
        console.log("this.annotations", this.annotations);
      }
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
