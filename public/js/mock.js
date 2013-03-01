(function(){

	var mockApp = angular.module('MockApp', [])

		.factory('PlayerSelectionSvc', function($rootScope){

			var svc = {};

			svc.tryAddPlayer = function(player){
				$rootScope.$broadcast('evtTryAddPlayer', player)
			}

			svc.playerAdded = function(player){
				$rootScope.$broadcast('evtPlayerAdded', player)
			}

			return svc;

		});

	function PlayerPoolCtrl($scope, $http, playerSelectionSvc){
		$scope.playerPool = [];

		$http.get('/js/razzball.js').success(function(data){
			// curate the data a bit
			$scope.playerPool = data.map(function(player){
				player.available = true;
				player.position = player.position.toLowerCase();
				return player
			});

		});

		$scope.isAvailable = function(player){
			return player.available 
		};

		$scope.selectPlayer = function(player){
			playerSelectionSvc.tryAddPlayer(player);
			// player.available = false;
		};

		$scope.$on('evtPlayerAdded', function(e, player){
			player.available = false;
		});

		$scope.removePlayer = function(player){
			console.log(player)
			player.available = false;
		};
	};
	PlayerPoolCtrl.$inject = ['$scope', '$http', 'PlayerSelectionSvc'];


	function MyTeamCtrl($scope, playerSelectionSvc){

		$scope.team = new Team();


		$scope.$on('evtTryAddPlayer', function(e, player){
			console.log('try add');

			if ($scope.team.tryAddPlayer(player)){
				playerSelectionSvc.playerAdded(player);
			}
			

			
		});
	};
	MyTeamCtrl.$inject = ['$scope', 'PlayerSelectionSvc'];

	var Team = function(){

		this.roster = _.flatten(
							_.map(positionConfig, function(obj, key){
								var ret = [];
								var i = obj.count;

								while (i--){
									ret.push({ position: key, accepts: obj.accepts, player: null })
								}

								return ret
							})
						);

	};

	Team.prototype = {
		// returns true with successful addition
		tryAddPlayer: function(player){
			var success = false;
			var positions = player.position.replace(/ */g, '').split(',');

			for (var i = 0; i < positions.length; i++){
				var position = _.find(this.roster, function(pos){
					return !pos.player && pos.accepts.indexOf(positions[i]) > -1
				});

				if (position !== undefined){
					position.player = player;
					success = true;
					break;
				}
			}

			return success;
		}
	}

	var positionConfig = {
		'c': {
			count: 1
			, accepts: ['c']
		}
		, '1b': {
			count: 1
			, accepts: ['1b']
		}
		, '2b': {
			count: 1
			, accepts: ['2b']
		}
		, '3b': {
			count: 1
			, accepts: ['3b']
		}
		, 'ss': {
			count: 1
			, accepts: ['ss']
		}
		, 'of': {
			count: 5
			, accepts: ['of']
		}
		, 'ci': {
			count: 1
			, accepts: ['1b', '3b']
		}
		, 'mi': {
			count: 1
			, accepts: ['2b', 'ss']
		}
		, 'util': {
			count: 1
			, accepts: ['c', '1b', '2b', '3b', 'ss', 'of', 'util']
		}
		, 'sp': {
			count: 2
			, accepts: ['sp']
		}
		, 'rp': {
			count: 2
			, accepts: ['rp']
		}
		, 'p': {
			count: 5
			, accepts: ['sp', 'rp']
		}
		, 'bench': {
			count: 5
			, accepts: ['c', '1b', '2b', '3b', 'ss', 'of', 'util', 'sp', 'rp']
		}
	}

	window.PlayerPoolCtrl = PlayerPoolCtrl;
	window.MyTeamCtrl = MyTeamCtrl;

}());
