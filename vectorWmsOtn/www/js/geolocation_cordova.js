/**
 * @namespace hs.geolocation
 * @memberOf hs
 */
define(['angular', 'ol'],

    function(angular, ol) {
        angular.module('hs.geolocation', ['hs.map'])
            .directive('hs.geolocation.directive', ['hs.map.service', 'hs.geolocation.service', 'Core', function(OlMap, Geolocation, Core) {
                return {
                    templateUrl: hsl_path + 'components/geolocation/partials/geolocation.html',
                    link: function link(scope, element, attrs) {
                        element.appendTo($(".ol-overlaycontainer-stopevent"));
                        $('.locate .blocate').click(function() {
                            $('.locate').toggleClass('ol-collapsed');
                            Geolocation.geolocation.startGpsWatch;
                            Geolocation.toggleFeatures(!$('.locate').hasClass('ol-collapsed'));
                        });
                        if (Core.panel_side === 'left') {
                            $('.locate').css({
                                right: '.5em'
                            });
                        }
                        if (Core.panel_side === 'right') {
                            $('.locate').css({
                                right: 'auto',
                                left: '.2em'
                            });
                        }
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
                            if (visible) {
                                featuresOverlay.addFeature(accuracyFeature);
                                featuresOverlay.addFeature(positionFeature);
                            } else {
                                featuresOverlay.removeFeature(accuracyFeature);
                                featuresOverlay.removeFeature(positionFeature);

                            }
                        },
                        gpsStatus: true
                    };

                    var accuracyFeature = new ol.Feature();
                                        
                    var positionFeature = new ol.Feature();

                    // if (navigator.geolocation) {
                    me.geolocation = navigator.geolocation;

                    var startGpsWatch = function () {
                        if (navigator.geolocation) {
                            console.log('GPS started.');
                            me.gpsStatus = true;
                            me.changed_handler();
                        }
                    };
                    
                    var stopGpsWatch = function () {
                        console.log('GPS stopped.');
                        me.gpsStatus = false;
                        me.geolocation.clearWatch(me.changed_handler);
                    };
                    
                    me.changed_handler = function () {
                        me.geolocation.watchPosition(gpsOkCallback, gpsFailCallback, gpsOptions);
                    };

                    var gpsOkCallback = function (position) {
                        console.log('GPS position found.');
                        me.accuracy = position.coords.accuracy ? position.coords.accuracy + ' [m]' : '';
                        me.altitude = position.coords.altitude ? position.coords.altitude + ' [m]' : '-';
                        me.heading = position.coords.heading ? position.coords.heading : null;
                        me.speed = position.coords.speed ? position.coords.speed + ' [m/s]' : '-';
                            me.changed
                        var p = ol.proj.transform([position.coords.longitude, position.coords.latitude], 'EPSG:4326', OlMap.map.getView().getProjection());
                        console.log(p);
                        if (!positionFeature.setGeometry()) {
                            positionFeature.setGeometry(new ol.geom.Point(p));
                        } else {
                            positionFeature.getGeometry().setCoordinates(p);
                        }
                        
                        if (!accuracyFeature.setGeometry()) {
                            accuracyFeature.setGeometry(new ol.geom.Circle(p, position.coords.accuracy));
                        } else {
                            accuracyFeature.getGeometry().setCenterAndRadius(p, me.accuracy);
                        }

                        if (me.following) {
                            OlMap.map.getView().setCenter(p);
                            console.log('Setting center of the map to: ' + p);
                        }
                        
                        $rootScope.$broadcast('geolocation.updated');
                        console.log(me.following);
                        console.log(me.accuracy);
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

                    startGpsWatch();

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


                    var featuresOverlay = new ol.FeatureOverlay({
                        map: OlMap.map,
                        features: []
                    });


                    return me;
                }])
        
            .controller('hs.geolocation.controller', ['$scope', 'hs.geolocation.service', function ($scope, service) {
                $scope.speed = null;
                $scope.alt = null;
                $scope.altitudeAccuracy = null;

                $scope.getGeolocationProvider = function () {
                    return service.geolocation;
                };

                $scope.gpsActive = function (set_to) {
                    if (arguments.length === 0) {
                        return service.gpsStatus;
                    } else {
                        service.geolocation.startGpsWatch();
                    }
                };

                $scope.following = function (set_to) {
                    if (arguments.length === 0) {
                        return service.following;
                    } else {
                        service.following = set_to;
                        service.changed_handler();
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
                
                $scope.$emit('scope_loaded', "Geolocation");
            }]);
    });
