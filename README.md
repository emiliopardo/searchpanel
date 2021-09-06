# Searchpanel

[![Build Tool](https://img.shields.io/badge/build-Webpack-green.svg)](https://github.com/sigcorporativo-ja/Mapea4-dev-webpack)

## Descripción

 Plugin de [Mapea](https://github.com/sigcorporativo-ja/Mapea4) para la generación automática de paneles de búsquedas para realizar consultas a diferentes cores de geosearch. 

![Imagen](./images/searchpanelPlugin.png)


### Plugin con parámetros

```
{
   "url": {
      "name": "geosearch",
      "separator": "*"
   },
   "constructor": "M.plugin.Geosearch",
   "parameters": [{
      "type": "object",
      "properties": [{
         "type": "simple",
         "name": "url",
         "position": 0
      }, {
         "type": "simple",
         "name": "core",
         "position": 1
      }, {
         "type": "simple",
         "name": "handler",
         "position": 2
      }]
   }]
}
```