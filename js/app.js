var monetaApp = angular.module('monetaApp', [
	'ui.router',
	'monetaControllers',
	'monetaFilters',
	'monetaServices',
	'formValidation',
	'tagBox',
	'bzm-date-picker',
	'ngAnimate',
	'ncy-angular-breadcrumb',
	'mm.foundation',
	'bw.paging'
]);

monetaApp.config(function($stateProvider, $urlRouterProvider, $breadcrumbProvider) {
	$breadcrumbProvider.setOptions({
		templateUrl: 'templates/breadcrumb.html'
    });

	$urlRouterProvider
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
			url: "/tasks?page&filter",
			templateUrl: "templates/tasks.html",
			controller: 'TaskListCtrl',
			ncyBreadcrumb: {
				label: 'Tasks'
			},
			resolve: {
				clusterconfig: "clusterconfig"
			},
			reloadOnSearch: false
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
			},
			resolve: {
				clusterconfig: "clusterconfig"
			}
		})
		.state('task.view', {
			url: "/view",
			templateUrl: "templates/task-view.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}}'
			}
		})
		.state('task.processes', {
			url: "/processes",
			templateUrl: "templates/task-processes.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}} - Processes'
			}
		})
		.state('task.edit', {
			url: "/edit",
			templateUrl: "templates/task-edit.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}} - Edition'
			}
		})
		.state('task.auditlog', {
			url: "/auditlog",
			templateUrl: "templates/auditlog.html",
			ncyBreadcrumb: {
				label: 'Task {{task.name}} - Audit Log'
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
