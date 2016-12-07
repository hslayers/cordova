'use strict';

define(['angular', 'ol', 'toolbar', 'layermanager', 'WfsSource', 'sidebar', 'map', 'ows', 'query', 'search', 'permalink', 'measure', 'legend', 'bootstrap', 'geolocation', 'core', 'datasource_selector', 'api', 'angular-gettext', 'translations', 'compositions', 'status_creator', 'mobile_toolbar', 'mobile_settings', 'ows.nonwms', 'print'],

    function(angular, ol, toolbar, layermanager, WfsSource) {
        var module = angular.module('hs', [
            'hs.sidebar',
            'hs.toolbar',
            'hs.layermanager',
            'hs.map',
            'hs.query',
            'hs.search', 'hs.permalink', 'hs.measure',
            'hs.geolocation', 'hs.core',
            'hs.datasource_selector',
            'hs.status_creator',
            'hs.api',
            'hs.ows',
            'gettext',
            'hs.compositions',
            'hs.sidebar',
            'hs.mobile_toolbar',
            'hs.mobile_settings',
        ]);

        module.directive('hs', ['hs.map.service', 'Core', function(OlMap, Core) {
            return {
                templateUrl: hsl_path + 'hslayers_mobile.html',
                link: function(scope, element) {
                    Core.fullScreenMap(element);
                    var $otn = $('<a>');
                    $otn.html('OTN')
                        .attr('href', 'http://opentnet.eu/')
                        .attr('target', '_blank')
                        .addClass('btn btn-default')
                        .css({
                            'z-index': 1000,
                            'position': 'absolute',
                            'top': '5px',
                            'right': '5px'
                        });
                    element.append($otn);
                }
            };
        }]);

        module.value('config', {
            box_layers: [
                new ol.layer.Group({
                    'img': 'img/osm.png',
                    title: 'Base layer',
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.XYZ({
                                url: 'http://{a-c}.osm.rrze.fau.de/osmhd/{z}/{x}/{y}.png',
                                tilePixelRatio: 2
                            }),
                            title: "Topographic",
                            base: true
                        }),
                        new ol.layer.Tile({
                            title: "Satellite",
                            visible: false,
                            base: true,
                            source: new ol.source.XYZ({
                                url: 'http://api.tiles.mapbox.com/v4/mapbox.streets-satellite/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicmFpdGlzYmUiLCJhIjoiY2lrNzRtbGZnMDA2bXZya3Nsb2Z4ZGZ2MiJ9.g1T5zK-bukSbJsOypONL9g'
                            })
                        })
                    ],
                })/*, new ol.layer.Group({
                    'img': 'img/armenia.png',
                    title: 'WMS layers',
                    layers: [
                        new ol.layer.Tile({
                            title: "Swiss",
                            source: new ol.source.TileWMS({
                                url: 'http://wms.geo.admin.ch/',
                                params: {
                                    LAYERS: 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
                                    INFO_FORMAT: undefined,
                                    FORMAT: "image/png; mode=8bit"
                                },
                                crossOrigin: 'anonymous'

                            }),
                        })
                    ]
                })*/
            ],
            default_view: new ol.View({
                center: ol.proj.transform([17.474129, 52.574000], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude    to Spherical Mercator
                zoom: 4,
                units: "m"
            }),
            connectTypes: ['', 'WMS', 'WMTS', 'GeoJSON', 'KML'],
            dsPaging: 30,
            hostname: {
                "default": {
                    "title": "Default",
                    "type": "default",
                    "editable": false,
                    "url": 'http://opentransportnet.eu'
                }
            },
            permalinkLocation: {
                'host': 'opentransportnet.eu',
                'pathname': '/create-maps',
                'origin': 'http://opentransportnet.eu',
                'hsl_path': '/wwwlibs/hslayers-ng/'
            },
            compositions_catalogue_url: '/php/metadata/csw/',
            status_manager_url: '/wwwlibs/statusmanager2/index.php',
            datasources: [{
                title: "Hub layers",
                url: "http://opentransportnet.eu/php/metadata/csw/",
                language: 'eng',
                type: "micka",
                code_list_url: 'http://opentransportnet.eu/php/metadata/util/codelists.php?_dc=1440156028103&language=eng&page=1&start=0&limit=25&filter=%5B%7B%22property%22%3A%22label%22%7D%5D'
            }]
        });

        module.controller('Main', ['$scope', 'Core', 'hs.query.service_infopanel', 'hs.compositions.service_parser', 'config',
            function($scope, Core, InfoPanelService, composition_parser, config) {
                if (console) console.log("Main called");
                $scope.hsl_path = hsl_path; //Get this from hslayers.js file
                $scope.Core = Core;
                Core.sidebarRight = false;
                Core.singleDatasources = true;
                Core.panelEnabled('draw', false);
                // Core.panelEnabled('mobile_settings', false);
                Core.panelEnabled('status_creator', false);
                $scope.$on('infopanel.updated', function(event) {
                    if (console) console.log('Attributes', InfoPanelService.attributes, 'Groups', InfoPanelService.groups);
                });
            }
        ]);

        return module;
    });


/*        var style = new ol.style.Style({
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: [242, 121, 0, 0.7]
                }),
                stroke: new ol.style.Stroke({
                    color: [0xbb, 0x33, 0x33, 0.7]
                }),
                radius: 5
            }),
            fill: new ol.style.Fill({
                color: "rgba(139, 189, 214, 0.3)",
            }),
            stroke: new ol.style.Stroke({
                color: '#112211',
                width: 1
            })
        })

        var projection = ol.proj.get('EPSG:3857');
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;
        var resolutions = new Array(14);
        var matrixIds = new Array(14);
        for (var z = 0; z < 14; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = 'EPSG:3857:' + z;
        }



        var gm = new ol.format.GML3();
        for (var key in gm) {
            if (key.indexOf("_PARSERS") > 0)
                gm[key]["http://www.opengis.net/gml/3.2"] = gm[key]["http://www.opengis.net/gml"];
        }

        var feature_parser = function(response) {
            var features = [];
            $("member", response).each(function() {
                var attrs = {};
                var geom_node = $("geometry", this).get(0) || $("CP\\:geometry", this).get(0);
                attrs.geometry = gm.readGeometryElement(geom_node, [{}]);
                var feature = new ol.Feature(attrs);
                features.push(feature);
            });
            return features;
        }

        module.value('config', {
            default_layers: [
                // new ol.layer.Tile({
                //     source: new ol.source.OSM(),
                //     title: "Base layer",
                //     base: true
                // }),
                // new ol.layer.Tile({
                //     source: new ol.source.WMTS({
                //         url: "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
                //         layer: 'elf_basemap',
                //         matrixSet: 'EPSG:3857',
                //         format: 'image/png',
                //         projection: ol.proj.get('EPSG:3857'),
                //         tileGrid: new ol.tilegrid.WMTS({
                //             origin: ol.extent.getTopLeft(projectionExtent),
                //             resolutions: resolutions,
                //             matrixIds: matrixIds
                //         }),
                //         style: 'default',
                //         wrapX: true
                //     }),
                //     title: 'ELF Basemap',
                //     base: true
                // }),
                new ol.layer.Tile({
                    source: new ol.source.XYZ({
                        url: 'http://{a-c}.osm.rrze.fau.de/osmhd/{z}/{x}/{y}.png',
                        tilePixelRatio: 2
                    }),
                    title: "Base layer",
                    base: true
                })
            ],
            default_view: new ol.View({
                center: ol.proj.transform([17.474129, 52.574000], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude    to Spherical Mercator
                zoom: 4,
                units: "m"
            }),
            hostname: {
                "default": {
                    "title": "Default",
                    "type": "default",
                    "editable": false,
                    "url": 'http://youth.sdi4apps.eu'
                },
                "compositions_catalogue": {
                    "title": "Compositions catalogue",
                    "type": "compositions_catalogue",
                    "editable": true,
                    "url": 'http://www.whatstheplan.eu'
                },
                "status_manager": {
                    "title": "Status manager",
                    "type": "status_manager",
                    "editable": true,
                    "url": 'http://www.whatstheplan.eu'
                },
            },
            permalinkUrlPrefix: 'http://opentransportnet.eu/create-maps',
            // hostname: {
            //     default: 'http://youth.sdi4apps.eu',
            //     compositions_catalogue: 'http://www.whatstheplan.eu',
            //     status_manager: 'http://www.whatstheplan.eu'
            // },
            // compositions_catalogue_url: '/p4b-dev/cat/catalogue/libs/cswclient/cswClientRun.php',
            status_manager_url: '/wwwlibs/statusmanager/index.php',
            compositions_catalogue_url: '/php/metadata/csw/',
            // compositions_catalogue_url: 'http://www.whatstheplan.eu/php/metadata/csw/',
            // status_manager_url: 'http://www.whatstheplan.eu/wwwlibs/statusmanager/index.php',
            connectTypes: ["", "WMS", "WFS", "KML", "GeoJSON"],
            datasources: [{
                title: "Catalogue",
                url: "http://www.whatstheplan.eu/php/metadata/csw/",
                language: 'eng',
                type: "micka",
                code_list_url: 'http://www.whatstheplan.eu/php/metadata/util/codelists.php?_dc=1440156028103&language=eng&page=1&start=0&limit=25&filter=%5B%7B%22property%22%3A%22label%22%7D%5D'
            }],
            createExtraMenu: function($compile, $scope, element) {
                $scope.uploadClicked = function() {
                    alert("UPLOAD!")
                }
                var el = angular.element("<li class=\"sidebar-item\" ng-click=\"uploadClicked()\" ><a href=\"#\"><span class=\"menu-icon glyphicon icon-cloudupload\"></span><span class=\"sidebar-item-title\">Upload</span></a></li>");
                element.find('ul').append(el);
                $compile(el)($scope);
            }
        });

        module.controller('Main', ['$scope', 'Core', 'hs.query.service_infopanel', 'hs.compositions.service_parser', 'config', 
            function($scope, Core, InfoPanelService, composition_parser, config) {
                if (console) console.log("Main called");
                $scope.hsl_path = hsl_path; //Get this from hslayers.js file
                $scope.Core = Core;
                Core.singleDatasources = true;
                Core.embededEnabled = false;
                $scope.$on('infopanel.updated', function(event) {
                    if (console) console.log('Attributes', InfoPanelService.attributes, 'Groups', InfoPanelService.groups);
                });
            }
        ]);

        return module;
    });*/
