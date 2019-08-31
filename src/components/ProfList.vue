<template>
  <a class="panel-block">
    <section>
      <article class="media">
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
              <strong>{{ prof.name }}</strong>
              <br />
            </p>
          </div>
        </div>
      </article>
    </section>
  </a>
</template>


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