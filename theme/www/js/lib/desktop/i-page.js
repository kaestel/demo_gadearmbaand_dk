u.bug_force = true;
u.bug_console_only = true;


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
//				u.bug("page.resized:" + u.nodeId(this));

				// update global values
				page.browser_w = u.browserW();
				page.browser_h = u.browserH();


				// navigation adjustments
				var i, item;
				if(page.nN.items) {
					for(i = 0; item = page.nN.items[i]; i++) {
						u.ass(item, {"height" : page.browser_h / 2 + "px"}, false);
					}

					// resize open navigation
					if(u.hc(page.nN, "open")) {
						u.ass(page.nN, {"height" : page.browser_h+"px", "width" : page.browser_w+"px"}, false);
					}
				}

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
					u.navigation({"node":this});


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
				page.logo.a = u.ae(page.logo, "a");
				u.ce(page.logo);
				page.logo.clicked = function() {
					u.h.navigate("/");
				}

				// logo animation
				u.as(page.logo, "perspective", (page.logo.offsetWidth) + "px");
				u.as(page.logo, "transformStyle", "preserve-3d");
				page.logo.mousedover = function() {
					u.a.transition(this.a, "all 0.5s ease-in-out");
					u.as(this.a, "transform", "rotateY(-180deg)");
				}
				page.logo.mousedout = function() {
					u.a.transition(this.a, "all 0.5s ease-in-out");
					u.as(this.a, "transform", "rotateY(0deg)");
				}
				if(u.e.event_pref == "mouse") {
					u.e.addEvent(page.logo, "mouseenter", page.logo.mousedover);
					u.e.addEvent(page.logo, "mouseleave", page.logo.mousedout);
				}
				// else {
				// 	u.e.addEvent(page.logo, "touchstart", page.logo.mousedover);
				// 	u.e.addEvent(page.logo, "touchend", page.logo.mousedout);
				// }



				// get the navigation node from the servicenavigation
				page.bn_nav = u.qs("ul.servicenavigation li.navigation", page.hN);
				page.bn_nav.a = u.qs("a", page.bn_nav);
				page.nN.items = u.qsa("ul li h4",page.nN);

				page.bn_nav.a.fixed_width = true;
				u.linkScrambler(page.bn_nav.a);


				// very simple navigation toggle
				u.ce(page.bn_nav);
				page.bn_nav.clicked = function() {

					if(this.a && typeof(this.a.unscramble) == "function") {
						this.a.unscramble();
					}

					// close navigation
					if(u.hc(page.nN, "open")) {

						this.a.innerHTML = "Menu";
						this.a.scramble_text = this.a.innerHTML;
						u.rc(this, "open");

						page.nN.transitioned = function() {
							u.rc(this, "open");
						}
						u.a.transition(page.nN, "all 0.3s linear");
						u.ass(page.nN, {"width":0, "height":0, "top": "40px", "right": "60px"});

					}
					// open navigation
					else {
						u.ac(page.nN, "open");

						this.a.innerHTML = "Luk";
						this.a.scramble_text = this.a.innerHTML;
						u.ac(this, "open");

						u.a.transition(page.nN, "all 0.3s linear");
						if(u.e.event_pref == "mouse") {
							u.ass(page.nN, {"width":page.browser_w+"px", "height":page.browser_h+"px", "top": 0, "right": 0});
						}
						else {
							u.ass(page.nN, {"width":page.browser_w+"px", "height":window.innerHeight+"px", "top": 0, "right": 0});
						}
					}

				}

			}


			// setup and activate Navigation
			page.initNavigation = function() {
//				u.bug("initNavigation")

				var i, node;

				// navigation nodes
				page.nN.nodes = u.qsa("li", page.nN);
				for(i = 0; node = page.nN.nodes[i]; i++) {

					// all navigation nodes except "buy"
//					if(!u.hc(node, "buy")) {
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

					// }
					// // the external buy link
					// else {
					// 	u.e.click(node);
					// 	node.clicked = function(event) {
					//
					// 		page.bn_nav.clicked();
					//
					// 	}
					//
					// }

					if(u.e.event_pref == "mouse") {
						node.vp = u.ae(node, "div", {"class":"vp"});
						u.as(node.vp, "backgroundImage", "url(/assets/nav_"+node.className.replace(/link/, "").trim()+".jpg)");
					}

					node.mousedover = function() {

						if(this.offsetWidth/this.offsetHeight > 480/270) {
							var height = (this.offsetWidth / (480/270));
							u.as(this.vp, "height", height + "px", false);
							u.as(this.vp, "marginTop", ((this.offsetHeight - height) / 2) + "px", false);
							u.as(this.vp, "width", "100%", false);
							u.as(this.vp, "marginLeft", 0, false);
						}
						else {
							var width = (this.offsetHeight / (270/480));
							u.as(this.vp, "width", width + "px", false);
							u.as(this.vp, "marginLeft", ((this.offsetWidth - width) / 2) + "px", false);
							u.as(this.vp, "height", "100%", false);
							u.as(this.vp, "marginTop", 0, false);
						}

						u.ac(this.vp, "show");

						// no video for buy button
						if(!u.hc(this, "buy")) {

							u.ae(this.vp, page.videoPlayer);
							u.as(page.videoPlayer, "opacity", 0);
							page.videoPlayer.playing = function() {
								u.as(this, "opacity", 1);
							}
							page.videoPlayer.ended = function() {
								this.play();
							}
							page.videoPlayer.loadAndPlay("/assets/nav_"+this.className.replace(/link/, "").trim()+"_640x360.mp4");

						}
					}

					node.mousedout = function() {
						u.rc(this.vp, "show");

						if(!u.hc(this, "buy")) {
							page.videoPlayer.stop();
							page.videoPlayer.parentNode.removeChild(page.videoPlayer);
						}
					}

					if(u.e.event_pref == "mouse") {
						u.e.addEvent(node, "mouseenter", node.mousedover);
						u.e.addEvent(node, "mouseleave", node.mousedout);
					}

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
							u.as(this, "transform", "rotateX(720deg) scale(10)");


						}


						u.a.transition(this, "all 1s ease-in", "step1");
						u.a.opacity(this, 1);
					}
					u.preloader(page.intro, ["/img/bg_intro.jpg"]);



					// remove intro
					u.ce(page.intro);
					page.intro.clicked = function() {
//						u.bug("cliecked intro")

						u.t.resetTimer(this.t_click);
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
