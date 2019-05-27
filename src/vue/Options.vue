<template>
  <div id="options">Hello</div>
</template>

<script>
export default {
  data() {
    return {
      cotoamiUrl: ""
    };
  },

  methods: {
    init() {
      chrome.storage.sync.get("cotoamiUrl", data => {
        this.cotoamiUrl = data.cotoamiUrl;
      });
    }
  },

  beforeMount() {
    this.init();
  }
};
</script>
