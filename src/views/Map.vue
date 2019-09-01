<template>
  <div class="columns is-gapless">
    <div class="column map-container">
      <v-map ref="map"
          :zoom=14
          :center="[38.8817, -77.0706]"
          @l-moveend="mapMoved">
        <v-tilelayer url="http://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png"></v-tilelayer>
        <v-marker-cluster :options="clusterOptions">
          <!--  Marker zur Anzeige der Suchergebnisse auf der Karte -->
          <v-marker v-for="point in unis"
            :key="point.id"
            :options="point"
            :lat-lng="point.coordinates"
            :icon="getIcon(point)"
            @l-mouseover="showPopup(point)"
            @l-mouseout="closePopup(point)"
          />
        </v-marker-cluster>
      </v-map>
      <!-- <b-loading :active.sync="isLoading" :canCancel="false"></b-loading> -->
    </div>
    <div class="column is-narrow">
      <!-- An dieser Stelle wird das Panel mit den Ergebnissen geladen 
            Klassenvariable wird an das Template übergeben und Variable persons zugewiesen  
      -->
      <gr-person-list :persons="unis"></gr-person-list>
    </div>
    <section>
      <!-- Modal zur genauen Auflistung der gefunden Professoren für die Hochschule --> 
      <b-modal :active.sync="isModal" :width="640">
        <div class="card" v-if="modalPerson">
          <div class="card-content">
            <div class="media">
              <div class="media-left">
                <figure class="image is-48x48">
                  <a class="image is-48x48" layout="row center-center"
                      v-if="modalPerson.imageURL"
                      :href="`//commons.wikimedia.org/wiki/File:${modalPerson.image}`"
                      target="_blank">
                    <img :src="modalPerson.imageURL" alt="Image">
                  </a>
                </figure>
              </div>
              <div class="media-content">
                <div layout="row center-justify">
                  <p class="title is-4">{{ modalPerson.name }}</p>
                  <a class="wikidata-link"
                      :href="`//www.wikidata.org/wiki/${modalPerson.id}`"
                      target="_blank">
                    <b-icon icon="link"></b-icon>
                  </a>
                </div>
                <div layout="row center-justify" v-if="!isLoading"> <!-- Professoren erst anzeigen, wenn Laden beendet -->
                  <p class="title is-4">{{ modalProfs.length }} Professoren gefunden:</p>
                </div>
                <gr-prof-list
                  v-for="prof in modalProfs"
                  :key="prof.id"
                  :person="prof">
                </gr-prof-list>
                <b-loading :active.sync="isLoading"></b-loading>
              </div>
            </div>
          </div>
        </div>
      </b-modal>
    </section>
  </div>
</template>

<script>
  // Um Komponenten und Services nutzen zu können
  import L from 'leaflet';
  import ProfList from '@/components/ProfList';
  import PersonList from '@/components/PersonList';
  import Wikidata from '@/services/wikidata';
  import University from '@/models/University';
  import store from '@/store';
  import redIcon from '@/assets/marker_red.png';
  import greenIcon from '@/assets/marker_green.png';

  let map = null;
  let popup = null;
  let popupTimeout = null;
  let router = null;
  const wikidata = new Wikidata();

  /**
   * Funktion zur Verarbeitung der Anfrage an Wikidata API
   */
  function getData(query) {
    store.commit('load'); // setzt den active.state in der store.js auf 'isLoading' = true

    return wikidata
      .runQueries([query])
      .then((response) => {
        store.commit('unload'); // setzt den active.state in der store.js auf 'isLoading' = false

        const responses = [];
        response.forEach(resp => responses.push(...resp.data.results.bindings));
        return responses;
      })
      .catch((err) => {
        store.commit('unload'); // setzt den active.state in der store.js auf 'isLoading' = false
        console.error('Error getting data from SPARQL endpoint!', err);
        return [];
      });
  }

  function getIcon(point) {
    const Icon = L.Icon.extend({
      options: {
        iconUrl: point.graveImage ? greenIcon : redIcon,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      },
    });
    return new Icon();
  }

  /**
   * Ermittelt oberere rechte Ecke und untere Linke Ecke des Map-Ausschnitts für SERVICE wikibase:box
   */
  function getBBox() {
    const bbox = map.getBounds();
    const cornerWest = `"Point(${bbox.getSouthWest().lng} ${bbox.getSouthWest().lat})"^^geo:wktLiteral`;
    const cornerEast = `"Point(${bbox.getNorthEast().lng} ${bbox.getNorthEast().lat})"^^geo:wktLiteral`;

    return `
      bd:serviceParam wikibase:cornerWest ${cornerWest}.
      bd:serviceParam wikibase:cornerEast ${cornerEast}.`;
  } // Wird dann per Funktionsaufruf in die Query geladen

  function getUnis() {
    return `SELECT ?university ?universityLabel ?location ?logo ?studentsCount ?employeesCount ?inception
            WHERE
            { 
              SERVICE wikibase:box {
                  ?university wdt:P625 ?location . ${getBBox()} 
                }
              ?university wdt:P31/wdt:P279* wd:Q38723 .
              ?university wdt:P154 ?logo .
              ?university wdt:P2196 ?studentsCount .
              OPTIONAL { ?university wdt:P1128 ?employeesCount .
                         ?university wdt:P571 ?inception .}
              SERVICE wikibase:label { bd:serviceParam wikibase:language "de"}
            }`;
  } // Query für alle in der Karte sichtbaren Hochschulen, dynamische Koordinaten via getBBOX()

  function getMapPosition() {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const params = [center.lat.toFixed(5), center.lng.toFixed(5), `${zoom}z`];

    return `@${params.join(',')}`;
  }

  /**
   * Updates URL based on map state
   */
  function updateURL() {
    router.push({
      name: 'Map',
      params: { position: getMapPosition() },
    });
  }

  /**
   * Sets map position based on URL address
   */
  function initMapPosition(position) {
    try {
      const [lat, lng, zoom] = (position || this.$route.params.position)
        .slice(1, -1)
        .split(',')
        .map(value => parseFloat(value));
      map.setView({ lat, lng }, zoom);
    } catch (err) {
      this.err = err;
    }
  }

  /**
   * EVENT Handler wenn Karte bewegt wird
   */
  function mapMoved() {
    const queryUnis = getUnis(); // Neue Query wird erstellt mit aktuellen Koordinaten

    updateURL();
    if (map.getZoom() < 10) { return; } // Verhindert Query bei zu großem Zoom-Faktor

    getData
      .apply(this, [queryUnis]) // Muss ein Array sein, daher immer  []
      .then((data) => {
        this.unis = data // Ergebnis wird der Klassenvariable zugewiesen
          .filter(
            (element, index, array) =>
            array.findIndex(t => t.university.value === element.university.value) === index)
          .map(uni => new University(uni)); // Ergebnisse werden nach ID gefiltert und jeweils an den Klassen-Konstruktor übergeben
      });
  }

  /**
   * Shows popup
   */
  function showPopup(point) {
    popupTimeout = setTimeout(() => {
      popup = this.$refs.map.$children[1].$children
        .filter(element => element.mapObject.options.id === point.id)
        .pop()
        .mapObject;

      popup
        .bindPopup(point.name.value)
        .openPopup();
    }, 200);
  }

  function closePopup() {
    if (popup) { popup.closePopup(); }
    if (popupTimeout) { clearTimeout(popupTimeout); }
  }

  export default {
    // Hier werden die verwendeten Komponenten (unter @/components/)
    // Variablen zugewiesen, die wie HTML Attribute verwendet werden könenn  
    components: {
      'gr-person-list': PersonList, 
      'gr-prof-list': ProfList,
    },
    data() {
      return {
        unis: [], // Leeres Arrays für die Query Nr.1
        clusterOptions: {
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: zoom => 130 - (zoom * 5),
          animate: false,
          iconCreateFunction: (cluster) => {
            const all = cluster.getChildCount();
            const green = cluster
              .getAllChildMarkers()
              .filter(g => g.options.graveImage)
              .length;
            const percentage = green / all;

            const size = Math.min(80, 20 + all);
            const radius = (size - 5) / 4.0;
            const circuit = 2 * 3.14 * radius;

            const props = {
              className: 'marker-cluster',
              html: `<div>
                <span class="chart-count">${all}</span>
                <svg class="chart" width="${size}" height="${size}">
                  <circle class="chart-slice"
                    style="stroke-dasharray: ${circuit * percentage}, ${circuit}; stroke-width: ${(2 * radius) + 1};"
                    r="${radius}" cx="${(size / 2.0) - 2}" cy="${(size / 2.0) - 2}">
                  </circle>
                </svg>
              </div>`,
              iconSize: new L.Point(size, size),
            };
            return new L.DivIcon(props);
          },
        },
      };
    },
    computed: {
      isLoading() { return store.state.isLoading; },
      isModal: {
        get: () => store.state.isModal,
        set: value => store.commit('setModal', value),
      },
      modalPerson() { return store.state.selectedPerson; }, // Zustände die in store gespeichert werden
      modalProfs() { return store.state.selectedProfs; }, // können so beim Aufruf des Modals verwendet werden
    },
    methods: { getIcon, getMapPosition, mapMoved, showPopup, closePopup, initMapPosition },
    mounted: function mounted() {
      map = this.$refs.map.mapObject;
      router = this.$router;

      this.initMapPosition();
    },
    beforeRouteUpdate(to, from, next) {
      const urlPosition = to.params.position;
      const mapPosition = this.getMapPosition();

      if (urlPosition !== mapPosition) {
        this.initMapPosition(to.params.position);
      }

      next();
    },
  };
</script>

<style scoped>
  .columns.is-gapless {
    margin-bottom: 0;
  }
  .map-container {
    height: calc(100vh - 52px);
    padding-bottom: 0;
  }

  .modal.is-active {
    z-index: 1000;
    cursor: auto;
  }
  .modal .image {
    background: #fff;
  }
  .modal .image .title {
    position: absolute;
    top: 25%;
    left: 25%;
    opacity: .75;
  }
  .modal .image img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }
  .modal .card .graveyard-info {
    margin-left: 64px;
    margin-bottom: 5px;
  }
  .modal .card .title.is-4 {
    margin-bottom: 0;
  }
</style>
