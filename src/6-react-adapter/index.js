import React from "react";
import ReactDOM from "react-dom";
import Giphy from "./Giphy";

class App extends React.Component {
	render() {
		return <Giphy rating="pg" />;
	}
}

ReactDOM.render( <App />, document.getElementById( "app" ) );
