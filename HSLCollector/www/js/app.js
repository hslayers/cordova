'use strict';

define(['ol',
        'sidebar',
        'toolbar',
        'layermanager',
        'query',
        'search',
        'print',
        'permalink',
        'measure',
        'bootstrap',
        'geolocation',
        'api',
        'mobile_toolbar',
        'mobile_settings',
        'senslog',
        'draw'
    ],
    function(ol, toolbar) {
        var module = angular.module('hs', [
            'hs.toolbar',
            'hs.layermanager',
            'hs.query',
            'hs.search',
            'hs.print',
            'hs.permalink',
            'hs.geolocation',
            'hs.api',
            'hs.sidebar',
            'hs.mobile_toolbar',
            'hs.mobile_settings',
            'hs.senslog',
            'hs.draw'
        ]);

        module.directive(
            'hs', [
                'hs.map.service', 'Core',
                function(OlMap, Core) {
                    return {
                        templateUrl: hsl_path + 'hslayers_mobile.html',
                        link: function(scope, element) {
                            Core.fullScreenMap(element);
                        }
                    };
                }
            ]);

        module.value('config', {
            default_layers: [
                new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'http://{a-c}.osm.rrze.fau.de/osmhd/{z}/{x}/{y}.png',
                        tilePixelRatio: 2
                    }),
                    title: "Base Layer",
                    base: true
                })/*,
                new ol.layer.Vector({
                    title: 'Editable vector layer',
                    visibility: true,
                    source: new ol.source.Vector({
                        url: 'http://portal.sdi4apps.eu/SensLog-VGI/rest/vgi/observations/select?user_name=tester&format=geojson',
                        senslog_url: 'http://portal.sdi4apps.eu/SensLog-VGI/rest/vgi/',
                        format: new ol.format.GeoJSON()
                    })
                })*/
            ],
            default_view: new ol.View({
                center: ol.proj.transform([6.1319, 49.6116], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude    to Spherical Mercator
                zoom: 13,
                units: "m"
            }),
            hostname: {
                "default": {
                    "title": "Default",
                    "type": "default",
                    "editable": false,
                    "url": 'http://portal.sdi4apps.eu'
                }
            },
            permalinkLocation: {
                'host': 'portal.sdi4apps.eu',
                'pathname': '/view',
                'origin': 'http://portal.sdi4apps.eu',
                'hsl_path': '/wwwlibs/hslayers_ng/'
            },
            senslog_url: 'http://portal.sdi4apps.eu/SensLog-VGI/rest/vgi'
        });

        module.controller('Main', ['$scope', 'Core', '$compile', 'hs.map.service', 'config', '$http',
            function($scope, Core, $compile, hsmap, config, $http) {
                $scope.hsl_path = hsl_path; //Get this from hslayers.js file
                $scope.Core = Core;
                $scope.$on("scope_loaded", function(event, args) {
                    if (args == 'Sidebar') {
                        var el = angular.element('<div hs.senslog.directive hs.draggable ng-controller="hs.senslog.controller" ng-if="Core.exists(\'hs.senslog.controller\')" ng-show="Core.panelVisible(\'senslog\', this)"></div>');
                        angular.element('#panelplace').append(el);
                        $compile(el)($scope);

                        var toolbar_button = angular.element('<div hs.senslog.toolbar_button_directive></div>');
                        angular.element('.sidebar-list').append(toolbar_button);
                        $compile(toolbar_button)(event.targetScope);
                    }
                    if (args == 'LayerManager') {
                        var add_button = angular.element('<button class="btn btn-default" style="float:right; margin-top:1em" ng-click="toggleAddSenslogDataset()" translate=""><span class="menu-icon glyphicon glyphicon-plus" data-toggle="tooltip" data-container="body" data-placement="auto" title="Add external data"></span></button>');
                        angular.element('.hs-lm-panel').append(add_button);
                        $compile(add_button)(event.targetScope);
                        var add_dataset_panel = angular.element('<panel class="panel" ng-show="add_dataset_panel_visible"><form> <div class="form-group"><label translate>Dataset name</label><input type="text" class="form-control" ng-model="dataset_name"/></div> <div class="form-group"><label translate>Description</label><textarea class="form-control" ng-model="dataset_description"/></div><button class="btn btn-primary" ng-click="addSenslogDataset()">Save</button> </form></panel>');
                        angular.element('.hs-lm-panel').append(add_dataset_panel);
                        $compile(add_dataset_panel)(event.targetScope);
                        event.targetScope.toggleAddSenslogDataset = function() {
                            event.targetScope.add_dataset_panel_visible = !event.targetScope.add_dataset_panel_visible;
                        }
                        event.targetScope.addSenslogDataset = function() {
                            $http({
                                    url: config.senslog_url + '/dataset/insert?user_name=tester',
                                    method: 'POST',
                                    data: {
                                        dataset_name: event.targetScope.dataset_name,
                                        description: event.targetScope.dataset_description
                                    },
                                    headers: {
                                        "Content-Type": "application/json"
                                    }
                            }
                                ).then(function(response) {
                                    debugger;
                                    if (response.statusText == "OK") {

                                    }
                                });
                        }
                    }
                })
                Core.panelEnabled('compositions', false);
                $scope.$on('infopanel.updated', function(event) {});
            }
        ]);

        return module;
    });