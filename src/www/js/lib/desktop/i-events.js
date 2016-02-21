Util.Objects["events"] = new function() {
	this.init = function(scene) {

		scene.resized = function() {
			// u.bug("scene.resized:" + u.nodeId(this));


			// adjust scene width manually to avoid half pixels
			if(page.browser_w > 1200) {
				var excess = page.browser_w-1200;
				var left = Math.round(excess/2);
				var right = excess - left;
				u.as(this, "margin", "0 "+right+"px 0 "+left+"px", false);
			}
			else {
				u.as(this, "margin", 0, false);
			}

		}

		scene.scrolled = function() {
			// u.bug("scene.scrolled:" + u.nodeId(this))
		}


		// perform filtering (days, tags, search)
		scene.filterEvents = function() {

			this._show_markers = [];
			this._hide_marker_count = 0;

			// reset selected event
			if(this.selected_event) {
				u.rc(this.selected_event, "selected");
				this.selected_event = false;
			}


			var i, node;
			for(i = 0; node = this.events[i]; i++) {

				if(this.checkDays(node) && this.checkTags(node) && this.checkSearch(node)) {

					this.showEvent(node);
				} 
				else {

					this.hideEvent(node);
				}
			}

			// filtering is done - we have enough info to calculate marker animation
			this.showDelayed();
		}


		// check if event matches day
		scene.checkDays = function(event_node) {
//			u.bug("selected_day:" + this.selected_day);

			// if no day is selected or event matched selected day
			if(!this.selected_day || this.selected_day == event_node._day) {
				return true;
			}
			return false;
		}

		// check if event matches tags
		scene.checkTags = function(event_node) {

			// no tags are selected - all events are valid
			if(this.selected_tags.length == 0) {

				return true;
			} 
			// loop through selected tags for each event
			else {

				var i, tag;
				for(i = 0; tag = this.selected_tags[i]; i++) {

					// check if node dosen't have tag
					if(event_node.tags_array.indexOf(tag) == -1) {
						return false;
					}
				}
			}

			return true;	
		}

		// check if event matches search
		scene.checkSearch = function(event_node) {

			// if no search or event matches search-string
			if(!this.selected_search || event_node._host._string.match(this.selected_search) || event_node._name._string.match(this.selected_search) || event_node._location._string.match(this.selected_search)) {
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
				node._description = u.qs("div.description", node);
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
				node._marker_shown = false;

				node.org_height = node.offsetHeight;

				node._day = u.cv(node, "day").toLowerCase();
				node._name = u.qs(".name", node);
				node._host = u.qs(".host", node);
				node._location = u.qs(".location a", node);
				node._location_p = u.qs(".location", node);

				node._latitude = node._location.parentNode.getAttribute("data-latitude");
				node._longitude = node._location.parentNode.getAttribute("data-longitude");

				node._text = u.qs(".text", node);

				node._facebook = u.qs(".text .action a", node);


				// prepare content for map infoWindow
				node._infowindow_content = document.createElement("div");
				u.ac(node._infowindow_content, "gmapInfo");
				u.ae(node._infowindow_content, node._name.cloneNode(true));
				u.ae(node._infowindow_content, node._text.cloneNode(true));

				node._infowindow_content_simple = document.createElement("div");
				u.ac(node._infowindow_content_simple, "gmapInfo");
				u.ae(node._infowindow_content_simple, node._name.cloneNode(true));


				if(u.e.event_pref == "mouse") {
					u.linkScrambler(node._facebook);
				}


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


//				u.ae(node._infowindow_content, node._facebook.cloneNode(true));


				node.clicked = function(event) {

					// inject img
					if(!this._image.is_loaded) {
						this._image.src = this._image_src;
						this._image.is_loaded = true;
					}

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
						u.as(this, "height", this.org_height + "px");
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

				// add link scrambling
				if(u.e.event_pref == "mouse") {
					u.linkScrambler(day);
				}

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

		// initialize all tags
		scene.initTags = function() {

			this.tags_list = u.qs(".tag_list", this);
			this.all_tags = u.ie(this.tags_list, "li", {"class":"all selected","html":"Alle"});
			this.tags = u.qsa("li", this.tags_list);

			var i, tag;
			for(i = 0; tag = this.tags[i]; i++) {

				tag.scene = this;
				tag.tag_string = tag.innerHTML;

				// add text scrambler
				if(u.e.event_pref == "mouse") {
					u.linkScrambler(tag);
				}

				tag.clicked = function() {

					// reset the search field
					if(this.scene.input_search) {
						this.scene.input_search.value = this.scene.input_search.default_value;
						this.scene.selected_search = "";
					}


					// all tags clicked
					if(u.hc(this, "all")) {

						// unselect all tags
						var i, tag;
						for(i = 0; tag = this.scene.tags[i]; i++) {
							u.rc(tag, "selected");
						}

						// select all tags
						u.ac(this.scene.all_tags, "selected")

						// empty tag scope
						this.scene.selected_tags = [];

					} 
					// selected tag clicked
					else if(u.hc(this, "selected")){

						// unselect tag
						u.rc(this, "selected");

						// remove tag from tag scope
						this.scene.selected_tags.splice(this.scene.selected_tags.indexOf(this.tag_string), 1);

						// no more node selected? highlight ALL again
						if(this.scene.selected_tags.length == 0) {
							u.ac(this.scene.all_tags, "selected");
						}

					}
					// new tag clicked
					else {

						// unselect "all"-tag
						u.rc(this.scene.all_tags, "selected")

						// select this tag
						u.ac(this, "selected");

						// add tag to tag scope
						this.scene.selected_tags.push(this.tag_string)
					}

					// perform filtering
					this.scene.filterEvents();

				}
				u.ce(tag)

			}
		}

		// initialize search
		scene.initSearch = function() {

			this.form_search = u.qs("form.search", this);
			this.input_search = u.qs("input", this.form_search);
			this.input_search.default_value = "Skriv her";
			this.input_search.scene = this;

			// setting default value
			this.input_search.value = this.input_search.default_value;

			// remove default value
			this.input_search.focused = function() {

				if(this.value == this.default_value) {
					this.value = "";
				} 
			}

			// restore default value if no custom value is present
			this.input_search.blurred = function() {

				if(this.value == "") {
					this.value = this.default_value;
				} 
			}

			// perform search
			this.input_search.keySearch = function() {

				// update seach-string
				this.scene.selected_search = this.value.toLowerCase();

				// perform filtering
				this.scene.filterEvents();
			}

			// listen for key-up
			this.input_search.keyUp = function(event) {

				u.t.resetTimer(this.t_search)

				// start seach after 300ms
				this.t_search = u.t.setTimer(this, this.keySearch, 300);
			}

			// listen for key-down (kill enter)
			this.input_search.keyDown = function(event) {
				if(event.keyCode == 13) {
					u.e.kill(event);
				}
			}

			// add event listeners
			u.e.addEvent(this.input_search, "focus", this.input_search.focused);
			u.e.addEvent(this.input_search, "blur", this.input_search.blurred);
			u.e.addEvent(this.input_search, "keyup", this.input_search.keyUp);
			u.e.addEvent(this.input_search, "keydown", this.input_search.keyDown);
		}

		// initialize filter panel
		scene.initFilters = function() {

			// open close advanced search
			this.filter = u.qs(".filter", this);
			this.filter.scene = this;

			this.filter.h2 = u.qs("h2", this.filter);
			this.filter.h2.filter = this.filter;

			this.filter.tag_list = u.qs("ul.tag_list", this.filter);


			// add scramble for title
			if(u.e.event_pref == "mouse") {
				this.filter.h2.fixed_width = true;
				u.linkScrambler(this.filter.h2);
			}

			// get initial height
			this.filter.org_height = this.filter.offsetHeight;

			// set initial width and height
			u.ass(this.filter, {"height" : "32px", "width" : "100px"});
			u.as(this.filter.tag_list, "display", "none");
			u.as(this.form_search, "display", "none");


			// open/close filter
			this.filter.h2.clicked = function() {

				if(typeof(this.unscramble) == "function") {
					this.unscramble();
				}

				// open filter
				if(!this.filter.open) {

					this.filter.transitioned = function() {

						u.as(this, "height", "auto");

						u.as(this.tag_list, "display", "block");
						u.as(this.scene.form_search, "display", "block");

						u.a.transition(this.tag_list, "all 0.5s ease-out");
						u.as(this.tag_list, "opacity", 1);

						u.a.transition(this.scene.form_search, "all 0.5s ease-out");
						u.as(this.scene.form_search, "opacity", 1);

						this.h2.innerHTML = "Luk";
						this.h2.scramble_text = this.h2.innerHTML;
					}

					u.ac(this.filter, "open");
					u.a.transition(this.filter, "all 0.5s ease-out");
					u.ass(this.filter, {"width" : "100%", "height" : this.filter.org_height + "px"});

					this.filter.open = true;

				}

				// close filter
				else {

					this.filter.transitioned = function() {

						u.as(this.tag_list, "display", "none");
						u.as(this.scene.form_search, "display", "none");

						this.h2.innerHTML = "Søg";
						this.h2.scramble_text = this.h2.innerHTML;
					}

					u.rc(this.filter, "open");

					u.a.transition(this.filter.tag_list, "all 0.3s ease-out");
					u.as(this.filter.tag_list, "opacity", 0);

					u.a.transition(this.filter.scene.form_search, "all 0.3s ease-out");
					u.as(this.filter.scene.form_search, "opacity", 0);

					// return to pixal state to be able to animate
					u.as(this.filter, "height", this.filter.org_height + "px");

					u.a.transition(this.filter, "all 0.3s ease-out");
					u.ass(this.filter, {"width" : "100px", "height" : "32px"});

					this.filter.open = false;

				}
			}

			u.ce(this.filter.h2);
		}


		// initialize map
		scene.initMap = function() {

			this.view_options = u.ie(this.div_events, "ul", {"class":"view_options"});
			this.insertBefore(this.view_options, this.div_events);

			this.view_map = u.ae(this.view_options, "li", {"class":"map", "html":"Kort"});
			this.view_list = u.ae(this.view_options, "li", {"class":"list selected", "html":"Liste"});

			this.view_map.scene = this;
			this.view_list.scene = this;
			this.current_view = "list";

			u.e.click(this.view_map);
			this.view_map.clicked = function() {

				if(this.scene.current_view == "list") {

					this.scene.current_view = "map";
					u.ac(this.scene.view_map, "selected");
					u.rc(this.scene.view_list, "selected");

					this.scene.div_events.transitioned = function() {

						u.as(this, "display", "none");

						if(!this.scene.map) {
							this.scene.map_div = u.ae(this.scene, "div", {"class":"mapwrap"});
							this.scene.map = u.ae(this.scene.map_div, "div", {"class":"map"});

							u.ae(this.scene.map_div, u.qs(".downloadmap", this).cloneNode(true));
							this.scene.map.scene = this.scene;
							this.scene.map_div.scene = this.scene;
						}


						u.as(this.scene.map_div, "display", "block");
						u.as(this.scene.map_div, "transform", "translate(0, "+page.browser_h+"px) rotate(-10deg)");



						this.scene.map.APIloaded = function() {
							u.bug("map API loaded")
							this._map_loaded = true;
							u.googlemaps.infoWindow(this.g_map);

						}
						this.scene.map.loaded = function() {
							u.bug("map loaded")


							u.rc(this.scene, "loading");

							this.scene.map_div.transitioned = function() {

								this.scene.filterEvents();

							}

							u.a.transition(this.scene.map_div, "all 0.5s ease-in");
							u.as(this.scene.map_div, "transform", "translate(0, 0) rotate(0)");


						}

						if(!this.scene.map._map_loaded) {
							u.ac(this.scene, "loading");
							u.googlemaps.map(this.scene.map, [55.67667,12.56678], {"zoom":13, "scrollwheel":false});
						}
						else {
							this.scene.map.loaded();
						}

					}

					u.a.transition(this.scene.div_events, "all 0.5s ease-in");
					u.as(this.scene.div_events, "transform", "translate(0, "+page.browser_h+"px) rotate(10deg)");


					
				}
			}

			u.e.click(this.view_list);
			this.view_list.clicked = function() {

				if(this.scene.current_view == "map") {

					this.scene.current_view = "list";
					u.rc(this.scene.view_map, "selected");
					u.ac(this.scene.view_list, "selected");


					var i, node;
					for(i = 0; node = this.scene.events[i]; i++) {

						u.rc(node, "selected", false);
						u.as(node, "height", this.scene.event_height+"px", false);
					}


					this.scene.map_div.transitioned = function() {
						u.as(this, "display", "none");

						this.scene.hideAllMarkers();

						u.as(this.scene.div_events, "display", "block");
						u.a.transition(this.scene.div_events, "all 0.5s ease-in");
						u.as(this.scene.div_events, "transform", "translate(0, 0) rotate(0)");


					}
					u.a.transition(this.scene.map_div, "all 0.5s ease-in");
					u.as(this.scene.map_div, "transform", "translate(0, "+page.browser_h+"px) rotate(-10deg)");

				}
			}


		}



		// get scene ready
		scene.ready = function() {

			// global variables
			this.selected_day = "";
			this.selected_tags = [];
			this.selected_search = "";

			this.h1 = u.qs("h1", this);
			this.h1.scene = this;
			this.div_events = u.qs("div.events", this);
			this.div_events.scene = this;

			this.div_filters = u.qs("div.filters", this);


			// initializing events
			this.initEvents();
			this.initDays();
			this.initTags();
			this.initSearch();
			this.initFilters();
			this.initMap();


			u.as(this.h1, "transform", "translate(0, -300px) rotate(10deg)");
			u.as(this.div_filters, "transform", "translate(0, -300px) rotate(10deg)");
			u.as(this.div_events, "transform", "translate(0, "+page.browser_h+"px) rotate(10deg)");

			// resize grid
			this.resized();


			this.is_ready = true;
			page.cN.ready();

		}

		// hide all markers on exit to be ready for re-entry animation
		scene.hideAllMarkers = function() {

			var i, node;
			for(i = 0; node = this.events[i]; i++) {
				if(node._marker_shown && node.marker) {
					u.googlemaps.removeMarker(node.marker.g_map, node.marker, {"animation":false});
					node._marker_shown = false;
				}
			}

		}

		// show markers (after hiding is done)
		scene.showDelayed = function() {

//			u.bug("show delayed")
			var i, node;
			for(i = 0; node = this._show_markers[i]; i++) {
				u.t.setTimer(node, this._showDelayed, (this._hide_marker_count*50) + 100 + (i*150));
			}

		}

		// mapped to node
		scene._showDelayed = function() {
			this.marker = u.googlemaps.addMarker(this.scene.map.g_map, [this._latitude, this._longitude]);
			this.marker._node = this;
			this.marker.entered = function() {

				if(this.g_map.g_infowindow._marker != this) {
					u.googlemaps.hideInfoWindow(this.g_map);
					u.googlemaps.showInfoWindow(this.g_map, this, this._node._infowindow_content_simple);
				}

			}

			this.marker.exited = function() {
//				u.bug("marker exited:" + this._clicked_to_open);
				
				if(!this._clicked_to_open) {
					u.googlemaps.hideInfoWindow(this.g_map);
				}

			}

			this.marker.clicked = function() {
//				u.bug("marker opened");

				u.googlemaps.hideInfoWindow(this.g_map);
				u.googlemaps.showInfoWindow(this.g_map, this, this._node._infowindow_content);


				var link = u.qs(".action a", this._node.scene.map);
				u.linkScrambler(link);


				this._clicked_to_open = true;

			}

			this.marker.closed = function() {
//				u.bug("marker closed");
				this._clicked_to_open = false;
			}

		}

		// mapped to node
		scene._hideDelayed = function() {

			u.googlemaps.removeMarker(this.marker.g_map, this.marker);

		}

		// show event
		scene.showEvent = function(node) {

//			u.bug("show event:" + u.nodeId(node))

			if(this.current_view == "map" && !node._marker_shown) {

				this._show_markers.push(node);
				node._marker_shown = true;
			}

			if(!node._shown) {

				node.transitioned = null;
				if(this.current_view == "list") {
					u.a.transition(node, "all 0.3s ease-out");
				}
				u.as(node, "display", "block");
				u.as(node, "height", this.event_height + "px");
			
				node._shown = true;
			}

		}

		// hide event
		scene.hideEvent = function(node) {


			if(this.current_view == "map" && node._marker_shown) {
				this._hide_marker_count++;

				u.t.setTimer(node, this._hideDelayed, this._hide_marker_count*50);
				node._marker_shown = false;
			}

			if(node._shown) {

				if(this.current_view == "map") {
					u.as(node, "display", "none");
				}
				else {
					u.a.transition(node, "all 0.3s ease-out");
					node.transitioned = function() {
						u.as(this, "display", "none");
					}
				}

				u.as(node, "height", "0px");

				node._shown = false;
			}
			
		}


		// build scene - start actual rendering of scene
		scene.build = function() {

			if(!this.is_built) {
// 				u.bug("scene.build:" + u.nodeId(this));

				this.is_built = true;
				u.a.opacity(this, 1);

				u.a.transition(this.h1, "all 0.6s ease-in-out");
				u.as(this.h1, "transform", "translate(0, 0) rotate(0)");
				u.a.transition(this.div_filters, "all 0.6s ease-in-out");
				u.as(this.div_filters, "transform", "translate(0, 0) rotate(0)");
				u.a.transition(this.div_events, "all 0.6s ease-in-out");
				u.as(this.div_events, "transform", "translate(0, 0) rotate(0)");

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

			this.h1.transitioned = function() {

				// destruction is done
				this.scene.finalizeDestruction();
			}

			u.a.transition(this.h1, "all 0.6s ease-in-out");
			u.as(this.h1, "transform", "translate(0, -300px) rotate(10deg)");
			u.a.transition(this.div_filters, "all 0.6s ease-in-out");
			u.as(this.div_filters, "transform", "translate(0, -300px) rotate(10deg)");
			if(this.current_view == "list") {
				u.a.transition(this.div_events, "all 0.6s ease-in-out");
				u.as(this.div_events, "transform", "translate(0, "+page.browser_h+"px) rotate(-10deg)");
			}
			else {
				u.a.transition(this.map, "all 0.6s ease-in-out");
				u.as(this.map, "transform", "translate(0, "+page.browser_h+"px) rotate(-10deg)");
			}

		}


		// scene is ready
		scene.ready();
	}
}
