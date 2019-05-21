import Vue from 'vue';
import Popup from './Popup.vue';
import "./skeleton/skeleton.scss";
import "./popup.scss";

new Vue({ el: '#popup', render: c => c(Popup) });

