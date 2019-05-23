<template>
  <div id="selection-scraper">
    <div id="error" v-if="error">Something went wrong...</div>
    <div id="posted" v-else-if="posted">
      <img src="../images/done.gif"> Posted.
    </div>
    <div id="scraped" v-else-if="scraped">
      <div id="scraped-content">
        <div class="coto">
          <div class="selected-html" v-html="selectedHtml"></div>
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
import Turndown from "turndown";
import url from "url";

export default {
  data() {
    return {
      title: "",
      url: "",
      selectedHtml: "",
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
        chrome.tabs.executeScript(
          tabs[0].id,
          {
            code: `
              var fragment = window.getSelection().getRangeAt(0).cloneContents();
              var div = document.createElement('div');
              div.appendChild(fragment.cloneNode(true));
              div.innerHTML;
            `
          },
          ([selection]) => {
            this.selectedHtml = selection;
            this.scraped = true;
            this.scaping = false;
            console.log("markdown", this.markdown());
          }
        );
      });
    },

    cancel() {
      this.$emit("cancel");
    },

    markdown() {
      const turndown = new Turndown();
      turndown.addRule("relativelink", {
        filter: (node, options) => {
          const href = node.getAttribute("href");
          return node.nodeName === "A" && href && !Utils.isAbsoluteUrl(href);
        },
        replacement: (content, node) => {
          const href = node.getAttribute("href");
          const absoluteUrl = url.resolve(this.url, href);
          return `[${content}](${absoluteUrl})`;
        }
      });
      const selectionAsMarkdown = turndown.turndown(this.selectedHtml);
      return `${selectionAsMarkdown} \n \n [${this.title}](${this.url})`;
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
