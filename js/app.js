var monetaApp = angular.module('monetaApp', [
	'ngRoute',
	'monetaControllers',
	'monetaFilters',
	'monetaServices',
	'formValidation',
	'mm.foundation'
]);

monetaApp.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when('/cluster', {
			templateUrl: 'templates/cluster-status.html',
			controller: 'ClusterStatusCtrl'
		}).
		when('/cluster/node/:node', {
			templateUrl: 'templates/node-status.html',
			controller: 'NodeStatusCtrl'
		}).
		when('/tasks', {
			templateUrl: 'templates/task-list.html',
			controller: 'TaskListCtrl',
			reloadOnSearch: false
		}).
		when('/tasks/:taskId/:templateId', {
			templateUrl: 'templates/task-edit.html',
			controller: 'TaskEditCtrl'
		}).
		when('/tasks/:taskId', {
			templateUrl: 'templates/task-edit.html',
			controller: 'TaskEditCtrl'
		}).
		otherwise({
			redirectTo: '/tasks'
		});
}]);

