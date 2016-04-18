( function( app ) {
	app.controller( "AppController", function( $scope ) {
		$scope.name = "World";
	} );
}( angular.module( "myApp", [
	"giphy"
] ) ) );
