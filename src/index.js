import M$plugin$Searchpanel from '/home/epardo/proyectos/searchpanel/src/facade/js/searchpanel';
import M$control$SearchpanelControl from '/home/epardo/proyectos/searchpanel/src/facade/js/searchpanelcontrol';
import M$impl$control$SearchpanelControl from '/home/epardo/proyectos/searchpanel/src/impl/ol/js/searchpanelcontrol';

if (!window.M.plugin) window.M.plugin = {};
if (!window.M.control) window.M.control = {};
if (!window.M.impl) window.M.impl = {};
if (!window.M.impl.control) window.M.impl.control = {};
window.M.plugin.Searchpanel = M$plugin$Searchpanel;
window.M.control.SearchpanelControl = M$control$SearchpanelControl;
window.M.impl.control.SearchpanelControl = M$impl$control$SearchpanelControl;
