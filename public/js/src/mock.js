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

		$http.get('/js/data/razzball.js').success(function(data){
			// curate the data a bit
			$scope.playerPool = data.map(function(player){
				player.available = true;
				player.position = player.position.toLowerCase();

				// make sure number fields are numbers here so we don't 
				// have to worry about it elsewhere
				player.rank = +player.rank;
				player.runs = +player.runs;
				player.hrs = +player.hrs;
				player.rbi = +player.rbi;
				player.steals = +player.steals;
				player.avg = +player.avg;
				player.wins = +player.wins;
				player.ks = +player.ks;
				player.era = +player.era;
				player.whip = +player.whip;
				player.saves = +player.saves;

				return player
			});

		});

		$scope.isAvailable = function(player){
			return player.available 
		};

		$scope.selectPlayer = function(player){
			playerSelectionSvc.tryAddPlayer(player);
		};

		$scope.$on('evtPlayerAdded', function(e, player){
			player.available = false;
		});

		$scope.removePlayer = function(player){
			player.available = false;
		};
	};
	PlayerPoolCtrl.$inject = ['$scope', '$http', 'PlayerSelectionSvc'];


	function MyTeamCtrl($scope, playerSelectionSvc){

		$scope.team = new Team();


		$scope.$on('evtTryAddPlayer', function(e, player){
			
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


		this.resetStats();

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
					this.refreshStats();

					break;
				}
			}

			return success;
		}

		, refreshStats: function(){
			var pitcherSlots = 'sp rp p'.split(' ');
			var hitterCount = 0;
			var pitcherCount = 0;

			this.resetStats();

			this.roster.forEach(function(slot){
				// not counting bench stats for now
				if (!slot.player || slot.position == 'bench') return;

				// pitchers
				if (pitcherSlots.indexOf(slot.position) > -1){
					pitcherCount++;

					// TODO: figure out how RP/SP IP should affect ratios (eg 70/180 or something)
					this.stats.wins += slot.player.wins;
					this.stats.ks += slot.player.ks;
					this.stats.saves += slot.player.saves;
					this.stats.era += slot.player.era;
					this.stats.whip += slot.player.whip;

				}
				// hitters
				else {
					hitterCount++;

					this.stats.runs += slot.player.runs;
					this.stats.hrs += slot.player.hrs;
					this.stats.rbi += slot.player.rbi;
					this.stats.steals += slot.player.steals;
					this.stats.avg += slot.player.avg;
				}

			}, this);

			this.stats.era /= pitcherCount;
			this.stats.whip /= pitcherCount;
			this.stats.avg /= hitterCount;
		}

		, resetStats: function(){
			this.stats = {
				runs: 0
				, hrs: 0
				, rbi: 0
				, steals: 0
				, avg: 0
				, wins: 0
				, ks: 0
				, era: 0
				, whip: 0
				, saves: 0
			};
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
