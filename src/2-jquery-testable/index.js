(function ( $, window, document, undefined ) {
    var pluginName = "giphy";

    function Plugin( element, options ) {
        this.element = element;
        this.$element = $( element );
        this.options = $.extend( {}, $.fn[ pluginName ].defaults, options );
        this.init();
    }

    Plugin.prototype.init = function() {
      this.$giphy = this.$element.wrap( this.options.templates.wrapper ).closest( ".Giphy" );
      this.$search = $( this.options.templates.search ).appendTo( this.$giphy );
      this.$controls = $( this.options.templates.controls ).hide().appendTo( this.$giphy );
      this.$prev = this.$controls.find( ".Giphy-prev" );
      this.$next = this.$controls.find( ".Giphy-next" );

      this.wireEventHandlers();
    };

    Plugin.prototype.wireEventHandlers = function() {
      this.$controls.on( "keydown", this.handleControlKey.bind( this ) );
      this.$prev.on( "click", this.navigate.bind( this, -1 ) );
      this.$next.on( "click", this.navigate.bind( this, +1 ) );
      this.$search.on( "click", this.handleSearchClick.bind( this ) );
      this.$element.on( "keypress", this.handleEnter.bind( this ) );
      this.$element.on( "giphy-list-updated", this.handleListUpdated.bind( this ) );
      this.$element.on( "giphy-item-updated", this.handleItemUpdated.bind( this ) );
    };

    Plugin.prototype.handleControlKey = function( e ) {
      switch ( e.which ) {
        case 37 : this.navigate( -1 ); break;
        case 39 : this.navigate( +1 ); break;
      }
    };

    Plugin.prototype.handleSearchClick = function() {
      if ( !this.$giphy.hasClass( "Giphy--search" ) ) {
        this.search( this.element.value ).then( this.handleResponse.bind( this ) );
      } else {
        this.reset();
      }
    };

    Plugin.prototype.handleListUpdated = function( e, list ) {
      this.items = list;
      this.itemIndex = 0;
      this.preload( list );
      this.$giphy.addClass( "Giphy--search" );
      this.$gif = $( "<img />" );
      this.$gif.appendTo( this.$giphy );
      this.$controls.show();
    };

    Plugin.prototype.handleItemUpdated = function( e, item ) {
      this.$gif.attr( "src", item.url );
      this.$controls.attr( "data-count", ( this.itemIndex + 1 ) + " of " + this.items.length );
      this.$gif.blur();
    };

    Plugin.prototype.reset = function() {
      this.$controls.hide();
      this.$gif.remove();
      this.$giphy.removeClass( "Giphy--search" );
    };

    Plugin.prototype.handleEnter = function( e ) {
       if ( e.which === 13 ) {
         this.search( this.element.value )
          .then( this.handleResponse.bind( this ) );
       }
    };

    Plugin.prototype.handleResponse = function( response ) {
      var list = this.options.decoder( response );
      var item = list && list.length ? list[ 0 ] : {};
      this.$element.trigger( "giphy-list-updated", [ list ] );
      this.$element.trigger( "giphy-item-updated", [ item ] );
    };

    Plugin.prototype.preload = function( gifs ) {
      var preloaded = [];
      gifs.forEach( function( gif, index ) {
        preloaded[ index ] = new Image();
        preloaded[ index ].src = gif.url;
      } );
      return preloaded;
    };

    Plugin.prototype.navigate = function( difference ) {
      if ( difference < 0 ) {
        if ( this.itemIndex >= 1 ) { this.itemIndex--; }
      } else if ( difference > 0 ) {
        if ( this.itemIndex < this.items.length - 1 ) { this.itemIndex++; }
      } else {
        return;
      }

      this.$element.trigger( "giphy-item-updated", [ this.items[ this.itemIndex ] ] );
    };

    Plugin.prototype.search = function( value ) {
      return $.ajax( {
        url: this.options.ajax.url,
        data: this.options.encoder( {
          searchTerm: value,
          apiKey: this.options.ajax.apiKey,
          rating: this.options.ajax.rating
        } )
      } );
    };

    $.fn[ pluginName ] = function( options ) {
      return this.each( function() {
        var $this = $( this );
        if ( !$this.data( pluginName ) ) {
          $this.data( pluginName, new Plugin( this, options ) );
        }
      });
    }

    $.fn[ pluginName ].defaults = {
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
      }
    };
})( jQuery, window, document );
