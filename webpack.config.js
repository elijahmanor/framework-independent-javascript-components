var path = require( "path");
var webpack = require( "webpack" );

module.exports = {
	entry: "./src/6-react-adapter/index.js",
	output: { path: "./src/6-react-adapter/", filename: "bundle.js" },
	module: {
		loaders: [
			{
				test: /.jsx?$/,
				loader: "babel-loader",
				exclude: /node_modules/,
				query: {
					presets: [ "es2015", "react" ]
				}
			}
		]
	}
};
