var Wudhagh = angular.module('Wudhagh', [
    'ngRoute',
    'ui.bootstrap',
    'ngTouch',
    'wudhaghControllers'
]),

routes = [
    {
        path: '/shoppinglist',
        templateUrl: 'pages/shoppinglist.html',
        controller: 'ShoppingListController',
        name: 'Shopping List'
    }
],

defaultRoute = 0;

Wudhagh.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    var def = $routeProvider;
    for (var i = 0; i < routes.length; i++) {
        def = def.when(routes[i].path, routes[i]);
    }
    def.otherwise({
        redirectTo: routes[defaultRoute].path
    });

//    $locationProvider.html5Mode(true);
}]);

var wudhaghControllers = angular.module('wudhaghControllers', ['ui.bootstrap', 'ngTouch']);