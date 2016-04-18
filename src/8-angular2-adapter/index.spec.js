describe( "4-vanilla-es6", () => {
	let fixture, giphy, element;
	const listOfGifs = [ { url: "1" }, { url: "2" }, { url: "3" } ];
	const gif = { url: "1" };

	beforeEach( () => {
		fixture = setFixtures( "<input id='giphy'></ul>" );
		element = document.querySelector( "input" );
		giphy = new Giphy( element );
	} );

	describe( "options", () => {
		it( "should have default options", () => {
			const defaults = Giphy.defaults;
			expect( defaults.templates ).toEqual( {
				wrapper: "<div class='Giphy'></div>",
				search: "<div class='Giphy-toggle'></div>",
				controls: "<div class='Giphy-controls' tabindex='0'><span class='Giphy-prev'></span><span class='Giphy-next'></span></div>"
			} );
			expect( defaults.ajax ).toEqual( {
				url: "http://api.giphy.com/v1/gifs/search",
				apiKey: "dc6zaTOxFJmzC",
				rating: "g"
			} );
			expect( defaults.encoder ).toBeTruthy();
			expect( defaults.decoder ).toBeTruthy();
			expect( defaults.params ).toBeTruthy();
			expect( defaults.fetch ).toBeTruthy();
		} );

		describe( "encoder", () => {
			it( "should return giphy api format", () => {
				const encoded = giphy.options.encoder( {
					searchTerm: "cats",
					apiKey: "abc123",
					rating: "g"
				} );
				expect( encoded ).toEqual( {
					q: "cats",
					api_key: "abc123",
					rating: "g"
				} );
			} );
		} );

		describe( "decoder", () => {
			it( "should default to an empty array if response or response.data is falsey", () => {
				const decoded = giphy.options.decoder();
				expect( decoded ).toEqual( [] );
			} );

			it( "should convert data array to objects with a url property", () => {
				const decoded = giphy.options.decoder( {
					data: [
						{ images: { downsized: { url: "1" } } },
						{ images: { downsized: { url: "2" } } },
						{ images: { downsized: { url: "3" } } }
					]
				} );
				expect( decoded ).toEqual( listOfGifs );
			} );
		} );

		describe( "params", () => {
			it( "should return empty string if no data", () => {
				const params = giphy.options.params();
				expect( params ).toBe( "" );
			} );

			it( "should return one param pair if passed one key/value", () => {
				const params = giphy.options.params( { cat: "fluffy" } );
				expect( params ).toBe( "?cat=fluffy" );
			} );

			it( "should encode a pair's value", () => {
				const params = giphy.options.params( { cat: "white fluffy" } );
				expect( params ).toBe( "?cat=white%20fluffy" );
			} );

			it( "should return two param pairs if passed two key/values", () => {
				const params = giphy.options.params( { cat: "fluffy", age: 4 } );
				expect( params ).toBe( "?cat=fluffy&age=4" );
			} );
		} );

		describe( "fetch", () => {
			beforeEach( () => {
				window.fetch = window.fetch || {};
				spyOn( giphy.options, "params" ).and.returnValue( "?test=1234" );
			} );

			afterEach( () => {
				delete window.fetch;
			} );

			describe( "resovle", () => {
				beforeEach( () => {
					spyOn( window, "fetch" ).and.callFake( () => {
						return new Promise( ( resolve, reject ) => {
							resolve( {
								json: jasmine.createSpy().and.callFake( () => {
									return new Promise( ( solve, ject ) => {
										solve( { test: 1234 } );
									} );
								} )
							} );
						} );
					} );
				} );

				it( "should return a promise", () => {
					function isPromise( promise ) {
						return _.isObject( promise ) &&
							promise.then instanceof Function &&
							promise.catch instanceof Function;
					}
					const promise = giphy.options.fetch( "http://request.com", { request: "abcd" } );
					const success = isPromise( promise );
					expect( isPromise( promise ) ).toBe( true );
				} );

				it( "should call window.fetch", () => {
					giphy.options.fetch( "http://request.com", { test: "1234" } );
 					expect( window.fetch ).toHaveBeenCalled();
				} );

				it( "should append params to the url", () => {
					giphy.options.fetch( "http://request.com", { test: "1234" } );
 					expect( window.fetch ).toHaveBeenCalledWith( "http://request.com?test=1234" );
				} );

				it( "should grab json and resolve on fetch success", done => {
					giphy.options.fetch( "http://request.com", { test: "1234" } ).then( ( data ) => {
						expect( data ).toEqual( { test: 1234 } );
						done();
					} );
 				} );
			} );

			describe( "reject", () => {
				beforeEach( () => {
					spyOn( window, "fetch" ).and.callFake( () => {
						return new Promise( ( resolve, reject ) => {
							reject( "exception" );
						} );
					} );
				} );

				it( "should reject promise on fetch failure", () => {
					giphy.options.fetch( "http://request.com", { test: "1234" } ).catch( ( exception ) => {
						expect( exception ).toEqual( "exception" );
						done();
					} );
				} );
			} );
		} );
	} );

	describe( "instance", () => {
		describe( "constructor", () => {
			it( "should save element as property", () => {
				expect( giphy.element ).toBe( element );
			} );

			it( "should save the merged options of defaults and passed in options", () => {
				expect( _.isPlainObject( giphy.options ) ).toBeTruthy();
			} );
		} );

		describe( "methods", () => {
			describe( "init", () => {
				it( "surrounds the element with a wrapper", () => {
					expect( giphy.element.parentNode.classList.contains( "Giphy") ).toBe( true );
				} );

				it( "adds template for the search toggle", () => {
					expect( giphy.search.classList.contains( "Giphy-toggle") ).toBe( true );
				} );

				it( "adds template for the controls", () => {
					expect( giphy.element.parentNode.querySelectorAll( ".Giphy-prev, .Giphy-next" ).length ).toBe( 2 );
				} );

				it( "should call wireEventHandlers", () => {
					spyOn( giphy, "wireEventHandlers" );
					giphy.init();
					expect( giphy.wireEventHandlers ).toHaveBeenCalled();
				} );

			} );

			describe( "createElementFromString", () => {
				it( "should return null if passed empty string", () => {
					const element = giphy.createElementFromString( "" );
					expect( element ).toBe( null );
				} );

				it( "should return null if passed invalid markup", () => {
					const element = giphy.createElementFromString( "<badmarkup" );
					expect( element ).toBe( null );
				} );

				it( "should return the firstChild of the markup passed", () => {
					const element = giphy.createElementFromString( "<p>goodmarkup</p>" );
					expect( element.tagName ).toBe( "P" );
				} );
			} );

			describe( "wireEventHandlers", () => {
				beforeEach( () => {
					spyOn( Element.prototype, "addEventListener" );
					giphy.wireEventHandlers();
				} );

				it( "should wire up keydown on controls", () => {
					expect( giphy.controls.addEventListener ).toHaveBeenCalledWith( "keydown", jasmine.any( Function ) );
				} );

				it( "should wire up click on prev control", () => {
					expect( giphy.prev.addEventListener ).toHaveBeenCalledWith( "click", jasmine.any( Function ) );
				} );

				it( "should wire up click on next control", () => {
					expect( giphy.next.addEventListener ).toHaveBeenCalledWith( "click", jasmine.any( Function ) );
				} );

				it( "should wire up click on search control", () => {
					expect( giphy.search.addEventListener ).toHaveBeenCalledWith( "click", jasmine.any( Function ) );
				} );

				it( "should wire up keypress on element control", () => {
					expect( giphy.element.addEventListener ).toHaveBeenCalledWith( "keypress", jasmine.any( Function ) );
				} );

				it( "should wire up giphy-list-updated on element control", () => {
					expect( giphy.element.addEventListener ).toHaveBeenCalledWith( "giphy-list-updated", jasmine.any( Function ) );
				} );

				it( "should wire up giphy-item-updated on element control", () => {
				  expect( giphy.element.addEventListener ).toHaveBeenCalledWith( "giphy-item-updated", jasmine.any( Function ) );
				} );
			} );

			describe( "handleControlKey", () => {
				beforeEach( () => {
					spyOn( giphy, "navigate" );;
				} );

				it( "should navigate backwards on left key", () => {
					giphy.handleControlKey( { which: 37 } );
					expect( giphy.navigate ).toHaveBeenCalledWith( -1 );
				} );

				it( "should navigate forwards on right key", () => {
					giphy.handleControlKey( { which: 39 } );
					expect( giphy.navigate ).toHaveBeenCalledWith( 1 );
				} );

				it( "should not navigate on any other key", () => {
					giphy.handleControlKey( { which: 1 } );
					expect( giphy.navigate ).not.toHaveBeenCalled();
				} );
			} );

			describe( "handleSearchClick", () => {
				beforeEach( () => {
					spyOn( giphy, "reset" );
					spyOn( giphy, "request" ).and.callFake( () => {
						const d = $.Deferred();
						d.resolve();
						return d.promise();
					} );
				} );

				it( "should reset if has Giphy--search", () => {
					giphy.giphy.classList.add( "Giphy--search" );
					giphy.handleSearchClick();
					expect( giphy.reset ).toHaveBeenCalled();
				} );

				it( "should search if doesn't have Giphy--search", () => {
					giphy.giphy.classList.remove( "Giphy--search" );
					giphy.handleSearchClick();
					expect( giphy.request ).toHaveBeenCalled();
				} );
			} );

			describe( "handleEnter", () => {
				beforeEach( () => {
					spyOn( giphy, "request" ).and.callFake( () => {
						const d = $.Deferred();
						d.resolve();
						return d.promise();
					} );
					spyOn( giphy, "handleResponse" );
				} );

				it( "should call search method for enter key", () => {
					giphy.element.value = "42";
					giphy.handleEnter( { which: 13 } );
					expect( giphy.request ).toHaveBeenCalledWith( "42" );
				} );

				it( "should not call search method for non-enter key", () => {
					giphy.handleEnter( { which: 10 } );
					expect( giphy.request ).not.toHaveBeenCalled();
				} );

				it( "should call handleResponse method on resolved search promise", () => {
					giphy.handleEnter( { which: 13 } );
					expect( giphy.handleResponse ).toHaveBeenCalled();
				} );
			} );

			describe( "handleListUpdated", () => {
				it( "should set the list instance to argument", () => {
					giphy.handleListUpdated( { detail: listOfGifs } );
					expect( giphy.items ).toBe( listOfGifs );
				} );

				it( "should reset the itemIndex", () => {
					giphy.handleListUpdated( { detail: [] } );
					expect( giphy.itemIndex ).toBe( 0 );
				} );

				it( "should call the preload method", () => {
					spyOn( giphy, "preload" );
					giphy.handleListUpdated( { detail: listOfGifs } );
					expect( giphy.preload ).toHaveBeenCalledWith( listOfGifs );
				} );

				it( "should add the Giphy--search class", () => {
					spyOn( giphy.giphy.classList, "add" );
					giphy.handleListUpdated( { detail: listOfGifs } );
					expect( giphy.giphy.classList.add ).toHaveBeenCalledWith( "Giphy--search" );
				} );

				it( "should append an image to gif", () => {
					spyOn( giphy.giphy, "appendChild" );
					giphy.handleListUpdated( { detail: listOfGifs } );
					expect( giphy.giphy.appendChild ).toHaveBeenCalledWith( giphy.gif );
				} );

				it( "should show the controls", () => {
					spyOn( giphy.controls, "removeAttribute" );
					giphy.handleListUpdated( { detail: listOfGifs } );
					expect( giphy.controls.removeAttribute ).toHaveBeenCalledWith( "hidden" );
				} );
			} );

			describe( "handleItemUpdated", () => {
				beforeEach( () => {
					giphy.handleListUpdated( { detail: listOfGifs } );
				} );

				it( "should update $gif src to item's url", () => {
					spyOn( giphy.gif, "setAttribute" );
					giphy.handleItemUpdated( { detail: gif } );
					expect( giphy.gif.setAttribute ).toHaveBeenCalledWith( "src", gif.url );
				} );

				it( "should update the data-count attribute", () => {
					spyOn( giphy.controls, "setAttribute" );
					giphy.handleItemUpdated( { detail: gif } );
					expect( giphy.controls.setAttribute ).toHaveBeenCalledWith( "data-count", "1 of 3" );
				} );

				it( "should blur the $gif", () => {
					spyOn( giphy.gif, "blur" );
					giphy.handleItemUpdated( { detail: gif } );
					expect( giphy.gif.blur ).toHaveBeenCalled();
				} );
			} );

			describe( "reset", () => {
				beforeEach( () => {
					giphy.handleListUpdated( { detail: listOfGifs } );
				} );

				it( "should hide controls", () => {
					spyOn( giphy.controls, "setAttribute" );
					giphy.reset();
					expect( giphy.controls.setAttribute ).toHaveBeenCalledWith( "hidden", "hidden" );
				} );

				it( "should remove the gif", () => {
					spyOn( giphy.gif.parentNode, "removeChild" );
					giphy.reset();
					expect( giphy.gif.parentNode.removeChild ).toHaveBeenCalled();
				} );

				it( "should remove the Giphy--serach class", () => {
					spyOn( giphy.giphy.classList, "remove" );
					giphy.reset();
					expect( giphy.giphy.classList.remove ).toHaveBeenCalledWith( "Giphy--search" );
				} );
			} );

			describe( "preload", () => {
				it( "should create images for each gif", () => {
					const images = giphy.preload( listOfGifs );
					expect( images ).toEqual( jasmine.any( Array ) );
					expect( images.length ).toBe( 3 );
				} );
			} );

			describe( "navigate", () => {
				beforeEach( () => {
					spyOn( Element.prototype, "dispatchEvent" );
					giphy.handleListUpdated( { detail: listOfGifs } );
				} );

				it( "should increase the index when passing a positive number", () => {
					giphy.navigate( 1 );
					expect( giphy.itemIndex ).toBe( 1 );
				} );

				it( "should decrease the index when passing a negative number", () => {
					const maxIndex = listOfGifs.length - 1;
					giphy.itemIndex = maxIndex;
					giphy.navigate( -1 );
					expect( giphy.itemIndex ).toBe( maxIndex - 1 );
				} );

				it( "should not increase past the length", () => {
					const maxIndex = listOfGifs.length - 1;
					giphy.itemIndex = maxIndex;
					giphy.navigate( 1 );
					expect( giphy.itemIndex ).toBe( maxIndex );
				} );

				it( "should not decrase past 0", () => {
					giphy.navigate( -1 );
					expect( giphy.itemIndex ).toBe( 0 );
				} );

				it( "should trigger the giphy-item-updated event", () => {
					giphy.navigate( 1 );
					expect( giphy.element.dispatchEvent ).toHaveBeenCalled();
				} );

				it( "should not trigger the event if difference is 0", () => {
					giphy.navigate( 0 );
					expect( giphy.element.dispatchEvent ).not.toHaveBeenCalled();
				} );
			} );

			describe( "request", () => {
				beforeEach( () => {
					spyOn( giphy.options, "fetch" );
					spyOn( giphy.options, "encoder" ).and.returnValue( listOfGifs );
				} );

				it( "should make a fetch call", () => {
					giphy.request( "cats" );
					expect( giphy.options.fetch ).toHaveBeenCalled();
				} );

				it( "should use options.url as the url", () => {
					giphy.request( "cats" );
					const args = giphy.options.fetch.calls.first().args[ 0 ]
					expect( args ).toBe( giphy.options.ajax.url );
				} );

				it( "should use call the options.encoder", () => {
					giphy.request( "cats" );
					expect( giphy.options.encoder ).toHaveBeenCalledWith( {
						searchTerm: "cats",
						apiKey: giphy.options.ajax.apiKey,
						rating: giphy.options.ajax.rating
					} );
				} );

				it( "should use the results from options.encoder as data", () => {
					giphy.request( "cats" );
					const args = giphy.options.fetch.calls.first().args[ 1 ]
					expect( args ).toBe( listOfGifs );
				} );
			} );

			describe( "handleResponse", () => {
				const response = {
					data: [
						{ images: { downsized: { url: "1" } } },
						{ images: { downsized: { url: "2" } } },
						{ images: { downsized: { url: "3" } } }
					]
				};
				beforeEach( () => {
					spyOn( giphy.options, "decoder" ).and.returnValue( listOfGifs );
					spyOn( giphy.element, "dispatchEvent" );
				} );

				it( "should call the options.decoder", () => {
					giphy.handleResponse( response );
					expect( giphy.options.decoder ).toHaveBeenCalledWith( response );
				} );

				it( "should trigger the giphy-list-updated event", () => {
					giphy.handleResponse( response );
					const args = giphy.element.dispatchEvent.calls.allArgs();
					const passed = args.some( arg => {
						const customEvent = arg[ 0 ];
						if ( customEvent instanceof CustomEvent &&
							customEvent.type === "giphy-list-updated" &&
							customEvent.detail === listOfGifs ) {
							return true;
						}
					} );
					expect( passed ).toBe( true );
				} );

				it( "should trigger the giphy-item-updated event", () => {
					giphy.handleResponse( response );
					const args = giphy.element.dispatchEvent.calls.allArgs();
					const passed = args.some( arg => {
						const customEvent = arg[ 0 ];
						if ( customEvent instanceof CustomEvent &&
							customEvent.type === "giphy-item-updated" &&
							customEvent.detail === listOfGifs[ 0 ] ) {
							return true;
						}
					} );
					expect( passed ).toBe( true );
				} );
			} );
		} );
	} );
} );
