var monetaFilters = angular.module('monetaFilters', []);

monetaFilters.filter('taskfilter', function ($filter) {
	return function(items, expression) {
		if (!expression) {
			return items;
		}

		expression = S(expression).latinise().toLowerCase().toString().split(" ");

		var result = [];

		function match_pool(task, pool)
		{
			for (var t = 0; t < task.pools.length; t++)
			{
				if (S(task.pools[t]).latinise().toLowerCase().contains(pool))
					return true;
			}

			return false;
		}

		function match_tag(task, tag)
		{
			for (var t = 0; t < task.tags.length; t++)
			{
				if (S(task.tags[t]).latinise().toLowerCase().contains(tag))
					return true;
			}

			return false;
		}

		function match_title(task, title)
		{
			return S(task.name).latinise().toLowerCase().contains(title);
		}

		function xor(a,b)
		{
			return ( a || b ) && !( a && b );
		}

		angular.forEach(items, function(task, taskid) {
			for (var i = 0; i < expression.length; i++)
			{
				var item = expression[i];

				var negate = false;
				if (item[0] == '-')
				{
					negate = true;
					item = item.substr(1);
				}

				if (item.lastIndexOf('tag:', 0) === 0)
				{
					item = item.substr(4);

					if (xor(negate, !match_tag(task, item)))
						return;
				}
				else if (item.lastIndexOf('pool:', 0) === 0)
				{
					item = item.substr(5);

					if (xor(negate, !match_pool(task, item)))
						return;
				}
				else if (item.lastIndexOf('title:', 0) === 0)
				{
					item = item.substr(6);
					if (xor(negate, !match_title(task, item)))
						return;
				}
				else if (item.lastIndexOf('enabled:', 0) === 0)
				{
					item = item.substr(8);
					if (item == 'false' || item == 'no')
						negate = !negate;

					if (xor(negate, !task.enabled))
						return;
				}
				else
				{
					if (xor(negate, !(match_title(task, item) || match_tag(task, item))))
						return;
				}
			}

			result.push(task);
		});

		return result;
	};
});


monetaFilters.filter('taskhastag', function ($filter) {
	return function(items, expression) {
		if (!expression) {
			return items;
		}

		if (expression[0] == "!") {
			negate = true;
			expression = expression.substring(1);
		} else {
			negate = false;
		}

		var result = [];

		angular.forEach(items, function(task, taskid) {
			hastag = task.tags.indexOf(expression) > -1;

			if (!negate && hastag || negate && !hastag) {
				result.push(task);
				return;
			}
		});

		return result;
	};
});


monetaFilters.filter('fromNow', function() {
	return function(date) {
		return moment(date).fromNow();
	}
});

monetaFilters.filter('formatDateTime', function() {
	return function(date) {
		return moment(date).format('llll');
	}
});

monetaFilters.filter('formatDateTimeShort', function() {
	return function(date) {
		return moment(date).format('DD/MM HH:mm:ss');
	}
});

monetaFilters.filter('formatDuration', function() {
	return function(duration) {
		return moment.duration(duration * 1000).humanize();
	}
});

monetaFilters.filter('keyLength', function(){
	return function(input){
		if(!angular.isObject(input)) {
			return 0;
		}
		return Object.keys(input).length;
	}
});

monetaFilters.filter('offset', function(){
	return function(input, offset){
		offset = parseInt(offset);
		return input.slice(offset);
	}
});

monetaFilters.filter('paginate', function(){
	return function(input, itemsperpage){
		var pages = Math.ceil(input.length / itemsperpage);
		return Array.apply(null, Array(pages)).map(function (_, i) {return i;});
	}
});
