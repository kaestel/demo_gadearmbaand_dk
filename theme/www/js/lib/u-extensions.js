// scramble text in buttons
u.linkScrambler = function(link) {
//	u.bug("linkScrambler:" + u.nodeId(link, true));

	link.scramble_text = link.innerHTML;
	link.scrambled_count = 0;
	link.randomizer = function() {
//		u.bug("randomizer")

		var indexes = [];
//		var chars = [];
		var rand;
		while(indexes.length < this.scrambled_sequence.length/2) {

			rand = u.random(0, this.scrambled_sequence.length-1);
			if(indexes.indexOf(rand) == -1) {
				indexes.push(rand);
//				chars.push(this.scrambled_sequence[rand]);
			}

		}
//		return [chars, indexes];
		return indexes;
	}

	link.scramble = function() {
//		u.bug("scramble")

//		this.scrambled_sequence = this.innerHTML.split("");
		var indexes = this.randomizer();
//		u.bug("indexes:" + indexes.join("#"));


		if(this.scrambled_count < 7) {

			var a, b, c, d;

			while(indexes.length > 1) {
				ia = u.random(0, indexes.length-1);
				ca = indexes[ia];
				indexes.splice(ia, 1);

				ib = u.random(0, indexes.length-1);
				cb = indexes[ib];
				indexes.splice(ib, 1);

//				u.bug("switch:" + ca + " with " + cb);

				c = this.scrambled_sequence[ca];
				d = this.scrambled_sequence[cb];

//				u.bug("switch:" + ca + "("+c+")" + " with " + cb + "("+d+")");

				this.scrambled_sequence[ca] = d;
				this.scrambled_sequence[cb] = c;

				// index = c[1].splice([u.random(0, c[1].length-1)], 1);
				// char = c[0].splice([u.random(0, c[0].length-1)], 1);
				//
				// this.scrambled_sequence[index] = char;
			}
			this.innerHTML = this.scrambled_sequence.join("");

			this.scrambled_count++;
			this.t_scrambler = u.t.setTimer(this, this.scramble, 50);
		}
		else {
			this.innerHTML = this.scramble_text;
		}

	}
	link.unscramble = function() {
//		u.bug("unscramble")

		u.t.resetTimer(this.t_scrambler);
		this.innerHTML = this.scramble_text;
		if(!this.fixed_width) {
			u.as(this, "width", "auto");
		}
		this.scrambled_count = 0;
	}

	link.mousedover = function() {
//		u.bug("mouseover scramble")
		u.t.resetTimer(this.t_unscrambler);

		if(!this.scrambled_count) {

			this.scramble_text = this.innerHTML;
			this.scrambled_sequence = this.scramble_text.split("");

			if(!this.fixed_width) {
				u.as(this, "width", u.actualWidth(this) + "px");
			}
			this.scramble();
		}
	}
	link.mousedout = function() {
//		u.bug("mouseout scramble")

		u.t.resetTimer(this.t_unscrambler);
		this.t_unscrambler = u.t.setTimer(this, "unscramble", 100);
	}


	if(u.e.event_pref == "mouse") {
		u.e.addEvent(link, "mouseover", link.mousedover);
		u.e.addEvent(link, "mouseout", link.mousedout);
	}
	else {
		u.e.addEvent(link, "touchstart", link.mousedover);
		u.e.addEvent(link, "touchend", link.mousedout);
	}

}


u.gotoBuy = function() {


	var svg_object = {
		"name":"event_build",
		"class":"buywristband",
		"width":page.browser_w,
		"height":page.browser_h,
		"shapes":[]
	};

	page.svg = u.svg(svg_object);
	page.svg = u.ae(page, page.svg);


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
	page.svg.top_points = top_points;

	// a little open top
	top_points2 = x1+","+y1+" ";
	for(i = 0; i < points_x.length; i++) {
		top_points2 += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-10)+" ";
	}
	top_points2 += x2+","+y1;
	page.svg.top_points2 = top_points2;

	// all out top
	top_flat = x1+","+(y1-y4)+" ";
	for(i = 0; i < points_x.length; i++) {
		top_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-y4)+" ";
	}
	top_flat += x2+","+(y1-y4);
	page.svg.top_flat = top_flat;


	// a closed bottom
	bottom_points = x1+","+y4+" ";
	for(i = 0; i < points_x.length; i++) {
		bottom_points += points_x[i]+","+points_y[i]+" ";
	}
	bottom_points += x2+","+y4;
	page.svg.bottom_points = bottom_points;

	// a little open bottom
	bottom_points2 = x1+","+y4+" ";
	for(i = 0; i < points_x.length; i++) {
		bottom_points2 += (points_x[i]-u.random(-10, 10))+","+points_y[i]+" ";
	}
	bottom_points2 += x2+","+y4;
	page.svg.bottom_points2 = bottom_points2;

	// all out bottom
	bottom_flat = x1+","+(y4+y4)+" ";
	for(i = 0; i < points_x.length; i++) {
		bottom_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]+y4)+" ";
	}
	bottom_flat += x2+","+(y4+y4);
	page.svg.bottom_flat = bottom_flat;




	page.svg._top = {"type":"polygon", "points": page.svg.top_flat, "stroke-width":"2px"};
	page.svg._top = u.svgShape(page.svg, page.svg._top);
	page.svg._top.page = page;

	page.svg._bottom = {"type":"polygon", "points": page.svg.bottom_flat, "stroke-width":"2px"};
	page.svg._bottom = u.svgShape(page.svg, page.svg._bottom);
	page.svg._bottom.page = page;

	page.svg._bottom.transitioned = function() {
		this.transitioned = null;

		this.transitioned = function() {
			this.transitioned = null;

			this.transitioned = function() {
				this.transitioned = null;

				location.href = "http://burl.nu/jbjpcu";
				page.removeChild(page.svg);
			}
			u.a.to(page.svg._top, "all 0.3s ease-in", {"stroke-width":"0px"});
			u.a.to(page.svg._bottom, "all 0.3s ease-in", {"stroke-width":"0px"});

		}

		u.a.to(page.svg._top, "all 0.3s ease-in", {"points":page.svg.top_points});
		u.a.to(page.svg._bottom, "all 0.3s ease-in", {"points":page.svg.bottom_points});
	}

	u.a.to(page.svg._top, "all 0.5s ease-in", {"points":page.svg.top_points2});
	u.a.to(page.svg._bottom, "all 0.5s ease-in", {"points":page.svg.bottom_points2});
	
}

