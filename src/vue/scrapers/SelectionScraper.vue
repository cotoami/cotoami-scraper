<template>
  <div id="selection-scraper">
    <div id="error" v-if="error">{{ error }}</div>
    <div id="posted" v-else-if="posted">
      <img src="../../images/done.gif"> Posted.
    </div>
    <div id="scraped" v-else-if="scraped">
      <div id="scraped-content">
        <div class="coto">
          <div class="selected-html" v-html="selectedHtml"></div>
          <a v-bind:href="url" target="_blank">{{ title }}</a>
        </div>
        <div class="will-be-posted-to">
          <div class="label">
            <span>will be posted to:</span>
          </div>
          <cotonoma-name-input v-bind:cotoami-url="cotoamiUrl" v-model="cotonomaName"></cotonoma-name-input>
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
import _ from "lodash";
import $ from "jquery";
import Turndown from "turndown";
import Url from "url";
import CotonomaNameInput from "./CotonomaNameInput.vue";
import Utils from "../../js/Utils.js";

const _turndown = new Turndown();
_turndown.addRule("preWithoutCode", {
  filter: function(node, options) {
    return (
      node.nodeName === "PRE" &&
      (!node.firstChild || node.firstChild.nodeName !== "CODE")
    );
  },
  replacement: function(content, node, options) {
    const unescapedContent = content
      .replace(/\\\\/g, "\\")
      .replace(/([^\\])\\([^\\])/g, "$1$2");
    return "\n\n    " + unescapedContent.replace(/\n/g, "\n    ") + "\n\n";
  }
});

export default {
  props: ["cotoamiUrl"],

  components: {
    CotonomaNameInput
  },

  data() {
    return {
      cotonomaName: "",
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
            this.selectedHtml = this.processHtml(selection);
            this.scraped = true;
            this.scaping = false;
          }
        );
      });
    },

    processHtml(html) {
      const outer = this;
      const tree = $(`<div>${html}</div>`);
      tree.find("a[href]").replaceWith(function() {
        const href = outer.processUrl(this.getAttribute("href"));
        this.setAttribute("href", href);
        this.setAttribute("target", "_blank");
        return this;
      });
      tree.find("img[src]").replaceWith(function() {
        const src = outer.processUrl(this.getAttribute("src"));
        this.setAttribute("src", src);
        return this;
      });
      return tree.html();
    },

    processUrl(rawUrl) {
      let url = rawUrl;
      if (!Utils.isAbsoluteUrl(url)) {
        url = Url.resolve(this.url, url);
      }
      url = _.replace(url, "(", "%28");
      url = _.replace(url, ")", "%29");
      return url;
    },

    cancel() {
      this.$emit("cancel");
    },

    markdown() {
      const selectionAsMarkdown = _turndown.turndown(this.selectedHtml);
      return `${selectionAsMarkdown} \n \n [${this.title}](${this.url})`;
    },

    post() {
      this.posting = true;
      Utils.getOrCreateCotonoma(
        this.cotoamiUrl,
        this.cotonomaName,
        cotonomaId => {
          Utils.postCoto(this.cotoamiUrl, this.markdown(), cotonomaId)
            .then(json => {
              this.posting = false;
              this.posted = true;
            })
            .catch(error => {
              this.error = error;
            });
        },
        error => {
          this.error = error;
        }
      );
    }
  },

  beforeMount() {
    this.scrape();
  }
};
</script>
