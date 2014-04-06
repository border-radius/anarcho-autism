var app = angular.module('bnw-replies', []);

app.directive('autoscroll', function ($timeout) {
	return function (scope, elem, attrs) {
		var height = elem[0].scrollHeight;

		scope.$watch(attrs.autoscroll, function (n, o) {
			$timeout(function () {
				var change = elem[0].scrollHeight - height;
				if (n.length - o.length == 1) {
					elem[0].scrollTop += change;
				}
				height = elem[0].scrollHeight;
			});
		}, true);
	};
});

app.directive('infinitescroll', function () {
	return function (scope, elem, attrs) {
		elem.on('scroll', function () {
			if (elem[0].scrollHeight - elem[0].scrollTop < screen.height + 150) {
				scope.$apply(attrs.infinitescroll);
			}
		});
	};
});

app.filter('moment', function () {
	return function (date) {
		return moment(date, 'X').fromNow();
	};
});

app.filter('lines', function () {
	return function (text) {
		return text.replace(/\n+/g, '\n').replace(/(^\n|\n$)/g, '').split('\n');
	};
});

app.controller('Replies', function ($scope, $http) {
	$scope.replies = [];
	
	var initWS = function () {
		var ws = new WebSocket('wss://bnw.im/comments/ws');
		ws.onmessage = function (event) {
			$scope.$apply(function () {
				$scope.replies = [JSON.parse(event.data)].concat($scope.replies);
			});
		};
		ws.onclose = initWS;
	};
	initWS();

	$scope.load = function () {
		if ($scope.loading) return;

		$scope.loading = true;

		$http.get('/comments?skip='+$scope.replies.length)
		.success(function (replies) {
			if (!replies.length) {
				$scope.finish = true;
			} else {
				$scope.replies = $scope.replies.concat(replies);
			}
		}).then(function () {
			$scope.loading = false;
		});
	};
	$scope.load();
});
