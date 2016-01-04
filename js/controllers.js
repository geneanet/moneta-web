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

monetaControllers.controller('TaskListCtrl', ['$scope', '$http', '$stateParams', '$location', '$window', 'config', 'alert', function ($scope, $http, $stateParams, $location, $window, config, alert) {
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

	$http.get(config.backend + '/plugins').success(function(data, status, headers) {
		$scope.plugins = data;

		if (data.indexOf('executionsummary') > -1) {
			$http.get(config.backend + '/executionsummary').success(function(data, status, headers) {
				$scope.executionsummary = data;
			});
		}
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured while fetching the plugins list, please try again !'});
	});

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
			$location.search('filter', newVal);
			$scope.currentpage = 0;
		}
	});

	$scope.currentpage = ($stateParams.page > 0) ? $stateParams.page - 1 : 0;
	$scope.$watch('currentpage', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$location.search('page', newVal + 1);
		}
	});

	$scope.tasksperpage = 25;

	$scope.changePage = function(page) {
		$scope.currentpage = page;
		$window.scrollTo(0,0);
	};

	$scope.$watch('tagfilter', function(newVal, oldVal) {
		if (newVal != oldVal) {
			$scope.currentpage = 0;
		}
	});
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


monetaControllers.controller('TaskEditCtrl', ['$scope', '$http', '$stateParams', '$state', '$location', 'config', 'alert', function ($scope, $http, $stateParams, $state, $location, config, alert) {
	$scope.tabs = [
		{ heading: "View", route:"task.view", active:true },
		{ heading: "Edit", route:"task.edit", active:false },
        { heading: "Audit Log", route:"task.auditlog", active:false },
	];

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
				$location.path('/tasks');
			}).error(function(data, status, headers, config) {
				alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
			});
	};

	$scope.deleteTask = function() {
		$http.delete(config.backend + '/tasks/' + $scope.taskId, $scope.task)
			.success(function(data, status, headers, config) {
				alert.add({'type': 'success', 'message': 'The task has been deleted.', 'timeout': 3000});
				$location.path('/tasks');
			}).error(function(data, status, headers, config) {
				alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
			});
	};

	$scope.taskId = $stateParams.taskId

	$http.get(config.backend + '/tasks/' + $stateParams.taskId).success(function(data, status, headers, config) {
		$scope.task = data;
	}).error(function(data, status, headers, config) {
		alert.add({'type': 'alert', 'message': 'An error occured, please try again !'});
	});
}]);


monetaControllers.controller('NewTaskCtrl', ['$scope', '$http', '$state', '$stateParams', '$location', 'config', 'alert', function ($scope, $http, $state, $stateParams, $location, config, alert) {
	$scope.createTask = function() {
		$http.post(config.backend + '/tasks', $scope.task)
			.success(function(data, status, headers, config) {
				alert.add({'type': 'success', 'message': 'The task has been created.', 'timeout': 3000});
				$location.path('/tasks');
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

monetaControllers.controller('AuditLogCtrl', ['$scope', '$http', 'config', 'alert', function ($scope, $http, config, alert) {
	fetchLog = function() {
		from = moment($scope.from).startOf('day').toISOString();
		until = moment($scope.until).endOf('day').toISOString();

		url = config.backend;
		if ($scope.taskId) {
			url = url + '/tasks/' + $scope.taskId;
		}
		url = url + '/auditlog?from=' + from + '&until=' + until + '&limit=' + $scope.eventsperpage + '&offset=' + ($scope.currentpage * $scope.eventsperpage);

		$http.get(url).success(function(data, status, headers, config) {
			data.records.forEach(function(event) {
				event['show'] = false;

				if ((event['@type'] == "moneta-task-report" && event['status'] != 'ok')
				   || (event['@type'] == "moneta-task-execution" && !event['success'])) {
					event['@status'] = "alert";
				}
				else if (event['@type'] == "moneta-task-report" && event['status'] == 'ok') {
					event['@status'] = "success";
				}
				else {
					event['@status'] = "info";
				}
			});

			var pages = Math.ceil(data.count / data.limit);
			$scope.pages = Array.apply(null, Array(pages)).map(function (_, i) {return i;});
			$scope.count = data.count;
			$scope.auditlog = data.records;
		}).error(function(data, status, headers, config) {
			alert.add({'type': 'alert', 'message': 'An error occured while fetching the audit log, please try again !'});
		});
	};

	dateUpdated = function(newValue, oldValue) {
		if (!(newValue === oldValue)) {
			$scope.currentpage = 0;
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
	$scope.currentpage = 0;
	$scope.today = moment().toDate();
	$scope.from = moment().subtract(1, 'days').toDate();
	$scope.until = moment().toDate();

	$scope.$watch('currentpage', pageUpdated);
	$scope.$watch('from', dateUpdated);
	$scope.$watch('until', dateUpdated);

	fetchLog();
}]);

monetaControllers.controller('MainMenuCtrl', ['$scope', function ($scope) {
	$scope.toggleMainMenu = function() {
		$scope.showMenu = !$scope.showMenu;

		btn = document.getElementById("mainmenubtn");
		menu = document.getElementById("mainmenu");

		btnpos = btn.getBoundingClientRect();

		console.log(btnpos);

		if ($scope.showMenu) {
			angular.element(menu).css('left', btnpos.left + "px");
			angular.element(menu).css('top', (btnpos.bottom + 5) + "px");
		} else {
			angular.element(menu).css('left', "-9999px");
		}
	}
}]);
