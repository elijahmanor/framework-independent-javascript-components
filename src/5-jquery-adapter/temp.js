// fetch_xmlhttprequest: function( url, data ) {
// 	return new Promise( function( resolve, reject ) {
// 		var request = new XMLHttpRequest();
// 		url += this.options.params( data );
// 		request.open( "GET", url );
// 		request.onload = function() {
// 			if ( request.status === 200 ) {
// 				resolve( request.response );
// 			} else {
// 				reject( new Error( request.statusText ) );
// 			}
// 		};
// 		request.onerror = function() {
// 			reject( new Error( "Network Error" ) );
// 		};
// 		request.send();
// 	}.bind( this ) );
// }
