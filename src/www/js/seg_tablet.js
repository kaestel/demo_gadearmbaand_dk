
/*seg_tablet_include.js*/

/*u.js*/
if(!u || !Util) {
	var u, Util = u = new function() {};
	u.version = "0.9.1";
	u.bug = u.nodeId = u.exception = function() {};
	u.stats = new function() {this.pageView = function(){};this.event = function(){};this.customVar = function(){};}
}


/*u-debug.js*/
Util.debugURL = function(url) {
	if(u.bug_force) {
		return true;
	}
	return document.domain.match(/.local$/);
}
Util.nodeId = function(node, include_path) {
	try {
		if(!include_path) {
			return node.id ? node.nodeName+"#"+node.id : (node.className ? node.nodeName+"."+node.className : (node.name ? node.nodeName + "["+node.name+"]" : node.nodeName));
		}
		else {
			if(node.parentNode && node.parentNode.nodeName != "HTML") {
				return u.nodeId(node.parentNode, include_path) + "->" + u.nodeId(node);
			}
			else {
				return u.nodeId(node);
			}
		}
	}
	catch(exception) {
		u.exception("u.nodeId", arguments, exception);
	}
	return "Unindentifiable node!";
}
Util.exception = function(name, _arguments, _exception) {
	u.bug("Exception in: " + name + " (" + _exception + ")");
	u.bug("Invoked with arguments:");
	u.xInObject(_arguments);
	u.bug("Called from:");
	if(_arguments.callee.caller.name) {
		u.bug("arguments.callee.caller.name:" + _arguments.callee.caller.name)
	}
	else {
		u.bug("arguments.callee.caller:" + _arguments.callee.caller.toString().substring(0, 250));
	}
}
Util.bug = function(message, corner, color) {
	if(u.debugURL()) {
		if(!u.bug_console_only) {
			var option, options = new Array([0, "auto", "auto", 0], [0, 0, "auto", "auto"], ["auto", 0, 0, "auto"], ["auto", "auto", 0, 0]);
			if(isNaN(corner)) {
				color = corner;
				corner = 0;
			}
			if(typeof(color) != "string") {
				color = "black";
			}
			option = options[corner];
			if(!document.getElementById("debug_id_"+corner)) {
				var d_target = u.ae(document.body, "div", {"class":"debug_"+corner, "id":"debug_id_"+corner});
				d_target.style.position = u.bug_position ? u.bug_position : "absolute";
				d_target.style.zIndex = 16000;
				d_target.style.top = option[0];
				d_target.style.right = option[1];
				d_target.style.bottom = option[2];
				d_target.style.left = option[3];
				d_target.style.backgroundColor = u.bug_bg ? u.bug_bg : "#ffffff";
				d_target.style.color = "#000000";
				d_target.style.textAlign = "left";
				if(d_target.style.maxWidth) {
					d_target.style.maxWidth = u.bug_max_width ? u.bug_max_width+"px" : "auto";
				}
				d_target.style.padding = "3px";
			}
			if(typeof(message) != "string") {
				message = message.toString();
			}
			var debug_div = document.getElementById("debug_id_"+corner);
			message = message ? message.replace(/\>/g, "&gt;").replace(/\</g, "&lt;").replace(/&lt;br&gt;/g, "<br>") : "Util.bug with no message?";
			u.ae(debug_div, "div", {"style":"color: " + color, "html": message});
		}
		if(typeof(console) == "object") {
			console.log(message);
		}
	}
}
Util.xInObject = function(object, _options) {
	if(u.debugURL()) {
		var return_string = false;
		var explore_objects = false;
		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {
					case "return"     : return_string               = _options[_argument]; break;
					case "objects"    : explore_objects             = _options[_argument]; break;
				}
			}
		}
		var x, s = "--- start object ---\n";
		for(x in object) {
			if(explore_objects && object[x] && typeof(object[x]) == "object" && typeof(object[x].nodeName) != "string") {
				s += x + "=" + object[x]+" => \n";
				s += u.xInObject(object[x], true);
			}
			else if(object[x] && typeof(object[x]) == "object" && typeof(object[x].nodeName) == "string") {
				s += x + "=" + object[x]+" -> " + u.nodeId(object[x], 1) + "\n";
			}
			else if(object[x] && typeof(object[x]) == "function") {
				s += x + "=function\n";
			}
			else {
				s += x + "=" + object[x]+"\n";
			}
		}
		s += "--- end object ---\n";
		if(return_string) {
			return s;
		}
		else {
			u.bug(s);
		}
	}
}


/*u-animation.js*/
Util.Animation = u.a = new function() {
	this.support3d = function() {
		if(this._support3d === undefined) {
			var node = u.ae(document.body, "div");
			try {
				u.as(node, "transform", "translate3d(10px, 10px, 10px)");
				if(u.gcs(node, "transform").match(/matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 10, 10, 1\)/)) {
					this._support3d = true;
				}
				else {
					this._support3d = false;
				}
			}
			catch(exception) {
				this._support3d = false;
			}
			document.body.removeChild(node);
		}
		return this._support3d;
	}
	this.transition = function(node, transition, callback) {
		try {
			var duration = transition.match(/[0-9.]+[ms]+/g);
			if(duration) {
				node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);
				if(callback) {
					var transitioned;
					transitioned = (function(event) {
						u.e.removeEvent(event.target, u.a.transitionEndEventName(), transitioned);
						if(event.target == this) {
							u.a.transition(this, "none");
							if(typeof(callback) == "function") {
								var key = u.randomString(4);
								node[key] = callback;
								node[key].callback(event);
								node[key] = null;
								callback = null;
							}
							else if(typeof(this[callback]) == "function") {
								this[callback](event);
								this[callback] = null;
							}
						}
						else {
						}
					});
					u.e.addEvent(node, u.a.transitionEndEventName(), transitioned);
				}
				else {
					u.e.addEvent(node, u.a.transitionEndEventName(), this._transitioned);
				}
			}
			else {
				node.duration = false;
			}
			u.as(node, "transition", transition);
		}
		catch(exception) {
			u.exception("u.a.transition", arguments, exception);
		}
	}
	this.transitionEndEventName = function() {
		if(!this._transition_end_event_name) {
			this._transition_end_event_name = "transitionend";
			var transitions = {
				"transition": "transitionend",
				"MozTransition": "transitionend",
				"msTransition": "transitionend",
				"webkitTransition": "webkitTransitionEnd",
				"OTransition": "otransitionend"
			};
			var x, div = document.createElement("div");
			for(x in transitions){
				if(typeof(div.style[x]) !== "undefined") {
					this._transition_end_event_name = transitions[x];
					break;
				}
			}
		}
		return this._transition_end_event_name;
	}
	this._transitioned = function(event) {
		u.e.removeEvent(event.target, u.a.transitionEndEventName(), u.a._transitioned);
		u.a.transition(event.target, "none");
		if(event.target == this && typeof(this.transitioned) == "function") {
			this.transitioned(event);
			this.transitioned = null;
		}
	}
	this.removeTransform = function(node) {
		u.as(node, "transform", "none");
	}
	this.translate = function(node, x, y) {
		if(this.support3d()) {
			u.as(node, "transform", "translate3d("+x+"px, "+y+"px, 0)");
		}
		else {
			u.as(node, "transform", "translate("+x+"px, "+y+"px)");
		}
		node._x = x;
		node._y = y;
	}
	this.rotate = function(node, deg) {
		u.as(node, "transform", "rotate("+deg+"deg)");
		node._rotation = deg;
	}
	this.scale = function(node, scale) {
		u.as(node, "transform", "scale("+scale+")");
		node._scale = scale;
	}
	this.setOpacity = this.opacity = function(node, opacity) {
		u.as(node, "opacity", opacity);
		node._opacity = opacity;
	}
	this.setWidth = this.width = function(node, width) {
		width = width.toString().match(/\%|auto|px/) ? width : (width + "px");
		node.style.width = width;
		node._width = width;
		node.offsetHeight;
	}
	this.setHeight = this.height = function(node, height) {
		height = height.toString().match(/\%|auto|px/) ? height : (height + "px");
		node.style.height = height;
		node._height = height;
		node.offsetHeight;
	}
	this.setBgPos = this.bgPos = function(node, x, y) {
		x = x.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? x : (x + "px");
		y = y.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? y : (y + "px");
		node.style.backgroundPosition = x + " " + y;
		node._bg_x = x;
		node._bg_y = y;
		node.offsetHeight;
	}
	this.setBgColor = this.bgColor = function(node, color) {
		node.style.backgroundColor = color;
		node._bg_color = color;
		node.offsetHeight;
	}
	// 
	// 	
	// 
	// 	
	// 	
	this._animationqueue = {};
	this.requestAnimationFrame = function(node, callback, duration) {
		if(!u.a.__animation_frame_start) {
			u.a.__animation_frame_start = Date.now();
		}
		var id = u.randomString();
		u.a._animationqueue[id] = {};
		u.a._animationqueue[id].id = id;
		u.a._animationqueue[id].node = node;
		u.a._animationqueue[id].callback = callback;
		u.a._animationqueue[id].duration = duration;
		u.t.setTimer(u.a, function() {u.a.finalAnimationFrame(id)}, duration);
		if(!u.a._animationframe) {
			window._requestAnimationFrame = eval(u.vendorProperty("requestAnimationFrame"));
			window._cancelAnimationFrame = eval(u.vendorProperty("cancelAnimationFrame"));
			u.a._animationframe = function(timestamp) {
				u.bug("frame:" + timestamp);
				var id, animation;
				for(id in u.a._animationqueue) {
					animation = u.a._animationqueue[id];
					if(!animation["__animation_frame_start_"+id]) {
						animation["__animation_frame_start_"+id] = timestamp;
						u.bug("now:" + animation["__animation_frame_start_"+id])
					}
					animation.node[animation.callback]((timestamp-animation["__animation_frame_start_"+id]) / animation.duration);
				}
				if(Object.keys(u.a._animationqueue).length) {
					u.a._requestAnimationId = window._requestAnimationFrame(u.a._animationframe);
				}
			}
		}
		if(!u.a._requestAnimationId) {
			u.a._requestAnimationId = window._requestAnimationFrame(u.a._animationframe);
		}
		return id;
	}
	this.finalAnimationFrame = function(id) {
		u.bug("finalAnimationFrame:" + ", " + id + ", " + u.a._requestAnimationId);
		var animation = u.a._animationqueue[id];
		animation["__animation_frame_start_"+id] = false;
		animation.node[animation.callback](1);
		if(typeof(animation.node.transitioned) == "function") {
			animation.node.transitioned({});
		}
		delete u.a._animationqueue[id];
		if(!Object.keys(u.a._animationqueue).length) {
			this.cancelAnimationFrame(id);
		}
	}
	this.cancelAnimationFrame = function(id) {
		if(id && u.a._animationqueue[id]) {
			delete u.a._animationqueue[id];
		}
		if(u.a._requestAnimationId) {
			window._cancelAnimationFrame(u.a._requestAnimationId);
			u.a.__animation_frame_start = false;
			u.a._requestAnimationId = false;
		}
	}
}


/*u-cookie.js*/
Util.saveCookie = function(name, value, _options) {
	var expires = true;
	var path = false;
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "expires"	: expires	= _options[_argument]; break;
				case "path"		: path		= _options[_argument]; break;
			}
		}
	}
	if(expires === false) {
		expires = ";expires=Mon, 04-Apr-2020 05:00:00 GMT";
	}
	else if(typeof(expires) === "string") {
		expires = ";expires="+expires;
	}
	else {
		expires = "";
	}
	if(typeof(path) === "string") {
		path = ";path="+path;
	}
	else {
		path = "";
	}
	document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + path + expires;
}
Util.getCookie = function(name) {
	var matches;
	return (matches = document.cookie.match(encodeURIComponent(name) + "=([^;]+)")) ? decodeURIComponent(matches[1]) : false;
}
Util.deleteCookie = function(name, _options) {
	var path = false;
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "path"	: path	= _options[_argument]; break;
			}
		}
	}
	if(typeof(path) === "string") {
		path = ";path="+path;
	}
	else {
		path = "";
	}
	document.cookie = encodeURIComponent(name) + "=" + path + ";expires=Thu, 01-Jan-70 00:00:01 GMT";
}
Util.saveNodeCookie = function(node, name, value, _options) {
	var ref = u.cookieReference(node, _options);
	var mem = JSON.parse(u.getCookie("man_mem"));
	if(!mem) {
		mem = {};
	}
	if(!mem[ref]) {
		mem[ref] = {};
	}
	mem[ref][name] = (value !== false && value !== undefined) ? value : "";
	u.saveCookie("man_mem", JSON.stringify(mem), {"path":"/"});
}
Util.getNodeCookie = function(node, name, _options) {
	var ref = u.cookieReference(node, _options);
	var mem = JSON.parse(u.getCookie("man_mem"));
	if(mem && mem[ref]) {
		if(name) {
			return mem[ref][name] ? mem[ref][name] : "";
		}
		else {
			return mem[ref];
		}
	}
	return false;
}
Util.deleteNodeCookie = function(node, name, _options) {
	var ref = u.cookieReference(node, _options);
	var mem = JSON.parse(u.getCookie("man_mem"));
	if(mem && mem[ref]) {
		if(name) {
			delete mem[ref][name];
		}
		else {
			delete mem[ref];
		}
	}
	u.saveCookie("man_mem", JSON.stringify(mem), {"path":"/"});
}
Util.cookieReference = function(node, _options) {
	var ref;
	var ignore_classnames = false;
	var ignore_classvars = false;
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "ignore_classnames"	: ignore_classnames	= _options[_argument]; break;
				case "ignore_classvars" 	: ignore_classvars	= _options[_argument]; break;
			}
		}
	}
	if(node.id) {
		ref = node.nodeName + "#" + node.id;
	}
	else {
		var node_identifier = "";
		if(node.name) {
			node_identifier = node.nodeName + "["+node.name+"]";
		}
		else if(node.className) {
			var classname = node.className;
			if(ignore_classnames) {
				var regex = new RegExp("(^| )("+ignore_classnames.split(",").join("|")+")($| )", "g");
				classname = classname.replace(regex, " ").replace(/[ ]{2,4}/, " ");
			}
			if(ignore_classvars) {
				classname = classname.replace(/(^| )[a-zA-Z_]+\:[\?\=\w\/\\#~\:\.\,\+\&\%\@\!\-]+(^| )/g, " ").replace(/[ ]{2,4}/g, " ");
			}
			node_identifier = node.nodeName+"."+classname.trim().replace(/ /g, ".");
		}
		else {
			node_identifier = node.nodeName
		}
		var id_node = node;
		while(!id_node.id) {
			id_node = id_node.parentNode;
		}
		if(id_node.id) {
			ref = id_node.nodeName + "#" + id_node.id + " " + node_identifier;
		}
		else {
			ref = node_identifier;
		}
	}
	return ref;
}


/*u-dom.js*/
Util.querySelector = u.qs = function(query, scope) {
	scope = scope ? scope : document;
	return scope.querySelector(query);
}
Util.querySelectorAll = u.qsa = function(query, scope) {
	try {
		scope = scope ? scope : document;
		return scope.querySelectorAll(query);
	}
	catch(exception) {
		u.exception("u.qsa", arguments, exception);
	}
	return [];
}
Util.getElement = u.ge = function(identifier, scope) {
	var node, i, regexp;
	if(document.getElementById(identifier)) {
		return document.getElementById(identifier);
	}
	scope = scope ? scope : document;
	regexp = new RegExp("(^|\\s)" + identifier + "(\\s|$|\:)");
	for(i = 0; node = scope.getElementsByTagName("*")[i]; i++) {
		if(regexp.test(node.className)) {
			return node;
		}
	}
	return scope.getElementsByTagName(identifier).length ? scope.getElementsByTagName(identifier)[0] : false;
}
Util.getElements = u.ges = function(identifier, scope) {
	var node, i, regexp;
	var nodes = new Array();
	scope = scope ? scope : document;
	regexp = new RegExp("(^|\\s)" + identifier + "(\\s|$|\:)");
	for(i = 0; node = scope.getElementsByTagName("*")[i]; i++) {
		if(regexp.test(node.className)) {
			nodes.push(node);
		}
	}
	return nodes.length ? nodes : scope.getElementsByTagName(identifier);
}
Util.parentNode = u.pn = function(node, _options) {
	var exclude = "";
	var include = "";
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;
			}
		}
	}
	var exclude_nodes = exclude ? u.qsa(exclude) : [];
	var include_nodes = include ? u.qsa(include) : [];
	node = node.parentNode;
	while(node && (node.nodeType == 3 || node.nodeType == 8 || (exclude && (u.inNodeList(node, exclude_nodes))) || (include && (!u.inNodeList(node, include_nodes))))) {
		node = node.parentNode;
	}
	return node;
}
Util.previousSibling = u.ps = function(node, _options) {
	var exclude = "";
	var include = "";
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;
			}
		}
	}
	var exclude_nodes = exclude ? u.qsa(exclude, node.parentNode) : [];
	var include_nodes = include ? u.qsa(include, node.parentNode) : [];
	node = node.previousSibling;
	while(node && (node.nodeType == 3 || node.nodeType == 8 || (exclude && (u.inNodeList(node, exclude_nodes))) || (include && (!u.inNodeList(node, include_nodes))))) {
		node = node.previousSibling;
	}
	return node;
}
Util.nextSibling = u.ns = function(node, _options) {
	var exclude = "";
	var include = "";
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;
			}
		}
	}
	var exclude_nodes = exclude ? u.qsa(exclude, node.parentNode) : [];
	var include_nodes = include ? u.qsa(include, node.parentNode) : [];
	node = node.nextSibling;
	while(node && (node.nodeType == 3 || node.nodeType == 8 || (exclude && (u.inNodeList(node, exclude_nodes))) || (include && (!u.inNodeList(node, include_nodes))))) {
		node = node.nextSibling;
	}
	return node;
}
Util.childNodes = u.cn = function(node, _options) {
	var exclude = "";
	var include = "";
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "include"      : include       = _options[_argument]; break;
				case "exclude"      : exclude       = _options[_argument]; break;
			}
		}
	}
	var exclude_nodes = exclude ? u.qsa(exclude, node) : [];
	var include_nodes = include ? u.qsa(include, node) : [];
	var i, child;
	var children = new Array();
	for(i = 0; child = node.childNodes[i]; i++) {
		if(child && child.nodeType != 3 && child.nodeType != 8 && (!exclude || (!u.inNodeList(child, exclude_nodes))) && (!include || (u.inNodeList(child, include_nodes)))) {
			children.push(child);
		}
	}
	return children;
}
Util.appendElement = u.ae = function(_parent, node_type, attributes) {
	try {
		var node = (typeof(node_type) == "object") ? node_type : document.createElement(node_type);
		node = _parent.appendChild(node);
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				if(attribute == "html") {
					node.innerHTML = attributes[attribute];
				}
				else {
					node.setAttribute(attribute, attributes[attribute]);
				}
			}
		}
		return node;
	}
	catch(exception) {
		u.exception("u.ae", arguments, exception);
	}
	return false;
}
Util.insertElement = u.ie = function(_parent, node_type, attributes) {
	try {
		var node = (typeof(node_type) == "object") ? node_type : document.createElement(node_type);
		node = _parent.insertBefore(node, _parent.firstChild);
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				if(attribute == "html") {
					node.innerHTML = attributes[attribute];
				}
				else {
					node.setAttribute(attribute, attributes[attribute]);
				}
			}
		}
		return node;
	}
	catch(exception) {
		u.exception("u.ie", arguments, exception);
	}
	return false;
}
Util.wrapElement = u.we = function(node, node_type, attributes) {
	try {
		var wrapper_node = node.parentNode.insertBefore(document.createElement(node_type), node);
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				wrapper_node.setAttribute(attribute, attributes[attribute]);
			}
		}	
		wrapper_node.appendChild(node);
		return wrapper_node;
	}
	catch(exception) {
		u.exception("u.we", arguments, exception);
	}
	return false;
}
Util.wrapContent = u.wc = function(node, node_type, attributes) {
	try {
		var wrapper_node = document.createElement(node_type);
		if(attributes) {
			var attribute;
			for(attribute in attributes) {
				wrapper_node.setAttribute(attribute, attributes[attribute]);
			}
		}	
		while(node.childNodes.length) {
			wrapper_node.appendChild(node.childNodes[0]);
		}
		node.appendChild(wrapper_node);
		return wrapper_node;
	}
	catch(exception) {
		u.exception("u.wc", arguments, exception);
	}
	return false;
}
Util.textContent = u.text = function(node) {
	try {
		return node.textContent;
	}
	catch(exception) {
		u.exception("u.text", arguments, exception);
	}
	return "";
}
Util.clickableElement = u.ce = function(node, _options) {
	node._use_link = "a";
	node._click_type = "manual";
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "use"			: node._use_link		= _options[_argument]; break;
				case "type"			: node._click_type		= _options[_argument]; break;
			}
		}
	}
	var a = (node.nodeName.toLowerCase() == "a" ? node : u.qs(node._use_link, node));
	if(a) {
		u.ac(node, "link");
		if(a.getAttribute("href") !== null) {
			node.url = a.href;
			a.removeAttribute("href");
			node._a = a;
		}
	}
	else {
		u.ac(node, "clickable");
	}
	if(typeof(u.e) != "undefined" && typeof(u.e.click) == "function") {
		u.e.click(node);
		if(node._click_type == "link") {
			node.clicked = function(event) {
				if(event && (event.metaKey || event.ctrlKey)) {
					window.open(this.url);
				}
				else {
					if(typeof(u.h) != "undefined" && u.h.is_listening) {
						u.h.navigate(this.url, this);
					}
					else {
						location.href = this.url;
					}
				}
			}
		}
	}
	return node;
}
Util.classVar = u.cv = function(node, var_name) {
	try {
		var regexp = new RegExp(var_name + ":[?=\\w/\\#~:.,?+=?&%@!\\-]*");
		if(node.className.match(regexp)) {
			return node.className.match(regexp)[0].replace(var_name + ":", "");
		}
	}
	catch(exception) {
		u.exception("u.cv", arguments, exception);
	}
	return false;
}
Util.setClass = u.sc = function(node, classname) {
	try {
		var old_class = node.className;
		node.className = classname;
		node.offsetTop;
		return old_class;
	}
	catch(exception) {
		u.exception("u.sc", arguments, exception);
	}
	return false;
}
Util.hasClass = u.hc = function(node, classname) {
	try {
		if(classname) {
			var regexp = new RegExp("(^|\\s)(" + classname + ")(\\s|$)");
			if(regexp.test(node.className)) {
				return true;
			}
		}
	}
	catch(exception) {
		u.exception("u.hc", arguments, exception);
	}
	return false;
}
Util.addClass = u.ac = function(node, classname, dom_update) {
	try {
		if(classname) {
			var regexp = new RegExp("(^|\\s)" + classname + "(\\s|$)");
			if(!regexp.test(node.className)) {
				node.className += node.className ? " " + classname : classname;
				dom_update === false ? false : node.offsetTop;
			}
			return node.className;
		}
	}
	catch(exception) {
		u.exception("u.ac", arguments, exception);
	}
	return false;
}
Util.removeClass = u.rc = function(node, classname, dom_update) {
	try {
		if(classname) {
			var regexp = new RegExp("(\\b)" + classname + "(\\s|$)", "g");
			node.className = node.className.replace(regexp, " ").trim().replace(/[\s]{2}/g, " ");
			dom_update === false ? false : node.offsetTop;
			return node.className;
		}
	}
	catch(exception) {
		u.exception("u.rc", arguments, exception);
	}
	return false;
}
Util.toggleClass = u.tc = function(node, classname, _classname, dom_update) {
	try {
		var regexp = new RegExp("(^|\\s)" + classname + "(\\s|$|\:)");
		if(regexp.test(node.className)) {
			u.rc(node, classname, false);
			if(_classname) {
				u.ac(node, _classname, false);
			}
		}
		else {
			u.ac(node, classname, false);
			if(_classname) {
				u.rc(node, _classname, false);
			}
		}
		dom_update === false ? false : node.offsetTop;
		return node.className;
	}
	catch(exception) {
		u.exception("u.tc", arguments, exception);
	}
	return false;
}
Util.applyStyle = u.as = function(node, property, value, dom_update) {
	node.style[u.vendorProperty(property)] = value;
	dom_update === false ? false : node.offsetTop;
}
Util.applyStyles = u.ass = function(node, styles, dom_update) {
	if(styles) {
		var style;
		for(style in styles) {
			node.style[u.vendorProperty(style)] = styles[style];
		}
	}
	dom_update === false ? false : node.offsetTop;
}
Util.getComputedStyle = u.gcs = function(node, property) {
	node.offsetHeight;
	property = (u.vendorProperty(property).replace(/([A-Z]{1})/g, "-$1")).toLowerCase().replace(/^(webkit|ms)/, "-$1");
	if(window.getComputedStyle) {
		return window.getComputedStyle(node, null).getPropertyValue(property);
	}
	return false;
}
Util.hasFixedParent = u.hfp = function(node) {
	while(node.nodeName.toLowerCase() != "body") {
		if(u.gcs(node.parentNode, "position").match("fixed")) {
			return true;
		}
		node = node.parentNode;
	}
	return false;
}
Util.selectText = function(node) {
	var selection = window.getSelection();
	var range = document.createRange();
	range.selectNodeContents(node);
	selection.removeAllRanges();
	selection.addRange(range);
}
Util.inNodeList = function(node, list) {
	var i, list_node;
	for(i = 0; list_node = list[i]; i++) {
		if(list_node === node) {
			return true;
		}
	}
	return false;
}
Util.nodeWithin = u.nw = function(node, scope) {
	var node_key = u.randomString(8);
	var scope_key = u.randomString(8);
	u.ac(node, node_key);
	u.ac(scope, scope_key);
	if(u.qs("."+scope_key+" ."+node_key)) {
		u.rc(node, node_key);
		u.rc(scope, scope_key);
		return true;
	}
	u.rc(node, node_key);
	u.rc(scope, scope_key);
	return false;
}


/*u-easings.js*/
u.easings = new function() {
	this["ease-in"] = function(progress) {
		return Math.pow((progress*this.duration) / this.duration, 3);
	}
	this["linear"] = function(progress) {
		return progress;
	}
	this["ease-out"] = function(progress) {
		return 1 - Math.pow(1 - ((progress*this.duration) / this.duration), 3);
	}
	this["linear"] = function(progress) {
		return (progress*this.duration) / this.duration;
	}
	this["ease-in-out"] = function(progress) {
		if((progress*this.duration) > (this.duration / 2)) {
			return 1 - Math.pow(1 - ((progress*this.duration) / this.duration), 3);
		}
		return Math.pow((progress*this.duration) / this.duration, 3);
	}
}

/*u-events.js*/
Util.Events = u.e = new function() {
	this.event_pref = typeof(document.ontouchmove) == "undefined" || (navigator.maxTouchPoints > 1 && navigator.userAgent.match(/Windows/i)) ? "mouse" : "touch";
	if(navigator.maxTouchPoints > 1) {
		if(typeof(document.ontouchmove) == "undefined" && typeof(document.onmousemove) == "undefined") {
			this.event_support = "multi";
		}
	}
	if(!this.event_support) {
		if(typeof(document.ontouchmove) == "undefined") {
			this.event_support = "mouse";
		}
		else {
			this.event_support = "touch";
		}
	}
	this.events = {
		"mouse": {
			"start":"mousedown",
			"move":"mousemove",
			"end":"mouseup",
			"over":"mouseover",
			"out":"mouseout"
		},
		"touch": {
			"start":"touchstart",
			"move":"touchmove",
			"end":"touchend",
			"over":"touchstart",
			"out":"touchend"
		}
	}
	this.kill = function(event) {
		if(event) {
			event.preventDefault();
			event.stopPropagation();
		}
	}
	this.addEvent = function(node, type, action) {
		try {
			node.addEventListener(type, action, false);
		}
		catch(exception) {
			alert("exception in addEvent:" + node + "," + type + ":" + exception);
		}
	}
	this.removeEvent = function(node, type, action) {
		try {
			node.removeEventListener(type, action, false);
		}
		catch(exception) {
			u.bug("exception in removeEvent:" + node + "," + type + ":" + exception);
		}
	}
	this.addStartEvent = this.addDownEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.start, action);
			u.e.addEvent(node, this.events.touch.start, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].start, action);
		}
	}
	this.removeStartEvent = this.removeDownEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.start, action);
			u.e.removeEvent(node, this.events.touch.start, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].start, action);
		}
	}
	this.addMoveEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.move, action);
			u.e.addEvent(node, this.events.touch.move, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].move, action);
		}
	}
	this.removeMoveEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.move, action);
			u.e.removeEvent(node, this.events.touch.move, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].move, action);
		}
	}
	this.addEndEvent = this.addUpEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.end, action);
			u.e.addEvent(node, this.events.touch.end, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].end, action);
		}
	}
	this.removeEndEvent = this.removeUpEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.end, action);
			u.e.removeEvent(node, this.events.touch.end, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].end, action);
		}
	}
	this.addOverEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.over, action);
			u.e.addEvent(node, this.events.touch.over, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].over, action);
		}
	}
	this.removeOverEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.over, action);
			u.e.removeEvent(node, this.events.touch.over, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].over, action);
		}
	}
	this.addOutEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.addEvent(node, this.events.mouse.out, action);
			u.e.addEvent(node, this.events.touch.out, action);
		}
		else {
			u.e.addEvent(node, this.events[this.event_support].out, action);
		}
	}
	this.removeOutEvent = function(node, action) {
		if(this.event_support == "multi") {
			u.e.removeEvent(node, this.events.mouse.out, action);
			u.e.removeEvent(node, this.events.touch.out, action);
		}
		else {
			u.e.removeEvent(node, this.events[this.event_support].out, action);
		}
	}
	this.resetClickEvents = function(node) {
		u.t.resetTimer(node.t_held);
		u.t.resetTimer(node.t_clicked);
		this.removeEvent(node, "mouseup", this._dblclicked);
		this.removeEvent(node, "touchend", this._dblclicked);
		this.removeEvent(node, "mousemove", this._cancelClick);
		this.removeEvent(node, "touchmove", this._cancelClick);
		this.removeEvent(node, "mouseout", this._cancelClick);
		this.removeEvent(node, "mousemove", this._move);
		this.removeEvent(node, "touchmove", this._move);
	}
	this.resetEvents = function(node) {
		this.resetClickEvents(node);
		if(typeof(this.resetDragEvents) == "function") {
			this.resetDragEvents(node);
		}
	}
	this.resetNestedEvents = function(node) {
		while(node && node.nodeName != "HTML") {
			this.resetEvents(node);
			node = node.parentNode;
		}
	}
	this._inputStart = function(event) {
		this.event_var = event;
		this.input_timestamp = event.timeStamp;
		this.start_event_x = u.eventX(event);
		this.start_event_y = u.eventY(event);
		this.current_xps = 0;
		this.current_yps = 0;
		this.move_timestamp = event.timeStamp;
		this.move_last_x = 0;
		this.move_last_y = 0;
		this._moves_cancel = 0;
		this.swiped = false;
		if(this.e_click || this.e_dblclick || this.e_hold) {
			if(event.type.match(/mouse/)) {
				var node = this;
				while(node) {
					if(node.e_drag || node.e_swipe) {
						u.e.addMoveEvent(this, u.e._cancelClick);
						break;
					}
					else {
						node = node.parentNode;
					}
				}
				u.e.addEvent(this, "mouseout", u.e._cancelClick);
			}
			else {
				u.e.addMoveEvent(this, u.e._cancelClick);
			}
			u.e.addMoveEvent(this, u.e._move);
			u.e.addEndEvent(this, u.e._dblclicked);
		}
		if(this.e_hold) {
			this.t_held = u.t.setTimer(this, u.e._held, 750);
		}
		if(this.e_drag || this.e_swipe) {
			u.e.addMoveEvent(this, u.e._pick);
			u.e.addEndEvent(this, u.e._drop);
		}
		if(this.e_scroll) {
			u.e.addMoveEvent(this, u.e._scrollStart);
			u.e.addEndEvent(this, u.e._scrollEnd);
		}
		if(typeof(this.inputStarted) == "function") {
			this.inputStarted(event);
		}
	}
	this._cancelClick = function(event) {
		var offset_x = u.eventX(event) - this.start_event_x;
		var offset_y = u.eventY(event) - this.start_event_y;
		if(event.type.match(/mouseout/) || this._moves_cancel > 1 || (event.type.match(/move/) && (Math.abs(offset_x) > 15 || Math.abs(offset_y) > 15))) {
			u.e.resetClickEvents(this);
			if(typeof(this.clickCancelled) == "function") {
				this.clickCancelled(event);
			}
		}
		else if(event.type.match(/move/)) {
			this._moves_cancel++;
		}
	}
	this._move = function(event) {
		if(typeof(this.moved) == "function") {
			this.current_x = u.eventX(event) - this.start_event_x;
			this.current_y = u.eventY(event) - this.start_event_y;
			this.current_xps = Math.round(((this.current_x - this.move_last_x) / (event.timeStamp - this.move_timestamp)) * 1000);
			this.current_yps = Math.round(((this.current_y - this.move_last_y) / (event.timeStamp - this.move_timestamp)) * 1000);
			this.move_timestamp = event.timeStamp;
			this.move_last_x = this.current_x;
			this.move_last_y = this.current_y;
			this.moved(event);
		}
	}
	this.hold = function(node) {
		node.e_hold = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._held = function(event) {
		u.stats.event(this, "held");
		u.e.resetNestedEvents(this);
		if(typeof(this.held) == "function") {
			this.held(event);
		}
	}
	this.click = this.tap = function(node) {
		node.e_click = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._clicked = function(event) {
		u.stats.event(this, "clicked");
		u.e.resetNestedEvents(this);
		if(typeof(this.clicked) == "function") {
			this.clicked(event);
		}
	}
	this.dblclick = this.doubletap = function(node) {
		node.e_dblclick = true;
		u.e.addStartEvent(node, this._inputStart);
	}
	this._dblclicked = function(event) {
		if(u.t.valid(this.t_clicked) && event) {
			u.stats.event(this, "dblclicked");
			u.e.resetNestedEvents(this);
			if(typeof(this.dblclicked) == "function") {
				this.dblclicked(event);
			}
			return;
		}
		else if(!this.e_dblclick) {
			this._clicked = u.e._clicked;
			this._clicked(event);
		}
		else if(event.type == "timeout") {
			this._clicked = u.e._clicked;
			this._clicked(this.event_var);
		}
		else {
			u.e.resetNestedEvents(this);
			this.t_clicked = u.t.setTimer(this, u.e._dblclicked, 400);
		}
	}
	this.hover = function(node, _options) {
		node._hover_out_delay = 100;
		node._callback_out = "out";
		node._callback_over = "over";
		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {
				switch(argument) {
					case "over"				: node._callback_over		= _options[argument]; break;
					case "out"				: node._callback_out		= _options[argument]; break;
					case "delay"			: node._hover_out_delay		= _options[argument]; break;
				}
			}
		}
		node.e_hover = true;
		u.e.addOverEvent(node, this._over);
		u.e.addOutEvent(node, this._out);
	}
	this._over = function(event) {
		u.t.resetTimer(this.t_out);
		if(typeof(this[this._callback_over]) == "function" && !this.is_hovered) {
			this[this._callback_over](event);
		}
		this.is_hovered = true;
	}
	this._out = function(event) {
		this.t_out = u.t.setTimer(this, u.e.__out, this._hover_out_delay, event);
	}
	this.__out = function(event) {
		this.is_hovered = false;
		if(typeof(this[this._callback_out]) == "function") {
			this[this._callback_out](event);
		}
	}
}


/*u-events-browser.js*/
u.e.addDOMReadyEvent = function(action) {
	if(document.readyState && document.addEventListener) {
		if((document.readyState == "interactive" && !u.browser("ie")) || document.readyState == "complete" || document.readyState == "loaded") {
			action();
		}
		else {
			var id = u.randomString();
			window["DOMReady_" + id] = action;
			eval('window["_DOMReady_' + id + '"] = function() {window["DOMReady_'+id+'"](); u.e.removeEvent(document, "DOMContentLoaded", window["_DOMReady_' + id + '"])}');
			u.e.addEvent(document, "DOMContentLoaded", window["_DOMReady_" + id]);
		}
	}
	else {
		u.e.addOnloadEvent(action);
	}
}
u.e.addOnloadEvent = function(action) {
	if(document.readyState && (document.readyState == "complete" || document.readyState == "loaded")) {
		action();
	}
	else {
		var id = u.randomString();
		window["Onload_" + id] = action;
		eval('window["_Onload_' + id + '"] = function() {window["Onload_'+id+'"](); u.e.removeEvent(window, "load", window["_Onload_' + id + '"])}');
		u.e.addEvent(window, "load", window["_Onload_" + id]);
	}
}
u.e.addWindowEvent = function(node, type, action) {
	var id = u.randomString();
	window["_OnWindowEvent_node_"+ id] = node;
	if(typeof(action) == "function") {
		eval('window["_OnWindowEvent_callback_' + id + '"] = function(event) {window["_OnWindowEvent_node_'+ id + '"]._OnWindowEvent_callback_'+id+' = '+action+'; window["_OnWindowEvent_node_'+ id + '"]._OnWindowEvent_callback_'+id+'(event);};');
	} 
	else {
		eval('window["_OnWindowEvent_callback_' + id + '"] = function(event) {if(typeof(window["_OnWindowEvent_node_'+ id + '"]["'+action+'"]) == "function") {window["_OnWindowEvent_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEvent(window, type, window["_OnWindowEvent_callback_" + id]);
	return id;
}
u.e.removeWindowEvent = function(node, type, id) {
	u.e.removeEvent(window, type, window["_OnWindowEvent_callback_"+id]);
	window["_OnWindowEvent_node_"+id]["_OnWindowEvent_callback_"+id] = null;
	window["_OnWindowEvent_node_"+id] = null;
	window["_OnWindowEvent_callback_"+id] = null;
}
u.e.addWindowStartEvent = function(node, action) {
	var id = u.randomString();
	window["_Onstart_node_"+ id] = node;
	if(typeof(action) == "function") {
		eval('window["_Onstart_callback_' + id + '"] = function(event) {window["_Onstart_node_'+ id + '"]._Onstart_callback_'+id+' = '+action+'; window["_Onstart_node_'+ id + '"]._Onstart_callback_'+id+'(event);};');
	} 
	else {
		eval('window["_Onstart_callback_' + id + '"] = function(event) {if(typeof(window["_Onstart_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onstart_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addStartEvent(window, window["_Onstart_callback_" + id]);
	return id;
}
u.e.removeWindowStartEvent = function(node, id) {
	u.e.removeStartEvent(window, window["_Onstart_callback_"+id]);
	window["_Onstart_node_"+id]["_Onstart_callback_"+id] = null;
	window["_Onstart_node_"+id] = null;
	window["_Onstart_callback_"+id] = null;
}
u.e.addWindowMoveEvent = function(node, action) {
	var id = u.randomString();
	window["_Onmove_node_"+ id] = node;
	if(typeof(action) == "function") {
		eval('window["_Onmove_callback_' + id + '"] = function(event) {window["_Onmove_node_'+ id + '"]._Onmove_callback_'+id+' = '+action+'; window["_Onmove_node_'+ id + '"]._Onmove_callback_'+id+'(event);};');
	} 
	else {
		eval('window["_Onmove_callback_' + id + '"] = function(event) {if(typeof(window["_Onmove_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onmove_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addMoveEvent(window, window["_Onmove_callback_" + id]);
	return id;
}
u.e.removeWindowMoveEvent = function(node, id) {
	u.e.removeMoveEvent(window, window["_Onmove_callback_" + id]);
	window["_Onmove_node_"+ id]["_Onmove_callback_"+id] = null;
	window["_Onmove_node_"+ id] = null;
	window["_Onmove_callback_"+ id] = null;
}
u.e.addWindowEndEvent = function(node, action) {
	var id = u.randomString();
	window["_Onend_node_"+ id] = node;
	if(typeof(action) == "function") {
		eval('window["_Onend_callback_' + id + '"] = function(event) {window["_Onend_node_'+ id + '"]._Onend_callback_'+id+' = '+action+'; window["_Onend_node_'+ id + '"]._Onend_callback_'+id+'(event);};');
	} 
	else {
		eval('window["_Onend_callback_' + id + '"] = function(event) {if(typeof(window["_Onend_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onend_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEndEvent(window, window["_Onend_callback_" + id]);
	return id;
}
u.e.removeWindowEndEvent = function(node, id) {
	u.e.removeEndEvent(window, window["_Onend_callback_" + id]);
	window["_Onend_node_"+ id]["_Onend_callback_"+id] = null;
	window["_Onend_node_"+ id] = null;
	window["_Onend_callback_"+ id] = null;
}
u.e.addWindowResizeEvent = function(node, action) {
	var id = u.randomString();
	window["_Onresize_node_"+ id] = node;
	if(typeof(action) == "function") {
		eval('window["_Onresize_callback_' + id + '"] = function(event) {window["_Onresize_node_'+ id + '"]._Onresize_callback_'+id+' = '+action+'; window["_Onresize_node_'+ id + '"]._Onresize_callback_'+id+'(event);};');
	} 
	else {
		eval('window["_Onresize_callback_' + id + '"] = function(event) {if(typeof(window["_Onresize_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onresize_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEvent(window, "resize", window["_Onresize_callback_" + id]);
	return id;
}
u.e.removeWindowResizeEvent = function(node, id) {
	u.e.removeEvent(window, "resize", window["_Onresize_callback_"+id]);
	window["_Onresize_node_"+id]["_Onresize_callback_"+id] = null;
	window["_Onresize_node_"+id] = null;
	window["_Onresize_callback_"+id] = null;
}
u.e.addWindowScrollEvent = function(node, action) {
	var id = u.randomString();
	window["_Onscroll_node_"+ id] = node;
	if(typeof(action) == "function") {
		eval('window["_Onscroll_callback_' + id + '"] = function(event) {window["_Onscroll_node_'+ id + '"]._Onscroll_callback_'+id+' = '+action+'; window["_Onscroll_node_'+ id + '"]._Onscroll_callback_'+id+'(event);};');
	} 
	else {
		eval('window["_Onscroll_callback_' + id + '"] = function(event) {if(typeof(window["_Onscroll_node_'+ id + '"]["'+action+'"]) == "function") {window["_Onscroll_node_'+id+'"]["'+action+'"](event);}};');
	}
	u.e.addEvent(window, "scroll", window["_Onscroll_callback_" + id]);
	return id;
}
u.e.removeWindowScrollEvent = function(node, id) {
	u.e.removeEvent(window, "scroll", window["_Onscroll_callback_"+id]);
	window["_Onscroll_node_"+id]["_Onscroll_callback_"+id] = null;
	window["_Onscroll_node_"+id] = null;
	window["_Onscroll_callback_"+id] = null;
}


/*u-events-movements.js*/
u.e.resetDragEvents = function(node) {
	node._moves_pick = 0;
	this.removeEvent(node, "mousemove", this._pick);
	this.removeEvent(node, "touchmove", this._pick);
	this.removeEvent(node, "mousemove", this._drag);
	this.removeEvent(node, "touchmove", this._drag);
	this.removeEvent(node, "mouseup", this._drop);
	this.removeEvent(node, "touchend", this._drop);
	this.removeEvent(node, "mouseout", this._drop_out);
	this.removeEvent(node, "mouseover", this._drop_over);
	this.removeEvent(node, "mousemove", this._scrollStart);
	this.removeEvent(node, "touchmove", this._scrollStart);
	this.removeEvent(node, "mousemove", this._scrolling);
	this.removeEvent(node, "touchmove", this._scrolling);
	this.removeEvent(node, "mouseup", this._scrollEnd);
	this.removeEvent(node, "touchend", this._scrollEnd);
}
u.e.overlap = function(node, boundaries, strict) {
	if(boundaries.constructor.toString().match("Array")) {
		var boundaries_start_x = Number(boundaries[0]);
		var boundaries_start_y = Number(boundaries[1]);
		var boundaries_end_x = Number(boundaries[2]);
		var boundaries_end_y = Number(boundaries[3]);
	}
	else if(boundaries.constructor.toString().match("HTML")) {
		var boundaries_start_x = u.absX(boundaries) - u.absX(node);
		var boundaries_start_y =  u.absY(boundaries) - u.absY(node);
		var boundaries_end_x = Number(boundaries_start_x + boundaries.offsetWidth);
		var boundaries_end_y = Number(boundaries_start_y + boundaries.offsetHeight);
	}
	var node_start_x = Number(node._x);
	var node_start_y = Number(node._y);
	var node_end_x = Number(node_start_x + node.offsetWidth);
	var node_end_y = Number(node_start_y + node.offsetHeight);
	if(strict) {
		if(node_start_x >= boundaries_start_x && node_start_y >= boundaries_start_y && node_end_x <= boundaries_end_x && node_end_y <= boundaries_end_y) {
			return true;
		}
		else {
			return false;
		}
	} 
	else if(node_end_x < boundaries_start_x || node_start_x > boundaries_end_x || node_end_y < boundaries_start_y || node_start_y > boundaries_end_y) {
		return false;
	}
	return true;
}
u.e.drag = function(node, boundaries, _options) {
	node.e_drag = true;
	node._moves_pick = 0;
	if(node.childNodes.length < 2 && node.innerHTML.trim() == "") {
		node.innerHTML = "&nbsp;";
	}
	node.drag_strict = true;
	node.drag_elastica = 0;
	node.drag_dropout = true;
	node.show_bounds = false;
	node.callback_picked = "picked";
	node.callback_moved = "moved";
	node.callback_dropped = "dropped";
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "strict"			: node.drag_strict			= _options[_argument]; break;
				case "elastica"			: node.drag_elastica		= Number(_options[_argument]); break;
				case "dropout"			: node.drag_dropout			= _options[_argument]; break;
				case "show_bounds"		: node.show_bounds			= _options[_argument]; break; 
				case "vertical_lock"	: node.vertical_lock		= _options[_argument]; break;
				case "horizontal_lock"	: node.horizontal_lock		= _options[_argument]; break;
				case "callback_picked"	: node.callback_picked		= _options[_argument]; break;
				case "callback_moved"	: node.callback_moved		= _options[_argument]; break;
				case "callback_dropped"	: node.callback_dropped		= _options[_argument]; break;
			}
		}
	}
	if((boundaries.constructor && boundaries.constructor.toString().match("Array")) || (boundaries.scopeName && boundaries.scopeName != "HTML")) {
		node.start_drag_x = Number(boundaries[0]);
		node.start_drag_y = Number(boundaries[1]);
		node.end_drag_x = Number(boundaries[2]);
		node.end_drag_y = Number(boundaries[3]);
	}
	else if((boundaries.constructor && boundaries.constructor.toString().match("HTML")) || (boundaries.scopeName && boundaries.scopeName == "HTML")) {
		node.start_drag_x = u.absX(boundaries) - u.absX(node);
		node.start_drag_y = u.absY(boundaries) - u.absY(node);
		node.end_drag_x = node.start_drag_x + boundaries.offsetWidth;
		node.end_drag_y = node.start_drag_y + boundaries.offsetHeight;
		// 	
		// 	
		// 	
		// 	
		// 	
		// 	
		// 	
	}
	if(node.show_bounds) {
		var debug_bounds = u.ae(document.body, "div", {"class":"debug_bounds"})
		debug_bounds.style.position = "absolute";
		debug_bounds.style.background = "red"
		debug_bounds.style.left = (u.absX(node) + node.start_drag_x - 1) + "px";
		debug_bounds.style.top = (u.absY(node) + node.start_drag_y - 1) + "px";
		debug_bounds.style.width = (node.end_drag_x - node.start_drag_x) + "px";
		debug_bounds.style.height = (node.end_drag_y - node.start_drag_y) + "px";
		debug_bounds.style.border = "1px solid white";
		debug_bounds.style.zIndex = 9999;
		debug_bounds.style.opacity = .5;
		if(document.readyState && document.readyState == "interactive") {
			debug_bounds.innerHTML = "WARNING - injected on DOMLoaded"; 
		}
		u.bug("node: "+u.nodeId(node)+" in (" + u.absX(node) + "," + u.absY(node) + "), (" + (u.absX(node)+node.offsetWidth) + "," + (u.absY(node)+node.offsetHeight) +")");
		u.bug("boundaries: (" + node.start_drag_x + "," + node.start_drag_y + "), (" + node.end_drag_x + ", " + node.end_drag_y + ")");
	}
	node._x = node._x ? node._x : 0;
	node._y = node._y ? node._y : 0;
	node.locked = ((node.end_drag_x - node.start_drag_x == node.offsetWidth) && (node.end_drag_y - node.start_drag_y == node.offsetHeight));
	node.only_vertical = (node.vertical_lock || (!node.locked && node.end_drag_x - node.start_drag_x == node.offsetWidth));
	node.only_horizontal = (node.horizontal_lock || (!node.locked && node.end_drag_y - node.start_drag_y == node.offsetHeight));
	u.e.addStartEvent(node, this._inputStart);
}
u.e._pick = function(event) {
	var init_speed_x = Math.abs(this.start_event_x - u.eventX(event));
	var init_speed_y = Math.abs(this.start_event_y - u.eventY(event));
	if((init_speed_x > init_speed_y && this.only_horizontal) || 
	   (init_speed_x < init_speed_y && this.only_vertical) ||
	   (!this.only_vertical && !this.only_horizontal)) {
		if(this._moves_pick > 1) {
			u.e.resetNestedEvents(this);
			u.e.kill(event);
			if(u.hasFixedParent(this)) {
				this.has_fixed_parent = true;
			}
			else {
				this.has_fixed_parent = false;
			}
			this.move_timestamp = event.timeStamp;
			this.move_last_x = this._x;
			this.move_last_y = this._y;
			if(u.hasFixedParent(this)) {
				this.start_input_x = u.eventX(event) - this._x - u.scrollX(); 
				this.start_input_y = u.eventY(event) - this._y - u.scrollY();
			}
			else {
				this.start_input_x = u.eventX(event) - this._x; 
				this.start_input_y = u.eventY(event) - this._y;
			}
			this.current_xps = 0;
			this.current_yps = 0;
			u.a.transition(this, "none");
			u.e.addMoveEvent(this, u.e._drag);
			u.e.addEndEvent(this, u.e._drop);
			if(typeof(this[this.callback_picked]) == "function") {
				this[this.callback_picked](event);
			}
			if(this.drag_dropout && event.type.match(/mouse/)) {
				// 	
				// 	
				// 	
				// 	
				// 	
				// 
				// 
				// 	
				this._dropOutDrag = u.e._drag;
				this._dropOutDrop = u.e._drop;
				u.e.addOutEvent(this, u.e._drop_out);
			}
		}
		else {
			this._moves_pick++;
		}
	}
}
u.e._drag = function(event) {
	if(this.has_fixed_parent) {
		this.current_x = u.eventX(event) - this.start_input_x - u.scrollX();
		this.current_y = u.eventY(event) - this.start_input_y - u.scrollY();
	}
	else {
		this.current_x = u.eventX(event) - this.start_input_x;
		this.current_y = u.eventY(event) - this.start_input_y;
	}
	this.current_xps = Math.round(((this.current_x - this.move_last_x) / (event.timeStamp - this.move_timestamp)) * 1000);
	this.current_yps = Math.round(((this.current_y - this.move_last_y) / (event.timeStamp - this.move_timestamp)) * 1000);
	this.move_timestamp = event.timeStamp;
	this.move_last_x = this.current_x;
	this.move_last_y = this.current_y;
	if(!this.locked && this.only_vertical) {
		this._y = this.current_y;
	}
	else if(!this.locked && this.only_horizontal) {
		this._x = this.current_x;
	}
	else if(!this.locked) {
		this._x = this.current_x;
		this._y = this.current_y;
	}
	if(this.e_swipe) {
		if(this.only_horizontal) {
			if(this.current_xps < 0) {
				this.swiped = "left";
			}
			else {
				this.swiped = "right";
			}
		}
		else if(this.only_vertical) {
			if(this.current_yps < 0) {
				this.swiped = "up";
			}
			else {
				this.swiped = "down";
			}
		}
		else {
			if(Math.abs(this.current_xps) > Math.abs(this.current_yps)) {
				if(this.current_xps < 0) {
					this.swiped = "left";
				}
				else {
					this.swiped = "right";
				}
			}
			else if(Math.abs(this.current_xps) < Math.abs(this.current_yps)) {
				if(this.current_yps < 0) {
					this.swiped = "up";
				}
				else {
					this.swiped = "down";
				}
			}
		}
	}
	if(!this.locked) {
		if(u.e.overlap(this, [this.start_drag_x, this.start_drag_y, this.end_drag_x, this.end_drag_y], true)) {
			u.a.translate(this, this._x, this._y);
		}
		else if(this.drag_elastica) {
			this.swiped = false;
			this.current_xps = 0;
			this.current_yps = 0;
			var offset = false;
			if(!this.only_vertical && this._x < this.start_drag_x) {
				offset = this._x < this.start_drag_x - this.drag_elastica ? - this.drag_elastica : this._x - this.start_drag_x;
				this._x = this.start_drag_x;
				this.current_x = this._x + offset + (Math.round(Math.pow(offset, 2)/this.drag_elastica));
			}
			else if(!this.only_vertical && this._x + this.offsetWidth > this.end_drag_x) {
				offset = this._x + this.offsetWidth > this.end_drag_x + this.drag_elastica ? this.drag_elastica : this._x + this.offsetWidth - this.end_drag_x;
				this._x = this.end_drag_x - this.offsetWidth;
				this.current_x = this._x + offset - (Math.round(Math.pow(offset, 2)/this.drag_elastica));
			}
			else {
				this.current_x = this._x;
			}
			if(!this.only_horizontal && this._y < this.start_drag_y) {
				offset = this._y < this.start_drag_y - this.drag_elastica ? - this.drag_elastica : this._y - this.start_drag_y;
				this._y = this.start_drag_y;
				this.current_y = this._y + offset + (Math.round(Math.pow(offset, 2)/this.drag_elastica));
			}
			else if(!this.horizontal && this._y + this.offsetHeight > this.end_drag_y) {
				offset = (this._y + this.offsetHeight > this.end_drag_y + this.drag_elastica) ? this.drag_elastica : (this._y + this.offsetHeight - this.end_drag_y);
				this._y = this.end_drag_y - this.offsetHeight;
				this.current_y = this._y + offset - (Math.round(Math.pow(offset, 2)/this.drag_elastica));
			}
			else {
				this.current_y = this._y;
			}
			if(offset) {
				u.a.translate(this, this.current_x, this.current_y);
			}
		}
		else {
			this.swiped = false;
			this.current_xps = 0;
			this.current_yps = 0;
			if(this._x < this.start_drag_x) {
				this._x = this.start_drag_x;
			}
			else if(this._x + this.offsetWidth > this.end_drag_x) {
				this._x = this.end_drag_x - this.offsetWidth;
			}
			if(this._y < this.start_drag_y) {
				this._y = this.start_drag_y;
			}
			else if(this._y + this.offsetHeight > this.end_drag_y) { 
				this._y = this.end_drag_y - this.offsetHeight;
			}
			u.a.translate(this, this._x, this._y);
		}
	}
	if(typeof(this[this.callback_moved]) == "function") {
		this[this.callback_moved](event);
	}
}
u.e._drop = function(event) {
	u.e.resetEvents(this);
	if(this.e_swipe && this.swiped) {
		if(this.swiped == "left" && typeof(this.swipedLeft) == "function") {
			this.swipedLeft(event);
		}
		else if(this.swiped == "right" && typeof(this.swipedRight) == "function") {
			this.swipedRight(event);
		}
		else if(this.swiped == "down" && typeof(this.swipedDown) == "function") {
			this.swipedDown(event);
		}
		else if(this.swiped == "up" && typeof(this.swipedUp) == "function") {
			this.swipedUp(event);
		}
	}
	else if(!this.drag_strict && !this.locked) {
		this.current_x = Math.round(this._x + (this.current_xps/2));
		this.current_y = Math.round(this._y + (this.current_yps/2));
		if(this.only_vertical || this.current_x < this.start_drag_x) {
			this.current_x = this.start_drag_x;
		}
		else if(this.current_x + this.offsetWidth > this.end_drag_x) {
			this.current_x = this.end_drag_x - this.offsetWidth;
		}
		if(this.only_horizontal || this.current_y < this.start_drag_y) {
			this.current_y = this.start_drag_y;
		}
		else if(this.current_y + this.offsetHeight > this.end_drag_y) {
			this.current_y = this.end_drag_y - this.offsetHeight;
		}
		this.transitioned = function() {
			this.transitioned = null;
			u.a.transition(this, "none");
			if(typeof(this.projected) == "function") {
				this.projected(event);
			}
		}
		if(this.current_xps || this.current_yps) {
			u.a.transition(this, "all 1s cubic-bezier(0,0,0.25,1)");
		}
		else {
			u.a.transition(this, "all 0.2s cubic-bezier(0,0,0.25,1)");
		}
		u.a.translate(this, this.current_x, this.current_y);
	}
	if(typeof(this[this.callback_dropped]) == "function") {
		this[this.callback_dropped](event);
	}
}
u.e._drop_out = function(event) {
	this._drop_out_id = u.randomString();
	document["_DroppedOutNode" + this._drop_out_id] = this;
	eval('document["_DroppedOutMove' + this._drop_out_id + '"] = function(event) {document["_DroppedOutNode' + this._drop_out_id + '"]._dropOutDrag(event);}');
	eval('document["_DroppedOutOver' + this._drop_out_id + '"] = function(event) {u.e.removeEvent(document, "mousemove", document["_DroppedOutMove' + this._drop_out_id + '"]);u.e.removeEvent(document, "mouseup", document["_DroppedOutEnd' + this._drop_out_id + '"]);u.e.removeEvent(document["_DroppedOutNode' + this._drop_out_id + '"], "mouseover", document["_DroppedOutOver' + this._drop_out_id + '"]);}');
	eval('document["_DroppedOutEnd' + this._drop_out_id + '"] = function(event) {u.e.removeEvent(document, "mousemove", document["_DroppedOutMove' + this._drop_out_id + '"]);u.e.removeEvent(document, "mouseup", document["_DroppedOutEnd' + this._drop_out_id + '"]);u.e.removeEvent(document["_DroppedOutNode' + this._drop_out_id + '"], "mouseover", document["_DroppedOutOver' + this._drop_out_id + '"]);document["_DroppedOutNode' + this._drop_out_id + '"]._dropOutDrop(event);}');
	u.e.addEvent(document, "mousemove", document["_DroppedOutMove" + this._drop_out_id]);
	u.e.addEvent(this, "mouseover", document["_DroppedOutOver" + this._drop_out_id]);
	u.e.addEvent(document, "mouseup", document["_DroppedOutEnd" + this._drop_out_id]);
}
u.e.swipe = function(node, boundaries, _options) {
	node.e_swipe = true;
	u.e.drag(node, boundaries, _options);
}


/*u-geometry.js*/
Util.absoluteX = u.absX = function(node) {
	if(node.offsetParent) {
		return node.offsetLeft + u.absX(node.offsetParent);
	}
	return node.offsetLeft;
}
Util.absoluteY = u.absY = function(node) {
	if(node.offsetParent) {
		return node.offsetTop + u.absY(node.offsetParent);
	}
	return node.offsetTop;
}
Util.relativeX = u.relX = function(node) {
	if(u.gcs(node, "position").match(/absolute/) == null && node.offsetParent && u.gcs(node.offsetParent, "position").match(/relative|absolute|fixed/) == null) {
		return node.offsetLeft + u.relX(node.offsetParent);
	}
	return node.offsetLeft;
}
Util.relativeY = u.relY = function(node) {
	if(u.gcs(node, "position").match(/absolute/) == null && node.offsetParent && u.gcs(node.offsetParent, "position").match(/relative|absolute|fixed/) == null) {
		return node.offsetTop + u.relY(node.offsetParent);
	}
	return node.offsetTop;
}
Util.actualWidth = u.actualW = function(node) {
	return parseInt(u.gcs(node, "width"));
}
Util.actualHeight = u.actualH = function(node) {
	return parseInt(u.gcs(node, "height"));
}
Util.eventX = function(event){
	return (event.targetTouches && event.targetTouches.length ? event.targetTouches[0].pageX : event.pageX);
}
Util.eventY = function(event){
	return (event.targetTouches && event.targetTouches.length ? event.targetTouches[0].pageY : event.pageY);
}
Util.browserWidth = u.browserW = function() {
	return document.documentElement.clientWidth;
}
Util.browserHeight = u.browserH = function() {
	return document.documentElement.clientHeight;
}
Util.htmlWidth = u.htmlW = function() {
	return document.body.offsetWidth + parseInt(u.gcs(document.body, "margin-left")) + parseInt(u.gcs(document.body, "margin-right"));
}
Util.htmlHeight = u.htmlH = function() {
	return document.body.offsetHeight + parseInt(u.gcs(document.body, "margin-top")) + parseInt(u.gcs(document.body, "margin-bottom"));
}
Util.pageScrollX = u.scrollX = function() {
	return window.pageXOffset;
}
Util.pageScrollY = u.scrollY = function() {
	return window.pageYOffset;
}


/*u-history.js*/
Util.History = u.h = new function() {
	this.popstate = ("onpopstate" in window);
	this.callbacks = [];
	this.is_listening = false;
	this.navigate = function(url, node) {
		if(this.popstate) {
			history.pushState({}, url, url);
			this.callback(url);
		}
		else {
			location.hash = u.h.getCleanUrl(url);
		}
	}
	this.callback = function(url) {
		var i, recipient;
		for(i = 0; recipient = this.callbacks[i]; i++) {
			if(typeof(recipient.node[recipient.callback]) == "function") {
				recipient.node[recipient.callback](url);
			}
		}
	}
	this.removeEvent = function(node, _options) {
		var callback_urlchange = "navigate";
		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {
				switch(argument) {
					case "callback"		: callback_urlchange		= _options[argument]; break;
				}
			}
		}
		var i, recipient;
		for(i = 0; recipient = this.callbacks[i]; i++) {
			if(recipient.node == node && recipient.callback == callback_urlchange) {
				this.callbacks.splice(i, 1);
				break;
			}
		}
	}
	this.addEvent = function(node, _options) {
		var callback_urlchange = "navigate";
		if(typeof(_options) == "object") {
			var argument;
			for(argument in _options) {
				switch(argument) {
					case "callback"		: callback_urlchange		= _options[argument]; break;
				}
			}
		}
		if(!this.is_listening) {
			this.is_listening = true;
			if(this.popstate) {
				u.e.addEvent(window, "popstate", this._urlChanged);
			}
			else if("onhashchange" in window && !u.browser("explorer", "<=7")) {
				u.e.addEvent(window, "hashchange", this._hashChanged);
			}
			else {
				u.h._current_hash = window.location.hash;
				window.onhashchange = this._hashChanged;
				setInterval(
					function() {
						if(window.location.hash !== u.h._current_hash) {
							u.h._current_hash = window.location.hash;
							window.onhashchange();
						}
					}, 200
				);
			}
		}
		this.callbacks.push({"node":node, "callback":callback_urlchange});
	}
	this._urlChanged = function(event) {
		var url = u.h.getCleanUrl(location.href);
		if(event.state || (!event.state && event.path)) {
			u.h.callback(url);
		}
		else {
			history.replaceState({}, url, url);
		}
	}
	this._hashChanged = function(event) {
		if(!location.hash || !location.hash.match(/^#\//)) {
			location.hash = "#/"
			return;
		}
		var url = u.h.getCleanHash(location.hash);
		u.h.callback(url);
	}
	this.trail = [];
	this.addToTrail = function(url, node) {
		this.trail.push({"url":url, "node":node});
	}
	this.getCleanUrl = function(string, levels) {
		string = string.replace(location.protocol+"//"+document.domain, "").match(/[^#$]+/)[0];
		if(!levels) {
			return string;
		}
		else {
			var i, return_string = "";
			var path = string.split("/");
			levels = levels > path.length-1 ? path.length-1 : levels;
			for(i = 1; i <= levels; i++) {
				return_string += "/" + path[i];
			}
			return return_string;
		}
	}
	this.getCleanHash = function(string, levels) {
		string = string.replace("#", "");
		if(!levels) {
			return string;
		}
		else {
			var i, return_string = "";
			var hash = string.split("/");
			levels = levels > hash.length-1 ? hash.length-1 : levels;
			for(i = 1; i <= levels; i++) {
				return_string += "/" + hash[i];
			}
			return return_string;
		}
	}
	this.resolveCurrentUrl = function() {
		return !location.hash ? this.getCleanUrl(location.href) : this.getCleanHash(location.hash);
	}
}


/*u-init.js*/
Util.Objects = u.o = new Object();
Util.init = function(scope) {
	var i, node, nodes, object;
	scope = scope && scope.nodeName ? scope : document;
	nodes = u.ges("i\:([_a-zA-Z0-9])+", scope);
	for(i = 0; node = nodes[i]; i++) {
		while((object = u.cv(node, "i"))) {
			u.rc(node, "i:"+object);
			if(object && typeof(u.o[object]) == "object") {
				u.o[object].init(node);
			}
		}
	}
}


/*u-math.js*/
Util.random = function(min, max) {
	return Math.round((Math.random() * (max - min)) + min);
}
Util.numToHex = function(num) {
	return num.toString(16);
}
Util.hexToNum = function(hex) {
	return parseInt(hex,16);
}
Util.round = function(number, decimals) {
	var round_number = number*Math.pow(10, decimals);
	return Math.round(round_number)/Math.pow(10, decimals);
}

/*u-navigation.js*/
u.navigation = function(_options) {
	var navigation_node = page;
	var callback_navigate = "_navigate";
	var initialization_scope = page.cN;
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {
			switch(argument) {
				case "callback"       : callback_navigate           = _options[argument]; break;
				case "node"           : navigation_node             = _options[argument]; break;
				case "scope"          : initialization_scope        = _options[argument]; break;
			}
		}
	}
	window._man_nav_path = window._man_nav_path ? window._man_nav_path : u.h.getCleanUrl(location.href, 1);
	navigation_node._navigate = function(url) {
		url = u.h.getCleanUrl(url);
		u.stats.pageView(url);
		if(
			!window._man_nav_path || 
			(!u.h.popstate && window._man_nav_path != u.h.getCleanHash(location.hash, 1)) || 
			(u.h.popstate && window._man_nav_path != u.h.getCleanUrl(location.href, 1))
		) {
			if(this.cN && typeof(this.cN.navigate) == "function") {
				this.cN.navigate(url);
			}
		}
		else {
			if(this.cN.scene && this.cN.scene.parentNode && typeof(this.cN.scene.navigate) == "function") {
				this.cN.scene.navigate(url);
			}
			else if(this.cN && typeof(this.cN.navigate) == "function") {
				this.cN.navigate(url);
			}
		}
		if(!u.h.popstate) {
			window._man_nav_path = u.h.getCleanHash(location.hash, 1);
		}
		else {
			window._man_nav_path = u.h.getCleanUrl(location.href, 1);
		}
	}
	if(location.hash.length && location.hash.match(/^#!/)) {
		location.hash = location.hash.replace(/!/, "");
	}
	var callback_after_init = false;
	if(!this.is_initialized) {
		this.is_initialized = true;
		if(!u.h.popstate) {
			if(location.hash.length < 2) {
				window._man_nav_path = u.h.getCleanUrl(location.href);
				u.h.navigate(window._man_nav_path);
				u.init(initialization_scope);
			}
			else if(location.hash.match(/^#\//) && u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href)) {
				callback_after_init = u.h.getCleanHash(location.hash);
			}
			else {
				u.init(initialization_scope);
			}
		}
		else {
			if(u.h.getCleanHash(location.hash) != u.h.getCleanUrl(location.href) && location.hash.match(/^#\//)) {
				window._man_nav_path = u.h.getCleanHash(location.hash);
				u.h.navigate(window._man_nav_path);
				callback_after_init = window._man_nav_path;
			}
			else {
				u.init(initialization_scope);
			}
		}
		var random_string = u.randomString(8);
		if(callback_after_init) {
			eval('navigation_node._initNavigation_'+random_string+' = function() {u.h.addEvent(this, {"callback":"'+callback_navigate+'"});u.h.callback("'+callback_after_init+'");}');
		}
		else {
			eval('navigation_node._initNavigation_'+random_string+' = function() {u.h.addEvent(this, {"callback":"'+callback_navigate+'"});}');
		}
		u.t.setTimer(navigation_node, "_initNavigation_"+random_string, 100);
	}
	else {
		u.h.callbacks.push({"node":navigation_node, "callback":callback_navigate});
	}
}


/*u-preloader.js*/
u.preloader = function(node, files, _options) {
	var callback_preloader_loaded = "loaded";
	var callback_preloader_loading = "loading";
	var callback_preloader_waiting = "waiting";
	node._callback_min_delay = 0;
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "loaded"               : callback_preloader_loaded       = _options[_argument]; break;
				case "loading"              : callback_preloader_loading      = _options[_argument]; break;
				case "waiting"              : callback_preloader_waiting      = _options[_argument]; break;
				case "callback_min_delay"   : node._callback_min_delay              = _options[_argument]; break;
			}
		}
	}
	if(!u._preloader_queue) {
		u._preloader_queue = document.createElement("div");
		u._preloader_processes = 0;
		if(u.e && u.e.event_pref == "touch") {
			u._preloader_max_processes = 1;
		}
		else {
			u._preloader_max_processes = 4;
		}
	}
	if(node && files) {
		var entry, file;
		var new_queue = u.ae(u._preloader_queue, "ul");
		new_queue._callback_loaded = callback_preloader_loaded;
		new_queue._callback_loading = callback_preloader_loading;
		new_queue._callback_waiting = callback_preloader_waiting;
		new_queue._node = node;
		new_queue._files = files;
		new_queue.nodes = new Array();
		new_queue._start_time = new Date().getTime();
		for(i = 0; file = files[i]; i++) {
			entry = u.ae(new_queue, "li", {"class":"waiting"});
			entry.i = i;
			entry._queue = new_queue
			entry._file = file;
		}
		u.ac(node, "waiting");
		if(typeof(node[new_queue._callback_waiting]) == "function") {
			node[new_queue._callback_waiting](new_queue.nodes);
		}
	}
	u._queueLoader();
	return u._preloader_queue;
}
u._queueLoader = function() {
	if(u.qs("li.waiting", u._preloader_queue)) {
		while(u._preloader_processes < u._preloader_max_processes) {
			var next = u.qs("li.waiting", u._preloader_queue);
			if(next) {
				if(u.hc(next._queue._node, "waiting")) {
					u.rc(next._queue._node, "waiting");
					u.ac(next._queue._node, "loading");
					if(typeof(next._queue._node[next._queue._callback_loading]) == "function") {
						next._queue._node[next._queue._callback_loading](next._queue.nodes);
					}
				}
				u._preloader_processes++;
				u.rc(next, "waiting");
				u.ac(next, "loading");
				next.loaded = function(event) {
					this.image = event.target;
					this._image = this.image;
					this._queue.nodes[this.i] = this;
					u.rc(this, "loading");
					u.ac(this, "loaded");
					u._preloader_processes--;
					if(!u.qs("li.waiting,li.loading", this._queue)) {
						u.rc(this._queue._node, "loading");
						if(typeof(this._queue._node[this._queue._callback_loaded]) == "function") {
							this._queue._node[this._queue._callback_loaded](this._queue.nodes);
						}
						// 
					}
					u._queueLoader();
				}
				u.loadImage(next, next._file);
			}
			else {
				break
			}
		}
	}
}
u.loadImage = function(node, src) {
	var image = new Image();
	image.node = node;
	u.ac(node, "loading");
    u.e.addEvent(image, 'load', u._imageLoaded);
	u.e.addEvent(image, 'error', u._imageLoadError);
	image.src = src;
}
u._imageLoaded = function(event) {
	u.rc(this.node, "loading");
	if(typeof(this.node.loaded) == "function") {
		this.node.loaded(event);
	}
}
u._imageLoadError = function(event) {
	u.rc(this.node, "loading");
	u.ac(this.node, "error");
	if(typeof(this.node.loaded) == "function" && typeof(this.node.failed) != "function") {
		this.node.loaded(event);
	}
	else if(typeof(this.node.failed) == "function") {
		this.node.failed(event);
	}
}
u._imageLoadProgress = function(event) {
	u.bug("progress")
	if(typeof(this.node.progress) == "function") {
		this.node.progress(event);
	}
}
u._imageLoadDebug = function(event) {
	u.bug("event:" + event.type);
	u.xInObject(event);
}


/*u-request.js*/
Util.createRequestObject = function() {
	return new XMLHttpRequest();
}
Util.request = function(node, url, _options) {
	var request_id = u.randomString(6);
	node[request_id] = {};
	node[request_id].request_url = url;
	node[request_id].request_method = "GET";
	node[request_id].request_async = true;
	node[request_id].request_params = "";
	node[request_id].request_headers = false;
	node[request_id].callback_response = "response";
	node[request_id].jsonp_callback = "callback";
	if(typeof(_options) == "object") {
		var argument;
		for(argument in _options) {
			switch(argument) {
				case "method"				: node[request_id].request_method		= _options[argument]; break;
				case "params"				: node[request_id].request_params		= _options[argument]; break;
				case "async"				: node[request_id].request_async		= _options[argument]; break;
				case "headers"				: node[request_id].request_headers		= _options[argument]; break;
				case "callback"				: node[request_id].callback_response	= _options[argument]; break;
				case "jsonp_callback"		: node[request_id].jsonp_callback		= _options[argument]; break;
			}
		}
	}
	if(node[request_id].request_method.match(/GET|POST|PUT|PATCH/i)) {
		node[request_id].HTTPRequest = this.createRequestObject();
		node[request_id].HTTPRequest.node = node;
		node[request_id].HTTPRequest.request_id = request_id;
		if(node[request_id].request_async) {
			node[request_id].HTTPRequest.statechanged = function() {
				if(this.readyState == 4 || this.IEreadyState) {
					u.validateResponse(this);
				}
			}
			if(typeof(node[request_id].HTTPRequest.addEventListener) == "function") {
				u.e.addEvent(node[request_id].HTTPRequest, "readystatechange", node[request_id].HTTPRequest.statechanged);
			}
		}
		try {
			if(node[request_id].request_method.match(/GET/i)) {
				var params = u.JSONtoParams(node[request_id].request_params);
				node[request_id].request_url += params ? ((!node[request_id].request_url.match(/\?/g) ? "?" : "&") + params) : "";
				node[request_id].HTTPRequest.open(node[request_id].request_method, node[request_id].request_url, node[request_id].request_async);
				node[request_id].HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				var csfr_field = u.qs('meta[name="csrf-token"]');
				if(csfr_field && csfr_field.content) {
					node[request_id].HTTPRequest.setRequestHeader("X-CSRF-Token", csfr_field.content);
				}
				if(typeof(node[request_id].request_headers) == "object") {
					var header;
					for(header in node[request_id].request_headers) {
						node[request_id].HTTPRequest.setRequestHeader(header, node[request_id].request_headers[header]);
					}
				}
				node[request_id].HTTPRequest.send("");
			}
			else if(node[request_id].request_method.match(/POST|PUT|PATCH/i)) {
				var params;
				if(typeof(node[request_id].request_params) == "object" && !node[request_id].request_params.constructor.toString().match(/FormData/i)) {
					params = JSON.stringify(node[request_id].request_params);
				}
				else {
					params = node[request_id].request_params;
				}
				node[request_id].HTTPRequest.open(node[request_id].request_method, node[request_id].request_url, node[request_id].request_async);
				if(!params.constructor.toString().match(/FormData/i)) {
					node[request_id].HTTPRequest.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
				}
				var csfr_field = u.qs('meta[name="csrf-token"]');
				if(csfr_field && csfr_field.content) {
					node[request_id].HTTPRequest.setRequestHeader("X-CSRF-Token", csfr_field.content);
				}
				if(typeof(node[request_id].request_headers) == "object") {
					var header;
					for(header in node[request_id].request_headers) {
						node[request_id].HTTPRequest.setRequestHeader(header, node[request_id].request_headers[header]);
					}
				}
				node[request_id].HTTPRequest.send(params);
			}
		}
		catch(exception) {
			node[request_id].HTTPRequest.exception = exception;
			u.validateResponse(node[request_id].HTTPRequest);
			return;
		}
		if(!node[request_id].request_async) {
			u.validateResponse(node[request_id].HTTPRequest);
		}
	}
	else if(node[request_id].request_method.match(/SCRIPT/i)) {
		var key = u.randomString();
		document[key] = new Object();
		document[key].node = node;
		document[key].request_id = request_id;
		document[key].responder = function(response) {
			var response_object = new Object();
			response_object.node = this.node;
			response_object.request_id = this.request_id;
			response_object.responseText = response;
			u.validateResponse(response_object);
		}
		var params = u.JSONtoParams(node[request_id].request_params);
		node[request_id].request_url += params ? ((!node[request_id].request_url.match(/\?/g) ? "?" : "&") + params) : "";
		node[request_id].request_url += (!node[request_id].request_url.match(/\?/g) ? "?" : "&") + node[request_id].jsonp_callback + "=document."+key+".responder";
		u.ae(u.qs("head"), "script", ({"type":"text/javascript", "src":node[request_id].request_url}));
	}
	return request_id;
}
Util.JSONtoParams = function(json) {
	if(typeof(json) == "object") {
		var params = "", param;
		for(param in json) {
			params += (params ? "&" : "") + param + "=" + json[param];
		}
		return params
	}
	var object = u.isStringJSON(json);
	if(object) {
		return u.JSONtoParams(object);
	}
	return json;
}
Util.isStringJSON = function(string) {
	if(string.trim().substr(0, 1).match(/[\{\[]/i) && string.trim().substr(-1, 1).match(/[\}\]]/i)) {
		try {
			var test = JSON.parse(string);
			if(typeof(test) == "object") {
				test.isJSON = true;
				return test;
			}
		}
		catch(exception) {}
	}
	return false;
}
Util.isStringHTML = function(string) {
	if(string.trim().substr(0, 1).match(/[\<]/i) && string.trim().substr(-1, 1).match(/[\>]/i)) {
		try {
			var test = document.createElement("div");
			test.innerHTML = string;
			if(test.childNodes.length) {
				var body_class = string.match(/<body class="([a-z0-9A-Z_: ]+)"/);
				test.body_class = body_class ? body_class[1] : "";
				var head_title = string.match(/<title>([^$]+)<\/title>/);
				test.head_title = head_title ? head_title[1] : "";
				test.isHTML = true;
				return test;
			}
		}
		catch(exception) {}
	}
	return false;
}
Util.evaluateResponseText = function(responseText) {
	var object;
	if(typeof(responseText) == "object") {
		responseText.isJSON = true;
		return responseText;
	}
	else {
		var response_string;
		if(responseText.trim().substr(0, 1).match(/[\"\']/i) && responseText.trim().substr(-1, 1).match(/[\"\']/i)) {
			response_string = responseText.trim().substr(1, responseText.trim().length-2);
		}
		else {
			response_string = responseText;
		}
		var json = u.isStringJSON(response_string);
		if(json) {
			return json;
		}
		var html = u.isStringHTML(response_string);
		if(html) {
			return html;
		}
		return responseText;
	}
}
Util.validateResponse = function(response){
	var object = false;
	if(response) {
		try {
			if(response.status && !response.status.toString().match(/403|404|500/)) {
				object = u.evaluateResponseText(response.responseText);
			}
			else if(response.responseText) {
				object = u.evaluateResponseText(response.responseText);
			}
		}
		catch(exception) {
			response.exception = exception;
		}
	}
	if(object) {
		if(typeof(response.node[response.node[response.request_id].callback_response]) == "function") {
			response.node[response.node[response.request_id].callback_response](object, response.request_id);
		}
		// 
	}
	else {
		if(typeof(response.node.responseError) == "function") {
			response.node.responseError(response);
		}
		else if(typeof(response.node[response.node[response.request_id].callback_response]) == "function") {
			response.node[response.node[response.request_id].callback_response](response, response.request_id);
		}
	}
}


/*u-scrollto.js*/
u.scrollTo = function(node, _options) {
	node.callback_scroll_to = "scrolledTo";
	node.callback_scroll_cancelled = "scrolledToCancelled";
	var offset_y = 0;
	var offset_x = 0;
	var scroll_to_x = 0;
	var scroll_to_y = 0;
	var to_node = false;
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "callback"             : node.callback_scroll_to           = _options[_argument]; break;
				case "callback_cancelled"   : node.callback_scroll_cancelled    = _options[_argument]; break;
				case "offset_y"             : offset_y                           = _options[_argument]; break;
				case "offset_x"             : offset_x                           = _options[_argument]; break;
				case "node"              : to_node                               = _options[_argument]; break;
				case "x"                    : scroll_to_x                        = _options[_argument]; break;
				case "y"                    : scroll_to_y                        = _options[_argument]; break;
				case "scrollIn"             : scrollIn                           = _options[_argument]; break;
			}
		}
	}
	if(to_node) {
		node._to_x = u.absX(to_node);
		node._to_y = u.absY(to_node);
	}
	else {
		node._to_x = scroll_to_x;
		node._to_y = scroll_to_y;
	}
	node._to_x = offset_x ? node._to_x - offset_x : node._to_x;
	node._to_y = offset_y ? node._to_y - offset_y : node._to_y;
	if(node._to_y > (node == window ? document.body.scrollHeight : node.scrollHeight)-u.browserH()) {
		node._to_y = (node == window ? document.body.scrollHeight : node.scrollHeight)-u.browserH();
	}
	if(node._to_x > (node == window ? document.body.scrollWidth : node.scrollWidth)-u.browserW()) {
		node._to_x = (node == window ? document.body.scrollWidth : node.scrollWidth)-u.browserW();
	}
	node._to_x = node._to_x < 0 ? 0 : node._to_x;
	node._to_y = node._to_y < 0 ? 0 : node._to_y;
	node._x_scroll_direction = node._to_x - u.scrollX();
	node._y_scroll_direction = node._to_y - u.scrollY();
	node._scroll_to_x = u.scrollX();
	node._scroll_to_y = u.scrollY();
	node.scrollToHandler = function(event) {
		u.t.resetTimer(this.t_scroll);
		this.t_scroll = u.t.setTimer(this, this._scrollTo, 50);
	}
	u.e.addEvent(node, "scroll", node.scrollToHandler);
	node.cancelScrollTo = function() {
		u.t.resetTimer(this.t_scroll);
		u.e.removeEvent(this, "scroll", this.scrollToHandler);
		this._scrollTo = null;
	}
	node.IEScrollFix = function(s_x, s_y) {
		if(!u.browser("ie")) {
			return false;
		}
		else if((s_y == this._scroll_to_y && (s_x == this._scroll_to_x+1 || s_x == this._scroll_to_x-1)) ||	(s_x == this._scroll_to_x && (s_y == this._scroll_to_y+1 || s_y == this._scroll_to_y-1))) {
			return true;
		}
	}
	node._scrollTo = function(start) {
		var s_x = u.scrollX();
		var s_y = u.scrollY();
		if((s_y == this._scroll_to_y && s_x == this._scroll_to_x) || this.IEScrollFix(s_x, s_y)) {
			if(this._x_scroll_direction > 0 && this._to_x > s_x) {
				this._scroll_to_x = Math.ceil(s_x + (this._to_x - s_x)/4);
			}
			else if(this._x_scroll_direction < 0 && this._to_x < s_x) {
				this._scroll_to_x = Math.floor(s_x - (s_x - this._to_x)/4);
			}
			else {
				this._scroll_to_x = this._to_x;
			}
			if(this._y_scroll_direction > 0 && this._to_y > s_y) {
				this._scroll_to_y = Math.ceil(s_y + (this._to_y - s_y)/4);
			}
			else if(this._y_scroll_direction < 0 && this._to_y < s_y) {
				this._scroll_to_y = Math.floor(s_y - (s_y - this._to_y)/4);
			}
			else {
				this._scroll_to_y = this._to_y;
			}
			if(this._scroll_to_x == this._to_x && this._scroll_to_y == this._to_y) {
				this.cancelScrollTo();
				this.scrollTo(this._to_x, this._to_y);
				if(typeof(this[this.callback_scroll_to]) == "function") {
					this[this.callback_scroll_to]();
				}
				return;
			}
			this.scrollTo(this._scroll_to_x, this._scroll_to_y);
		}
		else {
			this.cancelScrollTo();
			if(typeof(this[this.callback_scroll_cancelled]) == "function") {
				this[this.callback_scroll_cancelled]();
			}
		}	
	}
	node._scrollTo();
}

/*u-string.js*/
Util.cutString = function(string, length) {
	var matches, match, i;
	if(string.length <= length) {
		return string;
	}
	else {
		length = length-3;
	}
	matches = string.match(/\&[\w\d]+\;/g);
	if(matches) {
		for(i = 0; match = matches[i]; i++){
			if(string.indexOf(match) < length){
				length += match.length-1;
			}
		}
	}
	return string.substring(0, length) + (string.length > length ? "..." : "");
}
Util.prefix = function(string, length, prefix) {
	string = string.toString();
	prefix = prefix ? prefix : "0";
	while(string.length < length) {
		string = prefix + string;
	}
	return string;
}
Util.randomString = function(length) {
	var key = "", i;
	length = length ? length : 8;
	var pattern = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
	for(i = 0; i < length; i++) {
		key += pattern[u.random(0,35)];
	}
	return key;
}
Util.uuid = function() {
	var chars = '0123456789abcdef'.split('');
	var uuid = [], rnd = Math.random, r, i;
	uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	uuid[14] = '4';
	for(i = 0; i < 36; i++) {
		if(!uuid[i]) {
			r = 0 | rnd()*16;
			uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
		}
 	}
	return uuid.join('');
}
Util.stringOr = u.eitherOr = function(value, replacement) {
	if(value !== undefined && value !== null) {
		return value;
	}
	else {
		return replacement ? replacement : "";
	}	
}
Util.getMatches = function(string, regex) {
	var match, matches = [];
	while(match = regex.exec(string)) {
		matches.push(match[1]);
	}
	return matches;
}
Util.upperCaseFirst = u.ucfirst = function(string) {
	return string.replace(/^(.){1}/, function($1) {return $1.toUpperCase()});
}
Util.lowerCaseFirst = u.lcfirst = function(string) {
	return string.replace(/^(.){1}/, function($1) {return $1.toLowerCase()});
}

/*u-svg.js*/
Util.svg = function(svg_object) {
	var svg, shape, svg_shape;
	if(svg_object.name && u._svg_cache && u._svg_cache[svg_object.name]) {
		svg = u._svg_cache[svg_object.name].cloneNode(true);
	}
	if(!svg) {
		svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		if(svg_object.title) {
			svg.setAttributeNS(null, "title", svg_object.title);
		}
		if(svg_object.class) {
			svg.setAttributeNS(null, "class", svg_object.class);
		}
		if(svg_object.width) {
			svg.setAttributeNS(null, "width", svg_object.width);
		}
		if(svg_object.height) {
			svg.setAttributeNS(null, "height", svg_object.height);
		}
		if(svg_object.id) {
			svg.setAttributeNS(null, "id", svg_object.id);
		}
		if(svg_object.node) {
			svg.node = svg_object.node;
		}
		for(shape in svg_object.shapes) {
			Util.svgShape(svg, svg_object.shapes[shape]);
		}
		if(svg_object.name) {
			if(!u._svg_cache) {
				u._svg_cache = {};
			}
			u._svg_cache[svg_object.name] = svg.cloneNode(true);
		}
	}
	if(svg_object.node) {
		svg_object.node.appendChild(svg);
	}
	return svg;
}
Util.svgShape = function(svg, svg_object) {
	svg_shape = document.createElementNS("http://www.w3.org/2000/svg", svg_object["type"]);
	svg_object["type"] = null;
	delete svg_object["type"];
	for(detail in svg_object) {
		svg_shape.setAttributeNS(null, detail, svg_object[detail]);
	}
	return svg.appendChild(svg_shape);
}


/*u-system.js*/
Util.browser = function(model, version) {
	var current_version = false;
	if(model.match(/\bedge\b/i)) {
		if(navigator.userAgent.match(/Windows[^$]+Gecko[^$]+Edge\/(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/Edge\/(\d+)/i)[1];
		}
	}
	if(model.match(/\bexplorer\b|\bie\b/i)) {
		if(window.ActiveXObject && navigator.userAgent.match(/MSIE (\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/MSIE (\d+.\d)/i)[1];
		}
		else if(navigator.userAgent.match(/Trident\/[\d+]\.\d[^$]+rv:(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/Trident\/[\d+]\.\d[^$]+rv:(\d+.\d)/i)[1];
		}
	}
	if(model.match(/\bfirefox\b|\bgecko\b/i) && !u.browser("ie,edge")) {
		if(navigator.userAgent.match(/Firefox\/(\d+\.\d+)/i)) {
			current_version = navigator.userAgent.match(/Firefox\/(\d+\.\d+)/i)[1];
		}
	}
	if(model.match(/\bwebkit\b/i)) {
		if(navigator.userAgent.match(/WebKit/i) && !u.browser("ie,edge")) {
			current_version = navigator.userAgent.match(/AppleWebKit\/(\d+.\d)/i)[1];
		}
	}
	if(model.match(/\bchrome\b/i)) {
		if(window.chrome && !u.browser("ie,edge")) {
			current_version = navigator.userAgent.match(/Chrome\/(\d+)(.\d)/i)[1];
		}
	}
	if(model.match(/\bsafari\b/i)) {
		if(!window.chrome && document.body.style.webkitTransform != undefined && !u.browser("ie,edge")) {
			current_version = navigator.userAgent.match(/Version\/(\d+)(.\d)/i)[1];
		}
	}
	if(model.match(/\bopera\b/i)) {
		if(window.opera) {
			if(navigator.userAgent.match(/Version\//)) {
				current_version = navigator.userAgent.match(/Version\/(\d+)(.\d)/i)[1];
			}
			else {
				current_version = navigator.userAgent.match(/Opera[\/ ]{1}(\d+)(.\d)/i)[1];
			}
		}
	}
	if(current_version) {
		if(!version) {
			return current_version;
		}
		else {
			if(!isNaN(version)) {
				return current_version == version;
			}
			else {
				return eval(current_version + version);
			}
		}
	}
	else {
		return false;
	}
}
Util.segment = function(segment) {
	if(!u.current_segment) {
		var scripts = document.getElementsByTagName("script");
		var script, i, src;
		for(i = 0; script = scripts[i]; i++) {
			seg_src = script.src.match(/\/seg_([a-z_]+)/);
			if(seg_src) {
				u.current_segment = seg_src[1];
			}
		}
	}
	if(segment) {
		return segment == u.current_segment;
	}
	return u.current_segment;
}
Util.system = function(os, version) {
	var current_version = false;
	if(os.match(/\bwindows\b/i)) {
		if(navigator.userAgent.match(/(Windows NT )(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/(Windows NT )(\d+.\d)/i)[2];
		}
	}
	else if(os.match(/\bios\b/i)) {
		if(navigator.userAgent.match(/(OS )(\d+[._]{1}\d+[._\d]*)( like Mac OS X)/i)) {
			current_version = navigator.userAgent.match(/(OS )(\d+[._]{1}\d+[._\d]*)( like Mac OS X)/i)[2].replace(/_/g, ".");
		}
	}
	else if(os.match(/\bandroid\b/i)) {
		if(navigator.userAgent.match(/(Android )(\d+.\d)/i)) {
			current_version = navigator.userAgent.match(/(Android )(\d+.\d)/i)[2];
		}
	}
	else if(os.match(/\bmac\b/i)) {
		if(navigator.userAgent.match(/(Macintosh; Intel Mac OS X )(\d+[._]{1}\d)/i)) {
			current_version = navigator.userAgent.match(/(Macintosh; Intel Mac OS X )(\d+[._]{1}\d)/i)[2].replace("_", ".");
		}
	}
	else if(os.match(/\blinux\b/i)) {
		if(navigator.userAgent.match(/linux|x11/i) && !navigator.userAgent.match(/android/i)) {
			current_version = true;
		}
	}
	if(current_version) {
		if(!version) {
			return current_version;
		}
		else {
			if(!isNaN(version)) {
				return current_version == version;
			}
			else {
				return eval(current_version + version);
			}
		}
	}
	else {
		return false;
	}
}
Util.support = function(property) {
	if(document.documentElement) {
		var style_property = u.lcfirst(property.replace(/^(-(moz|webkit|ms|o)-|(Moz|webkit|Webkit|ms|O))/, "").replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()}));
		if(style_property in document.documentElement.style) {
			return true;
		}
		else if(u.vendorPrefix() && (u.vendorPrefix()+u.ucfirst(style_property)) in document.documentElement.style) {
			return true;
		}
	}
	return false;
}
Util.vendor_properties = {};
Util.vendorProperty = function(property) {
	if(!Util.vendor_properties[property]) {
		Util.vendor_properties[property] = property.replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()});
		if(document.documentElement) {
			var style_property = u.lcfirst(property.replace(/^(-(moz|webkit|ms|o)-|(Moz|webkit|Webkit|ms|O))/, "").replace(/(-\w)/g, function(word){return word.replace(/-/, "").toUpperCase()}));
			if(style_property in document.documentElement.style) {
				Util.vendor_properties[property] = style_property;
			}
			else if(u.vendorPrefix() && (u.vendorPrefix()+u.ucfirst(style_property)) in document.documentElement.style) {
				Util.vendor_properties[property] = u.vendorPrefix()+u.ucfirst(style_property);
			}
		}
	}
	return Util.vendor_properties[property];
}
Util.vendor_prefix = false;
Util.vendorPrefix = function() {
	if(Util.vendor_prefix === false) {
		Util.vendor_prefix = "";
		if(document.documentElement && typeof(window.getComputedStyle) == "function") {
			var styles = window.getComputedStyle(document.documentElement, "");
			if(styles.length) {
				var i, style, match;
				for(i = 0; style = styles[i]; i++) {
					match = style.match(/^-(moz|webkit|ms)-/);
					if(match) {
						Util.vendor_prefix = match[1];
						if(Util.vendor_prefix == "moz") {
							Util.vendor_prefix = "Moz";
						}
						break;
					}
				}
			}
			else {
				var x, match;
				for(x in styles) {
					match = x.match(/^(Moz|webkit|ms|OLink)/);
					if(match) {
						Util.vendor_prefix = match[1];
						if(Util.vendor_prefix === "OLink") {
							Util.vendor_prefix = "O";
						}
						break;
					}
				}
			}
		}
	}
	return Util.vendor_prefix;
}


/*u-textscaler.js*/
u.textscaler = function(node, _settings) {
	if(typeof(_settings) != "object") {
		_settings = {
			"*":{
				"unit":"rem",
				"min_size":1,
				"min_width":200,
				"min_height":200,
				"max_size":40,
				"max_width":3000,
				"max_height":2000
			}
		};
	}
	node.text_key = u.randomString(8);
	u.ac(node, node.text_key);
	node.text_settings = JSON.parse(JSON.stringify(_settings));
	node.scaleText = function() {
		var tag;
		for(tag in this.text_settings) {
			var settings = this.text_settings[tag];
			var width_wins = false;
			var height_wins = false;
			if(settings.width_factor && settings.height_factor) {
				if(window._man_text._height - settings.min_height < window._man_text._width - settings.min_width) {
					height_wins = true;
				}
				else {
					width_wins = true;
				}
			}
			if(settings.width_factor && !height_wins) {
				if(settings.min_width <= window._man_text._width && settings.max_width >= window._man_text._width) {
					var font_size = settings.min_size + (settings.size_factor * (window._man_text._width - settings.min_width) / settings.width_factor);
					settings.css_rule.style.setProperty("font-size", font_size + settings.unit, "important");
				}
				else if(settings.max_width < window._man_text._width) {
					settings.css_rule.style.setProperty("font-size", settings.max_size + settings.unit, "important");
				}
				else if(settings.min_width > window._man_text._width) {
					settings.css_rule.style.setProperty("font-size", settings.min_size + settings.unit, "important");
				}
			}
			else if(settings.height_factor) {
				if(settings.min_height <= window._man_text._height && settings.max_height >= window._man_text._height) {
					var font_size = settings.min_size + (settings.size_factor * (window._man_text._height - settings.min_height) / settings.height_factor);
					settings.css_rule.style.setProperty("font-size", font_size + settings.unit, "important");
				}
				else if(settings.max_height < window._man_text._height) {
					settings.css_rule.style.setProperty("font-size", settings.max_size + settings.unit, "important");
				}
				else if(settings.min_height > window._man_text._height) {
					settings.css_rule.style.setProperty("font-size", settings.min_size + settings.unit, "important");
				}
			}
		}
	}
	node.cancelTextScaling = function() {
		u.e.removeEvent(window, "resize", window._man_text.scale);
	}
	if(!window._man_text) {
		var man_text = {};
		man_text.nodes = [];
		var style_tag = document.createElement("style");
		style_tag.setAttribute("media", "all")
		style_tag.setAttribute("type", "text/css")
		man_text.style_tag = u.ae(document.head, style_tag);
		man_text.style_tag.appendChild(document.createTextNode(""))
		window._man_text = man_text;
		window._man_text._width = u.browserW();
		window._man_text._height = u.browserH();
		window._man_text.scale = function() {
			window._man_text._width = u.browserW();
			window._man_text._height = u.browserH();
			var i, node;
			for(i = 0; node = window._man_text.nodes[i]; i++) {
				if(node.parentNode) { 
					node.scaleText();
				}
				else {
					window._man_text.nodes.splice(window._man_text.nodes.indexOf(node), 1);
					if(!window._man_text.nodes.length) {
						u.e.removeEvent(window, "resize", window._man_text.scale);
						window._man_text = false;
					}
				}
			}
		}
		u.e.addEvent(window, "resize", window._man_text.scale);
		window._man_text.precalculate = function() {
			var i, node, tag;
			for(i = 0; node = window._man_text.nodes[i]; i++) {
				if(node.parentNode) { 
					var settings = node.text_settings;
					for(tag in settings) {
						if(settings[tag].max_width && settings[tag].min_width) {
							settings[tag].width_factor = settings[tag].max_width-settings[tag].min_width;
						}
						else if(node._man_text.max_width && node._man_text.min_width) {
							settings[tag].max_width = node._man_text.max_width;
							settings[tag].min_width = node._man_text.min_width;
							settings[tag].width_factor = node._man_text.max_width-node._man_text.min_width;
						}
						else {
							settings[tag].width_factor = false;
						}
						if(settings[tag].max_height && settings[tag].min_height) {
							settings[tag].height_factor = settings[tag].max_height-settings[tag].min_height;
						}
						else if(node._man_text.max_height && node._man_text.min_height) {
							settings[tag].max_height = node._man_text.max_height;
							settings[tag].min_height = node._man_text.min_height;
							settings[tag].height_factor = node._man_text.max_height-node._man_text.min_height;
						}
						else {
							settings[tag].height_factor = false;
						}
						settings[tag].size_factor = settings[tag].max_size-settings[tag].min_size;
						if(!settings[tag].unit) {
							settings[tag].unit = node._man_text.unit;
						}
					}
				}
			}
		}
	}
	var tag;
	node._man_text = {};
	for(tag in node.text_settings) {
		if(tag == "min_height" || tag == "max_height" || tag == "min_width" || tag == "max_width" || tag == "unit") {
			node._man_text[tag] = node.text_settings[tag];
			node.text_settings[tag] = null;
			delete node.text_settings[tag];
		}
		else {
			selector = "."+node.text_key + ' ' + tag + ' ';
			node.css_rules_index = window._man_text.style_tag.sheet.insertRule(selector+'{}', 0);
			node.text_settings[tag].css_rule = window._man_text.style_tag.sheet.cssRules[0];
		}
	}
	window._man_text.nodes.push(node);
	window._man_text.precalculate();
	node.scaleText();
}

/*u-timer.js*/
Util.Timer = u.t = new function() {
	this._timers = new Array();
	this.setTimer = function(node, action, timeout, param) {
		var id = this._timers.length;
		param = param ? param : {"target":node, "type":"timeout"};
		this._timers[id] = {"_a":action, "_n":node, "_p":param, "_t":setTimeout("u.t._executeTimer("+id+")", timeout)};
		return id;
	}
	this.resetTimer = function(id) {
		if(this._timers[id]) {
			clearTimeout(this._timers[id]._t);
			this._timers[id] = false;
		}
	}
	this._executeTimer = function(id) {
		var timer = this._timers[id];
		this._timers[id] = false;
		var node = timer._n;
		if(typeof(timer._a) == "function") {
			node._timer_action = timer._a;
			node._timer_action(timer._p);
			node._timer_action = null;
		}
		else if(typeof(node[timer._a]) == "function") {
			node[timer._a](timer._p);
		}
	}
	this.setInterval = function(node, action, interval, param) {
		var id = this._timers.length;
		param = param ? param : {"target":node, "type":"timeout"};
		this._timers[id] = {"_a":action, "_n":node, "_p":param, "_i":setInterval("u.t._executeInterval("+id+")", interval)};
		return id;
	}
	this.resetInterval = function(id) {
		if(this._timers[id]) {
			clearInterval(this._timers[id]._i);
			this._timers[id] = false;
		}
	}
	this._executeInterval = function(id) {
		var node = this._timers[id]._n;
		if(typeof(this._timers[id]._a) == "function") {
			node._interval_action = this._timers[id]._a;
			node._interval_action(this._timers[id]._p);
			node._interval_action = null;
		}
		else if(typeof(node[this._timers[id]._a]) == "function") {
			node[this._timers[id]._a](this._timers[id]._p);
		}
	}
	this.valid = function(id) {
		return this._timers[id] ? true : false;
	}
	this.resetAllTimers = function() {
		var i, t;
		for(i = 0; i < this._timers.length; i++) {
			if(this._timers[i] && this._timers[i]._t) {
				this.resetTimer(i);
			}
		}
	}
	this.resetAllIntervals = function() {
		var i, t;
		for(i = 0; i < this._timers.length; i++) {
			if(this._timers[i] && this._timers[i]._i) {
				this.resetInterval(i);
			}
		}
	}
}


/*u-url.js*/
Util.getVar = function(param, url) {
	var string = url ? url.split("#")[0] : location.search;
	var regexp = new RegExp("[\&\?\b]{1}"+param+"\=([^\&\b]+)");
	var match = string.match(regexp);
	if(match && match.length > 1) {
		return match[1];
	}
	else {
		return "";
	}
}


/*u-video.js*/
Util.videoPlayer = function(_options) {
	var player = document.createElement("div");
	u.ac(player, "videoplayer");
	player._autoplay = false;
	player._controls = false;
	player._controls_playpause = false;
	player._controls_zoom = false;
	player._controls_volume = false;
	player._controls_search = false;
	player._ff_skip = 2;
	player._rw_skip = 2;
	if(typeof(_options) == "object") {
		var _argument;
		for(_argument in _options) {
			switch(_argument) {
				case "autoplay"     : player._autoplay               = _options[_argument]; break;
				case "controls"     : player._controls               = _options[_argument]; break;
				case "playpause"    : player._controls_playpause     = _options[_argument]; break;
				case "zoom"         : player._controls_zoom          = _options[_argument]; break;
				case "volume"       : player._controls_volume        = _options[_argument]; break;
				case "search"       : player._controls_search        = _options[_argument]; break;
				case "ff_skip"      : player._ff_skip                = _options[_argument]; break;
				case "rw_skip"      : player._rw_skip                = _options[_argument]; break;
			}
		}
	}
	player.video = u.ae(player, "video");
	if(typeof(player.video.play) == "function") {
		player.load = function(src, _options) {
			if(typeof(_options) == "object") {
				var _argument;
				for(_argument in _options) {
					switch(_argument) {
						case "autoplay"     : this._autoplay               = _options[_argument]; break;
						case "controls"     : this._controls               = _options[_argument]; break;
						case "playpause"    : this._controls_playpause     = _options[_argument]; break;
						case "zoom"         : this._controls_zoom          = _options[_argument]; break;
						case "volume"       : this._controls_volume        = _options[_argument]; break;
						case "search"       : this._controls_search        = _options[_argument]; break;
						case "fullscreen"   : this._controls_fullscreen    = _options[_argument]; break;
						case "ff_skip"      : this._ff_skip                = _options[_argument]; break;
						case "rw_skip"      : this._rw_skip                = _options[_argument]; break;
					}
				}
			}
			if(u.hc(this, "playing")) {
				this.stop();
			}
			this.setup();
			if(src) {
				this.video.src = this.correctSource(src);
				this.video.load();
				this.video.controls = player._controls;
				this.video.autoplay = player._autoplay;
			}
		}
		player.play = function(position) {
			if(this.video.currentTime && position !== undefined) {
				this.video.currentTime = position;
			}
			if(this.video.src) {
				this.video.play();
			}
		}
		player.loadAndPlay = function(src, _options) {
			var position = 0;
			if(typeof(_options) == "object") {
				var _argument;
				for(_argument in _options) {
					switch(_argument) {
						case "position"		: position		= _options[_argument]; break;
					}
				}
			}
			this.load(src, _options);
			this.play(position);
		}
		player.pause = function() {
			this.video.pause();
		}
		player.stop = function() {
			this.video.pause();
			if(this.video.currentTime) {
				this.video.currentTime = 0;
			}
		}
		player.ff = function() {
			if(this.video.src && this.video.currentTime && this.videoLoaded) {
				this.video.currentTime = (this.video.duration - this.video.currentTime >= this._ff_skip) ? (this.video.currentTime + this._ff_skip) : this.video.duration;
				this.video._timeupdate();
			}
		}
		player.rw = function() {
			if(this.video.src && this.video.currentTime && this.videoLoaded) {
				this.video.currentTime = (this.video.currentTime >= this._rw_skip) ? (this.video.currentTime - this._rw_skip) : 0;
				this.video._timeupdate();
			}
		}
		player.togglePlay = function() {
			if(u.hc(this, "playing")) {
				this.pause();
			}
			else {
				this.play();
			}
		}
		player.volume = function(value) {
			this.video.volume = value;
			if(value === 0) {
				u.ac(this, "muted");
			}
			else {
				u.rc(this, "muted");
			}
		}
		player.toggleVolume = function() {
			if(this.video.volume) {
				this.video.volume = 0;
				u.ac(this, "muted");
			}
			else {
				this.video.volume = 1;
				u.rc(this, "muted");
			}
		}
		player.setup = function() {
			if(this.video) {
				var video = this.removeChild(this.video);
				delete video;
			}
			this.video = u.ie(this, "video");
			this.video.player = this;
			this.setControls();
			this.currentTime = 0;
			this.duration = 0;
			this.videoLoaded = false;
			this.metaLoaded = false;
			this.video._loadstart = function(event) {
				u.ac(this.player, "loading");
				if(typeof(this.player.loading) == "function") {
					this.player.loading(event);
				}
			}
			u.e.addEvent(this.video, "loadstart", this.video._loadstart);
			this.video._canplaythrough = function(event) {
				u.rc(this.player, "loading");
				if(typeof(this.player.canplaythrough) == "function") {
					this.player.canplaythrough(event);
				}
			}
			u.e.addEvent(this.video, "canplaythrough", this.video._canplaythrough);
			this.video._playing = function(event) {
				u.rc(this.player, "loading|paused");
				u.ac(this.player, "playing");
				if(typeof(this.player.playing) == "function") {
					this.player.playing(event);
				}
			}
			u.e.addEvent(this.video, "playing", this.video._playing);
			this.video._paused = function(event) {
				u.rc(this.player, "playing|loading");
				u.ac(this.player, "paused");
				if(typeof(this.player.paused) == "function") {
					this.player.paused(event);
				}
			}
			u.e.addEvent(this.video, "pause", this.video._paused);
			this.video._stalled = function(event) {
				u.rc(this.player, "playing|paused");
				u.ac(this.player, "loading");
				if(typeof(this.player.stalled) == "function") {
					this.player.stalled(event);
				}
			}
			u.e.addEvent(this.video, "stalled", this.video._paused);
			this.video._ended = function(event) {
				u.rc(this.player, "playing|paused");
				if(typeof(this.player.ended) == "function") {
					this.player.ended(event);
				}
			}
			u.e.addEvent(this.video, "ended", this.video._ended);
			this.video._loadedmetadata = function(event) {
				this.player.duration = this.duration;
				this.player.currentTime = this.currentTime;
				this.player.metaLoaded = true;
				if(typeof(this.player.loadedmetadata) == "function") {
					this.player.loadedmetadata(event);
				}
			}
			u.e.addEvent(this.video, "loadedmetadata", this.video._loadedmetadata);
			this.video._loadeddata = function(event) {
				this.player.videoLoaded = true;
				if(typeof(this.player.loadeddata) == "function") {
					this.player.loadeddata(event);
				}
			}
			u.e.addEvent(this.video, "loadeddata", this.video._loadeddata);
			this.video._timeupdate = function(event) {
				this.player.currentTime = this.currentTime;
				if(typeof(this.player.timeupdate) == "function") {
					this.player.timeupdate(event);
				}
			}
			u.e.addEvent(this.video, "timeupdate", this.video._timeupdate);
		}
	}
	else if(typeof(u.videoPlayerFallback) == "function") {
		player.removeChild(player.video);
		player = u.videoPlayerFallback(player);
	}
	else {
		player.load = function() {}
		player.play = function() {}
		player.loadAndPlay = function() {}
		player.pause = function() {}
		player.stop = function() {}
		player.ff = function() {}
		player.rw = function() {}
		player.togglePlay = function() {}
	}
	player.correctSource = function(src) {
		var param = src.match(/\?[^$]+/) ? src.match(/(\?[^$]+)/)[1] : "";
		src = src.replace(/\?[^$]+/, "");
		src = src.replace(/\.m4v|\.mp4|\.webm|\.ogv|\.3gp|\.mov/, "");
		if(this.flash) {
			return src+".mp4"+param;
		}
		else if(this.video.canPlayType("video/mp4")) {
			return src+".mp4"+param;
		}
		else if(this.video.canPlayType("video/ogg")) {
			return src+".ogv"+param;
		}
		else if(this.video.canPlayType("video/3gpp")) {
			return src+".3gp"+param;
		}
		else {
			return src+".mov"+param;
		}
	}
	player.setControls = function() {
		if(this.showControls) {
			if(u.e.event_pref == "mouse") {
				u.e.removeEvent(this, "mousemove", this.showControls);
				u.e.removeEvent(this.controls, "mouseenter", this._keepControls);
				u.e.removeEvent(this.controls, "mouseleave", this._unkeepControls);
			}
			else {
				u.e.removeEvent(this, "touchstart", this.showControls);
			}
		}
		if(this._controls_playpause || this._controls_zoom || this._controls_volume || this._controls_search) {
			if(!this.controls) {
				this.controls = u.ae(this, "div", {"class":"controls"});
				this.controls.player = this;
				this.controls._default_display = u.gcs(this.controls, "display");
				this.hideControls = function() {
					u.bug("hide controls")
					if(!this._keep) {
						this.t_controls = u.t.resetTimer(this.t_controls);
						u.a.transition(this.controls, "all 0.3s ease-out");
						u.a.setOpacity(this.controls, 0);
					}
				}
				this.showControls = function() {
					u.bug("show controls")
					if(this.t_controls) {
						this.t_controls = u.t.resetTimer(this.t_controls);
					}
					else {
						u.a.transition(this.controls, "all 0.5s ease-out");
						u.a.setOpacity(this.controls, 1);
					}
					this.t_controls = u.t.setTimer(this, this.hideControls, 1500);
				}
				this._keepControls = function() {
					this.player._keep = true;
				}
				this._unkeepControls = function() {
					this.player._keep = false;
				}
			}
			else {
				u.as(this.controls, "display", this.controls._default_display);
			}
			if(this._controls_playpause) {
				if(!this.controls.playpause) {
					this.controls.playpause = u.ae(this.controls, "a", {"class":"playpause"});
					this.controls.playpause._default_display = u.gcs(this.controls.playpause, "display");
					this.controls.playpause.player = this;
					u.e.click(this.controls.playpause);
					this.controls.playpause.clicked = function(event) {
						this.player.togglePlay();
					}
				}
				else {
					u.as(this.controls.playpause, "display", this.controls.playpause._default_display);
				}
			}
			else if(this.controls.playpause) {
				u.as(this.controls.playpause, "display", "none");
			}
			if(this._controls_search) {
				if(!this.controls.search) {
					this.controls.search_ff = u.ae(this.controls, "a", {"class":"ff"});
					this.controls.search_ff._default_display = u.gcs(this.controls.search_ff, "display");
					this.controls.search_ff.player = this;
					this.controls.search_rw = u.ae(this.controls, "a", {"class":"rw"});
					this.controls.search_rw._default_display = u.gcs(this.controls.search_rw, "display");
					this.controls.search_rw.player = this;
					u.e.click(this.controls.search_ff);
					this.controls.search_ff.ffing = function() {
						this.t_ffing = u.t.setTimer(this, this.ffing, 100);
						this.player.ff();
					}
					this.controls.search_ff.inputStarted = function(event) {
						this.ffing();
					}
					this.controls.search_ff.clicked = function(event) {
						u.t.resetTimer(this.t_ffing);
					}
					u.e.click(this.controls.search_rw);
					this.controls.search_rw.rwing = function() {
						this.t_rwing = u.t.setTimer(this, this.rwing, 100);
						this.player.rw();
					}
					this.controls.search_rw.inputStarted = function(event) {
						this.rwing();
					}
					this.controls.search_rw.clicked = function(event) {
						u.t.resetTimer(this.t_rwing);
						this.player.rw();
					}
					this.controls.search = true;
				}
				else {
					u.as(this.controls.search_ff, "display", this.controls.search_ff._default_display);
					u.as(this.controls.search_rw, "display", this.controls.search_rw._default_display);
				}
			}
			else if(this.controls.search) {
				u.as(this.controls.search_ff, "display", "none");
				u.as(this.controls.search_rw, "display", "none");
			}
			if(this._controls_zoom && !this.controls.zoom) {}
			else if(this.controls.zoom) {}
			if(this._controls_volume) {
				if(!this.controls.volume) {
					this.controls.volume = u.ae(this.controls, "a", {"class":"volume"});
					this.controls.volume._default_display = u.gcs(this.controls.volume, "display");
					this.controls.volume.player = this;
					u.e.click(this.controls.volume);
					this.controls.volume.clicked = function(event) {
						u.bug("volume toggle")
						this.player.toggleVolume();
					}
				}
				else {
					u.as(this.controls.volume, "display", this.controls.volume._default_display);
				}
			}
			else if(this.controls.volume) {
				u.as(this.controls.volume, "display", "none");
			}
			if(u.e.event_pref == "mouse") {
				u.e.addEvent(this.controls, "mouseenter", this._keepControls);
				u.e.addEvent(this.controls, "mouseleave", this._unkeepControls);
				u.e.addEvent(this, "mousemove", this.showControls);
			}
			else {
				u.e.addEvent(this, "touchstart", this.showControls);
			}
		}
		else if(this.controls) {
			u.as(this.controls, "display", "none");
		}
	}
	return player;
}

/*ga.js*/
u.ga_account = 'UA-62479513-1';
u.ga_domain = 'gadearmbaand.dk';
u.gapi_key = 'AIzaSyDDcI1nS5XiY3pfMQnlGVU4Ev2aAQZ8Wog';

/*u-googleanalytics.js*/
if(u.ga_account) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.defer=true;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', u.ga_account, u.ga_domain);
    ga('send', 'pageview');
	u.stats = new function() {
		this.pageView = function(url) {
			ga('send', 'pageview', url);
		}
		this.event = function(node, action, label) {
			ga('_trackEvent', location.href.replace(document.location.protocol + "//" + document.domain, ""), action, (label ? label : this.nodeSnippet(node)));
		}
		this.customVar = function(slot, name, value, scope) {
			//       slot,		
			//       name,		
			//       value,	
			//       scope		
		}
		this.nodeSnippet = function(e) {
			if(e.textContent != undefined) {
				return u.cutString(e.textContent.trim(), 20) + "(<"+e.nodeName+">)";
			}
			else {
				return u.cutString(e.innerText.trim(), 20) + "(<"+e.nodeName+">)";
			}
		}
	}
}


/*u-animation.js*/
Util.Animation = u.a = new function() {
	this.support3d = function() {
		if(this._support3d === undefined) {
			var node = u.ae(document.body, "div");
			try {
				u.as(node, "transform", "translate3d(10px, 10px, 10px)");
				if(u.gcs(node, "transform").match(/matrix3d\(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 10, 10, 1\)/)) {
					this._support3d = true;
				}
				else {
					this._support3d = false;
				}
			}
			catch(exception) {
				this._support3d = false;
			}
			document.body.removeChild(node);
		}
		return this._support3d;
	}
	this.transition = function(node, transition, callback) {
		try {
			var duration = transition.match(/[0-9.]+[ms]+/g);
			if(duration) {
				node.duration = duration[0].match("ms") ? parseFloat(duration[0]) : (parseFloat(duration[0]) * 1000);
				if(callback) {
					var transitioned;
					transitioned = (function(event) {
						u.e.removeEvent(event.target, u.a.transitionEndEventName(), transitioned);
						if(event.target == this) {
							u.a.transition(this, "none");
							if(typeof(callback) == "function") {
								var key = u.randomString(4);
								node[key] = callback;
								node[key].callback(event);
								node[key] = null;
								callback = null;
							}
							else if(typeof(this[callback]) == "function") {
								this[callback](event);
								this[callback] = null;
							}
						}
						else {
						}
					});
					u.e.addEvent(node, u.a.transitionEndEventName(), transitioned);
				}
				else {
					u.e.addEvent(node, u.a.transitionEndEventName(), this._transitioned);
				}
			}
			else {
				node.duration = false;
			}
			u.as(node, "transition", transition);
		}
		catch(exception) {
			u.exception("u.a.transition", arguments, exception);
		}
	}
	this.transitionEndEventName = function() {
		if(!this._transition_end_event_name) {
			this._transition_end_event_name = "transitionend";
			var transitions = {
				"transition": "transitionend",
				"MozTransition": "transitionend",
				"msTransition": "transitionend",
				"webkitTransition": "webkitTransitionEnd",
				"OTransition": "otransitionend"
			};
			var x, div = document.createElement("div");
			for(x in transitions){
				if(typeof(div.style[x]) !== "undefined") {
					this._transition_end_event_name = transitions[x];
					break;
				}
			}
		}
		return this._transition_end_event_name;
	}
	this._transitioned = function(event) {
		u.e.removeEvent(event.target, u.a.transitionEndEventName(), u.a._transitioned);
		u.a.transition(event.target, "none");
		if(event.target == this && typeof(this.transitioned) == "function") {
			this.transitioned(event);
			this.transitioned = null;
		}
	}
	this.removeTransform = function(node) {
		u.as(node, "transform", "none");
	}
	this.translate = function(node, x, y) {
		if(this.support3d()) {
			u.as(node, "transform", "translate3d("+x+"px, "+y+"px, 0)");
		}
		else {
			u.as(node, "transform", "translate("+x+"px, "+y+"px)");
		}
		node._x = x;
		node._y = y;
	}
	this.rotate = function(node, deg) {
		u.as(node, "transform", "rotate("+deg+"deg)");
		node._rotation = deg;
	}
	this.scale = function(node, scale) {
		u.as(node, "transform", "scale("+scale+")");
		node._scale = scale;
	}
	this.setOpacity = this.opacity = function(node, opacity) {
		u.as(node, "opacity", opacity);
		node._opacity = opacity;
	}
	this.setWidth = this.width = function(node, width) {
		width = width.toString().match(/\%|auto|px/) ? width : (width + "px");
		node.style.width = width;
		node._width = width;
		node.offsetHeight;
	}
	this.setHeight = this.height = function(node, height) {
		height = height.toString().match(/\%|auto|px/) ? height : (height + "px");
		node.style.height = height;
		node._height = height;
		node.offsetHeight;
	}
	this.setBgPos = this.bgPos = function(node, x, y) {
		x = x.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? x : (x + "px");
		y = y.toString().match(/\%|auto|px|center|top|left|bottom|right/) ? y : (y + "px");
		node.style.backgroundPosition = x + " " + y;
		node._bg_x = x;
		node._bg_y = y;
		node.offsetHeight;
	}
	this.setBgColor = this.bgColor = function(node, color) {
		node.style.backgroundColor = color;
		node._bg_color = color;
		node.offsetHeight;
	}
	// 
	// 	
	// 
	// 	
	// 	
	this._animationqueue = {};
	this.requestAnimationFrame = function(node, callback, duration) {
		if(!u.a.__animation_frame_start) {
			u.a.__animation_frame_start = Date.now();
		}
		var id = u.randomString();
		u.a._animationqueue[id] = {};
		u.a._animationqueue[id].id = id;
		u.a._animationqueue[id].node = node;
		u.a._animationqueue[id].callback = callback;
		u.a._animationqueue[id].duration = duration;
		u.t.setTimer(u.a, function() {u.a.finalAnimationFrame(id)}, duration);
		if(!u.a._animationframe) {
			window._requestAnimationFrame = eval(u.vendorProperty("requestAnimationFrame"));
			window._cancelAnimationFrame = eval(u.vendorProperty("cancelAnimationFrame"));
			u.a._animationframe = function(timestamp) {
				var id, animation;
				for(id in u.a._animationqueue) {
					animation = u.a._animationqueue[id];
					if(!animation["__animation_frame_start_"+id]) {
						animation["__animation_frame_start_"+id] = timestamp;
					}
					animation.node[animation.callback]((timestamp-animation["__animation_frame_start_"+id]) / animation.duration);
				}
				if(Object.keys(u.a._animationqueue).length) {
					u.a._requestAnimationId = window._requestAnimationFrame(u.a._animationframe);
				}
			}
		}
		if(!u.a._requestAnimationId) {
			u.a._requestAnimationId = window._requestAnimationFrame(u.a._animationframe);
		}
		return id;
	}
	this.finalAnimationFrame = function(id) {
		var animation = u.a._animationqueue[id];
		animation["__animation_frame_start_"+id] = false;
		animation.node[animation.callback](1);
		if(typeof(animation.node.transitioned) == "function") {
			animation.node.transitioned({});
		}
		delete u.a._animationqueue[id];
		if(!Object.keys(u.a._animationqueue).length) {
			this.cancelAnimationFrame(id);
		}
	}
	this.cancelAnimationFrame = function(id) {
		if(id && u.a._animationqueue[id]) {
			delete u.a._animationqueue[id];
		}
		if(u.a._requestAnimationId) {
			window._cancelAnimationFrame(u.a._requestAnimationId);
			u.a.__animation_frame_start = false;
			u.a._requestAnimationId = false;
		}
	}
}


/*beta-u-animation-to.js*/
	u.a.parseSVGPolygon = function(value) {
		var pairs = value.trim().split(" ");
		var sets = [];
		for(x in pairs) {
			parts = pairs[x].trim().split(",");
			for(part in parts) {
				parts[part] = Number(parts[part]);
			}
			sets[x] = parts;
		}
		return sets;
	}
	u.a.parseSVGPath = function(value) {
		var pairs = {"m":2, "l":2, "a":7, "c":6, "s":4, "q":4, "z":0};
		value = value.replace(/-/g, " -");
		value = value.replace(/,/g, " ");
		value = value.replace(/(m|l|a|c|s|q|M|L|A|C|S|Q)/g, " $1 ");
		value = value.replace(/  /g, " ");
		sets = value.match(/(m|l|a|c|s|q|M|L|A|C|S|Q)([0-9 \-\.]+)/g);
		for(x in sets) {
			parts = sets[x].trim().split(" ");
			sets[x] = parts;
			if(parts && pairs[parts[0].toLowerCase()] == parts.length-1) {
			}
			else {
			}
		}
		return sets;
	}
	u.a.getInitialValue = function(node, attribute) {
		var value = (node.getAttribute(attribute) ? node.getAttribute(attribute) : u.gcs(node, attribute)).replace(node._unit[attribute], "")
		if(attribute.match(/^(d|points)$/)) {
			return value;
		}
		else {
			return Number(value.replace(/auto/, 0));
		}
	}
	u.a.to = function(node, transition, attributes) {
		var transition_parts = transition.split(" ");
		if(transition_parts.length >= 3) {
			node._target = transition_parts[0];
			node.duration = transition_parts[1].match("ms") ? parseFloat(transition_parts[1]) : (parseFloat(transition_parts[1]) * 1000);
			node._ease = transition_parts[2];
			if(transition_parts.length == 4) {
				node.delay = transition_parts[3].match("ms") ? parseFloat(transition_parts[3]) : (parseFloat(transition_parts[3]) * 1000);
			}
		}
		var value, d;
		node._start = {};
		node._end = {};
		node._unit = {};
		for(attribute in attributes) {
			if(attribute.match(/^(d)$/)) {
				node._start[attribute] = this.parseSVGPath(this.getInitialValue(node, attribute));
				node._end[attribute] = this.parseSVGPath(attributes[attribute]);
			}
			else if(attribute.match(/^(points)$/)) {
				node._start[attribute] = this.parseSVGPolygon(this.getInitialValue(node, attribute));
				node._end[attribute] = this.parseSVGPolygon(attributes[attribute]);
			}
			else {
				node._unit[attribute] = attributes[attribute].toString().match(/\%|px/);
				node._start[attribute] = this.getInitialValue(node, attribute);
				node._end[attribute] = attributes[attribute].toString().replace(node._unit[attribute], "");
			}
		}
		node.easing = u.easings[node._ease];
		node.transitionTo = function(progress) {
			var easing = node.easing(progress);
			for(attribute in attributes) {
				if(attribute.match(/^(translate|rotate|scale)$/)) {
					if(attribute == "translate") {
						u.a.translate(this, Math.round((this._end_x - this._start_x) * easing), Math.round((this._end_y - this._start_y) * easing))
					}
					else if(attribute == "rotate") {
					}
				}
				else if(attribute.match(/^(x1|y1|x2|y2|r|cx|cy|stroke-width)$/)) {
					var new_value = (this._start[attribute] + ((this._end[attribute] - this._start[attribute]) * easing)) +  this._unit[attribute]
					this.setAttribute(attribute, new_value);
				}
				else if(attribute.match(/^(d)$/)) {
					var new_value = "";
					for(x in this._start[attribute]) {
						for(y in this._start[attribute][x]) {
							if(parseFloat(this._start[attribute][x][y]) == this._start[attribute][x][y]) {
								new_value += (Number(this._start[attribute][x][y]) + ((Number(this._end[attribute][x][y]) - Number(this._start[attribute][x][y])) * easing)) + " ";
							}
							else {
								new_value += this._end[attribute][x][y] + " ";
							}
						}
					}
					this.setAttribute(attribute, new_value);
				}
				else if(attribute.match(/^(points)$/)) {
					var new_value = "";
					for(x in this._start[attribute]) {
						new_value += (this._start[attribute][x][0] + ((this._end[attribute][x][0] - this._start[attribute][x][0]) * easing)) + ",";
						new_value += (this._start[attribute][x][1] + ((this._end[attribute][x][1] - this._start[attribute][x][1]) * easing)) + " ";
					}
					this.setAttribute(attribute, new_value);
				}
				else {
					var new_value = (this._start[attribute] + ((this._end[attribute] - this._start[attribute]) * easing)) +  this._unit[attribute]
					u.as(node, attribute, new_value, false);
				}
			}
		}
		u.a.requestAnimationFrame(node, "transitionTo", node.duration);
	}


/*beta-u-googlemaps.js*/
u.googlemaps = new function() {
	this.api_loaded = false;
	this.map = function(map, center, _options) {
		map._maps_streetview = false;
		map._maps_zoom = 10;
		map._maps_scrollwheel = true;
		map._maps_zoom = 10;
		map._center_latitude = center[0];
		map._center_longitude = center[1];
		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {
					case "zoom"           : map._maps_zoom               = _options[_argument]; break;
					case "scrollwheel"    : map._maps_scrollwheel        = _options[_argument]; break;
					case "streetview"     : map._maps_streetview         = _options[_argument]; break;
				}
			}
		}
		var map_key = u.randomString(8);
		(window[map_key] = function() {
			var mapOptions = {center: new google.maps.LatLng(center[0], center[1]), zoom: map._maps_zoom, scrollwheel: map._maps_scrollwheel, streetViewControl: map._maps_streetview, zoomControlOptions: {position: google.maps.ControlPosition.LEFT_TOP}};
			map.g_map = new google.maps.Map(map, mapOptions);
			if(typeof(map.APIloaded) == "function") {
				map.APIloaded();
			}
			google.maps.event.addListener(map.g_map, 'tilesloaded', function() {
				if(typeof(map.loaded) == "function") {
					map.loaded();
				}
			});
		});
		if(!this.api_loaded) {
			u.ae(document.head, "script", {"src":"https://maps.googleapis.com/maps/api/js?callback="+map_key+(u.gapi_key ? "&key="+u.gapi_key : "")});
			this.api_loaded = true;
		}
		else {
			window[map_key]();
		}
	}
	this.addMarker = function(map, coords, _options) {
		var _info = false;
		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {
					case "info"           : _info               = _options[_argument]; break;
				}
			}
		}
		var marker = new google.maps.Marker({position: new google.maps.LatLng(coords[0], coords[1]), animation:google.maps.Animation.DROP, InfoWindow: {content:"hest"}});
		marker.setMap(map);
		marker.g_map = map;
		google.maps.event.addListener(marker, 'click', function() {
			if(typeof(this.clicked) == "function") {
				this.clicked();
			}
		});
		google.maps.event.addListener(marker, 'mouseover', function() {
			if(typeof(this.entered) == "function") {
				this.entered();
			}
		});
		google.maps.event.addListener(marker, 'mouseout', function() {
			if(typeof(this.exited) == "function") {
				this.exited();
			}
		});
		return marker;
	}
	this.removeMarker = function(map, marker, _options) {
		marker._animation = true;
		if(typeof(_options) == "object") {
			var _argument;
			for(_argument in _options) {
				switch(_argument) {
					case "animation"      : marker._animation            = _options[_argument]; break;
				}
			}
		}
		if(marker._animation) {
			var key = u.randomString(8);
			marker.pick_step = 0;
			marker.c_zoom = (1 << map.getZoom());
			marker.c_projection = map.getProjection();
			marker.c_exit = map.getBounds().getNorthEast().lat();
			marker._pickUp = function() {
				var new_position = this.c_projection.fromLatLngToPoint(this.getPosition());
				new_position.y -= (20*this.pick_step) / this.c_zoom; 
				new_position = this.c_projection.fromPointToLatLng(new_position);
				this.setPosition(new_position);
				if(this.c_exit < new_position.lat()) {
					this.setMap(null);
					if(typeof(this.removed) == "function") {
						this.removed();
					}
				}
				else{
					this.pick_step++;
					u.t.setTimer(this, this._pickUp, 20);
				}
			}
			marker._pickUp();
		}
		else {
			marker.setMap(null);
		}
	}
	this.infoWindow = function(map) {
		map.g_infowindow = new google.maps.InfoWindow({"maxWidth":250});
		google.maps.event.addListener(map.g_infowindow, 'closeclick', function() {
			if(this._marker && typeof(this._marker.closed) == "function") {
				this._marker.closed();
				this._marker = false;
			}
		});
	}
	this.showInfoWindow = function(map, marker, content) {
		map.g_infowindow.setContent(content);
		map.g_infowindow.open(map, marker);
		map.g_infowindow._marker = marker;
	}
	this.hideInfoWindow = function(map) {
		map.g_infowindow.close();
		if(map.g_infowindow._marker && typeof(map.g_infowindow._marker.closed) == "function") {
			map.g_infowindow._marker.closed();
			map.g_infowindow._marker = false;
		}
		map.g_infowindow._marker = false;
	}
	this.zoom = function() {
	}
	this.center = function() {
	}
}


/*u-extensions.js*/
u.linkScrambler = function(link) {
	link.scramble_text = link.innerHTML;
	link.scrambled_count = 0;
	link.randomizer = function() {
		var indexes = [];
		var rand;
		while(indexes.length < this.scrambled_sequence.length/2) {
			rand = u.random(0, this.scrambled_sequence.length-1);
			if(indexes.indexOf(rand) == -1) {
				indexes.push(rand);
			}
		}
		return indexes;
	}
	link.scramble = function() {
		var indexes = this.randomizer();
		if(this.scrambled_count < 7) {
			var a, b, c, d;
			while(indexes.length > 1) {
				ia = u.random(0, indexes.length-1);
				ca = indexes[ia];
				indexes.splice(ia, 1);
				ib = u.random(0, indexes.length-1);
				cb = indexes[ib];
				indexes.splice(ib, 1);
				c = this.scrambled_sequence[ca];
				d = this.scrambled_sequence[cb];
				this.scrambled_sequence[ca] = d;
				this.scrambled_sequence[cb] = c;
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
		u.t.resetTimer(this.t_scrambler);
		this.innerHTML = this.scramble_text;
		if(!this.fixed_width) {
			u.as(this, "width", "auto");
		}
		this.scrambled_count = 0;
	}
	link.mousedover = function() {
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
	var top_points = x1+","+y1+" ";
	for(i = 0; i < points_x.length; i++) {
		top_points += points_x[i]+","+points_y[i]+" ";
	}
	top_points += x2+","+y1;
	page.svg.top_points = top_points;
	top_points2 = x1+","+y1+" ";
	for(i = 0; i < points_x.length; i++) {
		top_points2 += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-10)+" ";
	}
	top_points2 += x2+","+y1;
	page.svg.top_points2 = top_points2;
	top_flat = x1+","+(y1-y4)+" ";
	for(i = 0; i < points_x.length; i++) {
		top_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-y4)+" ";
	}
	top_flat += x2+","+(y1-y4);
	page.svg.top_flat = top_flat;
	bottom_points = x1+","+y4+" ";
	for(i = 0; i < points_x.length; i++) {
		bottom_points += points_x[i]+","+points_y[i]+" ";
	}
	bottom_points += x2+","+y4;
	page.svg.bottom_points = bottom_points;
	bottom_points2 = x1+","+y4+" ";
	for(i = 0; i < points_x.length; i++) {
		bottom_points2 += (points_x[i]-u.random(-10, 10))+","+points_y[i]+" ";
	}
	bottom_points2 += x2+","+y4;
	page.svg.bottom_points2 = bottom_points2;
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


/*i-page.js*/
u.bug_force = true;
u.bug_console_only = true;
Util.Objects["page"] = new function() {
	this.init = function(page) {
		if(u.hc(page, "i:page")) {
			u.rc(page, "i:page");
			page.hN = u.qs("#header");
			page.cN = u.qs("#content", page);
			page.nN = u.qs("#navigation", page);
			page.fN = u.qs("#footer");
			page.videoPlayer = u.videoPlayer();
			page.resized = function(event) {
				page.browser_w = u.browserW();
				page.browser_h = u.browserH();
				var i, item;
				if(page.nN.items) {
					for(i = 0; item = page.nN.items[i]; i++) {
						u.ass(item, {"height" : page.browser_h / 2 + "px"}, false);
					}
					if(u.hc(page.nN, "open")) {
						u.ass(page.nN, {"height" : page.browser_h+"px", "width" : page.browser_w+"px"}, false);
					}
				}
				if(page.cN && page.cN.scene && typeof(page.cN.scene.resized) == "function") {
					page.cN.scene.resized();
				}
				page.offsetHeight;
			}
			page.scrolled = function(event) {
				page.scroll_y = u.scrollY();
				if(page.cN && page.cN.scene && typeof(page.cN.scene.scrolled) == "function") {
					page.cN.scene.scrolled();
				}
				page.offsetHeight;
			}
			page.orientationchanged = function(event) {
				page.resized();
			}
			page.ready = function() {
				if(!this.is_ready) {
					this.is_ready = true;
					this.cN.scene = u.qs(".scene", this.cN);
					u.e.addEvent(window, "scroll", page.scrolled);
					if(u.e.event_pref == "touch") {
						u.e.addEvent(window, "orientationchange", page.orientationchanged);
					}
					else {
						u.e.addEvent(window, "resize", page.resized);
					}
					this.initHeader();
					this.resized();
					this.scrolled();
					this.initIntro();
					this.initNavigation();
					u.navigation({"node":this});
					u.init(this.cN);
				}
			}
			page.cN.ready = function() {
				if(!page.intro && page.is_ready && page.cN.scene.is_ready) {
					if(!page.cN.is_ready) {
						u.a.transition(page.logo, "all 0.5s ease-in");
						u.a.transition(page.hN, "all 0.5s ease-in");
						u.a.opacity(page.cN, 1);
						u.a.opacity(page.logo, 1);
						u.a.opacity(page.hN, 1);
						page.cN.is_ready = true;
					}
					var destroying = false;
					var scenes = u.qsa(".scene", this);
					for(i = 0; scene = scenes[i]; i++) {
						if(scene != this.scene){
							if(typeof(scene.destroy) == "function") {
								destroying = true;
								scene.destroy();
							}
						}
					}
					if(!destroying && this.scene && !this.scene.built && typeof(this.scene.build) == "function") {
						window.scrollTo(0, 0);
						this.scene.built = true;
						this.scene.build();
					}
				}
			}
			page.cN.navigate = function(url) {
				this.response = function(response) {
					u.setClass(document.body, response.body_class);
					document.title = response.head_title;
					this.scene = u.qs(".scene", response);
					this.scene = u.ae(this, this.scene);
					u.init(this);
				}
				u.request(this, u.h.getCleanHash(url));
			}
			page.initHeader = function() {
				page.logo = u.ae(page, "div", {"class":"logo"});
				page.logo.a = u.ae(page.logo, "a");
				u.ce(page.logo);
				page.logo.clicked = function() {
					u.h.navigate("/");
				}
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
				page.bn_nav = u.qs("ul.servicenavigation li.navigation", page.hN);
				page.bn_nav.a = u.qs("a", page.bn_nav);
				page.nN.items = u.qsa("ul li h4",page.nN);
				page.bn_nav.a.fixed_width = true;
				u.linkScrambler(page.bn_nav.a);
				u.ce(page.bn_nav);
				page.bn_nav.clicked = function() {
					if(this.a && typeof(this.a.unscramble) == "function") {
						this.a.unscramble();
					}
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
			page.initNavigation = function() {
				var i, node;
				page.nN.nodes = u.qsa("li", page.nN);
				for(i = 0; node = page.nN.nodes[i]; i++) {
						u.ce(node);
						node.clicked = function(event) {
							page.nN.next_url = this.url;
							page.bn_nav.clicked();
							page.nN.transitioned = function() {
								u.rc(this, "open");
								u.h.navigate(this.next_url);
							}
						}
					// 
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
			page.initIntro = function() {
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
							u.as(this.sq, "transformOrigin", "50% 52%");
							u.a.transition(this.sq, "all 1s cubic-bezier(0.320, 1.640, 0.700, 0.140) 0.5s", "step1");
							u.as(this.sq, "transform", "rotateX(0) scale(1)");
						}
						this.sq.ended = function() {
							this.intro.transitioned = function() {
								page.intro.clicked();
							}
							u.a.transition(this.intro, "opacity 0.3s ease-in");
							u.a.opacity(this.intro, 0);
						}
						this.sq.step1 = function() {
							u.a.transition(this, "none");
							u.as(this, "transform", "rotateX(0) scale(1)");
							u.a.transition(this, "all 0.5s ease-in 1.5s", "ended");
							u.as(this, "transform", "rotateX(720deg) scale(10)");
						}
						u.a.transition(this, "all 1s ease-in", "step1");
						u.a.opacity(this, 1);
					}
					u.preloader(page.intro, ["/img/bg_intro.jpg"]);
					u.ce(page.intro);
					page.intro.clicked = function() {
						u.t.resetTimer(this.t_click);
						this.parentNode.removeChild(this);
						page.intro = false;
						page.cN.ready();
					}
				}
			}
			page.ready();
		}
	}
}
function static_init() {
	u.o.page.init(u.qs("#page"));
}
u.e.addDOMReadyEvent(static_init);


/*i-front.js*/
Util.Objects["front"] = new function() {
	this.init = function(scene) {
		scene.resized = function() {
			if(page.browser_w > 1200) {
				var excess = page.browser_w-1200;
				var left = Math.round(excess/2);
				var right = excess - left;
				u.as(this, "margin", "0 "+right+"px 0 "+left+"px", false);
			}
			else {
				u.as(this, "margin", 0, false);
			}
			var block_height = Math.ceil(this.offsetWidth/5);
			u.as(this.grid, "width", (block_height*5)+"px", false);
			var i, li;
			for (i = 0; li = this.lis[i]; i++) {
				if(li.is_ready) {
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
					else if(u.hc(li, "tweet")) {
						u.as(li, "height", block_height+"px", false);
						u.as(li, "width", (block_height*2)+"px", false);
					}
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
					}
					else if(u.hc(li, "ambassador")) {
						u.as(li, "width", (block_height*5)+"px", false);
						u.as(li.li_video, "height", (block_height*2)+"px", false);
						u.as(li.li_video, "width", (block_height*3)+"px", false);
						u.as(li.li_article, "height", (block_height*2)+"px", false);
						u.as(li.li_article, "width", (block_height*2)+"px", false);
					}
					if(u.hc(li, "push_up|push_up_half")) {
						u.as(li, "marginTop", -(block_height)+"px", false);
					}
					else if(u.hc(li, "push_down")) {
						u.as(li, "marginTop", block_height+"px", false);
					}
				}
			}
			var factor = (this.offsetWidth - 600) / 600;
			var padding = (10 + (factor * 30))+"px "+(10 + (factor * 20))+"px";
			var h2_40_padding = "0 0 " + (20 + (factor * 25))+"px";
			var h2_20_padding = "0 0 " + (10 + (factor * 12))+"px";
			this.article_rule.style.setProperty("padding", padding, "important");
			this.article_h2_40_rule.style.setProperty("padding", h2_40_padding, "important");
			this.article_h2_20_rule.style.setProperty("padding", h2_20_padding, "important");
			this.article_p_rule.style.setProperty("padding", h2_40_padding, "important");
			this.tweet_rule.style.setProperty("padding", padding, "important");
		}
		scene.scrolled = function() {
			if(this.is_built) {
				var i, li;
				for (i = 0; li = this.lis[i]; i++) {
					if(!li.is_built && li.i == this.rendered) {
						var li_y = u.absY(li);
						if(
							(li_y > page.scroll_y && li_y < page.scroll_y + (page.browser_h-100)) || 
							(li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + (page.browser_h - 100))
						) {
							this.renderNode(li);
							break;
						}
					}
					else if(li.i > this.rendered) {
						break;
					}
					else if(li.is_built && li.image && li.image.video_player) {
						var li_y = u.absY(li);
						if(!li.image.video_player.is_playing &&
							(li_y > page.scroll_y && li_y < page.scroll_y + (page.browser_h-100)) || 
							(li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + (page.browser_h - 100))
						) {
							li.image.video_player.play();
						}
						else {
							li.image.video_player.stop();
						}
					}
				}
			}
		}
		scene.ready = function() {
			u.bug("scene.ready:" + u.nodeId(this));
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
			this.h1 = u.qs("h1", this);
			this.grid = u.qs("ul.grid", this);
			this.lis = u.qsa("ul.grid > li", this);
			var i, li;
			for (i = 0; li = this.lis[i]; i++) {
				li.scene = this;
				li.i = i;
				u.ac(li, "i"+i);
				if(u.hc(li, "forty")) {
					li.perspective_depth = Math.ceil(this.grid.offsetWidth/5) * 2;
					li._forty = true;
				}
				else if(u.hc(li, "sixty")) {
					li.perspective_depth = Math.ceil(this.grid.offsetWidth/5) * 3;
					li._sixty = true;
				}
				else {
					li.perspective_depth = Math.ceil(this.grid.offsetWidth/5);
					li._twenty = true;
				}
				if(u.hc(li, "instagram")) {
					li.image = u.qs("div.image", li);
					li.image.li = li;
					li.image.p = u.qs("div.image p", li);
					u.as(li, "perspectiveOrigin", "50% 50%");
					u.as(li, "perspective", (li.perspective_depth) + "px");
					u.as(li, "transformStyle", "preserve-3d");
					u.as(li.image, "backfaceVisibility", "hidden");
					u.as(li.image, "transformStyle", "preserve-3d");
					u.as(li.image, "transform", "rotateX(-180deg)");
					u.as(li.image, "transformOrigin", "50% 50% -"+(li.perspective_depth)+"px");
					li.image.image_id = u.cv(li.image, "image_id");
					li.image.image_format = u.cv(li.image, "image_format");
					if(li.image.image_id && li.image.image_format) {
						li.image._image_src = "/images/" + li.image.image_id + "/image/400x." + li.image.image_format;
					}
					li.image.video_format = u.cv(li.image, "video_format");
					if(li.image.image_id && li.image.video_format) {
						li.image._video_src = "/videos/" + li.image.image_id + "/video/400x." + li.image.video_format;
					}
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
				else if(u.hc(li, "tweet")) {
					li.cards = u.qsa(".card", li);
					u.as(li, "perspectiveOrigin", "50% 0");
					u.as(li, "perspective", "500px");
					u.as(li, "transformStyle", "preserve-3d");
					var j, card;
					for(j = 0; card = li.cards[j]; j++) {
						u.as(card, "backfaceVisibility", "hidden");
						u.as(card, "transform", "rotateX(180deg)");
					}
				}
				else if(u.hc(li, "article")) {
					li.card = u.qs(".card", li);
					li.link = u.qs(".card a", li);
					u.as(li, "perspectiveOrigin", "50% 0");
					u.as(li, "perspective", "500px");
					u.as(li, "transformStyle", "preserve-3d");
					u.as(li.card, "backfaceVisibility", "hidden");
					u.as(li.card, "transform", "rotateX(-180deg)");
					if(!li.link.target) {
						u.ce(li.link, {"type":"link"});
					}
					if(u.e.event_pref == "mouse") {
						u.linkScrambler(li.link);
					}
				}
				else if(u.hc(li, "ambassador")) {
					li.li_article = u.qs("li.article", li);
					li.li_article.card = u.qs(".card", li.li_article);
					li.li_article.link = u.qs(".card a", li.li_article);
					u.as(li.li_article, "perspectiveOrigin", "50% 0");
					u.as(li.li_article, "perspective", "500px");
					u.as(li.li_article, "transformStyle", "preserve-3d");
					u.as(li.li_article.card, "backfaceVisibility", "hidden");
					u.as(li.li_article.card, "transform", "rotateX(-180deg)");
					if(!li.li_article.link.target) {
						u.ce(li.li_article.link, {"type":"link"});
					}
					if(u.e.event_pref == "mouse") {
						u.linkScrambler(li.li_article.link);
					}
					li.li_video = u.qs("li.video", li);
					li.video = u.qs("div.video", li.li_video);
					li.image = u.qs("div.image", li.li_video);
					li.li_video.li = li;
					li.video.li = li;
					li.image.li = li;
					u.as(li.li_video, "perspectiveOrigin", "50% 50%");
					u.as(li.li_video, "perspective", (li.perspective_depth) + "px");
					u.as(li.image, "backfaceVisibility", "hidden");
					u.as(li.image, "transform", "rotateX(-180deg)");
					u.as(li.image, "transformOrigin", "50% 50% -"+(li.perspective_depth)+"px");
					u.as(li.video, "backfaceVisibility", "hidden");
					u.as(li.video, "transform", "rotateX(-180deg)");
					li.image_id = u.cv(li.image, "image_id");
					li.image_format = u.cv(li.image, "image_format");
					if(li.image_id && li.image_format) {
						li._image_src = "/images/" + li.image_id + "/image/720x." + li.image_format;
					}
					li.video_id = u.cv(li.video, "video_id");
					li.video_format = u.cv(li.video, "video_format");
					if(li.video_id && li.video_format) {
						li._video_url = "/videos/" + li.video_id + "/video/720x." + li.video_format;
						li.bn_play = u.ae(li.image, "div", {"class": "play"});
						u.e.click(li.image);
						li.image.clicked = function(event) {
							u.a.transition(this, "all 0.5s ease-in-out");
							u.as(this, "transform", "rotateX(180deg)");
							this.li.video.transitioned = function() {
								u.a.removeTransform(this);
							}
							u.a.transition(this.li.video, "all 0.5s ease-in-out");
							u.as(this.li.video, "transform", "rotateX(0deg)");
							this.li.resetPlayer = function() {
								this.video.transitioned = function() {
									u.as(this, "zIndex", 1);
								}
								u.a.transition(this.video, "all 0.5s ease-in-out");
								u.as(this.video, "transform", "rotateX(-180deg)");
								u.a.transition(this.image, "all 0.5s ease-in-out");
								u.as(this.image, "transform", "rotateX(0deg)");
							}
							if(page.videoPlayer.current_node) {
								page.videoPlayer.current_node.resetPlayer();
							}
							page.videoPlayer.ended = function(event) {
								this.current_node.resetPlayer();
								this.current_node = false;
							}
							u.as(this.li.video, "zIndex", 3);
							u.ae(this.li.video, page.videoPlayer);
							page.videoPlayer.current_node = this.li;
							page.videoPlayer.loadAndPlay(this.li._video_url, {"playpause":true});
						}
					}
				}
				li.is_ready = true;
			}
			this.resized();
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
			this.is_ready = true;
			page.cN.ready();
		}
		scene._rotateCard = function() {
			if(this.cards.length > 1) {
				var new_card = this.card+1 < this.cards.length ? this.card+1 : 0;
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
				if(this.offsetHeight) {
					u.t.setTimer(this, this.rotateCard, 5000);
				}
			}
		}
		scene.next_render = new Date().getTime();
		scene.renderControl = function() {
			var now = new Date().getTime();
			this.next_render = now - this.next_render > 150 ? now : now + (150 - (now - this.next_render));
			return this.next_render-now;
		}
		scene.renderNode = function(li) {
			li.is_built = true;
			if(u.hc(li, "instagram")) {
				if(li.image._image_src) {
					li.image.loaded = function(queue) {
						this.img = u.ae(this, "img", {"src": queue[0].image.src});
						this.transitioned = function() {
							u.a.removeTransform(this);
							if(this._video_src) {
								this.video_player = u.videoPlayer({"volume":true});
								this.video_player.img = this.img;
								u.ae(this, this.video_player);
								this.video_player.playing = function() {
									this.img.transitioned = function() {
										u.as(this, "display", "none");
									}
									u.a.transition(this.img, "all 0.3s linear");
									u.a.opacity(this.img, 0);
								}
								this.video_player.ended = function() {
									this.play();
								}
								this.video_player.loadAndPlay(this._video_src);
								this.video_player.volume(0);
							}
						}
						u.a.transition(this, "all 1s ease-in-out "+(this.li.scene.renderControl())+"ms");
						if(u.browser("safari")) {
							u.as(this, "transformOrigin", "50% 50% 0");
						}
						u.as(this, "transform", "rotateX(0)");
						this.li.scene.rendered++;
						this.li.scene.scrolled();
					}
					u.preloader(li.image, [li.image._image_src])
				}
				else {
					li.scene.rendered++;
					li.scene.scrolled();
				}
			}
			else if(u.hc(li, "ambassador")) {
				if(li._image_src) {
					li.image.loaded = function(queue) {
						u.ae(this, "img", {"src": queue[0].image.src});
						this.transitioned = function() {
							u.a.transition(this, "none");
							u.a.removeTransform(this);
							u.as(this.li.li_video, "perspective", "500px");
							u.as(this.li.li_video, "transformStyle", "preserve-3d");
							u.as(this.li.li_video, "perspectiveOrigin", "50% 0");
							u.as(this, "transformOrigin", "50% 50% 0");
						}
						u.a.transition(this, "all 1s ease-in-out "+(this.li.scene.renderControl())+"ms");
						if(u.browser("safari")) {
							u.as(this, "transformOrigin", "50% 50% 0");
						}
						u.as(this, "transform", "rotateX(0)");
						this.li.scene.rendered++;
						this.li.scene.scrolled();
					}
					u.preloader(li.image, [li._image_src])
				}
				else {
					li.scene.rendered++;
					li.scene.scrolled();
				}
				li.li_article.card.transitioned = function() {
					u.a.removeTransform(this);
				}
				u.a.transition(li.li_article.card, "all 0.5s ease-in-out "+(li.scene.renderControl())+"ms");
				u.as(li.li_article.card, "transform", "rotateX(0)");
			}
			else if(u.hc(li, "article")) {
				li.card.transitioned = function() {
					u.a.removeTransform(this);
				}
				u.a.transition(li.card, "all 0.5s ease-in-out "+(li.scene.renderControl())+"ms");
				u.as(li.card, "transform", "rotateX(0)");
				li.scene.rendered++;
				li.scene.scrolled();
			}
			else if(u.hc(li, "tweet")) {
				li.cards[0].transitioned = function() {
					u.a.transition(this, "none");
					u.a.removeTransform(this);
				}
				u.a.transition(li.cards[0], "all 0.5s ease-in-out "+(li.scene.renderControl())+"ms");
				u.as(li.cards[0], "transform", "rotateX(0)");
				li.card = 0;
				li.rotateCard = this._rotateCard;
				u.t.setTimer(li, li.rotateCard, 5000);
				li.scene.rendered++;
				li.scene.scrolled();
			}
			else if(u.hc(li, "blank")) {
				li.scene.rendered++;
				li.scene.scrolled();
			}
		}
		scene.build = function() {
			if(!this.is_built) {
				u.a.transition(this.h1, "all 0.5s ease-in");
				u.a.opacity(this.h1, 1);
				this.rendered = 0;
				this.is_built = true;
				this.scrolled();
			}
		}
		scene.destroy = function() {
			this.destroy = null;
			this.finalizeDestruction = function() {
				this.style_tag.parentNode.removeChild(this.style_tag);
				this.parentNode.removeChild(this);
				page.cN.ready();
			}
			u.a.transition(this.h1, "all 0.5s ease-out");
			u.a.opacity(this.h1, 0);
			var i, li, j = 0;
			for(i = 0; li = this.lis[i]; i++) {
				var li_y = u.absY(li);
				if((li_y > page.scroll_y && li_y < page.scroll_y + page.browser_h) || li_y+li.offsetHeight > page.scroll_y && li_y+li.offsetHeight < page.scroll_y + page.browser_h) {
					u.as(li, "zIndex", 100-j);
					u.as(li.parentNode, "perspectiveOrigin", "50% 0");
					u.as(li.parentNode, "perspective", "500px");
					u.as(li.parentNode, "transformStyle", "preserve-3d");
					u.a.transition(li, "all 0.5s ease-in "+(150*j++)+"ms");
					u.as(li, "transform", "translateY(1500px) rotateX(-540deg)");
				}
			}
			u.t.setTimer(this, this.finalizeDestruction, (150*j)+500);
		}
		scene.ready();
	}
}


/*i-events.js*/
Util.Objects["events"] = new function() {
	this.init = function(scene) {
		scene.resized = function() {
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
		}
		scene.filterEvents = function() {
			this._show_markers = [];
			this._hide_marker_count = 0;
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
			this.showDelayed();
		}
		scene.checkDays = function(event_node) {
			if(!this.selected_day || this.selected_day == event_node._day) {
				return true;
			}
			return false;
		}
		scene.checkTags = function(event_node) {
			if(this.selected_tags.length == 0) {
				return true;
			} 
			else {
				var i, tag;
				for(i = 0; tag = this.selected_tags[i]; i++) {
					if(event_node.tags_array.indexOf(tag) == -1) {
						return false;
					}
				}
			}
			return true;	
		}
		scene.checkSearch = function(event_node) {
			if(!this.selected_search || event_node._host._string.match(this.selected_search) || event_node._name._string.match(this.selected_search) || event_node._location._string.match(this.selected_search)) {
				return true;
			}
			return false;
		}
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
				node.clicked = function(event) {
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
		scene.initDays = function() {
			this.days_list = u.qs("ul.days", this);
			this.all_days = u.ie(this.days_list, "li", {"class":"all selected","html":"Alle dage"});
			this.days = u.qsa("li", this.days_list);
			var i, day;
			for(i = 0; day = this.days[i]; i++) {
				day.scene = this;
				day.day_string = day.innerHTML.toLowerCase();
				if(u.e.event_pref == "mouse") {
					u.linkScrambler(day);
				}
				day.clicked = function() {
					if(u.hc(this, "selected") && this != this.scene.all_days) {
						u.rc(this, "selected");
						u.ac(this.scene.all_days, "selected");
						this.scene.selected_day = "";
					} 
					else {
						var i, day;
						for(i = 0; day = this.scene.days[i]; i++) {
							u.rc(day, "selected");
						}
						if(this == this.scene.all_days) {
							this.scene.selected_day = "";
						}
						else {
							this.scene.selected_day = this.day_string;
						}
						u.ac(this, "selected");
					}
					this.scene.filterEvents();
				}
				u.ce(day)
			}
		}
		scene.initTags = function() {
			this.tags_list = u.qs(".tag_list", this);
			this.all_tags = u.ie(this.tags_list, "li", {"class":"all selected","html":"Alle"});
			this.tags = u.qsa("li", this.tags_list);
			var i, tag;
			for(i = 0; tag = this.tags[i]; i++) {
				tag.scene = this;
				tag.tag_string = tag.innerHTML;
				if(u.e.event_pref == "mouse") {
					u.linkScrambler(tag);
				}
				tag.clicked = function() {
					if(this.scene.input_search) {
						this.scene.input_search.value = this.scene.input_search.default_value;
						this.scene.selected_search = "";
					}
					if(u.hc(this, "all")) {
						var i, tag;
						for(i = 0; tag = this.scene.tags[i]; i++) {
							u.rc(tag, "selected");
						}
						u.ac(this.scene.all_tags, "selected")
						this.scene.selected_tags = [];
					} 
					else if(u.hc(this, "selected")){
						u.rc(this, "selected");
						this.scene.selected_tags.splice(this.scene.selected_tags.indexOf(this.tag_string), 1);
						if(this.scene.selected_tags.length == 0) {
							u.ac(this.scene.all_tags, "selected");
						}
					}
					else {
						u.rc(this.scene.all_tags, "selected")
						u.ac(this, "selected");
						this.scene.selected_tags.push(this.tag_string)
					}
					this.scene.filterEvents();
				}
				u.ce(tag)
			}
		}
		scene.initSearch = function() {
			this.form_search = u.qs("form.search", this);
			this.input_search = u.qs("input", this.form_search);
			this.input_search.default_value = "Skriv her";
			this.input_search.scene = this;
			this.input_search.value = this.input_search.default_value;
			this.input_search.focused = function() {
				if(this.value == this.default_value) {
					this.value = "";
				} 
			}
			this.input_search.blurred = function() {
				if(this.value == "") {
					this.value = this.default_value;
				} 
			}
			this.input_search.keySearch = function() {
				this.scene.selected_search = this.value.toLowerCase();
				this.scene.filterEvents();
			}
			this.input_search.keyUp = function(event) {
				u.t.resetTimer(this.t_search)
				this.t_search = u.t.setTimer(this, this.keySearch, 300);
			}
			this.input_search.keyDown = function(event) {
				if(event.keyCode == 13) {
					u.e.kill(event);
				}
			}
			u.e.addEvent(this.input_search, "focus", this.input_search.focused);
			u.e.addEvent(this.input_search, "blur", this.input_search.blurred);
			u.e.addEvent(this.input_search, "keyup", this.input_search.keyUp);
			u.e.addEvent(this.input_search, "keydown", this.input_search.keyDown);
		}
		scene.initFilters = function() {
			this.filter = u.qs(".filter", this);
			this.filter.scene = this;
			this.filter.h2 = u.qs("h2", this.filter);
			this.filter.h2.filter = this.filter;
			this.filter.tag_list = u.qs("ul.tag_list", this.filter);
			if(u.e.event_pref == "mouse") {
				this.filter.h2.fixed_width = true;
				u.linkScrambler(this.filter.h2);
			}
			this.filter.org_height = this.filter.offsetHeight;
			u.ass(this.filter, {"height" : "32px", "width" : "100px"});
			u.as(this.filter.tag_list, "display", "none");
			u.as(this.form_search, "display", "none");
			this.filter.h2.clicked = function() {
				if(typeof(this.unscramble) == "function") {
					this.unscramble();
				}
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
					u.as(this.filter, "height", this.filter.org_height + "px");
					u.a.transition(this.filter, "all 0.3s ease-out");
					u.ass(this.filter, {"width" : "100px", "height" : "32px"});
					this.filter.open = false;
				}
			}
			u.ce(this.filter.h2);
		}
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
		scene.ready = function() {
			this.selected_day = "";
			this.selected_tags = [];
			this.selected_search = "";
			this.h1 = u.qs("h1", this);
			this.h1.scene = this;
			this.div_events = u.qs("div.events", this);
			this.div_events.scene = this;
			this.div_filters = u.qs("div.filters", this);
			this.initEvents();
			this.initDays();
			this.initTags();
			this.initSearch();
			this.initFilters();
			this.initMap();
			u.as(this.h1, "transform", "translate(0, -300px) rotate(10deg)");
			u.as(this.div_filters, "transform", "translate(0, -300px) rotate(10deg)");
			u.as(this.div_events, "transform", "translate(0, "+page.browser_h+"px) rotate(10deg)");
			this.resized();
			this.is_ready = true;
			page.cN.ready();
		}
		scene.hideAllMarkers = function() {
			var i, node;
			for(i = 0; node = this.events[i]; i++) {
				if(node._marker_shown && node.marker) {
					u.googlemaps.removeMarker(node.marker.g_map, node.marker, {"animation":false});
					node._marker_shown = false;
				}
			}
		}
		scene.showDelayed = function() {
			var i, node;
			for(i = 0; node = this._show_markers[i]; i++) {
				u.t.setTimer(node, this._showDelayed, (this._hide_marker_count*50) + 100 + (i*150));
			}
		}
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
				if(!this._clicked_to_open) {
					u.googlemaps.hideInfoWindow(this.g_map);
				}
			}
			this.marker.clicked = function() {
				u.googlemaps.hideInfoWindow(this.g_map);
				u.googlemaps.showInfoWindow(this.g_map, this, this._node._infowindow_content);
				var link = u.qs(".action a", this._node.scene.map);
				u.linkScrambler(link);
				this._clicked_to_open = true;
			}
			this.marker.closed = function() {
				this._clicked_to_open = false;
			}
		}
		scene._hideDelayed = function() {
			u.googlemaps.removeMarker(this.marker.g_map, this.marker);
		}
		scene.showEvent = function(node) {
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
		scene.build = function() {
			if(!this.is_built) {
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
		scene.destroy = function() {
			this.destroy = null;
			this.finalizeDestruction = function() {
				this.parentNode.removeChild(this);
				page.cN.ready();
			}
			this.h1.transitioned = function() {
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
		scene.ready();
	}
}


/*i-manifest.js*/
Util.Objects["manifest"] = new function() {
	this.init = function(scene) {
		scene.resized = function() {
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
		}
		scene.ready = function() {
			page.resized();
			this.link = u.qs("a", this);
			u.ce(this.link, {"type":"link"});
			this.is_ready = true;
			page.cN.ready();
		}
		scene.build = function() {
			if(!this.is_built) {
				this.is_built = true;
				this.bg_manifest = u.ae(page, "div", {"class":"bg_manifest"});
				this.bg_manifest.vp = u.videoPlayer();
				u.ae(this.bg_manifest, this.bg_manifest.vp);
				page.resized();
				u.as(this, "opacity", 1);
				u.as(this.bg_manifest.vp, "opacity", 0);
				this.finalizeBuild = function() {
					this.removeChild(this.svg);
					this.bg_manifest.vp.ended = function() {
						this.play();
					}
					this.bg_manifest.vp.playing = function() {
						u.a.opacity(this, 1);
					}
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
				for(i = 0; i < lines; i++) {
					var x1 = (i*page.browser_w/lines) - 10;
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
				lines = u.qsa("line", this.svg);
				new_lines = [];
				for(i = 0; i < lines.length; i++) {
					new_lines.push(lines[i]);
				}
				this.svg._animate = function() {
					if(new_lines.length) {
						i = u.random(0, new_lines.length-1);
						line = new_lines[i];
						new_lines.splice(i, 1);
						u.a.to(line, "all 0.3s linear", new_coords[i]);
						new_coords.splice(i, 1);
						u.t.setTimer(this, "_animate", 10);
					}
					else {
						u.t.setTimer(this.scene, this.scene.finalizeBuild, 500);
					}
				}
				this.svg._animate();
			}
		}
		scene.destroy = function() {
			this.destroy = null;
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
			lines = u.qsa("line", this.svg);
			new_lines = [];
			for(i = 0; i < lines.length; i++) {
				new_lines.push(lines[i]);
			}
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
					if(j == 15) {
						u.a.transition(this._c, "all 0.2s ease-out");
						u.as(this._c, "transform", "scale(1) rotate(5deg) translate(5px, 100px)");
					}
					if(j == 20) {
						u.a.transition(this._c, "all 0.3s ease-out");
						u.as(this._c, "transform", "scale(0.8) rotate(-13deg) translate(-5px, 300px)");
					}
					if(j == 27) {
						u.a.transition(this._c, "all 0.3s ease-out");
						u.as(this._c, "transform", "scale(0.7) rotate(-3deg) translate(0px, 1000px)");
					}
					u.t.setTimer(this, "_animate", 10);
				}
				else {
					u.t.setTimer(this.scene, this.scene.finalizeDestruction, 500);
				}
			}
			this.svg._animate();
		}
		scene.ready();
	}
}


/*i-buy.js*/
Util.Objects["buy"] = new function() {
	this.init = function(scene) {
		scene.resized = function() {
			u.as(this, "height", page.browser_h + "px", false);
			if(this.h2) {
				u.as(this.h2, "paddingTop", ((page.browser_h - u.actualH(this.h2)) / 2) - 125 + "px", false);
			}
		}
		scene.scrolled = function() {
		}
		scene.ready = function() {
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
			this.is_ready = true;
			page.cN.ready();
		}
		scene.build = function() {
			if(!this.is_built) {
				this.is_built = true;
				this.bg_buy = u.ae(page, "div", {"class":"bg_buy"});
				this.h2 = u.qs("h2", this);
				this.link = u.qs(".actions li a", this);
				u.linkScrambler(this.link);
				page.resized();
				u.as(this, "opacity", 1);
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
				var top_points = x1+","+y1+" ";
				for(i = 0; i < points_x.length; i++) {
					top_points += points_x[i]+","+points_y[i]+" ";
				}
				top_points += x2+","+y1;
				this.svg.top_points = top_points;
				top_points2 = x1+","+y1+" ";
				for(i = 0; i < points_x.length; i++) {
					top_points2 += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-10)+" ";
				}
				top_points2 += x2+","+y1;
				this.svg.top_points2 = top_points2;
				top_flat = x1+","+(y1-y4)+" ";
				for(i = 0; i < points_x.length; i++) {
					top_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-y4)+" ";
				}
				top_flat += x2+","+(y1-y4);
				this.svg.top_flat = top_flat;
				bottom_points = x1+","+y4+" ";
				for(i = 0; i < points_x.length; i++) {
					bottom_points += points_x[i]+","+points_y[i]+" ";
				}
				bottom_points += x2+","+y4;
				this.svg.bottom_points = bottom_points;
				bottom_points2 = x1+","+y4+" ";
				for(i = 0; i < points_x.length; i++) {
					bottom_points2 += (points_x[i]-u.random(-10, 10))+","+points_y[i]+" ";
				}
				bottom_points2 += x2+","+y4;
				this.svg.bottom_points2 = bottom_points2;
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
					this.svg._bottom.transitioned = function() {
						this.transitioned = function() {
							this.transitioned = function() {
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
		scene.destroy = function() {
			this.destroy = null;
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
			var top_points = x1+","+y1+" ";
			for(i = 0; i < points_x.length; i++) {
				top_points += points_x[i]+","+points_y[i]+" ";
			}
			top_points += x2+","+y1;
			this.svg.top_points = top_points;
			top_points2 = x1+","+y1+" ";
			for(i = 0; i < points_x.length; i++) {
				top_points2 += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-10)+" ";
			}
			top_points2 += x2+","+y1;
			this.svg.top_points2 = top_points2;
			top_flat = x1+","+(y1-y4)+" ";
			for(i = 0; i < points_x.length; i++) {
				top_flat += (points_x[i]-u.random(-10, 10))+","+(points_y[i]-y4)+" ";
			}
			top_flat += x2+","+(y1-y4);
			this.svg.top_flat = top_flat;
			bottom_points = x1+","+y4+" ";
			for(i = 0; i < points_x.length; i++) {
				bottom_points += points_x[i]+","+points_y[i]+" ";
			}
			bottom_points += x2+","+y4;
			this.svg.bottom_points = bottom_points;
			bottom_points2 = x1+","+y4+" ";
			for(i = 0; i < points_x.length; i++) {
				bottom_points2 += (points_x[i]-u.random(-10, 10))+","+points_y[i]+" ";
			}
			bottom_points2 += x2+","+y4;
			this.svg.bottom_points2 = bottom_points2;
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
		scene.ready();
	}
}

