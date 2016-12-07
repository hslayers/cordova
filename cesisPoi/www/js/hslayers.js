'use strict';

var hsl_path = '';
var gitsha = '';

require.config({
    paths: {
        sidebar: hsl_path + 'components/sidebar/sidebar',
        toolbar: hsl_path + 'components/toolbar/toolbar',
        mobile_toolbar: hsl_path + 'components/mobile_toolbar/mobile_toolbar',
        mobile_settings: hsl_path + 'components/mobile_settings/mobile_settings',
        utils: hsl_path + 'components/utils.js',
        layermanager: hsl_path + 'components/layermanager/layermanager',
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
        translations: hsl_path + 'components/translations/js/translations',
        trip_planner: hsl_path + 'components/trip_planner/trip_planner',
        spoi_editor: hsl_path + 'js/spoi_editor'
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
