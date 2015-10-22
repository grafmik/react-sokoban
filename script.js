"use strict";

(function () {
	var TILE_HERO = "H";
	var TILE_CARTON = "O";
	var TILE_TARGET = ".";
	var TILE_WALL = "X";
	var TILE_NIL = " ";

	var TILE_CSS = {};
	TILE_CSS[TILE_HERO] = "hero";
	TILE_CSS[TILE_CARTON] = "carton";
	TILE_CSS[TILE_TARGET] = "target";
	TILE_CSS[TILE_WALL] = "wall";
	TILE_CSS[TILE_NIL] = "";

	var _getBoardDim = function(level) {
    	var levelRows = level.split("\n");
		return {
			x: levelRows[0].length,
			y: levelRows.length
		}
	};

	var _getTileDim = function(level) {
    	var levelRows = level.split("\n");
		return {
			x: Math.min(10, 100 / levelRows[0].length),
			y: Math.min(10, 100 / levelRows.length)
		}
	};

    var _getHeroPosition = function(level) {
    	var levelRow = undefined, rowIndex = undefined, colIndex = undefined;
    	var levelRows = level.split("\n");
        for (rowIndex = levelRows.length - 1; rowIndex >= 0; rowIndex--) {
        	levelRow = levelRows[rowIndex];
        	colIndex = levelRow.indexOf(TILE_HERO);
        	if (colIndex >= 0) {
        		return {x:colIndex, y:rowIndex};
        	}
        }
    };

    var _newPosition = function(origPos, offset) {
    	return {
    		x: origPos.x + offset.x,
    		y: origPos.y + offset.y,
    	};
    };

    var _isOutOfBounds = function(level, position) {
    	var boardDim = _getBoardDim(level);
    	return position.x === -1 || position.x === boardDim.x
    		|| position.y === -1 || position.y === boardDim.y;
    };

    var _setLevelChar = function(level, position, chr) {
    	var result = level;
    	var levelRows = level.split("\n");
    	var levelRow = levelRows[position.y];
    	var levelRowArray = levelRow.split("");
    	levelRowArray[position.x] = chr;
    	levelRow = levelRowArray.join("");
    	levelRows[position.y] = levelRow;
    	result = levelRows.join("\n");
    	return result;
    };

    var _getLevelChar = function(level, position) {
    	var result = undefined;
    	var levelRows = level.split("\n");
    	var levelRow = levelRows[position.y];
    	var levelRowArray = levelRow.split("");
    	result = levelRowArray[position.x];
    	return result;
    };

    var _move = function(initialLevel, level, direction) {
    	var newHeroDest = undefined, newCartonPosition = undefined, initialChar = undefined;
    	var result = level;
    	var heroPosition = _getHeroPosition(level);
    	var newHeroPosition = _newPosition(heroPosition, direction);
    	newHeroDest = _getLevelChar(level, newHeroPosition);
    	if (newHeroDest === TILE_CARTON) {
    		newCartonPosition = _newPosition(newHeroPosition, direction);
	    	result = _setLevelChar(result, newCartonPosition, TILE_CARTON);
    	}
    	initialChar = _getLevelChar(initialLevel, heroPosition);
    	if (initialChar !== TILE_TARGET) {
    		initialChar = TILE_NIL;
    	}
    	result = _setLevelChar(result, heroPosition, initialChar);
    	result = _setLevelChar(result, newHeroPosition, TILE_HERO);
		return result;
    };

    var _checkMove = function(level, direction) {
    	var newHeroDest = undefined, newCartonPosition = undefined, newCartonDest = undefined;
    	var heroPosition = _getHeroPosition(level);
    	var newHeroPosition = _newPosition(heroPosition, direction);
    	if (_isOutOfBounds(level, newHeroPosition)) {
    		return false;
    	}
    	newHeroDest = _getLevelChar(level, newHeroPosition);
    	if (newHeroDest === TILE_WALL) {
    		return false;
    	} else if (newHeroDest === TILE_CARTON) {
    		newCartonPosition = _newPosition(newHeroPosition, direction);
	    	if (_isOutOfBounds(level, newCartonPosition)) {
	    		return false;
	    	}
    		newCartonDest = _getLevelChar(level, newCartonPosition);
    		if (newCartonDest === TILE_WALL || newCartonDest === TILE_CARTON) {
    			return false;
    		}
    	}
    	return true;
    };

    var _directions = {
    	'i': {x:0, y:-1},
    	'j': {x:-1, y:0},
    	'k': {x:0, y:1},
    	'l': {x:1, y:0}
    };

	var Game = React.createClass({
	    displayName: 'React Sokoban',
		_onFilterKeyPress: function(e) {
			var newLevel = undefined;
			var direction = _directions[e.key];
			if (direction !== undefined) {
				e.preventDefault();
				if (_checkMove(this.state.currentLevel, direction)) {
					newLevel = _move(this.state.initialLevel, this.state.currentLevel, direction);
		    		if (newLevel !== undefined) {
						this.setState({currentLevel: newLevel}, function()  {
							// state changed
						}.bind(this));	    			
		    		}
				};
			}
		},
	    getInitialState: function() {
			// impossible level - this should always been overriden by props
			return {
				level: "" +
			    "OX.\n" +
			    "XHX\n" +
			    ".XO"
			};
	    },
	    componentWillMount: function() {
	    	if (this.props !== undefined && this.props.level !== undefined) {
	    		this.setState({currentLevel: this.props.level, initialLevel: this.props.level});
	    	}
	    },
	    render: function() {
	        var result = undefined, tile = undefined, rowIndex = undefined, colIndex = undefined,
	        	levelRow = undefined, tileType = undefined;
	        var currentLevel = this.state.currentLevel;
	        var boardDim = _getBoardDim(currentLevel);
	    	var tileDim = _getTileDim(currentLevel);
	    	var heroPosition = _getHeroPosition(currentLevel);
	    	var levelRows = currentLevel.split("\n");
	        var createParams = ["div", {
	            className: "game",
	            tabIndex: 1,
	            onKeyPress: this._onFilterKeyPress
	        }];
	        for (rowIndex = levelRows.length - 1; rowIndex >= 0; rowIndex--) {
	        	levelRow = levelRows[rowIndex];
				for (colIndex = levelRow.length - 1; colIndex >= 0; colIndex--) {
					tileType = levelRow[colIndex];
					tile = React.createElement("div", { "className": "tile " + TILE_CSS[tileType],
						style: {left:(tileDim.x*colIndex)+"%",top:(tileDim.y*rowIndex)+"%",
						width: tileDim.x+"%",height: tileDim.y+"%"} });
					createParams.push(tile);
				};
	        };
	        result = React.createElement.apply(this, createParams);
	        return result;
	    }
	});

	var level = "" +
	    "  XXXXX \n" +
	    "XXX   X \n" +
	    "X.HO  X \n" +
	    "XXX O.X \n" +
	    "X.XXO X \n" +
	    "X X . XX\n" +
	    "XO OOO.X\n" +
	    "X   .  X\n" +
	    "XXXXXXXX\n";

	ReactDOM.render(
	    React.createElement(Game, {level: level}),
	    document.getElementById('game')
	);
})(this);
