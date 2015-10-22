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
	    render: function() {
	    	var levelRows = this.props.level.split("\n");
	    	var tileDim = getTileDim(level);
	        var createParams = ["div", {
	            "className": "game"
	        }];
	        var tile = undefined, rowIndex = undefined, colIndex = undefined,
	        	levelRow = undefined, tileType = undefined;
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
	        return React.createElement.apply(this, createParams);
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
