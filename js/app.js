var monetaApp = angular.module('monetaApp', [
	'ui.router',
	'monetaControllers',
	'monetaFilters',
	'monetaServices',
	'formValidation',
	'bzm-date-picker',
	'ngLoadingSpinner',
	'ngAnimate',
	'ncy-angular-breadcrumb'
]);

monetaApp.config(function($stateProvider, $urlRouterProvider, $breadcrumbProvider) {
	$breadcrumbProvider.setOptions({
		templateUrl: 'templates/breadcrumb.html'
    });

	$urlRouterProvider
		.when('/tasks/:id', '/tasks/:id/view')
		.otherwise("/tasks");

	$stateProvider
		.state('cluster', {
			url: "/cluster",
			templateUrl: "templates/cluster-status.html",
			controller: 'ClusterStatusCtrl',
			ncyBreadcrumb: {
				label: 'Cluster'
			}
		})
		.state('cluster-node', {
			url: "/cluster/node/{node:[^/]+}",
			templateUrl: "templates/node-status.html",
			controller: 'NodeStatusCtrl',
			ncyBreadcrumb: {
				label: 'Node {{node.name}}',
				parent: 'cluster'
			}
		})
		.state('tasks', {
			url: "/tasks",
			templateUrl: "templates/tasks.html",
			controller: 'TaskListCtrl',
			ncyBreadcrumb: {
				label: 'Tasks'
			}
		})
		.state('newtask', {
		 	url: "/tasks/new",
		 	templateUrl: "templates/newtask.html",
		 	controller: 'NewTaskCtrl',
			ncyBreadcrumb: {
				label: 'New Task',
				parent: 'tasks'
			}
		})
		.state('newtaskfromtemplate', {
			url: "/tasks/new/{templateId}",
			templateUrl: "templates/newtask.html",
		 	controller: 'NewTaskCtrl',
			ncyBreadcrumb: {
				label: 'New Task',
				parent: 'tasks'
			}
		})
		.state('task', {
			url: "/tasks/{taskId}",
			templateUrl: "templates/task.html",
			controller: 'TaskEditCtrl',
			abstract: true,
			ncyBreadcrumb: {
				label: 'Task {{task.name}}',
				parent: 'tasks'
			}
		})
		.state('task.view', {
			url: "/view",
			templateUrl: "templates/task-view.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}}'
			}
		})
		.state('task.edit', {
			url: "/edit",
			templateUrl: "templates/task-edit.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}} Edition'
			}
		})
		.state('task.auditlog', {
			url: "/auditlog",
			templateUrl: "templates/auditlog.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}} Audit Log'
			}
		})
		.state('auditlog', {
			url: "/auditlog",
			templateUrl: "templates/global-auditlog.html",
			ncyBreadcrumb: {
				label: 'Audit Log'
			}
		})
});
