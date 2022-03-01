/* eslint-disable no-console */
/**
 * @module M/control/SearchpanelControl
 */

import SearchpanelImplControl from 'impl/searchpanelcontrol';
import searchpanelTemplate from 'templates/searchpanel';
import searchpanelTabtemplate from 'templates/searchpanelTabs';

export default class SearchpanelControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(config, panelTitle) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(SearchpanelImplControl)) {
      M.exception('La implementación usada no puede crear controles SearchpanelControl');
    }
    // 2. implementation of this control
    const impl = new SearchpanelImplControl();
    super(impl, 'Searchpanel');
    this.config_ = config;
    this.maxResults_ = this.config_.maxResults
    this.title_ = this.config_.title;
    this.fields_ = this.config_.fields;
    this.infofields_ = this.config_.infoFields;
    this.panelTitle_ = panelTitle
    this.geosearchUrl_ = this.config_.geosearchUrl + "fq=";
    this.otherParameters_ = '&rows=' + this.maxResults_ + '&start=0&srs=EPSG%3A25830';
    this.maxRecordsPage_ = 8;
    this.totalRecords_ = null;
    this.pageNumber_ = 1;
    this.pageTotal_ = null;
    this.tabs_ = null;
    this.panelConfig_ = null;
    this.dataList_ = new Array();
    this.capaGeoJSON_ = null;
    this.wktFormatter = new ol.format.WKT();
    this.selectedFeatures = null;
    this.arrayFeaturesMapeaGeoJSON = null;
    this.stylePoint = new M.style.Point({
      radius: 5,
      fill: {
        color: "#00796b",
        opacity: 0.7,
      },
      stroke: {
        color: "#00796b",
      },
    });
    this.stylePolygon = new M.style.Polygon({
      radius: 5,
      fill: {
        color: "#00796b",
        opacity: 0.7,
      },
      stroke: {
        color: "#00796b",
      },
    });

    this.styleLine = new M.style.Line({
      radius: 5,
      fill: {
        color: "#00796b",
        opacity: 0.7,
      },
      stroke: {
        color: "#00796b",
      },
    });

  }

  getPanelConfig(config) {
    let arrayConfig = new Array()
    for (let index = 0; index < config.length; index++) {
      const element = config[index];
      let myConfig = {
        tab: element.tab,
        tab_id: element.tab.toLowerCase().replace(' ', '-'),
        fields: element.fields,
        infoFields: element.infoFields
      }
      arrayConfig.push(myConfig)
    }
    return arrayConfig
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    
    let myVars = {
      panelTitle: this.panelTitle_,
      config: this.getPanelConfig(this.config_)
    }
    let templateVars = { vars: myVars };

    return new Promise((success, fail) => {
      let myTemplate = searchpanelTemplate
      if(this.config_.length > 1){
        myTemplate = searchpanelTabtemplate
      }
      const html = M.template.compileSync(myTemplate, templateVars);
      this.element = html;
      this.addEvents(html, this.fields_);
      success(html);
    });
  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    // calls super to manage de/activation
    super.activate();
    this.getImpl().activate(this.map_);

  }
  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    // calls super to manage de/activation
    super.deactivate();
    this.getImpl().deactivate(this.map_);
  }
  /**
   * This function gets activation button
   *
   * @public
   * @function
   * @param {HTML} html of control
   * @api stable
   */
  getActivationButton(html) {
    return html.querySelector('.m-searchpanel button');
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof SearchpanelControl;
  }

  // Add your own functions

  addEvents(html) {
    // Query Selector
    this.loadButton = html.querySelector('button#m-searchpanel-loadButton');
    this.clearButton = html.querySelector('button#m-searchpanel-clearButton');
    this.searchOptions = html.querySelectorAll('input[type=text]');
    this.searchPanel = html.querySelector('div#m-searchpanel-content');
    this.resultPanel = html.querySelector('div#m-searchpanel-result-content');
    this.results = html.querySelector('div#results');
    this.resultPagination = html.querySelector('div#m-searchpanel-result-pagination');
    this.previusPage = html.querySelector('td#previusPage');
    this.nextPage = html.querySelector('td#nextPage');
    this.recordsTotal = html.querySelector('span#recordsTotal');
    this.recordsNumber = html.querySelector('span#recordsNumber');

    // Add Event Listener
    this.loadButton.addEventListener('click', () => this.load());
    this.clearButton.addEventListener('click', () => this.clear());
    this.previusPage.addEventListener('click', () => this.showPreviusPage());
    this.nextPage.addEventListener('click', () => this.showNextPage());
    // listener para input textbox
    for (let i = 0; i < this.searchOptions.length; i++) {
      this.searchOptions[i].addEventListener('change', () => this.enableButtons(html));
    }
    this.results.addEventListener('click', (event) => {
      this.map_.removeLayers(this.capaGeoJSON_);
      this.selectedFeatures = new Array();
      let record = event.target.closest('table');
      let find = false;
      do {
        for (let i = 0; i < this.arrayFeaturesMapeaGeoJSON.length; i++) {
          if (this.arrayFeaturesMapeaGeoJSON[i].id == record.id) {
            this.selectedFeatures.push(this.arrayFeaturesMapeaGeoJSON[i]);
            find = true;
          }
        }
      } while (!find);

      let style = this.setStyle(this.selectedFeatures[0].geometry.type);

      this.capaGeoJSON_ = new M.layer.GeoJSON({
        extract: false,
        source: {
          crs: { properties: { name: "EPSG:25830" }, type: "name" },
          features: this.selectedFeatures,
          type: "FeatureCollection",
        },
        name: 'result',
      });
      this.capaGeoJSON_.setStyle(style);
      this.map_.addLayers(this.capaGeoJSON_);
      this.capaGeoJSON_.displayInLayerSwitcher = false;
      this.capaGeoJSON_.calculateMaxExtent().then((res) => {
        this.map_.setBbox(res);
      })
    });
  }

  setStyle(geometryTye) {
    let style = null;
    switch (geometryTye) {
      case geometryTye = 'Point':
        style = this.stylePoint;
        break;
      case geometryTye = 'MultiPoint':
        style = this.stylePoint;
        break;
      case geometryTye = 'LineString':
        style = this.styleLine;
        break;
      case geometryTye = 'MultiLineString':
        style = this.styleLine;
        break;
      case geometryTye = 'Polygon':
        style = this.stylePolygon;
        break;
      case geometryTye = 'MultiPolygon':
        style = this.stylePolygon;
        break;
      default:
        style = null
        break;
    }
    return style;

  }

  load() {
    let query = '';
    let fieldList = new Array();
    this.arrayFeaturesMapeaGeoJSON = new Array();
    for (let i = 0; i < this.searchOptions.length; i++) {
      if (this.searchOptions[i].value != "") {
        fieldList.push(this.searchOptions[i].id + ':"' + this.searchOptions[i].value + '"');
      }
    }
    for (let i = 0; i < fieldList.length; i++) {
      if (i == fieldList.length - 1) {
        query += fieldList[i];
      } else {
        query += fieldList[i] + " AND ";
      }
    }
    const projection = this.map_.getProjection().code;
    const wktFormatter = this.wktFormatter;
    M.remote.get(this.geosearchUrl_ + encodeURI(query) + this.otherParameters_).then((res) => {
      let resposeGeosearch = JSON.parse(res.text);
      resposeGeosearch.response.docs.forEach((element) => {
        const feature = wktFormatter.readFeature(element.geom, {
          dataProjection: projection,
        });
        feature.setId(element.solrid);
        feature.setProperties(element);
        const featureMapea = M.impl.Feature.olFeature2Facade(feature);
        this.arrayFeaturesMapeaGeoJSON.push(featureMapea.getGeoJSON());
      })
      this.showResults(this.arrayFeaturesMapeaGeoJSON);
    })
  }

  clear() {
    this.pageNumber_ = 1;
    for (let i = 0; i < this.searchOptions.length; i++) {
      this.searchOptions[i].value = '';
    }
    this.searchPanel.style.display = 'block';
    this.resultPanel.style.display = 'none';
    this.resultPagination.style.display = 'none';
    this.loadButton.disabled = true;
    this.clearButton.disabled = true;
  }

  enableButtons() {
    this.loadButton.disabled = false;
    this.clearButton.disabled = false;
  }

  paginate(array) {
    return array.slice((this.pageNumber_ - 1) * this.maxRecordsPage_, this.pageNumber_ * this.maxRecordsPage_);
  }

  createResultContent(dataList) {
    let htmlResult = '';
    for (let x = 0; x < dataList.length; x++) {
      htmlResult += this.recordInfoTable(dataList[x]);
    }
    return htmlResult;
  }

  recordInfoTable(record) {
    let recordTable = '<table id="' +
      record.properties["solrid"] +
      '" class="record-result">\n<tbody class="pointer-none">\n<tr class="rowResult" >\n';
    for (let y = 0; y < this.infofields_.length; y++) {
      recordTable += '<td class="key">' + this.infofields_[y].alias + '</td>\n<td class="value">' + record.properties[this.infofields_[y].field] + '</td>\n</tr>'
    }
    recordTable += '\n</tbody>\n</table>\n';
    return recordTable;
  }

  showResults(data) {
    this.dataList_ = data;
    if (this.dataList_.length > 0) {
      this.totalRecords_ = this.dataList_.length
      if (this.dataList_.length % this.maxRecordsPage_ == 0) {
        this.pageTotal_ = this.dataList_.length / this.maxRecordsPage_;
      } else {
        this.pageTotal_ = Math.floor(this.dataList_.length / this.maxRecordsPage_) + 1;
      }
      let paginatedRecords = this.paginate(this.dataList_);
      let resultContent = this.createResultContent(paginatedRecords);
      this.createResultPagination();
      this.results.innerHTML = resultContent;
      this.loadButton.disabled = true;
    } else {
      this.results.innerHTML =
        '<table class="center">\n' +
        "<tbody>\n" +
        "<tr>\n" +
        '<th class="noResults" colspan="2">\n' +
        "<p>No se ha encontrado ningún resultado</p>\n" +
        "</th>\n" +
        "</tr>\n" +
        "</tbody>\n" +
        "</table>";
      this.recordsNumber.textContent = "0";
      this.recordsTotal.textContent = "0";
      this.previusPage.style.visibility = "hidden";
      this.nextPage.style.visibility = "hidden";
    }
    this.resultPagination.style.display = "block";
    this.resultPanel.style.display = "block"
    this.searchPanel.style.display = "none"
  }

  createResultPagination() {
    this.recordsTotal.textContent = this.totalRecords_;
    if (this.totalRecords_ < this.maxRecordsPage_) {
      this.recordsNumber.textContent = this.totalRecords_;
      this.previusPage.style.visibility = "hidden";
      this.nextPage.style.visibility = "hidden";
    } else {
      this.recordsNumber.textContent = "1 - " + this.maxRecordsPage_;
    }

    if (this.pageNumber_ == 1 & (this.totalRecords_ > this.maxRecordsPage_)) {
      this.previusPage.style.visibility = "hidden";
      this.nextPage.style.visibility = "visible";
    } else if (this.pageNumber_ == 1 & (this.totalRecords_ <= this.maxRecordsPage_)) {
      this.previusPage.style.visibility = "hidden";
      this.nextPage.style.visibility = "hidden";
    }
    else {
      this.previusPage.style.visibility = "visible";
      this.nextPage.style.visibility = "visible";
    }
  }

  showPreviusPage() {
    this.pageNumber_ -= 1;
    let paginatedRecords = this.paginate(this.dataList_);
    let htmlRecords = this.createResultContent(paginatedRecords);
    this.results.innerHTML = htmlRecords;
    if (this.pageNumber_ == 1) {
      this.recordsNumber.textContent = "1 - " + this.pageNumber_ * this.maxRecordsPage_;
      this.previusPage.style.visibility = "hidden";
      this.nextPage.style.visibility = "visible"
    } else {
      this.recordsNumber.textContent = this.pageNumber_ * this.maxRecordsPage_ - (this.maxRecordsPage_ - 1) + ' - ' + this.pageNumber_ * this.maxRecordsPage_;
      this.previusPage.style.visibility = "visible";
      this.nextPage.style.visibility = "visible";
    }
  }

  showNextPage() {
    this.pageNumber_ += 1;
    let paginatedRecords = this.paginate(this.dataList_);
    let htmlRecords = this.createResultContent(paginatedRecords);
    this.results.innerHTML = htmlRecords;
    if (this.pageNumber_ == this.pageTotal_) {
      this.recordsNumber.textContent = (this.totalRecords_ - paginatedRecords.length) + ' - ' + this.totalRecords_;
      this.previusPage.style.visibility = "visible";
      this.nextPage.style.visibility = "hidden";
    } else {
      this.recordsNumber.textContent =
        this.pageNumber_ * this.maxRecordsPage_ -
        (this.maxRecordsPage_ - 1) +
        ' - ' +
        this.pageNumber_ * this.maxRecordsPage_;
      this.previusPage.style.visibility = "visible";
      this.nextPage.style.visibility = "visible";
    }
  }

}