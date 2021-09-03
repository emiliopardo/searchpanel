import Searchpanel from 'facade/searchpanel';

const map = M.map({
  container: 'mapjs',
});


const configMunicipos1 = {
  title: 'Buscador de Municipios',
  geosearchUrl: 'http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?',
  fields: [
    {
      field: 'municipio',
      alias: 'Municipio',
      label: 'Escribe el nombre del Municipio',
    }
  ],
  infoFields: [
    {
      field: 'municipio',
      alias: 'Municipio'
    },
    {
      field: 'nombre_provincia',
      alias: 'Provincia'
    }
  ]
}

const configMunicipos2 = {
  title: 'Buscador de Municipios',
  geosearchUrl: 'http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?',
  fields: [
    {
      field: 'municipio',
      alias: 'Municipio',
      label: 'Escribe el nombre del Municipio',
    },
    {
      field: 'nombre_provincia',
      alias: 'Provincia',
      label: 'Escribe el nombre de la Provincia'
    }
  ],
  infoFields: [
    {
      field: 'municipio',
      alias: 'Municipio'
    },
    {
      field: 'nombre_provincia',
      alias: 'Provincia'
    }
  ]
}

const configPlayas = {
  title: 'Buscador de Playas',
  geosearchUrl: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geobusquedas/playas/search?',
  fields: [
    {
      field: 'nombre_playa',
      alias: 'Playa',
      label: 'Escribe el nombre de la Playa',
    },
    {
      field: 'nombre_municipio',
      alias: 'Municipio',
      label: 'Escribe el nombre del Municipio',
    },
    {
      field:'provincia',
      alias: 'Provincia',
      label: 'Escribe el nombre de la Provincia'
    }
  ],
  infoFields: [
    {
      field: 'nombre_playa',
      alias: 'Playa'
    },
    {
      field: 'nombre_municipio',
      alias: 'Municipio'
    },
    {
      field: 'aseos',
      alias: 'Aseos'
    },
    {
      field: 'salvamento_y_socorrismo',
      alias: 'Salvamento y Socorrismo'
    }
  ]
}
//const mp = new Searchpanel(configMunicipos1);
//const mp = new Searchpanel(configMunicipos2);
const mp = new Searchpanel(configPlayas);

map.addPlugin(mp);
