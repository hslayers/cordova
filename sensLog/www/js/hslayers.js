'use strict';

var hsl_path = '';

var gitsha = $.ajax({
    type: "GET",
    url: hsl_path + 'gitsha.js?t=' + Date.now(),
    async: false
}).responseText;

require.config({
    urlArgs: 'bust=' + gitsha,
    paths: {
        app: 'js/app',
        core: hsl_path + 'components/core/core',
        ol: hsl_path + 'node_modules/openlayers/dist/ol-debug',
        toolbar: hsl_path + 'components/toolbar/toolbar',
        layermanager: hsl_path + 'components/layermanager/layermanager',
        ows: hsl_path + 'components/ows/ows',
        'ows.wms': hsl_path + 'components/ows/ows_wms',
        'ows.wfs': hsl_path + 'components/ows/ows_wfs',
        'ows.nonwms': hsl_path + 'components/ows/ows_nonwms',
        'ows.wmsprioritized': hsl_path + 'components/ows/ows_wmsprioritized',
        query: hsl_path + 'components/query/query',
        search: hsl_path + 'components/search/search',
        print: hsl_path + 'components/print/print',
        permalink: hsl_path + 'components/permalink/permalink',
        measure: hsl_path + 'components/measure/measure',
        legend: hsl_path + 'components/legend/legend',
        api: hsl_path + 'components/api/api',
        translations: hsl_path + 'components/translations/js/translations',
        senslog: hsl_path + 'senslog/senslog',
        geolocation: 'js/geolocation_cordova',
        mobile_toolbar: hsl_path + 'components/mobile_toolbar/mobile_toolbar',
        mobile_settings: hsl_path + 'components/mobile_settings/mobile_settings'
    },
    shim: {
        d3: {
            exports: 'd3'
        },
        dc: {
            deps: ['d3', 'crossfilter']
        }
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
