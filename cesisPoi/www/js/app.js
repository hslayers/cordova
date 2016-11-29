'use strict';

define(['angular', 'ol', 'toolbar', 'layermanager', 'SparqlJson', 'sidebar', 'map', 'ows', 'query', 'search', 'permalink', 'measure', 'legend', 'bootstrap', 'geolocation', 'core', 'api', 'angular-gettext', 'translations', 'compositions', 'mobile_toolbar', 'ows.nonwms', 'print', 'trip_planner'],

    function(angular, ol, toolbar, layermanager, SparqlJson) {
        var module = angular.module('hs', [
            'hs.sidebar',
            'hs.toolbar',
            'hs.layermanager',
            'hs.map',
            'hs.query',
            'hs.search', 'hs.permalink', 'hs.measure',
            'hs.geolocation', 'hs.core',
            'hs.api',
            'hs.ows',
            'gettext',
            'hs.sidebar',
            'hs.mobile_toolbar',
            'hs.ows.nonwms',
            'hs.trip_planner'
        ]);

        module.directive('hs', ['hs.map.service', 'Core', function(OlMap, Core) {
            return {
                templateUrl: hsl_path + 'hslayers_mobile.html',
                link: function(scope, element) {
                    Core.fullScreenMap(element);
                    Core.setMainPanel('layermanager');
                    angular.element("#loading-logo").remove();
                }
            };
        }]);

        var style = function(feature, resolution) {
            if (typeof feature.get('visible') === 'undefined' || feature.get('visible') == true) {
                var s = feature.get('http://www.openvoc.eu/poi#categoryWaze');
                if (typeof s === 'undefined') return;
                s = s.split("#")[1];
                return [
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1],
                            src: 'symbolsWaze/' + s + '.svg',
                            crossOrigin: 'anonymous'
                        })
                    })

                ]
            } else {
                return [];
            }
        }

        var styleOSM = function(feature, resolution) {
            if (typeof feature.get('visible') === 'undefined' || feature.get('visible') == true) {
                var s = feature.get('http://www.openvoc.eu/poi#categoryOSM');
                if (typeof s === 'undefined') return;
                s = s.split(".")[1];
                return [
                    new ol.style.Style({
                        image: new ol.style.Icon({
                            anchor: [0.5, 1],
                            src: 'symbols/' + s + '.svg',
                            crossOrigin: 'anonymous'
                        })
                    })
                ]
            } else {
                return [];
            }
        }

        var projection = ol.proj.get('EPSG:3857');
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;

        module.value('config', {
             box_layers: [new ol.layer.Group({
                'img': 'osm.png',
                title: 'Base layer',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM(),
                        title: "OpenStreetMap",
                        base: true,
                        visible: false,
                        path: 'Roads'
                    }),
                    new ol.layer.Tile({
                        title: "OpenCycleMap",
                        visible: true,
                        base: true,
                        source: new ol.source.OSM({
                            url: 'http://{a-c}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
                        }),
                        path: 'Roads'
                    }),
                    new ol.layer.Tile({
                        title: "MTBMap",
                        visible: false,
                        base: true,
                        source: new ol.source.XYZ({
                            url: 'http://tile.mtbmap.cz/mtbmap_tiles/{z}/{x}/{y}.png'
                        }),
                        path: 'Roads'
                    }),
                    new ol.layer.Tile({
                        title: "OwnTiles",
                        visible: false,
                        base: true,
                        source: new ol.source.XYZ({
                            url: 'http://ct37.sdi4apps.eu/map/{z}/{x}/{y}.png'
                        }),
                        path: 'Roads'
                    })
                ],
            }), new ol.layer.Group({
                'img': 'bicycle-128.png',
                title: 'Tourist info',
                layers: [
                ]
            }), new ol.layer.Group({
                'img': 'partly_cloudy.png',
                title: 'Weather',
                layers: [new ol.layer.Tile({
                        title: "OpenWeatherMap cloud cover",
                        source: new ol.source.XYZ({
                            url: "http://{a-c}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png"
                        }),
                        visible: false,
                        opacity: 0.7,
                        path: 'Weather info'
                    }),
                    new ol.layer.Tile({
                        title: "OpenWeatherMap precipitation",
                        source: new ol.source.XYZ({
                            url: "http://{a-c}.tile.openweathermap.org/map/precipitation/{z}/{x}/{y}.png"
                        }),
                        visible: false,
                        opacity: 0.7,
                        path: 'Weather info'
                    }),
                    new ol.layer.Tile({
                        title: "OpenWeatherMap temperature",
                        source: new ol.source.XYZ({
                            url: "http://{a-c}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png"
                        }),
                        visible: false,
                        opacity: 0.7,
                        path: 'Weather info'
                    })
                ]
            })],
            default_view: new ol.View({
                center: [2813226.6075217696, 7822508.146933724],
                zoom: 14,
                units: "m"
            }),
            hostname: {
                "default": {
                    "title": "Default",
                    "type": "default",
                    "editable": false,
                    "url": 'http://youth.sdi4apps.eu'
                }
            },
            permalinkLocation: {
                'host': 'youth.sdi4apps.eu',
                'pathname': '/1',
                'origin': 'http://youth.sdi4apps.eu',
                'hsl_path': '/wwwlibs/hslayers-ng/'
            },
            infopanel_template: hsl_path + 'infopanel.html'
        });

        module.controller('Main', ['$scope', '$compile', '$filter', 'Core', 'hs.map.service', 'hs.query.service_infopanel', '$sce', '$http', 'config', 'hs.trip_planner.service', 'hs.permalink.service_url', 'hs.utils.service',
            function($scope, $compile, $filter, Core, OlMap, InfoPanelService, $sce, $http, config, trip_planner_service, permalink, utils) {
                if (console) console.log("Main called");
                $scope.hsl_path = hsl_path; //Get this from hslayers.js file
                $scope.Core = Core;
                Core.embededEnabled = false;
                Core.panelEnabled('compositions', false);
                Core.panelEnabled('ows', false);
                Core.panelEnabled('status_creator', false);
                
                var hr_mappings;
                $http({
                    method: 'GET',
                    url: 'data.json',
                    cache: false
                }).then(function successCallback(response) {
                    hr_mappings = response.data;
                    angular.forEach(hr_mappings["http://www.openvoc.eu/poi#categoryWaze"], function(name, category) {
                        var new_lyr = new ol.layer.Vector({
                            title: " " + name,
                            source: new SparqlJson({
                                geom_attribute: '?geom',
                                url: '//data.plan4all.eu/sparql?default-graph-uri=&query=' + encodeURIComponent('SELECT ?o ?p ?s FROM <http://www.sdi4apps.eu/poi.rdf> WHERE { ?o <http://www.openvoc.eu/poi#categoryWaze> <' + category + '>. ?o <http://www.opengis.net/ont/geosparql#asWKT> ?geom. FILTER(isBlank(?geom) = false). ') + '<extent>' + encodeURIComponent('	?o ?p ?s } ORDER BY ?o') + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on',
                                updates_url: '//data.plan4all.eu/sparql?default-graph-uri=&query=' + encodeURIComponent('SELECT ?o ?date ?attr ?value FROM <http://www.sdi4apps.eu/poi.rdf> FROM <http://www.sdi4apps.eu/poi_changes.rdf> WHERE { ?o <http://www.openvoc.eu/poi#categoryWaze> <' + category + '>. ?o <http://www.opengis.net/ont/geosparql#asWKT> ?geom. FILTER(isBlank(?geom) = false). ') + '<extent>' + encodeURIComponent(' ?o <http://purl.org/dc/elements/1.1/identifier> ?id. ?c <http://www.sdi4apps.eu/poi_changes/poi_id> ?id. ?c <http://purl.org/dc/terms/1.1/created> ?date. ?c <http://www.sdi4apps.eu/poi_changes/attribute_set> ?attr_set. ?attr_set ?attr ?value } ORDER BY ?o ?date ?attr ?value') + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on',
                                category_field: 'http://www.openvoc.eu/poi#categoryWaze',
                                projection: 'EPSG:3857'
                                    //feature_loaded: function(feature){feature.set('hstemplate', 'hs.geosparql_directive')}
                            }),
                            style: style,
                            visible: (name == 'Culture & Entertainment' || name == 'Food and Drink'),
                            path: 'Points of interest',
                            category: category
                            //minResolution: 1,
                            //maxResolution: 38
                        });
                        config.box_layers[1].getLayers().insertAt(0, new_lyr);
                    })
                    angular.forEach(hr_mappings.popular_categories, function(name, category) {
                        var new_lyr = new ol.layer.Vector({
                            title: " " + name,
                            source: new SparqlJson({
                                geom_attribute: '?geom',
                                url: '//data.plan4all.eu/sparql?default-graph-uri=&query=' + encodeURIComponent('SELECT ?o ?p ?s FROM <http://www.sdi4apps.eu/poi.rdf> WHERE { ?o <http://www.openvoc.eu/poi#categoryOSM> ?filter_categ. ?o <http://www.opengis.net/ont/geosparql#asWKT> ?geom. FILTER(isBlank(?geom) = false). FILTER (str(?filter_categ) = "' + category + '"). ') + '<extent>' + encodeURIComponent('	?o ?p ?s } ORDER BY ?o') + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on',
                                updates_url: '//data.plan4all.eu/sparql?default-graph-uri=&query=' + encodeURIComponent('SELECT ?o ?date ?attr ?value FROM <http://www.sdi4apps.eu/poi.rdf> FROM <http://www.sdi4apps.eu/poi_changes.rdf> WHERE { ?o <http://www.openvoc.eu/poi#categoryOSM> ?filter_categ. ?o <http://www.opengis.net/ont/geosparql#asWKT> ?geom. FILTER(isBlank(?geom) = false). FILTER (str(?filter_categ) = "' + category + '"). ') + '<extent>' + encodeURIComponent(' ?o <http://purl.org/dc/elements/1.1/identifier> ?id. ?c <http://www.sdi4apps.eu/poi_changes/poi_id> ?id. ?c <http://purl.org/dc/terms/1.1/created> ?date. ?c <http://www.sdi4apps.eu/poi_changes/attribute_set> ?attr_set. ?attr_set ?attr ?value } ORDER BY ?o ?date ?attr ?value') + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on',
                                category_field: 'http://www.openvoc.eu/poi#categoryOSM',
                                projection: 'EPSG:3857'
                            }),
                            style: styleOSM,
                            visible: false,
                            path: 'Popular Categories',
                            minResolution: 1,
                            maxResolution: 38,
                            category: category
                        });
                        config.box_layers[1].getLayers().insertAt(0, new_lyr);
                    })
                    OlMap.reset();
                })

                $scope.makeHumanReadable = function(attribute) {
                    var value = $sce.valueOf(attribute.value);
                    var name = $sce.valueOf(attribute.name);
                    if (angular.isUndefined(hr_mappings[name])) {
                        if (value.indexOf('http:') == 0) {
                            return $sce.trustAsHtml('<a href="' + value + '">' + value + '</a>');
                        } else {
                            return value;
                        }
                    }
                    if (angular.isDefined(hr_mappings[name][value])) return hr_mappings[name][value];
                    else return attribute.value;
                }

                $scope.getSpoiCategories = function(group) {
                    return hr_mappings[group];
                }

                $scope.attrToEnglish = function(name) {
                    var hr_names = {
                        'http://xmlns.com/foaf/0.1/mbox': 'E-mail: ',
                        'http://www.openvoc.eu/poi#fax': 'Fax: ',
                        'http://xmlns.com/foaf/0.1/phone': 'Phone: ',
                        'http://www.openvoc.eu/poi#address': 'Address: ',
                        'http://www.openvoc.eu/poi#openingHours': 'Opening Hours: ',
                        'http://www.openvoc.eu/poi#access': 'Access: ',
                        'http://www.openvoc.eu/poi#accessibility': 'Accessibility: ',
                        'http://www.openvoc.eu/poi#internetAccess': 'Internet Acces: ',
                        'http://www.openvoc.eu/poi#categoryWaze': 'Category: ',
                        'http://www.openvoc.eu/poi#categoryOSM': 'Subcategory: ',
                        'http://xmlns.com/foaf/0.1/homepage': 'Homepage: ',
                        'http://www.w3.org/2000/01/rdf-schema#seeAlso': 'More info: ',
                        'http://www.w3.org/2004/02/skos/core#exactMatch': 'More info: ',
                        'http://purl.org/dc/terms/1.1/created': 'Created: ',
                        'http://www.opengis.net/ont/geosparql#sfWithin': 'Country: '
                    }
                    return hr_names[name];
                }

                $scope.startEdit = function(attribute, x) {
                    attribute.is_editing = !(angular.isDefined(attribute.is_editing) && attribute.is_editing);
                }

                $scope.attributesHaveChanged = function(attributes) {
                    var tmp = false;
                    angular.forEach(attributes, function(a) {
                        if (angular.isDefined(a.changed) && a.changed) tmp = true;
                    })
                    return tmp;
                }

                $scope.editDropdownVisible = function(attribute) {
                    return attribute.is_editing && angular.isDefined($scope.getSpoiCategories(attribute.name));
                }

                $scope.editTextboxVisible = function(attribute) {
                    return attribute.is_editing && angular.isUndefined($scope.getSpoiCategories(attribute.name));
                }


                $scope.saveSpoiChanges = function(attributes) {
                    var identifier = '';
                    var changes = [];
                    angular.forEach(attributes, function(a) {
                        if (angular.isDefined(a.changed) && a.changed) {
                            changes.push({
                                attribute: a.name,
                                value: $sce.valueOf(a.value)
                            });
                            InfoPanelService.feature.set(a.name, $sce.valueOf(a.value));
                        }
                        if (a.name == 'http://purl.org/dc/elements/1.1/identifier') identifier = $sce.valueOf(a.value);
                    })
                    var lines = [];
                    var d = new Date();
                    var n = d.toISOString();
                    var change_id = 'http://www.sdi4apps.eu/poi_changes/change_' + utils.generateUuid();
                    var attribute_set_id = 'http://www.sdi4apps.eu/poi_changes/attributes_' + utils.generateUuid();
                    lines.push('<' + change_id + '> <http://www.sdi4apps.eu/poi_changes/poi_id> <' + identifier + '>');
                    lines.push('<' + change_id + '> <http://purl.org/dc/terms/1.1/created> "' + n + '"^^xsd:dateTime');
                    lines.push('<' + change_id + '> <http://www.sdi4apps.eu/poi_changes/attribute_set> <' + attribute_set_id + '>');
                    angular.forEach(changes, function(a) {
                        lines.push('<' + attribute_set_id + '> <' + a.attribute + '> "' + a.value + '"');
                    })

                    var query = ['INSERT DATA { GRAPH <http://www.sdi4apps.eu/poi_changes.rdf> {', lines.join('.'), '}}'].join('\n');
                    $.ajax({
                            url: '//data.plan4all.eu/sparql?default-graph-uri=&query=' + encodeURIComponent(query) + '&should-sponge=&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on'
                        })
                        .done(function(response) {
                            angular.forEach(attributes, function(a) {
                                if (angular.isDefined(a.changed) && a.changed) {
                                    delete a.changed;
                                }
                            })
                            if (!$scope.$$phase) $scope.$digest();
                        });
                }
            }
        ]).filter('usrFrSpoiAttribs', function() {
            return function(items) {
                var filtered = [];
                var frnly_attribs = ['http://www.openvoc.eu/poi#categoryWaze', 'http://www.openvoc.eu/poi#categoryOSM', 'http://www.w3.org/2000/01/rdf-schema#comment', 'http://xmlns.com/foaf/0.1/mbox', 'http://www.openvoc.eu/poi#fax', 'http://www.opengis.net/ont/geosparql#sfWithin', 'http://www.w3.org/2004/02/skos/core#exactMatch', 'http://www.w3.org/2000/01/rdf-schema#seeAlso', 'http://xmlns.com/foaf/0.1/homepage', 'http://purl.org/dc/terms/1.1/created']
                angular.forEach(items, function(item) {
                    if (frnly_attribs.indexOf(item.name) > -1) {
                        filtered.push(item);
                    }
                });
                return filtered;
            };
        });

        return module;
    });
