Util.Objects["front"] = new function() {
	this.init = function(scene) {

		// global resize handler
		scene.resized = function() {
//			u.bug("scene.resized:" + u.nodeId(this));


		}

		// global scroll handler
		scene.scrolled = function() {
//			u.bug("page.scrolled:" + u.nodeId(this));


			if(this.is_built) {

				var i, li;
				for (i = 0; li = this.lis[i]; i++) {

//					u.bug("check render:" + li.is_built + ", " + li.i  + "==" + this.rendered + ", " + u.nodeId(li))

					// only consider unbuilt lis which are next in line for rendering
					if(!li.is_built && li.i == this.rendered) {

						// get position on screen
						var li_y = u.absY(li);
						if(li._blank ||
							(li_y > page.scroll_y && li_y < page.scroll_y + (page.browser_h)) || 
							(li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + (page.browser_h))
						) {

//							u.bug("go render:" + li.is_built)
							this.renderNode(li);
							break;

						}
					}

					// avoid loop without purpose
					else if(li.i > this.rendered) {
						break;
					}
				}
			}

		}

		// Page is ready
		scene.ready = function() {
//			u.bug("scene.ready:" + u.nodeId(this));


			this.h1 = u.qs("h1", this);
			this.lis = u.qsa("ul.grid > li", this);

			var i, li;
			for(i = 0; li = this.lis[i]; i++) {

				li.scene = this;

				// save order (to control rendering)
				li.i = i;
				u.ac(li, "i"+i);


				// pre-index
				if(u.hc(li, "forty")) {
					li._forty = true;
				}
				else if(u.hc(li, "sixty")) {
					li._sixty = true;
				}
				else {
					li._twenty = true;
				}


				// handle instagram images
				if(u.hc(li, "instagram")) {

					// get elements
					li.image = u.qs("div.image", li);
					li.image.li = li;
					li.image.p = u.qs("div.image p", li);

					// get image src if information is available
					li.image.image_id = u.cv(li.image, "image_id");
					li.image.image_format = u.cv(li.image, "image_format");
					if(li.image.image_id && li.image.image_format) {
						li.image._image_src = "/images/" + li.image.image_id + "/image/300x." + li.image.image_format;
					}
				}

				// handle tweet
				else if(u.hc(li, "tweet")) {}

				// handle article page
				else if(u.hc(li, "article")) {

					li.card = u.qs(".card", li);
					li.link = u.qs(".card a", li);

					if(!li.link.target) {
						u.ce(li, {"type":"link"});
					}

				}


				// handle ambassador
				else if(u.hc(li, "ambassador")) {
					//u.as(li, "height", li.offsetWidth+"px");


					// get elements
					li.li_article = u.qs("li.article", li);
					li.li_article.card = u.qs(".card", li.li_article);
					li.li_article.link = u.qs(".card a", li.li_article);


					if(!li.li_article.link.target) {
						u.ce(li.li_article, {"type":"link"});
					}


					// get elements
					li.li_video = u.qs("li.video", li);
					li.video = u.qs("div.video", li.li_video);
					li.image = u.qs("div.image", li.li_video);

					li.li_video.li = li;
					li.video.li = li;
					li.image.li = li;


					// get image src if information is available
					li.image_id = u.cv(li.image, "image_id");
					li.image_format = u.cv(li.image, "image_format");
					if(li.image_id && li.image_format) {
						li._image_src = "/images/" + li.image_id + "/image/720x." + li.image_format;
					}


					// get video src if information is available
					li.video_id = u.cv(li.video, "video_id");
					li.video_format = u.cv(li.video, "video_format");
					if(li.video_id && li.video_format) {
						li._video_url = "/videos/" + li.video_id + "/video/720x." + li.video_format;

						// add play button
						li.bn_play = u.ae(li.image, "div", {"class": "play"});

						// add play handler
						u.e.click(li.image);
						li.image.clicked = function(event) {

							// reset video (if playback is started elsewhere)
							this.li.resetPlayer = function() {
								u.bug("video done - should reset")
								u.as(this.video, "zIndex", 1);
							}

							// if video player is currently used, make sure to reset existing instance
							if(page.videoPlayer.current_node) {
								page.videoPlayer.current_node.resetPlayer();
							}

							// reset video when playback is dont
							page.videoPlayer.ended = function(event) {
								u.bug("video done - should call reset")

								this.current_node.resetPlayer();
								this.current_node = false;
							}

							// move video to top
							u.as(this.li.video, "zIndex", 3);
							// add video player
							u.ae(this.li.video, page.videoPlayer);
							// remember current position in hierarchy
							page.videoPlayer.current_node = this.li;

							// load and start playback as fast as posible
							page.videoPlayer.loadAndPlay(this.li._video_url, {"playpause":true});

						}

					}

				}
				
				else if(u.hc(li, "blank")) {
					li._blank = true;
				}

				// li is ready
				li.is_ready = true;

				// resize grid
				this.resized();

			}

			// resize grid
			this.resized();


			this.is_ready = true;
			page.cN.ready();

		}

		// render timestamp
		scene.next_render = new Date().getTime();

		// render controller - calculates delays for rendering
		scene.renderControl = function() {
			var now = new Date().getTime();

			// delay rendering for a minimum of 150ms between each render
			this.next_render = now - this.next_render > 150 ? now : now + (150 - (now - this.next_render));

			return this.next_render-now;
		}


		// render a node - invoked by scene.scrolled
		scene.renderNode = function(li) {
//			u.bug("renderNode:" + u.nodeId(li) + ", " + li.is_built);


			// set build state
			li.is_built = true;


			// instagram
			if(u.hc(li, "instagram")) {

				// do we have information
				if(li.image._image_src) {

					// load image
					li.image.loaded = function(queue) {

						this.img = u.ae(this, "img", {"src": queue[0].image.src});

						u.a.transition(this.li, "opacity 0.5s ease-in "+(this.li.scene.renderControl())+"ms");
						u.a.opacity(this.li, 1);


						// continue rendering
						this.li.scene.rendered++;
						this.li.scene.scrolled();

					}
					u.preloader(li.image, [li.image._image_src])
				}
				// skip element on missing information
				else {

					// continue rendering
					li.scene.rendered++;
					li.scene.scrolled();
				}

			}

			// ambassador
			else if(u.hc(li, "ambassador")) {

				// do we have enough information
				if(li._image_src) {

					// load image
					li.image.loaded = function(queue) {

						u.ae(this, "img", {"src": queue[0].image.src});

						u.a.transition(this.li, "opacity 0.5s ease-in "+(this.li.scene.renderControl())+"ms");
						u.a.opacity(this.li, 1);


						// continue rendering
						this.li.scene.rendered++;
						this.li.scene.scrolled();

					}
					u.preloader(li.image, [li._image_src])

				}
				// skip element on missing information
				else {

					// continue rendering
					li.scene.rendered++;
					li.scene.scrolled();
				}

			}

			// article
			else if(u.hc(li, "article")) {

				u.a.transition(li, "opacity 0.5s ease-in "+(li.scene.renderControl())+"ms");
				u.a.opacity(li, 1);

				// continue rendering
				li.scene.rendered++;
				li.scene.scrolled();
			}

			// tweet
			else if(u.hc(li, "tweet")) {

				u.a.transition(li, "opacity 0.5s ease-in "+(li.scene.renderControl())+"ms");
				u.a.opacity(li, 1);

				// continue rendering
				li.scene.rendered++;
				li.scene.scrolled();
			}

			// blank
			else if(u.hc(li, "blank")) {

				// continue rendering
				li.scene.rendered++;
				li.scene.scrolled();
			}

		}

		// build scene - start actual rendering of scene
		scene.build = function() {

			if(!this.is_built) {
//				u.bug("scene.build:" + u.nodeId(this));

				this.is_built = true;

				// show header
				u.a.transition(this.h1, "all 0.5s ease-in");
				u.a.opacity(this.h1, 1);

				// set render control counter
				this.rendered = 0;
				this.is_built = true;

				// scroll handler handles rendering when is_built is set
				this.scrolled();

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

			u.a.transition(this.h1, "all 1s ease-out");
			u.a.opacity(this.h1, 0);

			var i, li, j = 0;

			for(i = 0; li = this.lis[i]; i++) {
				var li_y = u.absY(li);
				if((li_y > page.scroll_y && li_y < page.scroll_y + page.browser_h) || li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + page.browser_h) {
					u.a.transition(li, "all 0.3s ease-in "+(150*j++)+"ms");
					u.a.opacity(li, 0);
				}
			}

			u.t.setTimer(this, this.finalizeDestruction, (100*j)+600);

		}



		// ready to start page builing process
		scene.ready();
	}
}
