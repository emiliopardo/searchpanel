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
    this.geosearchUrl_ = this.config_.geosearchUrl;
    this.otherParameters_ = '&rows=20&start=0&srs=EPSG:25830';
    this.maxRecordsPage_ = 8;
    this.totalRecords_ = null;
    this.page_number_ = 1;
    this.page_total_ = null;
    this.dataList_ = new Array();
    this.capaGeoJSON_ = null;
    this.wktFormatter__ = new ol.format.WKT();
    this.arrayFeaturesMapeaGeoJSON_ = new Array();
    this.selectedFeatures_ = new Array();


    // eslint-disable-next-line no-console
    //console.log(this.fields_);
    // eslint-disable-next-line no-console
    //console.log(this.geosearchUrl_);
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

  addEvents(html, fields) {
    // Query Selector
    this.loadButton = html.querySelector('button#m-searchpanel-loadButton');
    this.clearButton = html.querySelector('button#m-searchpanel-clearButton');
    console.log(html.querySelectorAll('.m-searchpanel-opciones-busqueda'));


    // Add Event Listener
    this.loadButton.addEventListener('click', () => this.load());
    this.clearButton.addEventListener('click', () => this.clear());
  }

  load() {
    alert('Se ha pinchado el boton ejecutar');
  }

  clear() {
    alert('Se ha pinchado el boton limpiar');
  }
}
