import Searchpanel from 'facade/searchpanel';

const map = M.map({
  container: 'mapjs',
});

const config = {
  title: 'Test de título',
  geosearchUrl: 'http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?q=',
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
  ]
}

// const config1 = {
//   title: 'HOLA',
//   geosearchUrl: 'http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?q=',
//   fields: [
//     {
//       field: 'municipio',
//       alias: 'Municipio',
//       label: 'Escribe el nombre del Municipio',
//     }
//   ]
// }
const mp = new Searchpanel(config);

map.addPlugin(mp);
