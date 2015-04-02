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
		when('/tasks', {
			templateUrl: 'templates/task-list.html',
			controller: 'TaskListCtrl'
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

