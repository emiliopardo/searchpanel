/* eslint-disable no-console */

/**
 * @module M/control/SearchpanelControl
 */

import SearchpanelImplControl from 'impl/searchpanelcontrol';
import template from 'templates/searchpanel';

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
  constructor(config) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(SearchpanelImplControl)) {
      M.exception('La implementación usada no puede crear controles SearchpanelControl');
    }
    // 2. implementation of this control
    const impl = new SearchpanelImplControl();
    super(impl, 'Searchpanel');
    this.config_ = config;
    this.title_ = this.config_.title;
    this.fields_ = this.config_.fields;
    this.infoFields_ = this.config_.infoFields;
    this.geosearchUrl_ = this.config_.geosearchUrl + "q=";
    this.otherParameters_ = '&rows=80&start=0&srs=EPSG%3A25830';
    this.maxRecordsPage_ = 8;
    this.totalRecords_ = null;
    this.pageNumber_ = 1;
    this.pageTotal_ = null;
    this.dataList_ = new Array();
    this.capaGeoJSON_ = null;
    this.wktFormatter_ = new ol.format.WKT();
    this.selectedFeatures_ = new Array();

    this.stylePoint = new M.style.Point({
      radius: 5,
      fill: {
        color: "#00796b",
        opacity: 0.1,
      },
      stroke: {
        color: "#00796b",
      },
    });
    this.stylePolygon = new M.style.Polygon({
      radius: 5,
      fill: {
        color: "#00796b",
        opacity: 0.1,
      },
      stroke: {
        color: "#00796b",
      },
    });

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
    let templateVars = { vars: { title: this.title_, fields: this.fields_ } };

    return new Promise((success, fail) => {
      const html = M.template.compileSync(template, templateVars);
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
    this.searchPanel_ = html.querySelector('div#m-searchpanel-content');
    this.resultPanel_ = html.querySelector('div#m-searchpanel-result-content');
    this.results_ = html.querySelector('div#results');
    this.resultPagination_ = html.querySelector('div#m-searchpanel-result-pagination');
    this.previusPageEl = html.querySelector('td#previusPage');
    this.nextPageEl = html.querySelector('td#nextPage');
    this.recordsTotalEl = html.querySelector('span#recordsTotal');
    this.recordsNumberEl = html.querySelector('span#recordsNumber');

    // Add Event Listener
    this.loadButton.addEventListener('click', () => this.load());
    this.clearButton.addEventListener('click', () => this.clear());
    this.previusPageEl.addEventListener('click', () => this.previusPage());
    this.nextPageEl.addEventListener('click', () => this.nextPage());
    // listener para input textbox
    for (let i = 0; i < this.searchOptions.length; i++) {
      this.searchOptions[i].addEventListener('change', () => this.enableButtons(html));
    }
  }

  load() {
    let query = '';
    let fieldList = new Array();
    let arrayFeaturesMapeaGeoJSON = new Array();
    for (let i = 0; i < this.searchOptions.length; i++) {
      fieldList.push(this.searchOptions[i].id + ':"' + this.searchOptions[i].value + '"');
    }
    for (let i = 0; i < fieldList.length; i++) {
      if (i == fieldList.length - 1) {
        query += fieldList[i];
      } else {
        query += fieldList[i] + " and ";
      }
    }
    const projection = this.map_.getProjection().code;
    const wktFormatter = this.wktFormatter_;
    console.log(this.geosearchUrl_ + encodeURI(query) + this.otherParameters_);
    M.remote.get(this.geosearchUrl_ + encodeURI(query) + this.otherParameters_).then((res) => {
      let resposeGeosearch = JSON.parse(res.text);
      resposeGeosearch.response.docs.forEach((element) => {
        const feature = wktFormatter.readFeature(element.geom, {
          dataProjection: projection,
        });
        feature.setId(element.solrid);
        feature.setProperties(element);
        const featureMapea = M.impl.Feature.olFeature2Facade(feature);
        arrayFeaturesMapeaGeoJSON.push(featureMapea.getGeoJSON());
      })
      this.showResults(arrayFeaturesMapeaGeoJSON);
    })
  }

  clear() {
    this.pageNumber_ = 1;
    for (let i = 0; i < this.searchOptions.length; i++) {
      this.searchOptions[i].value = '';
    }
    this.searchPanel_.style.display = 'block';
    this.resultPanel_.style.display = 'none';
    this.resultPagination_.style.display = 'none';
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
      '" class"result">\n<tbody class="pointer-none">\n<tr class="rowResult" >\n';
    for (let y = 0; y < this.infoFields_.length; y++) {
      recordTable += '<td class="key">' + this.infoFields_[y].alias + '</td>\n<td class="value">' + record.properties[this.infoFields_[y].field] + '</td>\n</tr>'
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
      this.results_.innerHTML = resultContent;
      this.loadButton.disabled = true;
    } else {
      this.results_.innerHTML =
        '<table class="center">\n' +
        "<tbody>\n" +
        "<tr>\n" +
        '<th class="noResults" colspan="2">\n' +
        "<p>No se ha encontrado ningún resultado</p>\n" +
        "</th>\n" +
        "</tr>\n" +
        "</tbody>\n" +
        "</table>";
      this.recordsNumberEl.textContent = "0";
      this.recordsTotalEl.textContent = "0";
      this.previusPageEl.style.visibility = "hidden";
      this.nextPageEl.style.visibility = "hidden";
    }
    this.resultPagination_.style.display = "block";
    this.resultPanel_.style.display = "block"
    this.searchPanel_.style.display = "none"
  }

  createResultPagination() {
    this.recordsTotalEl.textContent = this.totalRecords_;
    if (this.totalRecords_ < this.maxRecordsPage_) {
      this.recordsNumberEl.textContent = this.totalRecords_;
      this.previusPageEl.style.visibility = "hidden";
      this.nextPageEl.style.visibility = "hidden";
    } else {
      this.recordsNumberEl.textContent = "1 - " + this.maxRecordsPage_;
    }

    if (this.pageNumber_ == 1 & (this.totalRecords_ > this.maxRecordsPage_)) {
      this.previusPageEl.style.visibility = "hidden";
      this.nextPageEl.style.visibility = "visible";
    } else if (this.pageNumber_ == 1 & (this.totalRecords_ <= this.maxRecordsPage_)) {
      this.previusPageEl.style.visibility = "hidden";
      this.nextPageEl.style.visibility = "hidden";
    }
    else {
      this.previusPageEl.style.visibility = "visible";
      this.nextPageEl.style.visibility = "visible";
    }
  }

  previusPage() {
    this.pageNumber_ -= 1;
    let paginatedRecords = this.paginate(this.dataList_);
    let htmlRecords = this.createResultContent(paginatedRecords);
    this.results_.innerHTML = htmlRecords;
    if (this.pageNumber_ == 1) {
      this.recordsNumberEl.textContent = "1 - " + this.pageNumber_ * this.maxRecordsPage_;
      this.previusPageEl.style.visibility = "hidden";
      this.nextPageEl.style.visibility = "visible"
    } else {
      this.recordsNumberEl.textContent = this.pageNumber_ * this.maxRecordsPage_ - (this.maxRecordsPage_ - 1) + ' - ' + this.pageNumber_ * this.maxRecordsPage_;
      this.previusPageEl.style.visibility = "visible";
      this.nextPageEl.style.visibility = "visible";
    }
  }

  nextPage() {
    this.pageNumber_ += 1;
    let paginatedRecords = this.paginate(this.dataList_);
    let htmlRecords = this.createResultContent(paginatedRecords);
    this.results_.innerHTML = htmlRecords;
    if (this.pageNumber_ == this.pageTotal_) {
      this.recordsNumberEl.textContent = (this.totalRecords_ - paginatedRecords.length) + ' - ' + this.totalRecords_;
      this.previusPageEl.style.visibility = "visible";
      this.nextPageEl.style.visibility = "hidden";
    } else {
      this.recordsNumberEl.textContent =
        this.pageNumber_ * this.maxRecordsPage_ -
        (this.maxRecordsPage_ - 1) +
        ' - ' +
        this.pageNumber_ * this.maxRecordsPage_;
      this.previusPageEl.style.visibility = "visible";
      this.nextPageEl.style.visibility = "visible";
    }
  }

}