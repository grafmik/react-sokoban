"use strict";

(function () {
	var TILE_CSS = {
		"H": "hero",
		"O": "carton",
		".": "target",
		"X": "wall",
		" ": ""
	};

	var getTileDim = function(level) {
    	var levelRows = level.split("\n");
		return {
			w: Math.min(10, 100 / levelRows[0].length),
			h: Math.min(10, 100 / levelRows.length)
		}
	};

	var Game = React.createClass({
	    displayName: 'React Sokoban',
	    getInitialState: function() {
			// impossible level - this should always been overriden by props
			return {
				level: "" +
			    "OX.\n" +
			    "XHX\n" +
			    ".XO"
			};
	    },
	    _getHeroPosition: function(level) {
	    	var levelRow = undefined, rowIndex = undefined, colIndex = undefined;
	    	var levelRows = level.split("\n");
	        for (rowIndex = levelRows.length - 1; rowIndex >= 0; rowIndex--) {
	        	levelRow = levelRows[rowIndex];
	        	colIndex = levelRow.indexOf("H");
	        	if (colIndex >= 0) {
	        		return {x:colIndex, y:rowIndex};
	        	}
	        }
	    },
	    _move: function(direction) {
    		return "" +
		    "XXXXX\n" +
		    "X HOX\n" +
		    "XXXXX";
	    },
	    _checkMove: function(direction) {
	    	if (direction.x === 0 && direction.y === -1) {
		    	return true;
			}
	    },
	    _directions: {
	    	'i': {x:0, y:-1},
	    	'j': {x:-1, y:0},
	    	'k': {x:0, y:1},
	    	'l': {x:1, y:0}
	    },
	    _onFilterKeyPress:function(e) {
	    	var newLevel = undefined;
	    	var direction = this._directions[e.key];
	    	if (direction !== undefined) {
	    		e.preventDefault();
	    		if (this._checkMove(direction)) {
	    			newLevel = this._move(direction);
		    		if (newLevel !== undefined) {
						this.setState({currentLevel: newLevel}, function()  {
							console.log("state changed");
						}.bind(this));	    			
		    		}
	    		};
	    	}
	    },
	    componentWillMount: function() {
	    	if (this.props !== undefined && this.props.level !== undefined) {
	    		this.setState({currentLevel: this.props.level, initialLevel: this.props.level,
	    			heroPosition: this._getHeroPosition(this.props.level)});
	    	}
	    },
	    render: function() {
	        var result = undefined, tile = undefined, rowIndex = undefined, colIndex = undefined,
	        	levelRow = undefined, tileType = undefined;
	    	var levelRows = this.state.currentLevel.split("\n");
	    	var tileDim = getTileDim(this.state.level);
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
						style: {left:(tileDim.w*colIndex)+"%",top:(tileDim.h*rowIndex)+"%",
						height: tileDim.h+"%",width: tileDim.w+"%"} });
					createParams.push(tile);
				};
	        };
	        result = React.createElement.apply(this, createParams);
	        return result;
	    }
	});

	var level = "" +
	    "XXXXX\n" +
	    "XHO.X\n" +
	    "XXXXX";

	ReactDOM.render(
	    React.createElement(Game, {level: level}),
	    document.getElementById('game')
	);
})(this);
