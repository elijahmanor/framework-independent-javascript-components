(function (global, factory) {
	if (typeof define === "function" && define.amd) {
		define(["module", "exports"], factory);
	} else if (typeof exports !== "undefined") {
		factory(module, exports);
	} else {
		var mod = {
			exports: {}
		};
		factory(mod, mod.exports);
		global.Giphy = mod.exports;
	}
})(this, function (module, exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	function _classCallCheck(instance, Constructor) {
		if (!(instance instanceof Constructor)) {
			throw new TypeError("Cannot call a class as a function");
		}
	}

	var _createClass = function () {
		function defineProperties(target, props) {
			for (var i = 0; i < props.length; i++) {
				var descriptor = props[i];
				descriptor.enumerable = descriptor.enumerable || false;
				descriptor.configurable = true;
				if ("value" in descriptor) descriptor.writable = true;
				Object.defineProperty(target, descriptor.key, descriptor);
			}
		}

		return function (Constructor, protoProps, staticProps) {
			if (protoProps) defineProperties(Constructor.prototype, protoProps);
			if (staticProps) defineProperties(Constructor, staticProps);
			return Constructor;
		};
	}();

	var Giphy = function () {
		function Giphy(element, options) {
			_classCallCheck(this, Giphy);

			this.element = element;
			this.options = _.merge({}, Giphy.defaults, options);
			this.init();
		}

		_createClass(Giphy, [{
			key: "init",
			value: function init() {
				this.giphy = this.createElementFromString(this.options.templates.wrapper);
				this.element.parentNode.replaceChild(this.giphy, this.element);
				this.giphy.appendChild(this.element);

				this.search = this.createElementFromString(this.options.templates.search);
				this.giphy.appendChild(this.search);

				this.controls = this.createElementFromString(this.options.templates.controls);
				this.controls.setAttribute("hidden", "hidden");
				this.giphy.appendChild(this.controls);

				this.prev = this.controls.querySelector(".Giphy-prev");
				this.next = this.controls.querySelector(".Giphy-next");

				this.wireEventHandlers();
			}
		}, {
			key: "createElementFromString",
			value: function createElementFromString(markup) {
				var wrapper = document.createElement("div");
				wrapper.innerHTML = markup;
				return wrapper.firstChild;
			}
		}, {
			key: "wireEventHandlers",
			value: function wireEventHandlers() {
				this.controls.addEventListener("keydown", this.handleControlKey.bind(this));
				this.prev.addEventListener("click", this.navigate.bind(this, -1));
				this.next.addEventListener("click", this.navigate.bind(this, +1));
				this.search.addEventListener("click", this.handleSearchClick.bind(this));
				this.element.addEventListener("keypress", this.handleEnter.bind(this));
				this.element.addEventListener("giphy-list-updated", this.handleListUpdated.bind(this));
				this.element.addEventListener("giphy-item-updated", this.handleItemUpdated.bind(this));
			}
		}, {
			key: "handleControlKey",
			value: function handleControlKey(e) {
				switch (e.which) {
					case 37:
						this.navigate(-1);break;
					case 39:
						this.navigate(+1);break;
				}
			}
		}, {
			key: "handleSearchClick",
			value: function handleSearchClick(e) {
				if (!this.giphy.classList.contains("Giphy--search")) {
					this.request(this.element.value).then(this.handleResponse.bind(this));
				} else {
					this.reset();
				}
			}
		}, {
			key: "handleEnter",
			value: function handleEnter(e) {
				if (e.which === 13) {
					this.request(this.element.value).then(this.handleResponse.bind(this));
				}
			}
		}, {
			key: "handleListUpdated",
			value: function handleListUpdated(e) {
				var list = e.detail;
				this.items = list;
				this.itemIndex = 0;
				this.preload(list);
				this.giphy.classList.add("Giphy--search");
				this.gif = document.createElement("img");
				this.giphy.appendChild(this.gif);
				this.controls.removeAttribute("hidden");
			}
		}, {
			key: "handleItemUpdated",
			value: function handleItemUpdated(e) {
				var item = e.detail;
				this.gif.setAttribute("src", item.url);
				this.controls.setAttribute("data-count", this.itemIndex + 1 + " of " + this.items.length);
				this.gif.blur();
			}
		}, {
			key: "reset",
			value: function reset() {
				this.controls.setAttribute("hidden", "hidden");
				this.gif.parentNode.removeChild(this.gif);
				this.giphy.classList.remove("Giphy--search");
			}
		}, {
			key: "preload",
			value: function preload(gifs) {
				var preloaded = [];
				gifs.forEach(function (gif, index) {
					preloaded[index] = new Image();
					preloaded[index].src = gif.url;
				});
				return preloaded;
			}
		}, {
			key: "navigate",
			value: function navigate(difference) {
				if (difference < 0) {
					if (this.itemIndex >= 1) {
						this.itemIndex--;
					}
				} else if (difference > 0) {
					if (this.itemIndex < this.items.length - 1) {
						this.itemIndex++;
					}
				} else {
					return;
				}

				var itemUpdatedEvent = new CustomEvent("giphy-item-updated", {
					"detail": this.items[this.itemIndex]
				});
				this.element.dispatchEvent(itemUpdatedEvent);
			}
		}, {
			key: "request",
			value: function request(value) {
				return this.options.fetch(this.options.ajax.url, this.options.encoder({
					searchTerm: value,
					apiKey: this.options.ajax.apiKey,
					rating: this.options.ajax.rating
				}));
			}
		}, {
			key: "handleResponse",
			value: function handleResponse(response) {
				var list = this.options.decoder(response);
				var item = list && list.length ? list[0] : {};
				var listUpdatedEvent = new CustomEvent("giphy-list-updated", {
					"detail": list
				});
				var itemUpdatedEvent = new CustomEvent("giphy-item-updated", {
					"detail": item
				});
				this.element.dispatchEvent(listUpdatedEvent);
				this.element.dispatchEvent(itemUpdatedEvent);
			}
		}]);

		return Giphy;
	}();

	exports.default = Giphy;


	Giphy.defaults = {
		templates: {
			wrapper: "<div class='Giphy'></div>",
			search: "<div class='Giphy-toggle'></div>",
			controls: "<div class='Giphy-controls' tabindex='0'><span class='Giphy-prev'></span><span class='Giphy-next'></span></div>"
		},
		ajax: {
			url: "//api.giphy.com/v1/gifs/search",
			apiKey: "dc6zaTOxFJmzC",
			rating: "g"
		},
		encoder: function encoder(data) {
			return {
				q: data.searchTerm,
				api_key: data.apiKey, // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
				rating: data.rating
			};
		},
		decoder: function decoder(response) {
			var list = response && response.data || [];
			return list.map(function (item) {
				return { url: item.images.downsized.url };
			});
		},
		params: function params(data) {
			if (data) {
				return "?" + Object.keys(data).map(function (key) {
					return key + "=" + encodeURIComponent(data[key]);
				}).join("&");
			}
			return "";
		},
		fetch: function fetch(url, data) {
			var _this = this;

			return new Promise(function (resolve, reject) {
				url += _this.params(data);
				window.fetch(url).then(function (response) {
					response.json().then(function (json) {
						return resolve(json);
					});
				}).catch(function (exception) {
					return reject(exception);
				});
			});
		}
	};
	module.exports = exports['default'];
});