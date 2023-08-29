Util.Objects["manifest"] = new function() {
	this.init = function(scene) {

		scene.resized = function() {
//			u.bug("scene.resized:" + u.nodeId(this));

			// u.as(this, "height", page.browser_h + "px", false);

			if(this.bg_manifest && this.bg_manifest.vp) {

				if(page.browser_w/page.browser_h > 960/540) {
					var height = Math.ceil(page.browser_w / (960/540));
					u.as(this.bg_manifest.vp, "height", height + "px", false);
					u.as(this.bg_manifest.vp, "marginTop", Math.ceil((page.browser_h - height) / 2) + "px", false);
					u.as(this.bg_manifest.vp, "width", "100%", false);
					u.as(this.bg_manifest.vp, "marginLeft", 0, false);
				}
				else {
					var width = Math.ceil(page.browser_h / (540/960));
					u.as(this.bg_manifest.vp, "width", width + "px", false);
					u.as(this.bg_manifest.vp, "marginLeft", Math.ceil((page.browser_w - width) / 2) + "px", false);
					u.as(this.bg_manifest.vp, "height", "100%", false);
					u.as(this.bg_manifest.vp, "marginTop", 0, false);
				}

			}
		}

		scene.scrolled = function() {
//			u.bug("scene.scrolled:" + u.nodeId(this))
		}

		scene.ready = function() {
//			u.bug("scene.ready:" + u.nodeId(this));

			page.resized();

			this.link = u.qs("a", this);
			u.ce(this.link, {"type":"link"});
			// this.link.clicked = function(event) {
			// 	u.gotoBuy();
			// }

			this.is_ready = true;
			page.cN.ready();
		}


		// build scene - start actual rendering of scene
		scene.build = function() {

			if(!this.is_built) {
//				u.bug("scene.build:" + u.nodeId(this));

				this.is_built = true;

				// add manifest video
				this.bg_manifest = u.ae(page, "div", {"class":"bg_manifest"});
				this.bg_manifest.vp = u.videoPlayer();
				u.ae(this.bg_manifest, this.bg_manifest.vp);

				// aquire correct sizes
				page.resized();

				u.as(this, "opacity", 1);
				u.as(this.bg_manifest.vp, "opacity", 0);

				// wrap up building by removing svg
				this.finalizeBuild = function() {
					this.removeChild(this.svg);

					this.bg_manifest.vp.ended = function() {
						this.play();
					}
					this.bg_manifest.vp.playing = function() {
						u.a.opacity(this, 1);
					}

					// start playback
					this.bg_manifest.vp.loadAndPlay("/assets/manifest/960x540.mp4");

				}

				this.content = u.qs(".content", this);


				var lines = 25;
				var svg_object = {
					"name":"manifest_build",
					"width":page.browser_w,
					"height":page.browser_h,
					"shapes":[]
				};

				var i, shape, x1, new_coords = [];

				// start lines
				for(i = 0; i < lines; i++) {
					var x1 = (i*page.browser_w/lines) - 10;// + u.random(5, 10);
					var x2 = (i*page.browser_w/lines) - 10 + u.random(-20, 20);
					shape = {
						"type":"line",
						"class":"id"+i,
						"x1":x1,
						"x2":x2,
						"y1": -10,
						"y2": page.browser_h + 10,
						"stroke-width": u.random(45, 65)
					}
					svg_object.shapes.push(shape);
				}

				// new end coords
				for(i = 0; i < lines; i++) {
					shape = {
						"y1":page.browser_h + 10,
						"stroke-width":2
					}
					new_coords[i] = shape;
				}

				this.svg = u.svg(svg_object);
				this.svg.scene = this;
				this.svg._c = u.qs(".content");

				u.ae(this, this.svg);

				// get all lines in array to parse them randomly
				lines = u.qsa("line", this.svg);
				new_lines = [];
				for(i = 0; i < lines.length; i++) {
					new_lines.push(lines[i]);
				}

				// start animation sequence
				this.svg._animate = function() {
					if(new_lines.length) {
						i = u.random(0, new_lines.length-1);
						line = new_lines[i];
						new_lines.splice(i, 1);


						u.a.to(line, "all 0.3s linear", new_coords[i]);
						new_coords.splice(i, 1);

						// continue animation
						u.t.setTimer(this, "_animate", 10);
					}
					else {
						u.t.setTimer(this.scene, this.scene.finalizeBuild, 500);
					}

				}
				this.svg._animate();
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

				this.bg_manifest.parentNode.removeChild(this.bg_manifest);
				this.parentNode.removeChild(this);
				page.cN.ready();

			}


			var lines = 50;
			var svg_object = {
				"name":"destruction",
				"width":page.browser_w,
				"height":page.browser_h,
				"shapes":[]
			};

			var i, shape, x1, new_coords = [];

			// start lines
			for(i = 0; i < lines; i++) {

				var x1 = (i*page.browser_w/lines) - 10 + u.random(5, 10);
				shape = {
					"type":"line",
					"class":"id"+i,
					"x1":x1,
					"x2":x1,
					"y1":-10,
					"y2":-8,
					"stroke-width":2
				}
				svg_object.shapes.push(shape);
			}


			// new end coords
			for(i = 0; i < lines; i++) {
				shape = {
					"x2":(i*page.browser_w/lines) + u.random(-35, 35),
					"y1":-10,
					"y2":page.browser_h + 10
				}
				new_coords[i] = shape;
			}

			this.svg = u.svg(svg_object);
			this.svg.scene = this;
			this.svg._c = u.qs(".content");

			u.ae(this, this.svg);

			// get all lines in array to parse them randomly
			lines = u.qsa("line", this.svg);
			new_lines = [];
			for(i = 0; i < lines.length; i++) {
				new_lines.push(lines[i]);
			}

			// start animation sequence
			j = 0;
			this.svg._animate = function() {
				u.bug("animate");

				j++;
				if(new_lines.length) {
					i = u.random(0, new_lines.length-1);
					line = new_lines[i];
					new_lines.splice(i, 1);
					new_coords[i]["stroke-width"] = u.random(2+j*0.5, 28+(Math.pow(j*0.5, 2)));


					u.a.to(line, "all 0.3s linear", new_coords[i]);
					new_coords.splice(i, 1);

					// let content node fall down
					if(j == 15) {
						u.a.transition(this._c, "all 0.2s ease-out");
						u.as(this._c, "transform", "scale(1) rotate(5deg) translate(5px, 100px)");
//						u.a.scaleRotateTranslate(this._c, 1, 5, 5, 100);
					}

					if(j == 20) {
						u.a.transition(this._c, "all 0.3s ease-out");
						u.as(this._c, "transform", "scale(0.8) rotate(-13deg) translate(-5px, 300px)");
//						u.a.scaleRotateTranslate(this._c, 0.8, -13, -5, 300);
					}

					if(j == 27) {
						u.a.transition(this._c, "all 0.3s ease-out");
						u.as(this._c, "transform", "scale(0.7) rotate(-3deg) translate(0px, 1000px)");
//						u.a.scaleRotateTranslate(this._c, , -3, 0, 1000);
					}

					// continue animation
					u.t.setTimer(this, "_animate", 10);
				}
				else {
					u.t.setTimer(this.scene, this.scene.finalizeDestruction, 500);
				}

			}
			this.svg._animate();

		}


		// scene is ready
		scene.ready();
	}
}
