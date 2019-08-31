<template>
  <a class="panel-block">
    <section>
      <article class="media" @click="showModal">
        <div class="media-left">
          <figure class="image is-64x64">
            <a class="image is-64x64" layout="row center-center"
                v-if="person.imageURL"
                :href="`//commons.wikimedia.org/wiki/File:${person.logo}`"
                target="_blank">
              <img :src="person.imageURL" alt="Image">
            </a>
          </figure>
        </div>
        <div class="media-content">
          <div class="content">
            <p>
              <strong>{{ person.name }}</strong>
              <br />
              <small>
                <b>Gründungsdatum: </b>
                <span v-if="person.inception">{{ person.inception }}</span>
                <span v-else>Keine Angabe</span>
              </small>
              <br />
              <small>
                <b>Anzahl der Studenten: </b>
                <span v-if="person.studentsCount">{{ person.studentsCount }}</span>
                <span v-else>Keine Angabe</span>
              </small>
              <br />
              <small>
                <b>Anzahl der Mitarbeiter: </b>
                <span v-if="person.employeesCount">{{ person.employeesCount }}</span>
                <span v-else>Keine Angabe</span>
              </small>
            </p>
          </div>
        </div>
      </article>
    </section>
  </a>
</template>

<script>
  import Wikidata from '@/services/wikidata';
  import store from '@/store';
  import redIcon from '@/assets/marker_red.png';
  import greenIcon from '@/assets/marker_green.png';
  import Professor from '@/models/Professor';

  const wikidata = new Wikidata();

  function getData(query) {
    store.commit('load');

    return wikidata
      .runQueries([query])
      .then((response) => {
        store.commit('unload');

        const responses = [];
        response.forEach(resp => responses.push(...resp.data.results.bindings));
        return responses;
      })
      .catch((err) => {
        store.commit('unload');
        console.error('Error getting data from SPARQL endpoint!', err);
        return [];
      });
  }

  function getProfs(id) {
    return `SELECT ?prof ?profLabel ?uni ?uniLabel ?fachbereich ?fachbereichLabel ?image
            WHERE
            {
              ?prof wdt:P106 wd:Q1622272 .
              ?prof wdt:P108 wd:${id}.
              ?prof wdt:P18 ?image;
                    wdt:P101 ?fachbereich.
            SERVICE wikibase:label { bd:serviceParam wikibase:language "de"}
            }`;
  }

  function showModal() {
    const queryProfs = getProfs(this.person.id);

    getData
      .apply(this, [queryProfs])
      .then((data) => {
        this.profs = data
          .filter(
            (element, index, array) =>
            array.findIndex(t => t.prof.value === element.prof.value) === index)
          .map(prof => new Professor(prof));
      });
    store.commit('setSelectedPerson', this.person);
    console.log('Uni gefunden: ', this.person);
    store.commit('setSelectedProfs', this.profs);
    console.log('Professoren: ', this.profs);
    store.commit('showModal');
  }

  export default {
    data() {
      return {
        profs: [],
        icons: { redIcon, greenIcon },
      };
    },
    props: ['person'],
    methods: { showModal },
  };
</script>

<style scoped>
  .panel-block {
    position: relative;
    border-left: 0;
    border-right: 0;
  }
  .panel-block:first-child {
    border-top: 0;
  }
  .panel-block:hover .wikidata-link {
    display: inline;
  }
  .image {
    background: #fff;
  }
  .image .title {
    position: absolute;
    top: 25%;
    left: 25%;
    opacity: .75;
  }
  .image img {
    width: auto;
    height: auto;
    max-width: 100%;
    max-height: 100%;
    margin: auto;
  }
  .wikidata-link {
    display: none;
    position: absolute;
    top: 6px;
    right: 10px;
    width: 30px;
    height: 30px;
    background: whitesmoke;
    border-radius: 50%;
    line-height: 27px;
    text-align: center;
  }
</style>
