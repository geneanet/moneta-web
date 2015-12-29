var monetaApp = angular.module('monetaApp', [
	'ui.router',
	'monetaControllers',
	'monetaFilters',
	'monetaServices',
	'formValidation',
	'mm.foundation'
]);

monetaApp.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise("/tasks");

	$stateProvider
		.state('cluster', {
			url: "/cluster",
			templateUrl: "templates/cluster-status.html",
			controller: 'ClusterStatusCtrl'
		})
		.state('cluster-node', {
			url: "/cluster/node/{node:[^/]+}",
			templateUrl: "templates/node-status.html",
			controller: 'NodeStatusCtrl'
		})
		.state('tasks', {
			url: "/tasks",
			templateUrl: "templates/task-list.html",
			controller: 'TaskListCtrl'
		})
		.state('task', {
			url: "/tasks/{taskId:[^/]+}",
			templateUrl: "templates/task-edit.html",
			controller: 'TaskEditCtrl'
		})
		.state('taskfromtemplate', {
			url: "/tasks/{taskId:[^/]+}/{templateId:[^/]+}",
			templateUrl: "templates/task-edit.html",
			controller: 'TaskEditCtrl'
		});
});
