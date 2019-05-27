<template>
  <div id="options">
    <div id="content">
      <div id="title">Cotoami Scraper Options</div>
      <form id="options-form">
        <div class="row">
          <label for="cotoami-url">Cotoami URL</label>
          <input
            class="u-full-width"
            type="text"
            placeholder="Cotoami URL"
            id="cotoami-url"
            v-model="cotoamiUrlInput"
          >
        </div>
        <div id="buttons" class="row">
          <button class="button" v-on:click="reset()" v-if="!saving">Reset</button>
          <button
            class="button button-primary"
            v-bind:disabled="!okToSave() || saving"
            v-on:click="save()"
          >{{ saving ? 'Saving...' : 'Save' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import Utils from "../js/Utils.js";

export default {
  data() {
    return {
      cotoamiUrl: "",
      cotoamiUrlInput: "",
      saving: false
    };
  },

  methods: {
    init() {
      chrome.storage.sync.get("cotoamiUrl", data => {
        this.cotoamiUrl = data.cotoamiUrl;
        this.cotoamiUrlInput = data.cotoamiUrl;
      });
    },

    reset() {
      this.cotoamiUrlInput = this.cotoamiUrl;
    },

    okToSave() {
      return (
        this.cotoamiUrlInput.trim() !== "" &&
        Utils.isValidUrl(this.cotoamiUrlInput) &&
        this.cotoamiUrlInput.trim() != this.cotoamiUrl
      );
    },

    save() {
      const url = _.trimEnd(this.cotoamiUrlInput.trim(), "/");
      this.saving = true;
      chrome.storage.sync.set({ cotoamiUrl: url }, () => {
        this.cotoamiUrl = url;
        this.cotoamiUrlInput = url;
        this.saving = false;
      });
    }
  },

  beforeMount() {
    this.init();
  }
};
</script>
