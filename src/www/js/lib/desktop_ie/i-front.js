Util.Objects["front"] = new function() {
	this.init = function(scene) {

		// global resize handler
		scene.resized = function() {
//			u.bug("scene.resized:" + u.nodeId(this));


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


			// get block size to make grid add up
			var block_height = Math.ceil(this.offsetWidth/5);
			u.as(this.grid, "width", (block_height*5)+"px", false);

			var i, li;
			for (i = 0; li = this.lis[i]; i++) {

				if(li.is_ready) {

					// handle article and instagram items
					if(u.hc(li, "article|instagram")) {
						if(li._forty) {
							u.as(li, "height", (block_height*2)+"px", false);
							u.as(li, "width", (block_height*2)+"px", false);
						}
						else {
							u.as(li, "height", block_height+"px", false);
							u.as(li, "width", block_height+"px", false);
						}
					}

					// handle tweet items
					else if(u.hc(li, "tweet")) {
						u.as(li, "height", block_height+"px", false);
						u.as(li, "width", (block_height*2)+"px", false);
					}

					// blank
					else if(u.hc(li, "blank")) {
						if(li._forty) {
							u.as(li, "width", (block_height*2)+"px", false);
						}
						else if(li._sixty) {
							u.as(li, "width", (block_height*3)+"px", false);
						}
						else {
							u.as(li, "width", block_height+"px", false);
						}

//						u.as(li, "height", block_height+"px", false);
					}


					// handle ambassador
					else if(u.hc(li, "ambassador")) {

						u.as(li, "width", (block_height*5)+"px", false);

						// video height
						u.as(li.li_video, "height", (block_height*2)+"px", false);
						u.as(li.li_video, "width", (block_height*3)+"px", false);

						// article height
						u.as(li.li_article, "height", (block_height*2)+"px", false);
						u.as(li.li_article, "width", (block_height*2)+"px", false);
					}


					// handle margins
					if(u.hc(li, "push_up|push_up_half")) {
						u.as(li, "marginTop", -(block_height)+"px", false);
					}
					else if(u.hc(li, "push_down")) {
						u.as(li, "marginTop", block_height+"px", false);
					}

				}

			}


			// adjust grid padding
			var factor = (this.offsetWidth - 600) / 600;
			var padding = (10 + (factor * 30))+"px "+(10 + (factor * 20))+"px";

			var h2_40_padding = "0 0 " + (20 + (factor * 25))+"px";
			var h2_20_padding = "0 0 " + (10 + (factor * 12))+"px";

			// update paddings
			this.article_rule.style.setProperty("padding", padding, "important");
			this.article_h2_40_rule.style.setProperty("padding", h2_40_padding, "important");
			this.article_h2_20_rule.style.setProperty("padding", h2_20_padding, "important");
			this.article_p_rule.style.setProperty("padding", h2_40_padding, "important");
			this.tweet_rule.style.setProperty("padding", padding, "important");

		}

		// global scroll handler
		scene.scrolled = function() {
//			u.bug("page.scrolled:" + u.nodeId(this))

			// only do scroll adjustments if scene is built
			if(this.is_built) {

				var i, li;
				for (i = 0; li = this.lis[i]; i++) {

//					u.bug("check render:" + li.is_built + ", " + li.i  + "==" + this.rendered)

					// only consider unbuilt lis which are next in line for rendering
					if(!li.is_built && li.i == this.rendered) {

						// get position on screen
						var li_y = u.absY(li);
						if(
							(li_y > page.scroll_y && li_y < page.scroll_y + (page.browser_h-100)) || 
							(li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + (page.browser_h - 100))
						) {

	//						u.bug("go render:" + li.is_built)
							this.renderNode(li);
							break;

						}
					}

					// avoid loop without purpose
					else if(li.i > this.rendered) {
						break;
					}

					// check for videos to stop when out of view and start when reentering
					else if(li.is_built && li.image && li.image.video_player) {

						var li_y = u.absY(li);
						// if video is not playing and in sight - start playing
						if(!li.image.video_player.is_playing &&
							(li_y > page.scroll_y && li_y < page.scroll_y + (page.browser_h-100)) || 
							(li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + (page.browser_h - 100))
						) {
							li.image.video_player.play();
						}
						// stop video
						else {
							li.image.video_player.stop();
						}

					}
				}
			}
		}


		// get scene ready for building
		scene.ready = function() {
			u.bug("scene.ready:" + u.nodeId(this));


			// create padding rules for grid padding scaling
			this.style_tag = document.createElement("style");
			this.style_tag.setAttribute("media", "all")
			this.style_tag.setAttribute("type", "text/css")
			this.style_tag = u.ae(document.head, this.style_tag);

			this.style_tag.sheet.insertRule("#content .scene.front li.article .card {}", 0);
			this.article_rule = this.style_tag.sheet.cssRules[0];

			this.style_tag.sheet.insertRule("#content .scene.front li.article.forty .card h2 {}", 0);
			this.article_h2_40_rule = this.style_tag.sheet.cssRules[0];

			this.style_tag.sheet.insertRule("#content .scene.front li.article.twenty .card h2 {}", 0);
			this.article_h2_20_rule = this.style_tag.sheet.cssRules[0];

			this.style_tag.sheet.insertRule("#content .scene.front li.article .card p {}", 0);
			this.article_p_rule = this.style_tag.sheet.cssRules[0];

			this.style_tag.sheet.insertRule("#content .scene.front li.tweet .card {}", 0);
			this.tweet_rule = this.style_tag.sheet.cssRules[0];


			// primary elements
			this.h1 = u.qs("h1", this);
			this.grid = u.qs("ul.grid", this);
			this.lis = u.qsa("ul.grid > li", this);


			// prepare all nodes
			var i, li;
			for (i = 0; li = this.lis[i]; i++) {

				li.scene = this;

				// save order (to control rendering)
				li.i = i;
				u.ac(li, "i"+i);


				// pre-index for resizing
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
						li.image._image_src = "/images/" + li.image.image_id + "/image/400x." + li.image.image_format;
					}


					// username hover effect
					if(u.e.event_pref == "mouse") {
						li.image.mousedover = function() {
							u.a.transition(this.p, "all 0.2s ease-in");
							u.as(this.p, "fontSize", "14px");
						}
						li.image.mousedout = function() {
							u.a.transition(this.p, "all 0.1s ease-in");
							u.as(this.p, "fontSize", "10px");
						}

						u.e.addEvent(li.image, "mouseover", li.image.mousedover);
						u.e.addEvent(li.image, "mouseout", li.image.mousedout);
					}

				}

				// handle tweet
				else if(u.hc(li, "tweet")) {

					// get elements
//					li.card = u.qs(".card", li);

				}

				// handle article
				else if(u.hc(li, "article")) {


					// get elements
					li.card = u.qs(".card", li);
					li.link = u.qs(".card a", li);


					// add internal link handler - unless link has target (external link)
					if(!li.link.target) {
						u.ce(li.link, {"type":"link"});
					}

					// add link scrambling
					if(u.e.event_pref == "mouse") {
						u.linkScrambler(li.link);
					}

				}

				// handle ambassador
				else if(u.hc(li, "ambassador")) {


					// ARTICLE

					// get elements
					li.li_article = u.qs("li.article", li);
					li.li_article.card = u.qs(".card", li.li_article);
					li.li_article.link = u.qs(".card a", li.li_article);


					// add internal link handler - unless link has target (external link)
					if(!li.li_article.link.target) {
						u.ce(li.li_article.link, {"type":"link"});
					}

					// add link scrambling
					if(u.e.event_pref == "mouse") {
						u.linkScrambler(li.li_article.link);
					}


					// VIDEO

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

								u.as(this.video, "zIndex", 1);
							}

							// if video player is currently used, make sure to reset existing instance
							if(page.videoPlayer.current_node) {
								page.videoPlayer.current_node.resetPlayer();
							}

							// reset video when playback is dont
							page.videoPlayer.ended = function(event) {

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

				// li is ready
				li.is_ready = true;

				// resize grid
//				this.resized();

			}

			// resize grid
			this.resized();


			// add text scaling
			u.textscaler(this, {
				"min_width":768,
				"max_width":1200,
				"unit":"px",
				"li .actions a":{
					"min_size":13,
					"max_size":14
				},
				"li h3":{
					"min_size":13,
					"max_size":14
				},
				".twenty h2":{
					"min_size":16,
					"max_size":22
				},
				".forty h2":{
					"min_size":28,
					"max_size":45
				},
				".tweet p":{
					"min_size":15,
					"max_size":22
				},
				".ambassador p":{
					"min_size":15,
					"max_size":22
				}
			});


			u.bug("front ready")

			// call middle step which checks for images loaded
			this.is_ready = true;
			page.cN.ready();
		}


		// twitter card rotator - attached to tweet li
		scene._rotateCard = function() {

			if(this.cards.length > 1) {
				var new_card = this.card+1 < this.cards.length ? this.card+1 : 0;

				// don't flip if menu is open
				if(!u.hc(page.nN, "open")) {
					this.cards[this.card].transitioned = function() {
						u.a.transition(this, "none");
						u.as(this, "transform", "rotateX(180deg)");
					}
					u.a.transition(this.cards[this.card], "all 0.5s ease-in-out");
					u.as(this.cards[this.card], "transform", "rotateX(-180deg)");

					u.a.transition(this.cards[new_card], "all 0.5s ease-in-out");
					u.as(this.cards[new_card], "transform", "rotateX(0)");

					this.card = new_card;
				}

				// only continue loop if tweet is still part of DOM
				if(this.offsetHeight) {
					u.t.setTimer(this, this.rotateCard, 5000);
				}
			}

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

						u.a.transition(this.li, "all 1s ease-in-out "+(this.li.scene.renderControl())+"ms");
						u.a.setOpacity(this.li, 1);


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

						u.a.transition(this.li, "all 1s ease-in-out "+(this.li.scene.renderControl())+"ms");
						u.a.setOpacity(this.li, 1);


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

				u.a.transition(li, "all 0.5s ease-in-out "+(li.scene.renderControl())+"ms");
				u.a.setOpacity(li, 1);


				// continue rendering
				li.scene.rendered++;
				li.scene.scrolled();
			}

			// tweet
			else if(u.hc(li, "tweet")) {

				u.a.transition(li, "all 0.5s ease-in-out "+(li.scene.renderControl())+"ms");
				u.a.setOpacity(li, 1);

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

				// show header
				u.a.transition(this.h1, "all 0.5s ease-in");
				u.a.setOpacity(this.h1, 1);

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

				// remove style tag
				this.style_tag.parentNode.removeChild(this.style_tag);

				// remove scene and get on with the party
				this.parentNode.removeChild(this);
				page.cN.ready();

			}

			// hide header
			u.a.transition(this.h1, "all 0.5s ease-out");
			u.a.setOpacity(this.h1, 0);


			var i, li, j = 0;
			for(i = 0; li = this.lis[i]; i++) {
				var li_y = u.absY(li);

				// only destroy visible elements
				if((li_y > page.scroll_y && li_y < page.scroll_y + page.browser_h) || li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + page.browser_h) {
//					u.bug("move:" + u.nodeId(li))
					u.as(li, "zIndex", 100-j);

					u.a.transition(li, "all 0.5s ease-in "+(150*j++)+"ms");
					u.a.setOpacity(li, 0);
				}
			}

			// get on with it
			u.t.setTimer(this, this.finalizeDestruction, (150*j)+500);

		}


		// ready to start page builing process
		scene.ready();
	}
}
