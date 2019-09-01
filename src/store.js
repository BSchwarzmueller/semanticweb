/* eslint no-param-reassign: ["error", { "props": false }] */

import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    isLoading: false,
    isModal: false,
    selectedPerson: null,
  },
  mutations: {
    load: (state) => { state.isLoading = true; },
    unload: (state) => { state.isLoading = false; },
    showModal: (state) => { state.isModal = true; },
    hideModal: (state) => { state.isModal = false; },
    setModal: (state, value) => { state.isModal = value; },
    setSelectedPerson: (state, person) => { state.selectedPerson = person; },
    setSelectedProfs: (state, profs) => { state.selectedProfs = profs; },
  },
});
/*
 * Diese Funktion hat die Aufgabe, Komponenten übergreifend Zustände an einem zentralen Punkt
 * zu speichern. Durch entsprechende Event-Listener kann auf die Änderung eines Zustands
 * reagiert werden
 */
