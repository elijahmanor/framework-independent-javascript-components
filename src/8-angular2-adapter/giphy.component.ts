import { Component, ElementRef, OnInit } from "angular2/core";

declare var Giphy: any;

@Component( {
	selector: "my-giphy",
	template: "<input />"
} )
export class GiphyComponent {
  constructor( private el:ElementRef ) {}

	ngOnInit():any {
	  const input = this.el.nativeElement.querySelector( "input" );
		this.giphy = new Giphy( input, {} );
	}
}
