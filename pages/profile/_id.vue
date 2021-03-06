<template>
  <v-layout column justify-center align-center>
    <v-flex xs12>
      <v-card>
        <h1 class="ml-3 pt-4"> {{profileName}} </h1>
        <v-card-text>
          <div class="bar-chart">
            <v-card-title class="headline"> Completeness Distribution </v-card-title>
            <v-card-text>Amount of entities according to completeness score</v-card-text>
            <BarChart :chart-data="datacollection" :options="chartOptions"/>
          </div>
          <br>
          <v-layout row wrap>
            <v-flex xs8>
              <v-layout column>
                <v-flex class="my-4">
                  <v-layout row wrap>
                    <v-flex xs6>
                        <v-subheader><h3>Filters</h3></v-subheader>
                    </v-flex>
                    <v-flex xs6>
                      <v-card-text v-if="filters.length === 0">No filter</v-card-text>
                      <v-chip v-else v-for="filter in filters" v-bind:key="filter.prop.code"
                      @input="remove(filters, filter)"
                      >
                        {{filter.prop.name}}: {{filter.value.name}}
                      </v-chip>
                    </v-flex>
                  </v-layout>
                </v-flex>
                <v-flex>
                  <v-layout v-for="facet in facets" v-bind:key="facet.code" row wrap>
                      <v-flex xs6>
                          <v-subheader> {{facet.name}} ({{facet.code}}) </v-subheader>
                      </v-flex>
                      <v-flex xs6>
                          <v-autocomplete :items="facetOptions[facet.code]" v-model=facetValue[facet.code] item-text="name" item-value="code"
                              class="input-group--focused" placeholder="any"
                          ></v-autocomplete>
                      </v-flex>
                  </v-layout>
                </v-flex>
              </v-layout>
            </v-flex>
            <v-flex xs4>
              <v-layout row wrap>
                <v-flex xs12>
                  <h3 class="text-xs-center"> &nbsp; &nbsp;Average Completeness Score</h3>
                </v-flex>
                <v-flex xs3></v-flex>
                <v-flex x5>
                  <v-progress-circular class="text-xs-center"
                    :size="200"
                    :width="25"
                    :rotate="-90"
                    :value="score1"
                    color=blue
                  >
                    <h1> {{ score1 }}% </h1>
                  </v-progress-circular>
                </v-flex>
                <v-flex xs12>
                  <h3 class="text-xs-center">Total number of entities: {{ entities.length }}</h3>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
          <v-layout row wrap>
            <v-flex xs2>
              <v-autocomplete
                v-model=languageCode label="label code" :items="languages" required box
                item-text="code" item-value="code"
              >
                <template
                  slot="item"
                  slot-scope="data"
                >
                  {{data.item}}
                </template>
              </v-autocomplete>
            </v-flex>
            <v-flex xs10></v-flex>
            <v-flex xs2 v-if="facets.length > 0">
              <v-btn @click="postQuery()" color="success"> Post Query </v-btn>
            </v-flex>
            <v-flex xs3>
              <v-progress-circular v-if="loading" :width="3" :size="50" indeterminate color="green"></v-progress-circular>
            </v-flex>
            <v-flex xs12>
              <v-alert
                v-model=warning outline dismissible
                type="warning"
              >
                Current version of the app only support up to 5.000 entities
              </v-alert>
            </v-flex>
          </v-layout>

        </v-card-text>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card >
        <v-card-title class="headline mt-3"> Attribute Completeness Score </v-card-title>
        <v-card-text>Degree of completeness for attributes of interest</v-card-text>
        <v-layout row align-center justify-space-around>
          <v-flex class="px-3 mx-5" xs3 v-for="(attr, i) in attributes.slice(0,3)" v-bind:key="attr.code">
            <v-layout align-center justify-center column fill-height>
            <v-flex xs12>
              <h3 class="text-xs-center">{{attr.name}} ({{attr.code}})</h3>
            </v-flex>
            <v-flex xs12></v-flex>
            <v-flex >
              <v-progress-circular
                :size="200"
                :width="25"
                :rotate="-90"
                :value="attr.score"
                :color="colors[i]"
              >
                <h1> {{ (attr.score).toFixed(2) }}% </h1>
              </v-progress-circular>
            </v-flex>
            <v-flex xs12 class="mx-5">
              <h3 class="text-xs-center">Entities with this attribute: {{ attr.count }}</h3>
            </v-flex>
          </v-layout>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
    <v-flex xs12>
      <v-card>
        <v-card-title class="headline mt-3"> Completeness table </v-card-title>
        <v-card-text>Completeness details of all entities within the profile</v-card-text>
        <v-data-table
          :headers="headers"
          :items="entities"
          hide-actions
          class="elevation-1"
          disable-initial-sort
        >
          <template slot="items" slot-scope="props">
            <td v-for="attr in attributeVariables" v-bind:key="attr.code" v-if="props.item[attr]" class="text-xs-right">
              <div v-if="attr === 'classLabel'">
                <a v-bind:href="props.item['class'].value">
                  <v-icon>link</v-icon>
                </a>
                {{props.item[attr]}}
              </div>
              <div v-else><v-icon color="green light">check</v-icon></div>
            </td>
            <td v-else class="text-xs-right">
              <v-icon color="red">close</v-icon>
            </td>

            <td class="text-xs-right">{{ (props.item.score).toFixed(2)+'%' }}</td>
          </template>
        </v-data-table>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
import BarChart from '~/components/BarChart.vue'

export default {
  async fetch ({ store, params }) {
    await Promise.all([
      store.dispatch('LANGUAGES'),
      store.dispatch('FETCH_PROFILE_BY_ID', params.id),
      store.dispatch('FETCH_FACET_OPTIONS')
    ])
  },
  components: {
    BarChart
  },
  data () {
    return {
      warning: false,
      facetValue: { 'any': 'any' },
      colors: ['red', 'orange', 'yellow'],
      query: '',
      datacollection: null,
      facetOptionsData: {},
      languageCode: 'en',
      loading: false,
      chartOptions: {
        maintainAspectRatio: false,
        scales: {
          yAxes: [{
            ticks: {
              min: 0
            }
          }]
        }
      }
    }
  },
  computed: {
    entities () {
      var entities = JSON.parse(JSON.stringify(this.$store.state.entities1))
      var attributes = JSON.parse(JSON.stringify(this.$store.state.attributes))

      entities.forEach(function (entity) {
        entity.classLabel = entity.classLabel.value
        entity.score = (100 * (Object.keys(entity).length - 2) / attributes.length)
      })

      return entities
    },
    headers () {
      var entityClass = this.$store.state.class
      var ret = [].concat(this.$store.state.attributes)
      ret = ret.map(obj => {
        return { text: obj.name + ' (' + obj.code + ')', value: obj.code + 'Exist' }
      })
      ret = [{ text: entityClass.name + ' (' + entityClass.code + ')', value: 'classLabel' }].concat(ret)
      var headers = ret.concat({ text: 'completeness score', value: 'score' })
      return headers
    },
    languages () {
      return this.$store.state.languages
    },
    attributeVariables () {
      var attrs = this.$store.state.attributes
      attrs = attrs.map(obj => obj.code + 'Exist')
      return ['classLabel'].concat(attrs)
    },
    barChartData () {
      return this.$store.state.barChartData
    },
    class () {
      return this.$store.state.class
    },
    facets () {
      return this.$store.state.facets
    },
    attributes () {
      var entities = this.$store.state.entities1
      var attributes = this.$store.state.attributes
      var amount = {}

      attributes.forEach(function (attr) {
        amount[attr.code] = 0
      })

      entities.forEach(function (entity) {
        attributes.forEach(function (attr) {
          if (entity[attr.code + 'Exist']) {
            amount[attr.code] += 1
          }
        })
      })

      attributes.forEach(function (attr) {
        attr.count = amount[attr.code]
        attr.score = (100 * attr.count / entities.length)
      })

      return attributes.sort(function (a, b) {
        return a.count - b.count
      })
    },
    profileName () {
      return this.$store.state.profileName
    },
    facetOptions () {
      return this.facetOptionsData
    },
    subclass () {
      return this.$store.state.subclass
    },
    filters () {
      return this.$store.state.filters
    },
    score1 () {
      return this.$store.state.score1
    }
  },
  methods: {
    postQuery () {
      this.loading = true
      var attributeVarQueryString = this.attributeVariables.reduce(function (acc, attr) {
        return acc + ' ?' + attr
      }, '')
      var filterExistQueryString = this.attributes.reduce(function (acc, attr) {
        return acc + ` OPTIONAL {BIND ("TRUE" AS ?${attr.code}Exist) FILTER EXISTS{?class wdt:${attr.code} ?${attr.code}}}`
      }, '')
      var facetValue = this.facetValue
      var facetQuery = this.facets.reduce(function (acc, attr) {
        if (facetValue[attr.code] !== 'any') {
          return acc.concat({ code: attr.code, value: 'wd:' + facetValue[attr.code] })
        } else {
          return acc
        }
      }, [])

      var facetQueryString = facetQuery.reduce(function (acc, attr) {
        if (attr.value !== 'wd:undefined') {
          return acc + ` ?class wdt:${attr.code} ${attr.value}.`
        } else {
          return acc + ''
        }
      }, '')
      var includeSubclass = ''
      if (this.subclass) includeSubclass = '/wdt:P279*'

      var classFilterQueryString = this.filters.reduce(function (acc, filter) {
        return acc + ` ?class wdt:${filter.prop.code} wd:${filter.value.code}.`
      }, '')

      var query = `
        SELECT DISTINCT ?class ${attributeVarQueryString}
        WHERE {
          SELECT ?class ${attributeVarQueryString}
          WHERE {
          ${classFilterQueryString}
          ?class wdt:P31${includeSubclass} wd:${this.class.code}.
          ${facetQueryString}
          ${filterExistQueryString}
          SERVICE wikibase:label { bd:serviceParam wikibase:language "${this.languageCode}, [AUTO_LANGUAGE]". }
          }
          LIMIT 10000
        }
      `

      this.$axios.post(process.env.WIKIDATA_SPARQL_ENDPOINT + 'sparql?query=' + encodeURIComponent(query))
        .then((response) => {
          var entities = response.data.results.bindings
          this.$store.commit('SET_ENTITIES1', entities)

          const reducer = function (acc, country) {
            var exist = Object.keys(country).length - 2
            acc[exist] = acc[exist] + 1 || 1
            return acc
          }
          var attributes = this.attributes.concat([''])
          var acc = Array.apply(null, Array(attributes.length)).map(Number.prototype.valueOf, 0)

          var chartData = entities.reduce(reducer, acc)

          var score = 0
          var div = 100 / chartData.length
          chartData.forEach(function (val, i) {
            var weight = (i + 1) * div
            score += (weight * val)
            console.log(weight, val)
          })
          score /= entities.length
          this.$store.commit('SET_SCORE1', parseFloat(score.toFixed(2)))

          this.datacollection = {
            labels: attributes.map((_, x) => `${(100 * (x) / this.attributes.length).toFixed(2)}%`),
            datasets: [
              {
                label: 'Amount of class entity',
                backgroundColor: '#41b883',
                data: chartData
              }
            ]
          }

          this.loading = false
          this.warning = (this.entities.length === 20000)
        })
        .catch((error) => {
          console.log(error)
        })
    },
    fillFacets () {
      var classFilterQueryString = this.filters.reduce(function (acc, filter) {
        return acc + ` ?entity wdt:${filter.prop.code} wd:${filter.value.code}.`
      }, '')

      var facetOptionsResults = this.facets.map(async (facet) => {
        var includeSubclass = ''
        if (this.subclass) includeSubclass = '/wdt:P279*'
        var query = `
        SELECT DISTINCT ?facet ?facetLabel ?${facet.code}
          WHERE {
            SELECT ?facet ?facetLabel ?${facet.code}
            WHERE {
              ?entity wdt:P31${includeSubclass} wd:${this.class.code}.
              ${classFilterQueryString}
              ?entity wdt:${facet.code} ?facet.
              SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en,id,de,it". }
            }
            LIMIT 10000
          }
        `
        return this.$axios.post(process.env.WIKIDATA_SPARQL_ENDPOINT + 'sparql?query=' + encodeURIComponent(query))
      })
      Promise.all(facetOptionsResults).then((completed) => {
        var tmp = {}
        completed.forEach(function (response) {
          tmp[response.data.head.vars[2]] = response.data.results.bindings.map((obj) => {
            return {
              code: obj['facet']['value'].split('/')[4],
              name: obj['facetLabel']['value']
            }
          }).concat({ name: 'any', code: 'any' }).sort(function (a, b) {
            if (a.name > b.name) {
              return 1
            } else if (a.name < b.name) {
              return -1
            } else {
              return 0
            }
          })
        })
        this.facetOptionsData = tmp
      })
    }
  },
  mounted: async function () {
    this.postQuery()
    await this.fillFacets()
    this.$forceUpdate()
  }
}
</script>
