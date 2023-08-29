Util.Objects["buy"] = new function() {
	this.init = function(scene) {

		scene.resized = function() {
//			u.bug("scene.resized:" + u.nodeId(this));

			u.as(this, "height", page.browser_h + "px", false);

			if(this.h2) {
				
				u.as(this.h2, "paddingTop", ((page.browser_h - u.actualH(this.h2)) / 2) - 125 + "px", false);
				
			}
		}

		scene.scrolled = function() {
//			u.bug("scene.scrolled:" + u.nodeId(this))
		}

		scene.ready = function() {
//			u.bug("scene.ready:" + u.nodeId(this));


			// add text scaling
			u.textscaler(this, {
				"min_width":768,
				"max_width":1200,
				"unit":"px",
				"h2":{
					"min_size":40,
					"max_size":70
				}
			});


			page.resized();

			// this.link = u.qs("a", this);
			// u.ce(this.link);
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
				this.bg_buy = u.ae(page, "div", {"class":"bg_buy"});
				this.h2 = u.qs("h2", this);
				this.link = u.qs(".actions li a", this);
				u.linkScrambler(this.link);


				// aquire correct sizes
				page.resized();

				u.as(this, "opacity", 1);

				// wrap up building by removing svg
				this.finalizeBuild = function() {
					this.removeChild(this.svg);

				}


				var svg_object = {
					"name":"event_build",
					"class":"buywristband",
					"width":page.browser_w,
					"height":page.browser_h,
					"shapes":[]
				};

				this.svg = u.svg(svg_object);
				this.svg = u.ae(this, this.svg);


				x1 = 0;
				y1 = 0;

				x2 = page.browser_w;
				y2 = Math.round(page.browser_h/2) - 150;

				y3 = Math.round(page.browser_h/2) - 100;
				y4 = page.browser_h;

				f = page.browser_w/20;

				var points_x = [x1, x1+f,  x1+f*2, x1+f*3, x1+f*4, x1+f*5, x1+f*6, x1+f*7, x1+f*8, x1+f*9, x1+f*10, x1+f*11, x1+f*12, x1+f*13, x1+f*14, x1+f*15, x1+f*16, x1+f*17, x1+f*18, x1+f*19, x2];
				var points_y = [y2, y2+80, y2+20,  y2+170, y2+70,  y2+200, y2+120, y2+270, y2+180, y2+320,  y2+200,  y2+280,  y2+190,  y2+230,  y2+120,  y2+200,  y2+110,  y2+180,  y2+50,  y2+130,  y2];

				var i;
				var top_points, top_points2, top_flat, bottom_points, bottom_points2, bottom_flat;

				// a closed top
				var top_points = x1+","+y1+" ";
				for(i = 0; i < points_x.length; i++) {
					top_points += points_x[i]+","+points_y[i]+" ";
				}
				top_points += x2+","+y1;
				this.svg.top_points = top_points;

				// a little open top
				top_points2 = x1+","+y1+" ";
				for(i = 0; i < points_x.length; i++) {
					top_points2 += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-10)+" ";
				}
				top_points2 += x2+","+y1;
				this.svg.top_points2 = top_points2;

				// all out top
				top_flat = x1+","+(y1-y4)+" ";
				for(i = 0; i < points_x.length; i++) {
					top_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-y4)+" ";
				}
				top_flat += x2+","+(y1-y4);
				this.svg.top_flat = top_flat;


				// a closed bottom
				bottom_points = x1+","+y4+" ";
				for(i = 0; i < points_x.length; i++) {
					bottom_points += points_x[i]+","+points_y[i]+" ";
				}
				bottom_points += x2+","+y4;
				this.svg.bottom_points = bottom_points;

				// a little open bottom
				bottom_points2 = x1+","+y4+" ";
				for(i = 0; i < points_x.length; i++) {
					bottom_points2 += (points_x[i]-u.random(-10, 10))+","+points_y[i]+" ";
				}
				bottom_points2 += x2+","+y4;
				this.svg.bottom_points2 = bottom_points2;

				// all out bottom
				bottom_flat = x1+","+(y4+y4)+" ";
				for(i = 0; i < points_x.length; i++) {
					bottom_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]+y4)+" ";
				}
				bottom_flat += x2+","+(y4+y4);
				this.svg.bottom_flat = bottom_flat;



				this.svg._top = {"type":"polygon", "points": this.svg.top_points};
				this.svg._top = u.svgShape(this.svg, this.svg._top);
				this.svg._top.svg = this.svg;

				this.svg._bottom = {"type":"polygon", "points": this.svg.bottom_points};
				this.svg._bottom = u.svgShape(this.svg, this.svg._bottom);
				this.svg._bottom.svg = this.svg;
				this.svg._bottom.scene = this;

				this.svg._bottom.transitioned = function() {
//					this.transitioned = null;

					this.svg._bottom.transitioned = function() {
//						this.transitioned = null;

						this.transitioned = function() {
//							this.transitioned = null;

							this.transitioned = function() {
//								this.transitioned = null;

								this.scene.removeChild(this.svg);
							}
							u.a.to(this.svg._top, "all 0.3s ease-in", {"stroke-width":"0px"});
							u.a.to(this.svg._bottom, "all 0.3s ease-in", {"stroke-width":"0px"});
						}

						u.a.to(this.svg._top, "all 0.3s ease-in", {"points":this.svg.top_flat});
						u.a.to(this.svg._bottom, "all 0.3s ease-in", {"points":this.svg.bottom_flat});
					}

					u.a.to(this.svg._top, "all 0.3s ease-in", {"points":this.svg.top_points2});
					u.a.to(this.svg._bottom, "all 0.3s ease-in", {"points":this.svg.bottom_points2});
				}

				u.a.to(this.svg._top, "all 1.2s ease-in", {"stroke-width":"2px"});
				u.a.to(this.svg._bottom, "all 0.2s ease-in", {"stroke-width":"2px"});

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

				this.bg_buy.parentNode.removeChild(this.bg_buy);
				this.parentNode.removeChild(this);
				page.cN.ready();

			}



			var svg_object = {
				"name":"event_build",
				"class":"buywristband",
				"width":page.browser_w,
				"height":page.browser_h,
				"shapes":[]
			};

			this.svg = u.svg(svg_object);
			this.svg = u.ae(this, this.svg);


			x1 = 0;
			y1 = 0;

			x2 = page.browser_w;
			y2 = Math.round(page.browser_h/2) - 150;

			y3 = Math.round(page.browser_h/2) - 100;
			y4 = page.browser_h;

			f = page.browser_w/20;

			var points_x = [x1, x1+f,  x1+f*2, x1+f*3, x1+f*4, x1+f*5, x1+f*6, x1+f*7, x1+f*8, x1+f*9, x1+f*10, x1+f*11, x1+f*12, x1+f*13, x1+f*14, x1+f*15, x1+f*16, x1+f*17, x1+f*18, x1+f*19, x2];
			var points_y = [y2, y2+80, y2+20,  y2+170, y2+70,  y2+200, y2+120, y2+270, y2+180, y2+320,  y2+200,  y2+280,  y2+190,  y2+230,  y2+120,  y2+200,  y2+110,  y2+180,  y2+50,  y2+130,  y2];

			var i;
			var top_points, top_points2, top_flat, bottom_points, bottom_points2, bottom_flat;

			// a closed top
			var top_points = x1+","+y1+" ";
			for(i = 0; i < points_x.length; i++) {
				top_points += points_x[i]+","+points_y[i]+" ";
			}
			top_points += x2+","+y1;
			this.svg.top_points = top_points;

			// a little open top
			top_points2 = x1+","+y1+" ";
			for(i = 0; i < points_x.length; i++) {
				top_points2 += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-10)+" ";
			}
			top_points2 += x2+","+y1;
			this.svg.top_points2 = top_points2;

			// all out top
			top_flat = x1+","+(y1-y4)+" ";
			for(i = 0; i < points_x.length; i++) {
				top_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-y4)+" ";
			}
			top_flat += x2+","+(y1-y4);
			this.svg.top_flat = top_flat;


			// a closed bottom
			bottom_points = x1+","+y4+" ";
			for(i = 0; i < points_x.length; i++) {
				bottom_points += points_x[i]+","+points_y[i]+" ";
			}
			bottom_points += x2+","+y4;
			this.svg.bottom_points = bottom_points;

			// a little open bottom
			bottom_points2 = x1+","+y4+" ";
			for(i = 0; i < points_x.length; i++) {
				bottom_points2 += (points_x[i]-u.random(-10, 10))+","+points_y[i]+" ";
			}
			bottom_points2 += x2+","+y4;
			this.svg.bottom_points2 = bottom_points2;

			// all out bottom
			bottom_flat = x1+","+(y4+y4)+" ";
			for(i = 0; i < points_x.length; i++) {
				bottom_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]+y4)+" ";
			}
			bottom_flat += x2+","+(y4+y4);
			this.svg.bottom_flat = bottom_flat;




			this.svg._top = {"type":"polygon", "points": this.svg.top_flat, "stroke-width":"2px"};
			this.svg._top = u.svgShape(this.svg, this.svg._top);
			this.svg._top.svg = this.svg;

			this.svg._bottom = {"type":"polygon", "points": this.svg.bottom_flat, "stroke-width":"2px"};
			this.svg._bottom = u.svgShape(this.svg, this.svg._bottom);
			this.svg._bottom.svg = this.svg;
			this.svg._bottom.scene = this;

			this.svg._bottom.transitioned = function() {
				this.transitioned = null;

				this.transitioned = function() {
					this.transitioned = null;

					this.transitioned = function() {
						this.transitioned = null;

						this.scene.finalizeDestruction()
						// location.href = "http://burl.nu/jbjpcu";
						// this.removeChild(this.svg);
					}
					u.a.to(this.svg._top, "all 0.3s ease-in", {"stroke-width":"0px"});
					u.a.to(this.svg._bottom, "all 0.3s ease-in", {"stroke-width":"0px"});

				}

				u.a.to(this.svg._top, "all 0.3s ease-in", {"points":this.svg.top_points});
				u.a.to(this.svg._bottom, "all 0.3s ease-in", {"points":this.svg.bottom_points});
			}

			u.a.to(this.svg._top, "all 0.5s ease-in", {"points":this.svg.top_points2});
			u.a.to(this.svg._bottom, "all 0.5s ease-in", {"points":this.svg.bottom_points2});

		}


		// scene is ready
		scene.ready();
	}
}
