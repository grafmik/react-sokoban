"use strict";

(function () {
	var BASE_URL = "http://grafmik.com/files/other/sokoban-levels/";

	var WELCOME_MESSAGE = "React Sokoban - Keys : IJKL:Move R:Reload Level N:Next Level - Click to close";

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
    	var levelData = level.data;
    	var levelRow = levelData[position.y];
    	var levelRowArray = levelRow.split("");
    	levelRowArray[position.x] = chr;
    	levelRow = levelRowArray.join("");
    	levelData[position.y] = levelRow;
    	level.data = levelData;
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

    var _move = function(level, direction) {
    	var initialChar = undefined, newInitialChar = undefined,
    	heroDest = undefined, newHeroDest = undefined, initialNewHeroDest = undefined,
    	newCartonPosition = undefined, newCartonDest = undefined,
    	initialNewCartonDest = undefined;
    	var heroPosition = _getHeroPosition(level);
    	var newHeroPosition = _newPosition(heroPosition, direction);
    	heroDest = _getLevelChar(level, newHeroPosition);
    	if (heroDest === TILE_CARTON || heroDest === TILE_CARTON_TARGET) {
    		newCartonPosition = _newPosition(newHeroPosition, direction);
	    	initialNewCartonDest = _getLevelChar(level, newCartonPosition);
	    	if (_isTargetChar(initialNewCartonDest)) {
	    		newCartonDest = TILE_CARTON_TARGET;
	    	} else {
	    		newCartonDest = TILE_CARTON;
	    	}
	    	_setLevelChar(level, newCartonPosition, newCartonDest);
    	}
    	initialChar = _getLevelChar(level, heroPosition);
    	if (_isTargetChar(initialChar)) {
    		newInitialChar = TILE_TARGET;
    	} else {
    		newInitialChar = TILE_NIL;
    	}
    	_setLevelChar(level, heroPosition, newInitialChar);
    	initialNewHeroDest = _getLevelChar(level, newHeroPosition);
    	if (_isTargetChar(initialNewHeroDest)) {
    		newHeroDest = TILE_HERO_TARGET;
    	} else {
    		newHeroDest = TILE_HERO;
    	}
    	_setLevelChar(level, newHeroPosition, newHeroDest);
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
		for (levelIndex = 0; levelIndex < levelDOMElements.length; levelIndex++) {
			levelDOMElement = levelDOMElements[levelIndex];
			level = {
				id: levelDOMElement.getAttribute("Id"),
				x: levelDOMElement.getAttribute("Width"),
				y: levelDOMElement.getAttribute("Height"),
				data: []
			};
			levelRowDOMElements = levelDOMElement.getElementsByTagName("L");
			for (levelRowIndex = 0; levelRowIndex < levelRowDOMElements.length; levelRowIndex++) {
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
	    _setLevel: function(level, isInitial) {
    		if (level !== undefined) {
    			if (isInitial) {
    				this.setState({mainMessage: WELCOME_MESSAGE + " - Level is : " + level.id});
	    			level["initialData"] = level.data.slice();
    			}
	    		this.setState({level: level});
	    	}
	    },
		_loadNextLevels: function() {
			var newLevelFileNb = this.state.levelFileNb + 1;
			var url = BASE_URL + newLevelFileNb + ".slc";
			console.log("GET " + url);
			$.get(url).done(function(data) {
				var levels = _getNextLevelsFromRawXML(data);
				console.log("levels found : " + levels.length);
				var levelNb = 0;
				this._setLevel(levels[levelNb], true);
				this.setState({levels: levels, levelNb: levelNb, levelFileNb: newLevelFileNb});	    	
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
			if (this.state.levels[newLevelNb] !== undefined) {
				this._setLevel(this.state.levels[newLevelNb], true);
				this.setState({levelNb: newLevelNb});
			} else {
				this._loadNextLevels();
			}
		},
		_onClick: function(e) {
			this.setState({mainMessage: undefined});
		},
		_onKeyPress: function(e) {
			var newLevel = undefined;
			var newMessage = undefined;
			var direction = _directions[e.key];
			e.preventDefault();
			if (_isLevelFinished(this.state.level)) {
				this._loadNextLevel();
			} else {
				if (direction === undefined) {
					if (e.key === 'r') {
						newLevel = this.state.level;
						newLevel.data = newLevel.initialData.slice();
						this._setLevel(newLevel);
					} else if (e.key === 'n') {
						this._loadNextLevel();
					} else {
						this.setState({mainMessage: WELCOME_MESSAGE});
					}
				} else {
					if (_checkMove(this.state.level, direction)) {
						_move(this.state.level, direction);
						newLevel = this.state.level;
			    		if (_isLevelFinished(newLevel)) {
			    			newMessage = "Level finished";
			    		}
			    		if (newLevel !== undefined) {
			    			this._setLevel(newLevel);
			    			this.setState({mainMessage: newMessage});	    			
			    		}
					};
				}				
			}
		},
		getInitialState: function() {
			return {
			    levelFileNb: 0,
			    mainMessage: WELCOME_MESSAGE
			};
	    },
	    componentDidMount: function() {
	    	if (this.state.level === undefined) {
				this._loadNextLevels();
	    	}
		},
	    componentWillMount: function() {
	    	if (this.props !== undefined) {
	    		this._setLevel(this.props.level, true);
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
	        var level = this.state.level;
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

	var initialFileNb = Math.floor(Math.random() * 457);

	ReactDOM.render(
	    React.createElement(Game, {levelFileNb: initialFileNb}),
	    document.getElementById('game')
	);
})(this);
