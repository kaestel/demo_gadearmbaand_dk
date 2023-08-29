Util.Objects["buy"] = new function() {
	this.init = function(scene) {

		scene.resized = function() {
//			u.bug("scene.resized:" + u.nodeId(this));

//			if(this.bg_buy) {
				u.as(this, "height", page.browser_h + "px", false);
//			}

		}

		scene.scrolled = function() {
//			u.bug("scene.scrolled:" + u.nodeId(this))
		}

		scene.ready = function() {
//			u.bug("scene.ready:" + u.nodeId(this));

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

//				this.bg_buy = u.ae(page, "div", {"class":"bg_buy"});

				u.a.transition(this, "all 0.5s ease-in");
				u.as(this, "opacity", 1);

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
			this.transitioned = function(){
				this.finalizeDestruction();
			}

			u.a.transition(this, "all 0.5s ease-in");
			u.as(this, "opacity", 1);

		}


		// scene is ready
		scene.ready();
	}
}
