'use strict';

define(['angular', 'ol', 'toolbar', 'layermanager', 'WfsSource', 'sidebar', 'map', 'ows', 'query', 'search', 'permalink', 'measure', 'legend', 'bootstrap', 'geolocation', 'core', 'datasource_selector', 'api', 'angular-gettext', 'translations', 'compositions', 'status_creator', 'mobile_toolbar', 'ows.nonwms', 'print'],

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
            'hs.compositions', 'hs.status_creator',
            'hs.sidebar',
            'hs.mobile_toolbar',
            'hs.ows.nonwms'
        ]);

        module.directive('hs', ['hs.map.service', 'Core', function(OlMap, Core) {
            return {
                templateUrl: hsl_path + 'hslayers_mobile.html',
                link: function(scope, element) {
                    Core.fullScreenMap(element);
                }
            };
        }]);

        var style = new ol.style.Style({
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
                new ol.layer.Tile({
                    source: new ol.source.OSM(),
                    title: "Base layer",
                    base: true
                }),
                new ol.layer.Tile({
                    source: new ol.source.WMTS({
                        url: "http://opencache.statkart.no/gatekeeper/gk/gk.open_wmts",
                        layer: 'elf_basemap',
                        matrixSet: 'EPSG:3857',
                        format: 'image/png',
                        projection: ol.proj.get('EPSG:3857'),
                        tileGrid: new ol.tilegrid.WMTS({
                            origin: ol.extent.getTopLeft(projectionExtent),
                            resolutions: resolutions,
                            matrixIds: matrixIds
                        }),
                        style: 'default',
                        wrapX: true
                    }),
                    title: 'ELF Basemap',
                    base: true
                // }),
                // new ol.layer.Vector({
                //     title: "Parcels",
                //     source: new WfsSource({
                //         url: 'http://services.cuzk.cz/wfs/inspire-cp-wfs.asp',
                //         typename: 'CP:CadastralParcel',
                //         projection: 'EPSG:3857',
                //         version: '2.0.0',
                //         format: new ol.format.WFS(),
                //         hsproxy: true,
                //         parser: feature_parser
                //     }),
                //     style: style
                // }),
                // new ol.layer.Vector({
                //     title: "Buildings",
                //     maxResolution: 2.4,
                //     visible: false,
                //     source: new WfsSource({
                //         url: 'https://security.locationframework.eu/wss/service/CZ-AD/httpauth',
                //         typename: 'AD:Address',
                //         projection: 'EPSG:3857',
                //         version: '2.0.0',
                //         format: new ol.format.WFS(),
                //         hsproxy: true,
                //         beforeSend: function(xhr) {
                //             xhr.setRequestHeader("Authorization", "Basic " + btoa("WRLS" + ":" + "WRLSELFx1"));
                //         },
                //         parser: feature_parser
                //     }),
                //     style: style
                })
            ],
            default_view: new ol.View({
                center: ol.proj.transform([17.474129, 52.574000], 'EPSG:4326', 'EPSG:3857'), //Latitude longitude    to Spherical Mercator
                zoom: 4,
                units: "m"
            }),
            compositions_catalogue_url: 'http://www.whatstheplan.eu/php/metadata/csw/',
            status_manager_url: 'http://www.whatstheplan.eu/wwwlibs/statusmanager/index.php',
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
    });
