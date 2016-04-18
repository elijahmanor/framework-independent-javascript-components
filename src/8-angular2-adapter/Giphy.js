import React from "react";
import ReactDOM from "react-dom";
import GiphyLib from "../4-vanilla-es6/Giphy.js";

export default class Giphy extends React.Component {
	componentDidMount() {
		const element = ReactDOM.findDOMNode( this );
		const { url, apiKey, rating, encoder, decoder, fetch } = this.props;
		this.giphy = new GiphyLib( element, {
			ajax: { url, apiKey, rating },
			encoder, decoder, fetch
		} );
	}
	render() {
		return <input />;
	}
}

Giphy.propTypes = {
	url: React.PropTypes.string,
	apiKey: React.PropTypes.string,
	rating: React.PropTypes.string,
	encoder: React.PropTypes.func,
	decoder: React.PropTypes.func,
	fetch: React.PropTypes.func
};

Giphy.defaultProps = {
	url: GiphyLib.defaults.ajax.url,
	apiKey: GiphyLib.defaults.ajax.apiKey,
	rating: GiphyLib.defaults.ajax.rating,
	encoder: GiphyLib.defaults.encoder,
	decoder: GiphyLib.defaults.decoder,
	fetch: GiphyLib.defaults.fetch
};
