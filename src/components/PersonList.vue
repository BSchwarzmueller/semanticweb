<template>
  <nav class="panel">
    <!-- In Map.vue wird beim Aufruf des Templates die Variable persons zugewiesen
          Also alle Suchergebnisse die bei der Query gefunden wurden
    --> 
    <div class="panel-header" v-if="!isLoading">
      {{ persons.length }}
      {{ persons.length === 1 ? 'Hochschule' : 'Hochschulen' }}
    </div>
    <!-- Ladebalken während der Suche -->
    <div class="panel-header" v-if="isLoading">Loading...</div>
    <div class="panel-list">
      <vue-virtual-scroll :height="80" style="height: 100%">
        <!--  An dieser Stelle wird die Unterkomponente für jede Hochschule in der
              Ergebnisliste aufgerufen. v-for entspricht dabei einer For-Schleife
              Es werden so viele Unterkomponenten wie Suchergebnisse generiert
        -->
        <gr-person-panel
          v-for="person in persons"
          :key="person.id"
          :person="person">
        </gr-person-panel>
      </vue-virtual-scroll>
      <b-loading :active.sync="isLoading"></b-loading>
    </div>
  </nav>
</template>

<script>
  import VueVirtualScroll from 'vue-virtualscroll';
  import PersonPanel from '@/components/PersonPanel';
  import store from '@/store';

  export default {
    components: {
      'gr-person-panel': PersonPanel,
      'vue-virtual-scroll': VueVirtualScroll,
    },
    props: ['persons'],
    computed: {
      isLoading() { return store.state.isLoading; },
    },
  };
</script>

<style scoped>
  .panel {
    position: relative;
    width: 400px;
    height: calc(100vh - 52px);
    overflow: auto;
  }

  .panel-header {
    border: 1px solid #dbdbdb;
    border-width: 0 0 2px;
    padding: 1em .75em;
    vertical-align: top;
    font-weight: 600;
  }

  .panel-list {
    position: relative;
    height: calc(100% - 58px);
  }

  .loading-overlay.is-active {
    position: absolute;
  }
</style>
