module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'Profiling Wikidata',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A prototype for ProWD ' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' }
    ]
  },
  env: {
    API_ENDPOINT: process.env.API_ENDPOINT || 'https://guarded-fjord-56608.herokuapp.com',
    WIKIDATA_SPARQL_ENDPOINT: process.env.WIKIDATA_SPARQL_ENDPOINT || 'https://query.wikidata.org/',
    WIKIDATA_API_ENDPOINT: process.env.WIKIDATA_API || 'https://www.wikidata.org/w/api.php',
    BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
    githubToken: '42cdf9fd55abf41d24f34c0f8a4d9ada5f9e9b93'
  },
  modules: [
    '@nuxtjs/axios'
  ],
  plugins: ['~/plugins/vuetify.js'],
  css: [
    '~/assets/style/app.styl'
  ],
  router: {
    middleware: ['path']
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: '#3B8070' },
  /*
  ** Build configuration
  */
  build: {
    vendor: [
      '~/plugins/vuetify.js'
    ],
    extractCSS: true,
    /*
    ** Run ESLint on save
    */
    extend (config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
