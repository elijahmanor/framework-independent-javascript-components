
( function( $, window, document, undefined ) {
	var pluginName = "giphy";

	$.fn[ pluginName ] = function( options ) {
		return this.each( function() {
			var $this = $( this );
			if ( !$this.data( pluginName) ) {
				$this.data( pluginName, new Giphy( this, options ) );
			}
		} );
	};

} ( jQuery, window, document ) );
