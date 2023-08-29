Util.Objects["events"] = new function() {
	this.init = function(scene) {

		scene.resized = function() {
			// u.bug("scene.resized:" + u.nodeId(this));

		}

		scene.scrolled = function() {
			// u.bug("scene.scrolled:" + u.nodeId(this))
		}


		// perform filtering (days, tags, search)
		scene.filterEvents = function() {

			// reset selected event
			if(this.selected_event) {
				u.rc(this.selected_event, "selected");
				this.selected_event = false;
			}


			var i, node;
			for(i = 0; node = this.events[i]; i++) {

				if(this.checkDays(node)) {
					
					if(!node._shown) {
						node.transitioned = null;
						u.a.transition(node, "all 0.3s ease-out");
						u.as(node, "display", "block");
						u.as(node, "height", this.event_height + "px");
						
						node._shown = true;
					}

				} 
				else {

					if(node._shown) {

						node.transitioned = function() {
							u.as(this, "display", "none");
						}
						u.a.transition(node, "all 0.3s ease-out");
						u.as(node, "height", "0px");

						node._shown = false;
					}
				}
			}
		}


		// check if event matches day
		scene.checkDays = function(event_node) {

			// if no day is selected or event matched selected day
			if(!this.selected_day || this.selected_day == event_node._day) {
				return true;
			}
			return false;
		}


		// initialize events
		scene.initEvents = function() {

			this.events = u.qsa(".item", this);
			this.event_height = 38;

			var i, node;
			for(i = 0; node = this.events[i]; i++) {

				node.scene = this;

				node._tags = u.qsa("ul.tags li", node);
				node._tags_ul = u.qs("ul.tags", node);
				node._media = u.qs("div.media", node);
				node._media._item_id = u.cv(node._media, "item_id")
				node._media._format = u.cv(node._media, "format")

				node._image_src = "/images/" + node._media._item_id + "/single_media/300x." + node._media._format;
				node._image = u.ae(node._media, "img");


				node.tags_array = [];

				var j, tag;
				for(j = 0; tag = node._tags[j]; j++) {
					node.tags_array.push(tag.innerHTML);
				}

				node._shown = true;
				node._height = node.offsetHeight;

				node._day = u.cv(node, "day").toLowerCase();
				node._name = u.qs(".name", node);
				node._host = u.qs(".host", node);
				node._location_p = u.qs(".location", node);
				node._location = u.qs(".location a", node);
				node._text = u.qs(".text", node);
				node._facebook = u.qs(".text .action a", node);

				u.ae(node._text, node._tags_ul);
				u.ie(node._text, node._location_p);




				u.ce(node._facebook);
				u.ce(node._location);
				node._location.clicked = node._facebook.clicked = function(event) {
					window.open(this.url);
					this.blur();
					u.e.kill(event);
				}

				node._host._string = node._host.innerHTML.toLowerCase()
				node._name._string = node._name.innerHTML.toLowerCase()
				node._location._string = node._location.innerHTML.toLowerCase()

				node.clicked = function(event) {

					// inject img
					// if(!this._image.is_loaded) {
					// 	this._image.src = this._image_src;
					// 	this._image.is_loaded = true;
					// }

					if(u.hc(this, "selected")) {
						u.a.transition(this, "all 0.3s ease-out");
						u.rc(this, "selected");
						this.scene.selected_event = false;
						u.as(this, "height", this.scene.event_height+"px");
					}
					else {
						u.a.transition(this, "all 0.5s ease-out");
						u.ac(this, "selected");
						this.scene.selected_event = this;
						u.as(this, "height", this._height + "px");
					}

					var i, node;
					for(i = 0; node = this.scene.events[i]; i++) {

						if(this.scene.selected_event != node && u.hc(node, "selected")) {
							u.a.transition(node, "all 0.3s ease-out");
							u.rc(node, "selected");
							u.as(node, "height", this.scene.event_height+"px");
						}
					}
				}

				u.e.click(node)
				u.ass(node, {"height": this.event_height+"px"})
			}
		}

		// initalized all days
		scene.initDays = function() {

			this.days_list = u.qs("ul.days", this);
			this.all_days = u.ie(this.days_list, "li", {"class":"all selected","html":"Alle dage"});
			this.days = u.qsa("li", this.days_list);

			var i, day;
			for(i = 0; day = this.days[i]; i++) {

				day.scene = this;
				day.day_string = day.innerHTML.toLowerCase();

				day.clicked = function() {

					// unselection and not "alle dage"
					if(u.hc(this, "selected") && this != this.scene.all_days) {

						u.rc(this, "selected");
						u.ac(this.scene.all_days, "selected");
						this.scene.selected_day = "";

					} 
					// selection
					else {

						// reset all days
						var i, day;
						for(i = 0; day = this.scene.days[i]; i++) {
							u.rc(day, "selected");
						}

						// "alle dage" selected
						if(this == this.scene.all_days) {
							this.scene.selected_day = "";
						}
						// single day selected
						else {
							this.scene.selected_day = this.day_string;
						}

						u.ac(this, "selected");

					}

					// perform filtering
					this.scene.filterEvents();
				}
				u.ce(day)

			}
		}

		// get scene ready
		scene.ready = function() {

			// global variables
			this.selected_day = "";


			// initializing events
			this.initEvents();
			this.initDays();


			this.h1 = u.qs("h1", this);
			this.h1.scene = this;
			this.div_events = u.qs("div.events", this);
			this.div_filters = u.qs("div.filters", this);

			// u.as(this.h1, "transform", "translate(0, -300px) rotate(10deg)");
			// u.as(this.div_filters, "transform", "translate(0, -300px) rotate(10deg)");
			// u.as(this.div_events, "transform", "translate(0, "+page.browser_h+"px) rotate(10deg)");

			this.is_ready = true;
			page.cN.ready();

		}


		// build scene - start actual rendering of scene
		scene.build = function() {

			if(!this.is_built) {
// 				u.bug("scene.build:" + u.nodeId(this));

				this.is_built = true;

				u.a.transition(this, "all 1s linear");
				u.a.opacity(this, 1);

			}
		}


		// destroy scene - scene needs to be removed
		scene.destroy = function() {
//			u.bug("scene.destroy:" + u.nodeId(this))

			// destruction is a one time, oneway street
			this.destroy = null;


			// when destruction is done, remove scene from content and notify content.ready
			// to continue building the new scene
			this.finalizeDestruction = function() {

				this.parentNode.removeChild(this);
				page.cN.ready();

			}

			this.transitioned = function() {

				// destruction is done
				u.t.setTimer(this, this.finalizeDestruction, 300);
			}

			// make up some page destruction
			u.a.transition(this, "all 1s linear");
			u.a.opacity(this, 0);

		}


		// scene is ready
		scene.ready();
	}
}
