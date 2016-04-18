angular.module( "giphy", [] )
	.directive( "myGiphy", function() {
		return {
			restrict: "E",
			replace: "true",
			template: "<input />",
			link: function( scope, el, atts ) {
				this.giphy = new Giphy( el[ 0 ], {} );
			}
		};
	} );
