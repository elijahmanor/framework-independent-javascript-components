import { Component } from "angular2/core";
import { GiphyComponent } from "./giphy.component";

@Component({
  selector: 'my-app',
  directives: [ GiphyComponent ],
  template: `
    <div>
      <h3>Hello</h3>
      <my-giphy></my-giphy>
    </div>
  `
})
export class App {
}
