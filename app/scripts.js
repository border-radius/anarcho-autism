var app = angular.module('bnw-replies', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
	var ctrl = {
		templateUrl: 'feed.html',
		controller: 'Replies'
	}
	$routeProvider.when('/', ctrl)
				  .when('/for/:user', ctrl)
				  .when('/top', {
				  	templateUrl: 'feed.html',
				  	controller: 'Top'
				  });

	$locationProvider.html5Mode(true);
}]);

app.directive('autoscroll', function ($timeout) {
	return function (scope, elem, attrs) {
		var height = elem[0].scrollHeight;

		scope.$watch(attrs.autoscroll, function (n, o) {
			$timeout(function () {
				var change = elem[0].scrollHeight - height;
				if ((n || []).length - (o || []).length == 1) {
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

app.controller('Top', function ($scope, $http) {
	$scope.load = function() {};
	$scope.top = true;

	$http.get('/api/top').success(function (replies) {
		$scope.replies = replies;
	});
});

app.controller('Replies', function ($scope, $http, $routeParams, $timeout) {
	$scope.user = $routeParams.user;
	$scope.replies = [];

	var addReply = function (reply) {
		$timeout(function () {
			$scope.replies.unshift(reply);
		});
	};

	var initWS = function () {
		var ws = new WebSocket('wss://bnw.im/comments/ws');
		ws.onmessage = function (event) {
			var reply = JSON.parse(event.data);
			if (!$scope.user) return addReply(reply);
			if ((reply.text.match(/\@([\-0-9A-z]+)/ig) || []).indexOf('@' + $scope.user) > -1) {
				addReply(reply);
			} else if (!reply.replyto) {
				$http.get('https://bnw.im/api/show?message=' + reply.id.split('/')[0]).success(function (res) {
					if (res.messages[0].user == $scope.user) addReply(reply);
				});
			}
		};
		ws.onclose = initWS;
	};
	initWS();

	$scope.load = function () {
		if ($scope.loading) return;

		$scope.loading = true;

		$http.get('/comments' + (($scope.user) ? '/' + $scope.user : '') + '?skip='+$scope.replies.length)
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

app.controller('For', ['$scope', '$location', function($scope, $location) {
	$scope.name = localStorage['last'] || 'anonymous';
	$scope.for = function (name) {
		localStorage['last'] = name;
		$location.url('/for/' + name);
	};
}]);

app.controller('Webui', ['$scope', '$rootScope', function($scope, $rootScope) {
	$scope.webuilist = [
		{name: 'meow', url: 'https://meow.bnw.im'},
		{name: '6nw', url: 'https://6nw.im'},
		{name: 'default', url: 'https://bnw.im'}
	];
	$scope.update = function () {
		localStorage['webui'] = $scope.webui;
		$rootScope.webuiurl = $scope.webuilist[$scope.webui].url;
	};
	$scope.webui = localStorage['webui'] || '0';
	$scope.update();
}]);
