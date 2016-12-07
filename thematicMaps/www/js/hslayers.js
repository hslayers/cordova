'use strict';

var hsl_path = '';
var gitsha = $.ajax({
    type: "GET",
    url: hsl_path + 'gitsha.js',
    async: false
}).responseText;

require.config({
    paths: {
        sidebar: hsl_path + 'components/sidebar/sidebar',
        toolbar: hsl_path + 'components/toolbar/toolbar',
        mobile_toolbar: hsl_path + 'components/mobile_toolbar/mobile_toolbar',
        mobile_settings: hsl_path + 'components/mobile_settings/mobile_settings',
        utils: hsl_path + 'components/utils.js',
        layermanager: hsl_path + 'components/layermanager/layermanager',
        ows: hsl_path + 'components/ows/ows',
        'ows.wms': hsl_path + 'components/ows/ows_wms',
        'ows.wfs': hsl_path + 'components/ows/ows_wfs',
        'ows.nonwms': hsl_path + 'components/ows/ows_nonwms',
        'ows.wmsprioritized': hsl_path + 'components/ows/ows_wmsprioritized',
        WfsSource: hsl_path + 'components/layers/hs.source.Wfs',
        ol: hsl_path + 'node_modules/openlayers/dist/ol-debug',
        query: hsl_path + 'components/query/query',
        search: hsl_path + 'components/search/search',
        print: hsl_path + 'components/print/print',
        permalink: hsl_path + 'components/permalink/permalink',
        geolocation: hsl_path + 'components/geolocation/geolocation',
        measure: hsl_path + 'components/measure/measure',
        legend: hsl_path + 'components/legend/legend',
        app: 'js/app',
        core: hsl_path + 'components/core/core',
        datasource_selector: hsl_path + 'components/datasource_selector/datasource_selector',
        api: hsl_path + 'components/api/api',
        senslog: hsl_path + 'senslog/senslog',
        translations: hsl_path + 'components/translations/js/translations'
    }
});

window.name = "NG_DEFER_BOOTSTRAP!";

require(['core'], function(app) {
    require(['app'], function(app) {
        var $html = angular.element(document.getElementsByTagName('html')[0]);
        angular.element().ready(function() {
            angular.resumeBootstrap([app['name']]);
        });
    });
});
