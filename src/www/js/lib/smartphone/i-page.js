
Util.Objects["page"] = new function() {
	this.init = function(page) {

		if(u.hc(page, "i:page")) {

			// remove initializer class
			u.rc(page, "i:page");

			// header reference
			page.hN = u.qs("#header");

			// content reference
			page.cN = u.qs("#content", page);

			// navigation reference
			page.nN = u.qs("#navigation", page);

			// footer reference
			page.fN = u.qs("#footer");


			// add global video player
			page.videoPlayer = u.videoPlayer();


			// global resize handler 
			page.resized = function(event) {
//				u.bug("page.resized");

				// update global values
				page.browser_w = u.browserW();
				page.browser_h = u.browserH();


				// navigation adjustments
				// var i, item;
				// if(page.nN.items) {
				// 	for(i = 0; item = page.nN.items[i]; i++) {
				// 		u.ass(item, {"height" : ((u.browserH()-50) / 4) + "px"});
				// 	}

				// 	// resize open navigation
				// 	if(u.hc(page.nN, "open")) {
				// 		u.ass(page.nN, {"height" : u.browserH()+"px", "width" : page.browser_w+"px"});
				// 	}
				// }

				// forward scroll event to current scene
				if(page.cN && page.cN.scene && typeof(page.cN.scene.resized) == "function") {
					page.cN.scene.resized();
				}

				page.offsetHeight;
			}

			// global scroll handler 
			page.scrolled = function(event) {
//				u.bug("page.scrolled:" + u.nodeId(this))

				// update global values
				page.scroll_y = u.scrollY();


				// forward scroll event to current scene
				if(page.cN && page.cN.scene && typeof(page.cN.scene.scrolled) == "function") {
					page.cN.scene.scrolled();
				}

				page.offsetHeight;
			}

			// global orientation change handler
			page.orientationchanged = function(event) {
				page.resized();
			}



			// Page is ready
			page.ready = function() {
//				u.bug("page.ready called:" + u.nodeId(this));

				// page is ready to be shown - only initalize if not already shown
				if(!this.is_ready) {
//					u.bug("page initialization:" + u.nodeId(this));

					// page is ready
					this.is_ready = true;


					// map the current scene
					this.cN.scene = u.qs(".scene", this.cN);


					// set scroll handler
					u.e.addEvent(window, "scroll", page.scrolled);

					// set orientation change handler
					if(u.e.event_pref == "touch") {
						u.e.addEvent(window, "orientationchange", page.orientationchanged);
					}
					// set resize handler
					else {
						u.e.addEvent(window, "resize", page.resized);
					}

					// build header
					this.initHeader();

					// resize / scroll straight away to adjust widths
					this.resized();
					this.scrolled();


					// start intro
					this.initIntro();


					// build navigation
					this.initNavigation();


					// enable ajax navigation
					u.navigation();


					// initialize current scene
					u.init(this.cN);
				}

			}


			// Content is ready - called from page.ready, scene and intro to make sure
			// we are at the correct state before showing the content and starting the scene rendering
			page.cN.ready = function() {
//				u.bug("page.cN ready called")


				// is page in a state to continue
				if(!page.intro && page.is_ready && page.cN.scene.is_ready) {

					// show page content
					if(!page.cN.is_ready) {
//						u.a.transition(page.cN, "all 0.5s ease-in");
						u.a.transition(page.logo, "all 0.5s ease-in");
						u.a.transition(page.hN, "all 0.5s ease-in");

						u.a.opacity(page.cN, 1);
						u.a.opacity(page.logo, 1);
						u.a.opacity(page.hN, 1);
						page.cN.is_ready = true;
					}

					// if existing scene exists, then destroy it
					// destroy will callback to this function and start the build when approriate
					// start destroying process for all notes but new scene
					var destroying = false;
					var scenes = u.qsa(".scene", this);
					for(i = 0; scene = scenes[i]; i++) {
						if(scene != this.scene){
							if(typeof(scene.destroy) == "function") {
//								u.bug("should destroy first")
								destroying = true;
								scene.destroy();
							}
						}
					}

					if(!destroying && this.scene && !this.scene.built && typeof(this.scene.build) == "function") {
//						u.bug("should build")

						// take page back to top
						window.scrollTo(0, 0);

						this.scene.built = true;
						this.scene.build();
					}

				}

			}


			// navigation controller
			page.cN.navigate = function(url) {
//				u.bug("cN.navigate:" + url)

				// content received
				this.response = function(response) {
//					u.bug("navigate response:" + response.body_class)

					// set body class
					u.setClass(document.body, response.body_class);
					// set title
					document.title = response.head_title;

					// get .scene content from response
					this.scene = u.qs(".scene", response);

					// append new scene to #content
					this.scene = u.ae(this, this.scene);

					// init content - will callback to ready when done
					u.init(this);

				}
				// request new content
				u.request(this, u.h.getCleanHash(url));

			}


			// initialize header
			page.initHeader = function() {
//				u.bug("initHeader")

				// logo
				page.logo = u.ae(page, "div", {"class":"logo"});
				u.ce(page.logo);
				page.logo.clicked = function() {
					u.h.navigate("/");
				}


				// get the navigation node from the servicenavigation
				page.bn_nav = u.qs("ul.servicenavigation li.navigation", page.hN);
				page.bn_nav.a = u.qs("a", page.bn_nav);
				page.nN.items = u.qsa("ul li h4",page.nN);

				// very simple navigation toggle
				u.ce(page.bn_nav);
				page.bn_nav.clicked = function() {

					// close navigation
					if(u.hc(page.nN, "open")) {

						this.a.innerHTML = "Menu";
						u.rc(this, "open");

						page.nN.transitioned = function() {
							u.rc(this, "open");
						}
						u.a.transition(page.nN, "all 0.3s ease-in");
						u.ass(page.nN, {"width":0, "height":0, "top": "40px", "right": "60px"});

					}
					// open navigation
					else {

						// for mobile alculate height on every opeing of the menu
						if(page.nN.items) {
							for(i = 0; item = page.nN.items[i]; i++) {
								console.log(item)
								u.ass(item, {"height" : ((u.browserH()-50) / 4) + "px"});
							}
						}

						u.ac(page.nN, "open");

						this.a.innerHTML = "Luk";
						u.ac(this, "open");

						u.a.transition(page.nN, "all 0.3s ease-out");
						u.ass(page.nN, {"width":page.browser_w+"px", "height":window.innerHeight+"px", "top": 0, "right": 0});

					}

				}

			}


			// setup and activate Navigation
			page.initNavigation = function() {
//				u.bug("initNavigation")

				var i, node;

				// no scrolling in navigation
				u.e.drag(page.nN, page.nN);

				// navigation nodes
				page.nN.nodes = u.qsa("li", page.nN);
				for(i = 0; node = page.nN.nodes[i]; i++) {

					// all navigation nodes except "buy"
					if(!u.hc(node, "buy")) {
						u.ce(node);
						node.clicked = function(event) {

							// save next url to process after navigation has been removed
							page.nN.next_url = this.url;

							page.bn_nav.clicked();
							// remove navigation
							page.nN.transitioned = function() {
								u.rc(this, "open");
								u.h.navigate(this.next_url);
							}

						}

					}
					// the external buy link
					else {
						u.e.click(node);
						node.clicked = function(event) {

							page.bn_nav.clicked();

						}

					}

					// node.vp = u.ae(node, "div", {"class":"vp"});
					// u.as(node.vp, "backgroundImage", "url(/assets/nav_"+node.className.replace(/link/, "").trim()+".jpg)");
					//
					// node.mousedover = function() {
					// 	u.ac(this.vp, "show");
					// }
					//
					// node.mousedout = function() {
					// 	u.rc(this.vp, "show");
					// }
					//
					// u.e.addEvent(node, "touchstart", node.mousedover);
					// u.e.addEvent(node, "touchend", node.mousedout);

				}

			}


			// initialize intro
			page.initIntro = function() {
//				u.bug("initIntro")

				// create intro layer
				if(u.hc(document.body, "front")) {
					page.intro = u.ae(document.body, "div", {"id":"intro"});

					page.intro.loaded = function() {

						u.as(this, "perspectiveOrigin", "50% 50%");
						u.as(this, "perspective", (this.offsetWidth) + "px");

						this.sq = u.ae(this, "div", {"class":"intro_logo"});
						this.sq.intro = this;

						u.as(this.sq, "transform", "rotateX(-720deg) scale(0)");
						u.a.opacity(this.sq, 1);


						this.step1 = function(event) {
//							u.bug("step1")

							u.as(this.sq, "transformOrigin", "50% 52%");

							u.a.transition(this.sq, "all 1s cubic-bezier(0.320, 1.640, 0.700, 0.140) 0.5s", "step1");
							u.as(this.sq, "transform", "rotateX(0) scale(1)");
						}

						this.sq.ended = function() {
//							u.bug("sq ended")


							this.intro.transitioned = function() {
								page.intro.clicked();
							}

							u.a.transition(this.intro, "opacity 0.3s ease-in");
							u.a.opacity(this.intro, 0);
						}



						this.sq.step1 = function() {
//							u.bug("sq step1")

							u.a.transition(this, "none");
							u.as(this, "transform", "rotateX(0) scale(1)");


							u.a.transition(this, "all 0.5s ease-in 1.5s", "ended");
							u.as(this, "transform", "rotateX(720deg) scale(3)");


						}


						u.a.transition(this, "all 1s ease-in", "step1");
						u.a.opacity(this, 1);
					}
					u.preloader(page.intro, ["/img/bg_intro.jpg"]);



					// remove intro
					u.ce(page.intro);
					page.intro.clicked = function() {
//						u.bug("cliecked intro")

						this.parentNode.removeChild(this);
						page.intro = false;

						// notify page.cN.ready to continue content rendering
						page.cN.ready();

					}
//					page.intro.t_click = u.t.setTimer(page.intro, "clicked", 2500);
				}

			}



			// ready to start page builing process
			page.ready();

		}

	}
}


// Controlled initialization
function static_init() {
	u.o.page.init(u.qs("#page"));
}
u.e.addDOMReadyEvent(static_init);
