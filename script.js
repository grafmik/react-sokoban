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
	    _onFilterKeyPress:function(e) {
	    	if (e.key === 'l') {
				var level = "" +
				    "XXXXX\n" +
				    "X HOX\n" +
				    "XXXXX";
	    		e.preventDefault();
    			this.setState({level: level}, function()  {
    				console.log("state changed");
    			}.bind(this));
	    	}
	    },
	    componentWillMount: function() {
	    	if (this.props !== undefined && this.props.level !== undefined) {
	    		this.setState({level: this.props.level});
	    	}
	    },
	    render: function() {
	        var result = undefined, tile = undefined, rowIndex = undefined, colIndex = undefined,
	        	levelRow = undefined, tileType = undefined;
	    	var levelRows = this.state.level.split("\n");
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
