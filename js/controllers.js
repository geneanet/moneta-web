var monetaControllers = angular.module('monetaControllers', ['monetaServices']);

monetaControllers.controller('ClusterStatusCtrl', ['$scope', '$http', 'config', 'alert', function ($scope, $http, config, alert) {
	$http.get(config.backend + '/cluster/status').success(function(data, status, headers, httpconfig) {
		$scope.cluster = data;
		$scope.processes = {}

		angular.forEach($scope.cluster['nodes'], function(value, key) {
			$http.get(config.backend + '/node/' + key + '/status').success(function(data, status, headers, httpconfig) {
				$scope.cluster['nodes'][key]['status'] = data

				angular.forEach(data['running_processes'], function(value, key) {
					$scope.processes[key] = {
						'node': data['name'],
						'started': value['started'],
						'task': value['task']
					}
				});
			}).error(function(data, status, headers, config) {
				alert.add({'type': 'alert', 'message': 'An error occured while fetching node ' + key + ' status, please try again !'});
			});
		});
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching cluster status, please try again !'});
	});

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		$scope.tasks = data;
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching tasks, please try again !'});
	});
}]);

monetaControllers.controller('NodeStatusCtrl', ['$scope', '$http', '$stateParams', 'config', function ($scope, $http, $stateParams, config) {
	$http.get(config.backend + '/node/' + $stateParams.node + '/status').success(function(data, status, headers, config) {
		$scope.node = data;
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching cluster status, please try again !'});
	});

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		$scope.tasks = data;
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching tasks, please try again !'});
	});
}]);

monetaControllers.controller('TaskListCtrl', ['$scope', '$http', '$stateParams', '$state', '$window', 'config', 'alert', 'clusterconfig', function ($scope, $http, $stateParams, $state, $window, config, alert, clusterconfig) {
	$scope.tagfilter = '!template'

	$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
		arraydata = [];

		angular.forEach(data, function(task, taskid) {
			task['id'] = taskid;
			arraydata.push(task);
		});


		$scope.tasks = arraydata;
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching the tasks, please try again !'});
	});

	$scope.plugins = clusterconfig.plugins

	if (clusterconfig.plugins.executionsummary) {
		$http.get(config.backend + '/executionsummary').success(function(data, status, headers) {
			$scope.executionsummary = data;
		});
	}

	$scope.enableTask = function(task) {
		if (task.enabled)
			action = "enable";
		else
			action = "disable";

		$http.post(config.backend + '/tasks/' + task.id + '/' + action).error(function(data, status, headers, config) {
				alert('Fail !')
			});
	};

	$scope.filter = $stateParams.filter;
	$scope.$watch('filter', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$state.go(".", { filter: newVal });
			$scope.currentpage = 1;
		}
	});

	$scope.currentpage = ($stateParams.page > 0) ? $stateParams.page : 1;
	$scope.$watch('currentpage', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$state.go(".", { page: newVal });
			$window.scrollTo(0,0);
		}
	});

	$scope.tasksperpage = 25;

	$scope.$watch('tagfilter', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$scope.currentpage = 1;
		}
	});

	$scope.addFilter = function(filter) {
		if ($scope.filter != "") {
			$scope.filter = $scope.filter + " " + filter;
		}
		else {
			$scope.filter = filter;
		}
	}

	if (!$scope.filter) {
		$scope.filter = "";
	}
}]);

monetaControllers.controller('TaskEditorCtrl', ['$scope', '$http', 'config', function ($scope, $http, config) {
	$scope.removeEnv = function(env) {
		delete $scope.task.env[env];
	};

	$scope.setEnv = function(env, value) {
		env = env.trim();

		if (env == '')
			return;

		$scope.task.env[env] = value;
	};

	$scope.removeTag = function(tag) {
		var index = $scope.task.tags.indexOf(tag);
		$scope.task.tags.splice(index, 1);
	};

	$scope.addTag = function(tag) {
		tag = tag.trim();

		if (($scope.task.tags.indexOf(tag) > -1) || (tag == ''))
			return;

		$scope.task.tags.push(tag);
	};

	$scope.removePool = function(pool) {
		var index = $scope.task.pools.indexOf(pool);
		$scope.task.pools.splice(index, 1);
	};

	$scope.addPool = function(pool) {
		pool = pool.trim();

		if (($scope.task.pools.indexOf(pool) > -1) || (pool == ''))
			return;

		$scope.task.pools.push(pool);
	};

	$scope.removeSchedule = function(index) {
		$scope.task.schedules.splice(index, 1);
	};

	$scope.addSchedule = function(schedule) {
		$scope.task.schedules.push(schedule);
	};

	$scope.removeEMail = function(index) {
		$scope.task.mailto.splice(index, 1);
	};

	$scope.addEMail = function(email) {
		$scope.task.mailto.push(email);
	};

	$http.get(config.backend + '/tags').success(function(data, status, headers, config) {
		$scope.tags = data;
	});

	$http.get(config.backend + '/cluster/pools').success(function(data, status, headers, config) {
		$scope.pools = Object.keys(data);
	});
}]);


monetaControllers.controller('TaskEditCtrl', ['$scope', '$http', '$stateParams', '$state', 'config', 'alert', 'clusterconfig', function ($scope, $http, $stateParams, $state, config, alert, clusterconfig) {
	$scope.plugins = clusterconfig.plugins;

	$scope.tabs = [
		{ heading: "View", route:"task.view", active:true },
		{ heading: "Edit", route:"task.edit", active:false },
	];

	if (clusterconfig.plugins.audit) {
		$scope.tabs.push({ heading: "Audit Log", route:"task.auditlog", active:false });
	}

   $scope.go = function(route){
       $state.go(route);
   };

   $scope.active = function(route){
       return $state.is(route);
   };

   $scope.$on("$stateChangeSuccess", function() {
       $scope.tabs.forEach(function(tab) {
           tab.active = $scope.active(tab.route);
       });
   });

	$scope.saveTask = function() {
		$http.put(config.backend + '/tasks/' + $scope.taskId, $scope.task)
			.success(function(data, status, headers, config) {
				alert.add({'type': 'success', 'message': 'The task has been saved.', 'timeout': 3000});
				$state.go('^.view');
			}).error(function(data, status, headers, config) {
				alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
			});
	};

	$scope.deleteTask = function() {
		if (confirm("You are about to delete the task \"" + $scope.task.name + "\" !")) {
			$http.delete(config.backend + '/tasks/' + $scope.taskId, $scope.task)
				.success(function(data, status, headers, config) {
					alert.add({'type': 'success', 'message': 'The task has been deleted.', 'timeout': 3000});
					$state.go('tasks');
				}).error(function(data, status, headers, config) {
					alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
				});
		}
	};

	$scope.taskId = $stateParams.taskId

	$http.get(config.backend + '/tasks/' + $stateParams.taskId).success(function(data, status, headers, config) {
		$scope.task = data;
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
	});
}]);


monetaControllers.controller('NewTaskCtrl', ['$scope', '$http', '$state', '$stateParams', 'config', 'alert', function ($scope, $http, $state, $stateParams, config, alert) {
	$scope.createTask = function() {
		$http.post(config.backend + '/tasks', $scope.task)
			.success(function(data, status, headers, config) {
				alert.add({'type': 'success', 'message': 'The task has been created.', 'timeout': 3000});
				$state.go('task.view', { 'taskId': data.id });
			}).error(function(data, status, headers, config) {
				alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
			});
	};

	if ($stateParams.templateId) {
		$http.get(config.backend + '/tasks/' + $stateParams.templateId).success(function(data, status, headers, config) {
			$scope.templateId = $stateParams.templateId;
			$scope.templateName = data.name;
			$scope.task = data;
			$scope.task.name = ""
			$scope.task.description = ""
			$scope.task.tags.splice($scope.task.tags.indexOf('template'), 1);
		}).error(function(data, status, headers, config) {
			alert.add({'type': 'alert', 'message': 'An error occured while fetching the template, please try again !'});
		});
	} else {
		$scope.task = {
			'tags': [],
			'env': {},
			'schedules': [],
			'mailto': [],
			'mode': 'any',
			'pools': [ 'default' ],
			'mailreport': 'never'
		}
	}
}]);

monetaControllers.controller('RestoreTaskCtrl', ['$scope', '$http', '$state', 'config', 'alert', function ($scope, $http, $state, config, alert) {
	$scope.restoreTask = function() {
		if (confirm("You are about to restore task \"" + $scope.task.name + "\"")) {
			$http.put(config.backend + '/tasks/' + $scope.taskId, $scope.task)
				.success(function(data, status, headers, config) {
					alert.add({'type': 'success', 'message': 'The task has been restored.', 'timeout': 3000});
					$state.go('task.view', { 'taskId': $scope.taskId }, { 'reload': true});
				}).error(function(data, status, headers, config) {
					alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
				});
		}
	};
}]);

monetaControllers.controller('AuditLogCtrl', ['$scope', '$http', 'config', 'alert', function ($scope, $http, config, alert) {
	fetchLog = function() {
		from = moment($scope.from).startOf('day').toISOString();
		until = moment($scope.until).endOf('day').toISOString();

		levelfilter = [];
		console.log($scope.levelfilter);
		angular.forEach($scope.levelfilter, function(value, key) {
			if (value) {
				levelfilter.push(key);
			}
		});
		levelfilter = levelfilter.join(',');

		url = config.backend;
		if ($scope.taskId) {
			url = url + '/tasks/' + $scope.taskId;
		}
		url = url + '/auditlog?from=' + from + '&until=' + until + '&limit=' + $scope.eventsperpage + '&offset=' + (($scope.currentpage - 1) * $scope.eventsperpage) + '&level=' + levelfilter;

		$http.get(url).success(function(data, status, headers, config) {
			data.records.forEach(function(event) {
				event['show'] = false;
			});

			$scope.pages = Math.ceil(data.count / data.limit);
			$scope.count = data.count;
			$scope.levels = data.levels;
			$scope.auditlog = data.records;
		}).error(function(data, status, headers, config) {
			alert.add({'type': 'alert', 'message': 'An error occured while fetching the audit log, please try again !'});
		});
	};

	filterUpdated = function(newValue, oldValue) {
		if (!(newValue === oldValue)) {
			$scope.currentpage = 1;
			fetchLog();
		}
	};

	pageUpdated = function(newValue, oldValue) {
		if (!(newValue === oldValue)) {
			fetchLog();
		}
	};

	if (!$scope.taskId) {
		$http.get(config.backend + '/tasks').success(function(data, status, headers, config) {
			$scope.tasks = data;
		}).error(function(data, status, headers, config) {
			alert.add({'type': 'alert', 'message': 'An error occured while fetching the tasks, please try again !'});
		});
	}

	$scope.eventsperpage = 50;
	$scope.currentpage = 1;
	$scope.today = moment().toDate();
	$scope.from = moment().subtract(1, 'days').toDate();
	$scope.until = moment().toDate();
	$scope.levelfilter = {
		'info': true,
		'success': true,
		'warning': true,
		'alert': true
	}

	$scope.$watch('currentpage', pageUpdated);
	$scope.$watch('from', filterUpdated);
	$scope.$watch('until', filterUpdated);
	$scope.$watch('levelfilter', filterUpdated, true);

	fetchLog();
}]);

monetaControllers.controller('MainMenuCtrl', ['$scope', 'clusterconfig', '$q', function ($scope, clusterconfig, $q) {
	$q.resolve(clusterconfig, function(clusterconfig) {
		$scope.plugins = clusterconfig.plugins;
	});
}]);
