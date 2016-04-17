(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define([], factory);
	} else if (typeof exports !== "undefined") {
		factory();
	} else {
		var mod = {
			exports: {}
		};
		factory();
		global.indexSpec = mod.exports;
	}
})(this, function () {
	"use strict";

	describe("4-vanilla-es6", function () {
		var fixture = void 0,
		    giphy = void 0,
		    element = void 0;
		var listOfGifs = [{ url: "1" }, { url: "2" }, { url: "3" }];
		var gif = { url: "1" };

		beforeEach(function () {
			fixture = setFixtures("<input id='giphy'></ul>");
			element = document.querySelector("input");
			giphy = new Giphy(element);
		});

		describe("options", function () {
			it("should have default options", function () {
				var defaults = Giphy.defaults;
				expect(defaults.templates).toEqual({
					wrapper: "<div class='Giphy'></div>",
					search: "<div class='Giphy-toggle'></div>",
					controls: "<div class='Giphy-controls' tabindex='0'><span class='Giphy-prev'></span><span class='Giphy-next'></span></div>"
				});
				expect(defaults.ajax).toEqual({
					url: "http://api.giphy.com/v1/gifs/search",
					apiKey: "dc6zaTOxFJmzC",
					rating: "g"
				});
				expect(defaults.encoder).toBeTruthy();
				expect(defaults.decoder).toBeTruthy();
				expect(defaults.params).toBeTruthy();
				expect(defaults.fetch).toBeTruthy();
			});

			describe("encoder", function () {
				it("should return giphy api format", function () {
					var encoded = giphy.options.encoder({
						searchTerm: "cats",
						apiKey: "abc123",
						rating: "g"
					});
					expect(encoded).toEqual({
						q: "cats",
						api_key: "abc123",
						rating: "g"
					});
				});
			});

			describe("decoder", function () {
				it("should default to an empty array if response or response.data is falsey", function () {
					var decoded = giphy.options.decoder();
					expect(decoded).toEqual([]);
				});

				it("should convert data array to objects with a url property", function () {
					var decoded = giphy.options.decoder({
						data: [{ images: { downsized: { url: "1" } } }, { images: { downsized: { url: "2" } } }, { images: { downsized: { url: "3" } } }]
					});
					expect(decoded).toEqual(listOfGifs);
				});
			});

			describe("params", function () {
				it("should return empty string if no data", function () {
					var params = giphy.options.params();
					expect(params).toBe("");
				});

				it("should return one param pair if passed one key/value", function () {
					var params = giphy.options.params({ cat: "fluffy" });
					expect(params).toBe("?cat=fluffy");
				});

				it("should encode a pair's value", function () {
					var params = giphy.options.params({ cat: "white fluffy" });
					expect(params).toBe("?cat=white%20fluffy");
				});

				it("should return two param pairs if passed two key/values", function () {
					var params = giphy.options.params({ cat: "fluffy", age: 4 });
					expect(params).toBe("?cat=fluffy&age=4");
				});
			});

			describe("fetch", function () {
				beforeEach(function () {
					window.fetch = window.fetch || {};
					spyOn(giphy.options, "params").and.returnValue("?test=1234");
				});

				afterEach(function () {
					delete window.fetch;
				});

				describe("resovle", function () {
					beforeEach(function () {
						spyOn(window, "fetch").and.callFake(function () {
							return new Promise(function (resolve, reject) {
								resolve({
									json: jasmine.createSpy().and.callFake(function () {
										return new Promise(function (solve, ject) {
											solve({ test: 1234 });
										});
									})
								});
							});
						});
					});

					it("should return a promise", function () {
						function isPromise(promise) {
							return _.isObject(promise) && promise.then instanceof Function && promise.catch instanceof Function;
						}
						var promise = giphy.options.fetch("http://request.com", { request: "abcd" });
						var success = isPromise(promise);
						expect(isPromise(promise)).toBe(true);
					});

					it("should call window.fetch", function () {
						giphy.options.fetch("http://request.com", { test: "1234" });
						expect(window.fetch).toHaveBeenCalled();
					});

					it("should append params to the url", function () {
						giphy.options.fetch("http://request.com", { test: "1234" });
						expect(window.fetch).toHaveBeenCalledWith("http://request.com?test=1234");
					});

					it("should grab json and resolve on fetch success", function (done) {
						giphy.options.fetch("http://request.com", { test: "1234" }).then(function (data) {
							expect(data).toEqual({ test: 1234 });
							done();
						});
					});
				});

				describe("reject", function () {
					beforeEach(function () {
						spyOn(window, "fetch").and.callFake(function () {
							return new Promise(function (resolve, reject) {
								reject("exception");
							});
						});
					});

					it("should reject promise on fetch failure", function () {
						giphy.options.fetch("http://request.com", { test: "1234" }).catch(function (exception) {
							expect(exception).toEqual("exception");
							done();
						});
					});
				});
			});
		});

		describe("instance", function () {
			describe("constructor", function () {
				it("should save element as property", function () {
					expect(giphy.element).toBe(element);
				});

				it("should save the merged options of defaults and passed in options", function () {
					expect(_.isPlainObject(giphy.options)).toBeTruthy();
				});
			});

			describe("methods", function () {
				describe("init", function () {
					it("surrounds the element with a wrapper", function () {
						expect(giphy.element.parentNode.classList.contains("Giphy")).toBe(true);
					});

					it("adds template for the search toggle", function () {
						expect(giphy.search.classList.contains("Giphy-toggle")).toBe(true);
					});

					it("adds template for the controls", function () {
						expect(giphy.element.parentNode.querySelectorAll(".Giphy-prev, .Giphy-next").length).toBe(2);
					});

					it("should call wireEventHandlers", function () {
						spyOn(giphy, "wireEventHandlers");
						giphy.init();
						expect(giphy.wireEventHandlers).toHaveBeenCalled();
					});
				});

				describe("createElementFromString", function () {
					it("should return null if passed empty string", function () {
						var element = giphy.createElementFromString("");
						expect(element).toBe(null);
					});

					it("should return null if passed invalid markup", function () {
						var element = giphy.createElementFromString("<badmarkup");
						expect(element).toBe(null);
					});

					it("should return the firstChild of the markup passed", function () {
						var element = giphy.createElementFromString("<p>goodmarkup</p>");
						expect(element.tagName).toBe("P");
					});
				});

				describe("wireEventHandlers", function () {
					beforeEach(function () {
						spyOn(Element.prototype, "addEventListener");
						giphy.wireEventHandlers();
					});

					it("should wire up keydown on controls", function () {
						expect(giphy.controls.addEventListener).toHaveBeenCalledWith("keydown", jasmine.any(Function));
					});

					it("should wire up click on prev control", function () {
						expect(giphy.prev.addEventListener).toHaveBeenCalledWith("click", jasmine.any(Function));
					});

					it("should wire up click on next control", function () {
						expect(giphy.next.addEventListener).toHaveBeenCalledWith("click", jasmine.any(Function));
					});

					it("should wire up click on search control", function () {
						expect(giphy.search.addEventListener).toHaveBeenCalledWith("click", jasmine.any(Function));
					});

					it("should wire up keypress on element control", function () {
						expect(giphy.element.addEventListener).toHaveBeenCalledWith("keypress", jasmine.any(Function));
					});

					it("should wire up giphy-list-updated on element control", function () {
						expect(giphy.element.addEventListener).toHaveBeenCalledWith("giphy-list-updated", jasmine.any(Function));
					});

					it("should wire up giphy-item-updated on element control", function () {
						expect(giphy.element.addEventListener).toHaveBeenCalledWith("giphy-item-updated", jasmine.any(Function));
					});
				});

				describe("handleControlKey", function () {
					beforeEach(function () {
						spyOn(giphy, "navigate");;
					});

					it("should navigate backwards on left key", function () {
						giphy.handleControlKey({ which: 37 });
						expect(giphy.navigate).toHaveBeenCalledWith(-1);
					});

					it("should navigate forwards on right key", function () {
						giphy.handleControlKey({ which: 39 });
						expect(giphy.navigate).toHaveBeenCalledWith(1);
					});

					it("should not navigate on any other key", function () {
						giphy.handleControlKey({ which: 1 });
						expect(giphy.navigate).not.toHaveBeenCalled();
					});
				});

				describe("handleSearchClick", function () {
					beforeEach(function () {
						spyOn(giphy, "reset");
						spyOn(giphy, "request").and.callFake(function () {
							var d = $.Deferred();
							d.resolve();
							return d.promise();
						});
					});

					it("should reset if has Giphy--search", function () {
						giphy.giphy.classList.add("Giphy--search");
						giphy.handleSearchClick();
						expect(giphy.reset).toHaveBeenCalled();
					});

					it("should search if doesn't have Giphy--search", function () {
						giphy.giphy.classList.remove("Giphy--search");
						giphy.handleSearchClick();
						expect(giphy.request).toHaveBeenCalled();
					});
				});

				describe("handleEnter", function () {
					beforeEach(function () {
						spyOn(giphy, "request").and.callFake(function () {
							var d = $.Deferred();
							d.resolve();
							return d.promise();
						});
						spyOn(giphy, "handleResponse");
					});

					it("should call search method for enter key", function () {
						giphy.element.value = "42";
						giphy.handleEnter({ which: 13 });
						expect(giphy.request).toHaveBeenCalledWith("42");
					});

					it("should not call search method for non-enter key", function () {
						giphy.handleEnter({ which: 10 });
						expect(giphy.request).not.toHaveBeenCalled();
					});

					it("should call handleResponse method on resolved search promise", function () {
						giphy.handleEnter({ which: 13 });
						expect(giphy.handleResponse).toHaveBeenCalled();
					});
				});

				describe("handleListUpdated", function () {
					it("should set the list instance to argument", function () {
						giphy.handleListUpdated({ detail: listOfGifs });
						expect(giphy.items).toBe(listOfGifs);
					});

					it("should reset the itemIndex", function () {
						giphy.handleListUpdated({ detail: [] });
						expect(giphy.itemIndex).toBe(0);
					});

					it("should call the preload method", function () {
						spyOn(giphy, "preload");
						giphy.handleListUpdated({ detail: listOfGifs });
						expect(giphy.preload).toHaveBeenCalledWith(listOfGifs);
					});

					it("should add the Giphy--search class", function () {
						spyOn(giphy.giphy.classList, "add");
						giphy.handleListUpdated({ detail: listOfGifs });
						expect(giphy.giphy.classList.add).toHaveBeenCalledWith("Giphy--search");
					});

					it("should append an image to gif", function () {
						spyOn(giphy.giphy, "appendChild");
						giphy.handleListUpdated({ detail: listOfGifs });
						expect(giphy.giphy.appendChild).toHaveBeenCalledWith(giphy.gif);
					});

					it("should show the controls", function () {
						spyOn(giphy.controls, "removeAttribute");
						giphy.handleListUpdated({ detail: listOfGifs });
						expect(giphy.controls.removeAttribute).toHaveBeenCalledWith("hidden");
					});
				});

				describe("handleItemUpdated", function () {
					beforeEach(function () {
						giphy.handleListUpdated({ detail: listOfGifs });
					});

					it("should update $gif src to item's url", function () {
						spyOn(giphy.gif, "setAttribute");
						giphy.handleItemUpdated({ detail: gif });
						expect(giphy.gif.setAttribute).toHaveBeenCalledWith("src", gif.url);
					});

					it("should update the data-count attribute", function () {
						spyOn(giphy.controls, "setAttribute");
						giphy.handleItemUpdated({ detail: gif });
						expect(giphy.controls.setAttribute).toHaveBeenCalledWith("data-count", "1 of 3");
					});

					it("should blur the $gif", function () {
						spyOn(giphy.gif, "blur");
						giphy.handleItemUpdated({ detail: gif });
						expect(giphy.gif.blur).toHaveBeenCalled();
					});
				});

				describe("reset", function () {
					beforeEach(function () {
						giphy.handleListUpdated({ detail: listOfGifs });
					});

					it("should hide controls", function () {
						spyOn(giphy.controls, "setAttribute");
						giphy.reset();
						expect(giphy.controls.setAttribute).toHaveBeenCalledWith("hidden", "hidden");
					});

					it("should remove the gif", function () {
						spyOn(giphy.gif.parentNode, "removeChild");
						giphy.reset();
						expect(giphy.gif.parentNode.removeChild).toHaveBeenCalled();
					});

					it("should remove the Giphy--serach class", function () {
						spyOn(giphy.giphy.classList, "remove");
						giphy.reset();
						expect(giphy.giphy.classList.remove).toHaveBeenCalledWith("Giphy--search");
					});
				});

				describe("preload", function () {
					it("should create images for each gif", function () {
						var images = giphy.preload(listOfGifs);
						expect(images).toEqual(jasmine.any(Array));
						expect(images.length).toBe(3);
					});
				});

				describe("navigate", function () {
					beforeEach(function () {
						spyOn(Element.prototype, "dispatchEvent");
						giphy.handleListUpdated({ detail: listOfGifs });
					});

					it("should increase the index when passing a positive number", function () {
						giphy.navigate(1);
						expect(giphy.itemIndex).toBe(1);
					});

					it("should decrease the index when passing a negative number", function () {
						var maxIndex = listOfGifs.length - 1;
						giphy.itemIndex = maxIndex;
						giphy.navigate(-1);
						expect(giphy.itemIndex).toBe(maxIndex - 1);
					});

					it("should not increase past the length", function () {
						var maxIndex = listOfGifs.length - 1;
						giphy.itemIndex = maxIndex;
						giphy.navigate(1);
						expect(giphy.itemIndex).toBe(maxIndex);
					});

					it("should not decrase past 0", function () {
						giphy.navigate(-1);
						expect(giphy.itemIndex).toBe(0);
					});

					it("should trigger the giphy-item-updated event", function () {
						giphy.navigate(1);
						expect(giphy.element.dispatchEvent).toHaveBeenCalled();
					});

					it("should not trigger the event if difference is 0", function () {
						giphy.navigate(0);
						expect(giphy.element.dispatchEvent).not.toHaveBeenCalled();
					});
				});

				describe("request", function () {
					beforeEach(function () {
						spyOn(giphy.options, "fetch");
						spyOn(giphy.options, "encoder").and.returnValue(listOfGifs);
					});

					it("should make a fetch call", function () {
						giphy.request("cats");
						expect(giphy.options.fetch).toHaveBeenCalled();
					});

					it("should use options.url as the url", function () {
						giphy.request("cats");
						var args = giphy.options.fetch.calls.first().args[0];
						expect(args).toBe(giphy.options.ajax.url);
					});

					it("should use call the options.encoder", function () {
						giphy.request("cats");
						expect(giphy.options.encoder).toHaveBeenCalledWith({
							searchTerm: "cats",
							apiKey: giphy.options.ajax.apiKey,
							rating: giphy.options.ajax.rating
						});
					});

					it("should use the results from options.encoder as data", function () {
						giphy.request("cats");
						var args = giphy.options.fetch.calls.first().args[1];
						expect(args).toBe(listOfGifs);
					});
				});

				describe("handleResponse", function () {
					var response = {
						data: [{ images: { downsized: { url: "1" } } }, { images: { downsized: { url: "2" } } }, { images: { downsized: { url: "3" } } }]
					};
					beforeEach(function () {
						spyOn(giphy.options, "decoder").and.returnValue(listOfGifs);
						spyOn(giphy.element, "dispatchEvent");
					});

					it("should call the options.decoder", function () {
						giphy.handleResponse(response);
						expect(giphy.options.decoder).toHaveBeenCalledWith(response);
					});

					it("should trigger the giphy-list-updated event", function () {
						giphy.handleResponse(response);
						var args = giphy.element.dispatchEvent.calls.allArgs();
						var passed = args.some(function (arg) {
							var customEvent = arg[0];
							if (customEvent instanceof CustomEvent && customEvent.type === "giphy-list-updated" && customEvent.detail === listOfGifs) {
								return true;
							}
						});
						expect(passed).toBe(true);
					});

					it("should trigger the giphy-item-updated event", function () {
						giphy.handleResponse(response);
						var args = giphy.element.dispatchEvent.calls.allArgs();
						var passed = args.some(function (arg) {
							var customEvent = arg[0];
							if (customEvent instanceof CustomEvent && customEvent.type === "giphy-item-updated" && customEvent.detail === listOfGifs[0]) {
								return true;
							}
						});
						expect(passed).toBe(true);
					});
				});
			});
		});
	});
});