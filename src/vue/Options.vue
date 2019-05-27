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
          <button class="button" v-on:click="reset()" v-if="!posting">Reset</button>
          <button class="button button-primary" v-bind:disabled="!okToSave()">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      cotoamiUrl: "",
      cotoamiUrlInput: ""
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
        this.cotoamiUrlInput.trim() != this.cotoamiUrl
      );
    }
  },

  beforeMount() {
    this.init();
  }
};
</script>
