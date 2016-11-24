var global = this;
(function() {
    var ua = navigator.userAgent;
    var device = (function(){
        if(ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0){
            return 'sp';
        }else if(ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0){
            return 'tab';
        }else{
            return 'other';
        }
    }) ();

    // init module
    var mainApp = angular.module('mainApp', [
        'ngAnimate',
        'ngRoute',
        'ngTouch',
    ]);

    // directives
    {{{
    // override ng-click
    mainApp.directive('ngClick', function () {
        var delay = 300;   // min milliseconds between clicks
        return {
            restrict: 'A',
            priority: -1,
            link: function (scope, elem) {
                var disabled = false;
                function onClick(evt) {
                    if (disabled) {
                        evt.preventDefault();
                        evt.stopImmediatePropagation();
                    } else {
                        disabled = true;
                        setTimeout(function () { disabled = false; }, delay, false);
                    }
                }
                scope.$on('$destroy', function () { elem.off('click', onClick); });
                elem.on('click', onClick);
            }
        };
    });
    mainApp.directive('ngTap', function() {
        return function(scope, element, attrs) {
            var tapping;
            tapping = false;
            element.bind('touchstart', function(e) {
                element.addClass('active');
                tapping = true;
            });
            element.bind('touchmove', function(e) {
                element.removeClass('active');
                tapping = false;
            });
            element.bind('touchend', function(e) {
                element.removeClass('active');
                if (tapping) {
                  scope.$apply(attrs['ngTap'], element);
                }
            });
        };
    });
    mainApp.directive('ngTapMenu', function() {
        return function(scope, element, attrs) {
            var tapping;
            tapping = false;
            element.bind('touchstart', function(e) {
                element.addClass('active');
                tapping = true;
            });
            element.bind('touchmove', function(e) {
                element.removeClass('active');
                tapping = false;
            });
            element.bind('touchend', function(e) {
                setTimeout(function() {
                    element.removeClass('active');
                }, 100);
                if (tapping) {
                    scope.$apply(attrs['ngTapMenu'], element);
                    tapping = false;
                }
            });
        };
    });
    mainApp.directive('a', function() {
        return {
            restrict: 'E',
            link: function(scope, elem, attrs) {
                if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                    elem.on('click', function(e){
                        e.preventDefault();
                    });
                }
            }
       };
    });
    }}}

    // routing and DB init processing
    mainApp.config(['$routeProvider','$locationProvider',
        function($routeProvider, $locationProvider) {
        // routing
        $routeProvider
        .when('/', {
            controller: 'IndexController',
            templateUrl: 'html/index.html',
            menu: 'index'
        })
        .otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });

    }]);

    var isInit = false;
    // common setting
    mainApp.run(['$rootScope', '$route', '$location', function($rootScope, $route, $location) {
        // twitter / facebook向けのviewの調整
        fixViewportHeight();
        // ブラウザバック時にアニメーションが動作しないようにする措置
        $rootScope.$on('$locationChangeSuccess', function() {
            $rootScope.actualLocation = $location.path();
        });
        $rootScope.$on('$routeChangeStart', function(event, currRoute, prevRoute) {
            $rootScope.menu = currRoute.menu;
        });
        $rootScope.$on("$viewContentLoaded", function() {});
        // 一部、hashを変えたいだけなど、ページ遷移を伴う必要が無い、URL変更を有効化するための措置
        $location.changePath = function(path) {
            var currentRoute = $route.current;
            var deregistrationFn = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = currentRoute;
                deregistrationFn();
            });
            return $location.path(path);
        };
        $rootScope.openLinkInternal = function(url) {
            window.open(url, '_self');
        };
        $rootScope.openLink = function(url, share) {
            var options = '';
            if (share && share == true) {
                options = getOpenWindowOptions();
            }
            window.open(url, '_blank', options);
        };
        $rootScope.go = function(path) {
            $location.path(path);
        };
    }]);

    mainApp.controller('IndexController', ['$scope', function($scope) {}]);

    function getDeviceHeight() {
        var deviceHeight = (document.body && document.body.clientHeight) ? document.body.clientHeight : window.innerHeight;
        return deviceHeight ? deviceHeight : screen.height;
    };
    function getDeviceWidth() {
        var deviceWidth = (document.body && document.body.clientWidth) ? document.body.clientWidth : window.innerWidth;
        return deviceWidth ? deviceWidth : screen.width;
    };
    function fixViewportHeight() {
        var html = document.querySelector('html');
        var d_h;
        function _onResize(event) {
            d_h = getDeviceHeight();
            html.style.height = d_h + 'px';
        };
        window.addEventListener('resize', debounce(_onResize, 125), true);
        _onResize();
    };
    function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            }, wait);
            if (immediate && !timeout) func.apply(context, args);
        };
    };
})();