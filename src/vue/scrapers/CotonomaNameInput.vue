<template>
  <div class="cotonoma">
    <vue-simple-suggest
      v-model="internalValue"
      :min-length="1"
      :list="suggestions"
      :filter-by-query="false"
    >
      <input
        type="text"
        class="cotonoma-name u-full-width"
        placeholder="Cotonoma name (optional)"
        maxlength="50"
      >
    </vue-simple-suggest>
  </div>
</template>

<script>
import VueSimpleSuggest from "vue-simple-suggest";
import "vue-simple-suggest/dist/styles.css";
import Utils from "../../js/Utils.js";

export default {
  props: ["cotoamiUrl", "value"],

  components: {
    VueSimpleSuggest
  },

  computed: {
    internalValue: {
      get() {
        return this.value;
      },
      set(newVal) {
        if (this.value !== newVal) this.$emit("input", newVal);
      }
    }
  },

  methods: {
    suggestions(query) {
      return Utils.fetchCotonomaSuggestions(this.cotoamiUrl, query);
    }
  }
};
</script>

