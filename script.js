"use strict";

(function () {
	var BASE_URL = "http://grafmik.com/files/other/sokoban-levels/";

	var TILE_HERO = "@";
	var TILE_HERO_TARGET = "+";
	var TILE_CARTON = "$";
	var TILE_CARTON_TARGET = "*";
	var TILE_TARGET = ".";
	var TILE_WALL = "#";
	var TILE_NIL = " ";

	var TILE_CSS = {};
	TILE_CSS[TILE_HERO] = "hero";
	TILE_CSS[TILE_HERO_TARGET] = "hero-target";
	TILE_CSS[TILE_CARTON] = "carton";
	TILE_CSS[TILE_CARTON_TARGET] = "carton-target";
	TILE_CSS[TILE_TARGET] = "target";
	TILE_CSS[TILE_WALL] = "wall";
	TILE_CSS[TILE_NIL] = "";

	var _getTileCSS = function(tileType) {
		var result = "";
		if (tileType !== undefined) {
			result = TILE_CSS[tileType];
		}
		return result;
	};

	var _getTileDim = function(level) {
		return {
			x: Math.min(10, 100 / level.x),
			y: Math.min(10, 100 / level.y)
		}
	};

    var _getHeroPosition = function(level) {
    	var levelRow = undefined, rowIndex = undefined, colIndex = undefined;
        for (rowIndex = level.data.length - 1; rowIndex >= 0; rowIndex--) {
        	levelRow = level.data[rowIndex];
        	colIndex = Math.max(levelRow.indexOf(TILE_HERO), levelRow.indexOf(TILE_HERO_TARGET));
        	if (colIndex >= 0) {
        		return {x:colIndex, y:rowIndex};
        	}
        }
    };

    var _isLevelFinished = function(level) {
    	var levelRow = undefined, rowIndex = undefined, colIndex = undefined;
        for (rowIndex = level.data.length - 1; rowIndex >= 0; rowIndex--) {
        	levelRow = level.data[rowIndex];
        	colIndex = levelRow.indexOf(TILE_CARTON);
        	if (colIndex >= 0) {
        		return false;
        	}
        }
        return true;
    };

    var _newPosition = function(origPos, offset) {
    	return {
    		x: origPos.x + offset.x,
    		y: origPos.y + offset.y,
    	};
    };

    var _isOutOfBounds = function(level, position) {
    	return position.x === -1 || position.x === level.x
    		|| position.y === -1 || position.y === level.y;
    };

    var _setLevelChar = function(level, position, chr) {
    	var result = level;
    	var levelData = level.data;
    	var levelRow = levelData[position.y];
    	var levelRowArray = levelRow.split("");
    	levelRowArray[position.x] = chr;
    	levelRow = levelRowArray.join("");
    	levelData[position.y] = levelRow;
    	result.data = levelData;
    	return result;
    };

    var _isTargetChar = function(chr) {
    	return chr === TILE_TARGET
    	|| chr === TILE_CARTON_TARGET
    	|| chr === TILE_HERO_TARGET;
    }

    var _getLevelChar = function(level, position) {
    	var result = undefined;
    	var levelRow = level.data[position.y];
    	var levelRowArray = levelRow.split("");
    	result = levelRowArray[position.x];
    	return result;
    };

    var _move = function(initialLevel, level, direction) {
    	var initialChar = undefined, newInitialChar = undefined,
    	heroDest = undefined, newHeroDest = undefined, initialNewHeroDest = undefined,
    	newCartonPosition = undefined, newCartonDest = undefined,
    	initialNewCartonDest = undefined;
    	var result = level;
    	var heroPosition = _getHeroPosition(level);
    	var newHeroPosition = _newPosition(heroPosition, direction);
    	heroDest = _getLevelChar(level, newHeroPosition);
    	if (heroDest === TILE_CARTON || heroDest === TILE_CARTON_TARGET) {
    		newCartonPosition = _newPosition(newHeroPosition, direction);
	    	initialNewCartonDest = _getLevelChar(initialLevel, newCartonPosition);
	    	if (_isTargetChar(initialNewCartonDest)) {
	    		newCartonDest = TILE_CARTON_TARGET;
	    	} else {
	    		newCartonDest = TILE_CARTON;
	    	}
	    	result = _setLevelChar(result, newCartonPosition, newCartonDest);
    	}
    	initialChar = _getLevelChar(initialLevel, heroPosition);
    	if (_isTargetChar(initialChar)) {
    		newInitialChar = TILE_TARGET;
    	} else {
    		newInitialChar = TILE_NIL;
    	}
    	result = _setLevelChar(result, heroPosition, newInitialChar);
    	initialNewHeroDest = _getLevelChar(initialLevel, newHeroPosition);
    	if (_isTargetChar(initialNewHeroDest)) {
    		newHeroDest = TILE_HERO_TARGET;
    	} else {
    		newHeroDest = TILE_HERO;
    	}
    	result = _setLevelChar(result, newHeroPosition, newHeroDest);
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
    	} else if (newHeroDest === TILE_CARTON || newHeroDest === TILE_CARTON_TARGET) {
    		newCartonPosition = _newPosition(newHeroPosition, direction);
	    	if (_isOutOfBounds(level, newCartonPosition)) {
	    		return false;
	    	}
    		newCartonDest = _getLevelChar(level, newCartonPosition);
    		if (newCartonDest === TILE_WALL || newCartonDest === TILE_CARTON
    			|| newCartonDest === TILE_CARTON_TARGET) {
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

    var _getNextLevelsFromRawXML = function(levelRawData) {
    	var result = [];
		var levelDOMElements = undefined, levelDOMElement = undefined, levelIndex = undefined;
		var levelRowDOMElements = undefined, levelRowDOMElement = undefined, levelRowIndex = undefined;
		var levelRow = undefined, level = undefined;
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(levelRawData, "text/xml");
		var levelDOMElements = xmlDoc.getElementsByTagName("Level");
		for (levelIndex = levelDOMElements.length - 1; levelIndex >= 0; levelIndex--) {
			levelDOMElement = levelDOMElements[levelIndex];
			level = {
				id: levelDOMElement.getAttribute("Id"),
				x: levelDOMElement.getAttribute("Width"),
				y: levelDOMElement.getAttribute("Height"),
				data: []
			};
			levelRowDOMElements = levelDOMElement.getElementsByTagName("L");
			for (levelRowIndex = levelRowDOMElements.length - 1; levelRowIndex >= 0; levelRowIndex--) {
				levelRowDOMElement = levelRowDOMElements[levelRowIndex];
				levelRow = levelRowDOMElement.childNodes[0].nodeValue;
				level.data.push(levelRow);
			};
			result.push(level);
		};
		return result;
    };

	var Game = React.createClass({
	    displayName: 'React Sokoban',
		_loadNextLevels: function() {
			var newLevelFileNb = this.state.levelFileNb + 1;
			var url = BASE_URL + newLevelFileNb + ".slc";
			console.log("GET " + url);
			$.get(url).done(function(data) {
				var levels = _getNextLevelsFromRawXML(data);
				var levelNb = 0;
				this.setState({initialLevel: levels[levelNb], currentLevel: levels[levelNb],
					levels: levels, levelNb: 0, levelFileNb: newLevelFileNb});
			}.bind(this)).fail(function() {
				console.log("Failed to load level file");
				if (this.state.levelFileNb > 1) {
					console.log("Starting from level file number : zero");
					this.setState({levelFileNb: 0});
					this._loadNextLevels();
				}
			}.bind(this));
		},
		_loadNextLevel: function() {
			var newLevelNb = this.state.levelNb + 1;
			if (this.state.levels[this.state.levelNb] !== undefined) {
				this.setState({initialLevel: levels[newLevelNb], currentLevel: levels[newLevelNb],
					levelNb: newLevelNb});
			} else {
				this._loadNextLevels;
			}
		},
		_onClick: function(e) {
			this.setState({mainMessage: undefined});
		},
		_onKeyPress: function(e) {
			var newLevel = undefined;
			var newMessage = undefined;
			var direction = _directions[e.key];
			if (direction === undefined) {
				this.setState({mainMessage: "Keys : IJKL"})
			} else {
				e.preventDefault();
				if (_checkMove(this.state.currentLevel, direction)) {
					newLevel = _move(this.state.initialLevel, this.state.currentLevel, direction);
		    		if (_isLevelFinished(newLevel)) {
		    			newMessage = "Level finished";
		    		}
		    		if (newLevel !== undefined) {
		    			this.setState({
							mainMessage: newMessage,
							currentLevel: newLevel
						}, function()  {
							// state changed
						}.bind(this));	    			
		    		}
				};
			}
		},
		getInitialState: function() {
			return {
			    levelFileNb: 0,
			    mainMessage: "Hi! Please click on the game first. Then, use IJKL keys to play"
			};
	    },
	    componentDidMount: function() {
	    	if (this.state.currentLevel === undefined) {
				this._loadNextLevels();
	    	}
		},
	    componentWillMount: function() {
	    	if (this.props !== undefined) {
	    		if (this.props.level !== undefined) {
		    		this.setState({currentLevel: this.props.level, initialLevel: this.props.level});
		    	}
		    	if (this.props.message !== undefined) {
		    		this.setState({mainMessage: this.props.message})
		    	}
		    	if (this.props.levelFileNb !== undefined) {
		    		this.setState({levelFileNb: this.props.levelFileNb})
		    	}
		    }
	    },
	    render: function() {
	        var result = undefined, tile = undefined, rowIndex = undefined, colIndex = undefined,
	        	levelRow = undefined, tileType = undefined, mainMessage = undefined,
	        	tileDim = undefined, heroPosition = undefined;
	        var level = this.state.currentLevel;
	        var createParams = ["div", {
	            className: "game",
	            tabIndex: 1,
	            onKeyPress: this._onKeyPress,
	            onClick: this._onClick
	        }];
	        if (level !== undefined) {
		    	var tileDim = _getTileDim(level);
		    	var heroPosition = _getHeroPosition(level);
		        for (rowIndex = level.data.length - 1; rowIndex >= 0; rowIndex--) {
		        	levelRow = level.data[rowIndex];
					for (colIndex = levelRow.length - 1; colIndex >= 0; colIndex--) {
						tileType = levelRow[colIndex];
						tile = React.createElement("div", { "className": "tile " + _getTileCSS(tileType),
							style: {left:(tileDim.x*colIndex)+"%",top:(tileDim.y*rowIndex)+"%",
							width: tileDim.x+"%",height: tileDim.y+"%"} });
						createParams.push(tile);
					};
		        };
	        }
	        if (this.state.mainMessage !== undefined) {
		        mainMessage = React.createElement("div", { "className": "main-message" }, this.state.mainMessage);	        	
		        createParams.push(mainMessage);
	        }
	        result = React.createElement.apply(this, createParams);
	        return result;
	    }
	});

	ReactDOM.render(
	    React.createElement(Game, {levelFileNb: Math.floor(Math.random() * 457)}),
	    document.getElementById('game')
	);
})(this);
