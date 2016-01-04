var monetaApp = angular.module('monetaApp', [
	'ui.router',
	'monetaControllers',
	'monetaFilters',
	'monetaServices',
	'formValidation',
	'mm.foundation',
	'bzm-date-picker',
	'ngLoadingSpinner',
	'ngAnimate'
]);

monetaApp.config(function($stateProvider, $urlRouterProvider) {
	$urlRouterProvider
		.when('/tasks/:id', '/tasks/:id/view')
		.otherwise("/tasks");

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
			templateUrl: "templates/tasks.html",
			controller: 'TaskListCtrl'
		})
		.state('newtask', {
		 	url: "/tasks/new",
		 	templateUrl: "templates/newtask.html",
		 	controller: 'NewTaskCtrl'
		})
		.state('newtaskfromtemplate', {
			url: "/tasks/new/{templateId}",
			templateUrl: "templates/newtask.html",
		 	controller: 'NewTaskCtrl'
		})
		.state('task', {
			url: "/tasks/{taskId}",
			templateUrl: "templates/task.html",
			controller: 'TaskEditCtrl',
			abstract: true
		})
		.state('task.view', {
			url: "/view",
			templateUrl: "templates/task-view.html",
		})
		.state('task.edit', {
			url: "/edit",
			templateUrl: "templates/task-edit.html",
		})
		.state('task.auditlog', {
			url: "/auditlog",
			templateUrl: "templates/auditlog.html"
		})
		.state('auditlog', {
			url: "/auditlog",
			templateUrl: "templates/global-auditlog.html"
		})
});
