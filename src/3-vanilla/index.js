(function ( _, window, document, undefined ) {
	function Giphy( element, options ) {
		this.element = element;
		this.options = _.merge( {}, Giphy.defaults, options );
		this.init();
	}

	Giphy.prototype.init = function() {
		this.giphy = this.createElementFromString( this.options.templates.wrapper );
		this.element.parentNode.replaceChild( this.giphy, this.element );
		this.giphy.appendChild( this.element );

		this.search = this.createElementFromString( this.options.templates.search );
		this.giphy.appendChild( this.search );

		this.controls = this.createElementFromString( this.options.templates.controls );
		this.controls.setAttribute( "hidden", "hidden" );
		this.giphy.appendChild( this.controls );

		this.prev = this.controls.querySelector( ".Giphy-prev" );
		this.next = this.controls.querySelector( ".Giphy-next" );

		this.wireEventHandlers();
	};

	Giphy.prototype.createElementFromString = function( markup ) {
		var wrapper = document.createElement( "div" );
		wrapper.innerHTML = markup;
		return wrapper.firstChild;
	};

	Giphy.prototype.wireEventHandlers = function() {
		this.controls.addEventListener( "keydown", this.handleControlKey.bind( this ) );
		this.prev.addEventListener( "click", this.navigate.bind( this, -1 ) );
		this.next.addEventListener( "click", this.navigate.bind( this, +1 ) );
		this.search.addEventListener( "click", this.handleSearchClick.bind( this ) );
		this.element.addEventListener( "keypress", this.handleEnter.bind( this ) );
		this.element.addEventListener( "giphy-list-updated", this.handleListUpdated.bind( this ) );
		this.element.addEventListener( "giphy-item-updated", this.handleItemUpdated.bind( this ) );
	};

	Giphy.prototype.handleControlKey = function( e ) {
		console.log( "handleControlKey", e );
		switch ( e.which ) {
			case 37 : this.navigate( -1 ); break;
			case 39 : this.navigate( +1 ); break;
		}
	};

	Giphy.prototype.handleSearchClick = function( e ) {
		console.log( "handleSearchClick", e );
		if ( !this.giphy.classList.contains( "Giphy--search" ) ) {
			this.request( this.element.value ).then( this.handleResponse.bind( this ) );
		} else {
			this.reset();
		}
	};

	Giphy.prototype.handleEnter = function( e ) {
		console.log( "handleEnter", e );
		if ( e.which === 13 ) {
			this.request( this.element.value )
			 .then( this.handleResponse.bind( this ) );
		}
	};

	Giphy.prototype.handleListUpdated = function( e ) {
		var list = e.detail;
		this.items = list;
		this.itemIndex = 0;
		this.preload( list );
		this.giphy.classList.add( "Giphy--search" );
		this.gif = document.createElement( "img" );
		this.giphy.appendChild( this.gif );
		this.controls.removeAttribute( "hidden" );
	};

	Giphy.prototype.handleItemUpdated = function( e ) {
		var item = e.detail;
		this.gif.setAttribute( "src", item.url );
		this.controls.setAttribute( "data-count", ( this.itemIndex + 1 ) + " of " + this.items.length );
		this.gif.blur();
	};

	Giphy.prototype.reset = function() {
		this.controls.setAttribute( "hidden", "hidden" );
		this.gif.parentNode.removeChild( this.gif );
		this.giphy.classList.remove( "Giphy--search" );
	};

	Giphy.prototype.preload = function( gifs ) {
		var preloaded = [];
		gifs.forEach( function( gif, index ) {
			preloaded[ index ] = new Image();
			preloaded[ index ].src = gif.url;
		} );
		return preloaded;
	};

	Giphy.prototype.navigate = function( difference ) {
		if ( difference < 0 ) {
			if ( this.itemIndex >= 1 ) { this.itemIndex--; }
		} else if ( difference > 0 ) {
			if ( this.itemIndex < this.items.length - 1 ) { this.itemIndex++; }
		} else {
			return;
		}

		var itemUpdatedEvent = new CustomEvent( "giphy-item-updated", {
			"detail": this.items[ this.itemIndex ]
		} );
		this.element.dispatchEvent( itemUpdatedEvent );
	};

	Giphy.prototype.request = function( value ) {
		return this.options.fetch(
			this.options.ajax.url,
			this.options.encoder( {
				searchTerm: value,
				apiKey: this.options.ajax.apiKey,
				rating: this.options.ajax.rating
			} )
		);
	};

	Giphy.prototype.handleResponse = function( response ) {
		var list = this.options.decoder( response );
		var item = list && list.length ? list[ 0 ] : {};
		var listUpdatedEvent = new CustomEvent( "giphy-list-updated", {
			"detail": list
		} );
		var itemUpdatedEvent = new CustomEvent( "giphy-item-updated", {
			"detail": item
		} );
		this.element.dispatchEvent( listUpdatedEvent );
		this.element.dispatchEvent( itemUpdatedEvent );
	};

	Giphy.defaults = {
		templates: {
			wrapper: "<div class='Giphy'></div>",
			search: "<div class='Giphy-toggle'></div>",
			controls: "<div class='Giphy-controls' tabindex='0'><span class='Giphy-prev'></span><span class='Giphy-next'></span></div>"
		},
		ajax: {
			url: "http://api.giphy.com/v1/gifs/search",
			apiKey: "dc6zaTOxFJmzC",
			rating: "g"
		},
		encoder: function( data ) {
			return {
				q: data.searchTerm,
				api_key: data.apiKey, // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
				rating: data.rating
			};
		},
		decoder: function( response ) {
			var list = ( response && response.data ) || [];
			return list.map( function( item ) {
				return {
					url: item.images.downsized.url
				};
			} );
		},
		// https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
		params: function( data ) {
			if ( data ) {
				return "?" + Object.keys( data ).map( function( key ) {
					return key + "=" + encodeURIComponent( data[ key ] );
				} ).join( "&" );
			}
			return "";
		},
		fetch: function( url, data ) {
			return new Promise( function( resolve, reject ) {
				url += this.params( data );
				window.fetch( url ).then( function( response ) {
					response.json().then( function( json ) {
						resolve( json );
					} );
				} ).catch( function( exception ) {
					reject( exception );
				} );
			}.bind( this ) );
		}
	};

	window.Giphy = Giphy;
})( _, window, document );
