import Vue from 'vue';
import Popup from './Popup.vue';
import "./css/skeleton/skeleton.scss";
import "./css/popup.scss";

new Vue({ el: '#popup', render: c => c(Popup) });

