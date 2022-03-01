/**
 * @module M/plugin/Searchpanel
 */
import 'assets/css/searchpanel';
import SearchpanelControl from './searchpanelcontrol';
import api from '../../api.json';

export default class Searchpanel extends M.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {M.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(parameters) {

    super();
    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;
    this.panel_ = null;
    this.config_ = parameters.config;
    this.options_ = parameters.options;
    this.position_ = parameters.options.position || 'TL';
    this.title_ = parameters.options.title

    if (this.position_ === 'TL' || this.position_ === 'BL') {
      this.positionClass_ = 'left';
    } else {
      this.positionClass_ = 'right';
    }

    /**
     * Array of controls
     * @private
     * @type {Array<M.Control>}
     */
    this.controls_ = [];

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.controls_.push(new SearchpanelControl(this.config_, this.title_));
    this.map_ = map;
    // panel para agregar control - no obligatorio
    this.panel_ = new M.ui.Panel('panelSearchpanel', {
      className: `search-panel ${this.positionClass_}`,
      collapsible: true,
      position: M.ui.position[this.position_],
      collapsedButtonClass: 'g-cartografia-prismaticos',
      tooltip: this.config_.title,
    });
    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
    this.panel_.on(M.evt.SHOW, () => {
      if (this.position_ == 'BR') {
        if (document.getElementsByClassName('m-map-info').length > 0) {
          document.getElementsByClassName('m-map-info')[0].style.display = 'none'
        }
        if (document.getElementsByClassName('m-location').length > 0) {
          document.getElementsByClassName('m-location')[0].style.display = 'none'
        }
        if (document.getElementsByClassName('m-rotate').length > 0) {
          document.getElementsByClassName('m-rotate')[0].style.display = 'none'
        }
      }
      if (this.position_ == 'BL') {
        document.getElementsByClassName('m-scaleline')[0].style.display = 'none'
      }
    }
    )
    this.panel_.on(M.evt.HIDE, () => {
      if (this.position_ == 'BR') {
        if (document.getElementsByClassName('m-map-info').length > 0) {
          document.getElementsByClassName('m-map-info')[0].style.display = 'block'
        }
        if (document.getElementsByClassName('m-location').length > 0) {
          document.getElementsByClassName('m-location')[0].style.display = 'block'
        }
        if (document.getElementsByClassName('m-rotate').length > 0) {
          document.getElementsByClassName('m-rotate')[0].style.display = 'block'
        }
      }
      if (this.position_ == 'BL') {
        document.getElementsByClassName('m-scaleline')[0].style.display = 'block'
      }
    })
  }

  /**
     * This function returns the position
     *
     * @public
     * @return {string}
     * @api
     */
  get position() {
    return this.position_;
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata() {
    return this.metadata_;
  }
}
