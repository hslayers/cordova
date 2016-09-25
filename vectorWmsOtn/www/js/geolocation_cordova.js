/**
 * @namespace hs.geolocation
 * @memberOf hs
 */
define(['angular', 'ol'],

    function(angular, ol) {
        angular.module('hs.geolocation', ['hs.map'])
            .directive('hs.geolocation.directive', ['hs.map.service', 'hs.geolocation.service', 'Core', function(OlMap, Geolocation, Core) {
                return {
                    templateUrl: hsl_path + 'components/geolocation/partials/geolocation_cordova.html',
                    link: function link(scope, element, attrs) {
                        element.appendTo($("#menu"));
                        $('.blocate').click(function() {
                            $('.locate-mobile').toggleClass('ol-collapsed');
                            // Rewrite this, ugly implementation.
                            $('#toolbar').removeClass('show');
                            if (!Geolocation.gpsStatus && !$('.locate-mobile').hasClass('ol-collapsed')) {
                                Geolocation.toggleGps();
                                Geolocation.toggleFeatures(true);
                            }
                        });
                    },
                    replace: true
                };
            }])

            .service('hs.geolocation.service', ['hs.map.service', '$rootScope',
                function(OlMap, $rootScope) {
                    var me = {
                        following: false,
                        geolocation: null,
                        toggleFeatures: function(visible) {
                            var src = me.position_layer.getSource();
                            if (visible) {
                                OlMap.map.addLayer(me.position_layer);
                                src.addFeature(accuracyFeature);
                                src.addFeature(positionFeature);
                                me.position_layer.setZIndex(99);
                            } else {
                                src.removeFeature(accuracyFeature);
                                src.removeFeature(positionFeature);
                                OlMap.map.removeLayer(me.position_layer);
                            }
                        },
                        gpsStatus: false,
                        gpsSwitch: 'Start GPS',
                        changed_handler: null,
                    };
                    
                    me.set_center = function () {
                        OlMap.map.getView().setCenter(me.last_location);
                    };

                    var accuracyFeature = new ol.Feature();
                                        
                    var positionFeature = new ol.Feature();

                    // if (navigator.geolocation) {
                    me.geolocation = navigator.geolocation;
                    
                    me.toggleGps = function () {
                        if (me.gpsStatus === false) {
                            me.startGpsWatch();
                        } else if (me.gpsStatus === true) {
                            me.stopGpsWatch();
                        }
                        $rootScope.$broadcast('geolocation.switched');
                    }

                    me.startGpsWatch = function () {
                        if (navigator.geolocation) {
                            me.gpsStatus = true;
                            // me.gpsSwitch = 'Stop GPS';
                            me.changed_handler = me.geolocation.watchPosition(gpsOkCallback, gpsFailCallback, gpsOptions);
                        }
                    };
                    
                    me.stopGpsWatch = function () {
                        me.gpsStatus = false;
                        // me.gpsSwitch = 'Start GPS';
                        me.geolocation.clearWatch(me.changed_handler);
                        me.changed_handler = null;
                    };

                    var gpsOkCallback = function (position) {
                        me.accuracy = position.coords.accuracy ? Math.round(position.coords.accuracy) : '-';
                        me.altitude = position.coords.altitude ? Math.round(position.coords.altitude) : '-';
                        me.heading = position.coords.heading ? position.coords.heading : null;
                        me.speed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : '-';
                        me.last_location = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', OlMap.map.getView().getProjection());
                        if (!positionFeature.setGeometry()) {
                            positionFeature.setGeometry(new ol.geom.Point(me.last_location));
                        } else {
                            positionFeature.getGeometry().setCoordinates(me.last_location);
                        }
                        
                        if (!accuracyFeature.setGeometry()) {
                            accuracyFeature.setGeometry(new ol.geom.Circle(me.last_location, position.coords.accuracy));
                        } else {
                           accuracyFeature.getGeometry().setCenterAndRadius(me.last_location, me.accuracy);
                        }

                        if (me.following) {
                            me.set_center();
                        }
                        
                        lat = position.coords.latitude;
                        lon = position.coords.longitude;
                        trackingDb.transaction(logPosition, errorCB, successCB);
                        db_id++;
                        
                        $rootScope.$broadcast('geolocation.updated');
                    };

                    var gpsFailCallback = function (e) {
                        var msg = 'Error ' + e.code + ': ' + e.message;
                        console.log(msg);
                    };

                    var gpsOptions = {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 100000
                    };

                    me.style = new ol.style.Style({
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
                            color: [0xbb, 0xbb, 0xbb, 0.2]
                        }),
                        stroke: new ol.style.Stroke({
                            color: [0x66, 0x66, 0x00, 0.8]
                        })
                    });

                    accuracyFeature.setStyle(me.style);
                    positionFeature.setStyle(me.style);

                    me.position_layer = new ol.layer.Vector({
                        title: "Position",
                        show_in_manager: false,
                        source: new ol.source.Vector()
                    });


                    // var featuresOverlay = new ol.FeatureOverlay({
                    //     map: OlMap.map,
                    //     features: []
                    // });
                    
                    return me;
                }])
        
            .controller('hs.geolocation.controller', ['$scope', 'hs.geolocation.service', function ($scope, service) {
                $scope.speed = null;
                $scope.alt = null;
                $scope.altitudeAccuracy = null;
                $scope.Geolocation = service;

                $scope.switchGps = function () {
                    service.toggleGps();
                    service.toggleFeatures(service.gpsStatus);
                }

                $scope.getGeolocationProvider = function () {
                    return service.geolocation;
                };

                $scope.gpsActive = function (set_to) {
                    if (arguments.length === 0) {
                        return service.gpsStatus;
                        console.log('arguments = 0');
                    } else {
                        service.startGpsWatch();
                        console.log('Starting GPS.');
                    }
                };

                $scope.following = function (set_to) {
                    if (arguments.length === 0) {
                        return service.following;
                        console.log('Success!');
                    } else {
                        service.following = set_to;
                        if (service.following === true) {
                            service.set_center();
                        }
                    }
                };

                $scope.setFeatureStyle = function (style) {
                    service.style = style;
                };

                $scope.$on('geolocation.updated', function (event) {
                    $scope.speed = service.speed;
                    $scope.alt = service.altitude;
                    $scope.altitudeAccuracy = service.altitudeAccuracy;
                    if (!$scope.$$phase) {
                        $scope.$digest();
                    }
                });

                $scope.$on('geolocation.switched', function (event) {
                    service.gpsSwitch = service.gpsStatus ? 'Stop GPS' : 'Start GPS';
                    if (!$scope.$$phase) {
                        $scope.$digest();
                    }
                });
                
                $scope.$emit('scope_loaded', "Geolocation");
            }]);
    });
