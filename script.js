"use strict";

var Game = React.createClass({
    displayName: 'React Sokoban',
    render: function() {
    	return React.createElement(
		   "div",
		   { "className": "game" },
		   React.createElement("div", { "className": "tile hero", style: {left:"5%",top:"5%"} }),
		   React.createElement("div", { "className": "tile carton", style: {left:"10%",top:"5%"} }),
		   React.createElement("div", { "className": "tile target", style: {left:"15%",top:"5%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"0%",top:"0%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"5%",top:"0%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"10%",top:"0%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"15%",top:"0%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"20%",top:"0%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"0%",top:"5%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"20%",top:"5%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"0%",top:"10%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"5%",top:"10%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"10%",top:"10%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"15%",top:"10%"} }),
		   React.createElement("div", { "className": "tile wall", style: {left:"20%",top:"10%"} })
		);
    }
});

ReactDOM.render(
    React.createElement(Game),
    document.getElementById('game')
);

