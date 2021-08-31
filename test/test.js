import Searchpanel from 'facade/searchpanel';

const map = M.map({
  container: 'mapjs',
});

const mp = new Searchpanel();

map.addPlugin(mp);
