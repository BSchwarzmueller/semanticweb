import Axios from 'axios';

export default class wikidata {

  constructor() {
    this.wikidataUrl = 'https://www.wikidata.org/w/api.php';
    this.sparqlUrl = 'https://query.wikidata.org/sparql';
  }

  /*
   * HTTP Request an die wikidata-API Endpunkte
   */
  runQuery(query) { // Einzelne Query
    return Axios.get(this.sparqlUrl, {
      params: { query },
    });
  }

  runQueries(queries) { // Mehrfache Queries
    return Axios.all(queries
      .map(query => Axios.get(this.sparqlUrl, {
        params: { query },
      })));
  }
}
