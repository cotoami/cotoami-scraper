import Vue from 'vue';
import Options from './vue/Options.vue';
import "./css/skeleton/skeleton.scss";
import "./css/options.scss";

new Vue({ el: '#options', render: c => c(Options) });