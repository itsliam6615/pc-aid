"use strict";

function getBoundingClientRect(e) {
	var t = e.getBoundingClientRect();
	return {
		width: t.width,
		height: t.height,
		top: t.top,
		right: t.right,
		bottom: t.bottom,
		left: t.left,
		x: t.left,
		y: t.top
	}
}

function getWindow(e) {
	if ("[object Window]" === e.toString()) return e;
	var t = e.ownerDocument;
	return t ? t.defaultView : window
}

function getWindowScroll(e) {
	var t = getWindow(e);
	return {
		scrollLeft: t.pageXOffset,
		scrollTop: t.pageYOffset
	}
}

function isElement(e) {
	return e instanceof getWindow(e).Element || e instanceof Element
}

function isHTMLElement(e) {
	return e instanceof getWindow(e).HTMLElement || e instanceof HTMLElement
}

function getHTMLElementScroll(e) {
	return {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	}
}

function getNodeScroll(e) {
	return (e !== getWindow(e) && isHTMLElement(e) ? getHTMLElementScroll : getWindowScroll)(e)
}

function getNodeName(e) {
	return e ? (e.nodeName || "").toLowerCase() : null
}

function getDocumentElement(e) {
	return (isElement(e) ? e.ownerDocument : e.document).documentElement
}

function getWindowScrollBarX(e) {
	return getBoundingClientRect(getDocumentElement(e)).left + getWindowScroll(e).scrollLeft
}

function getComputedStyle(e) {
	return getWindow(e).getComputedStyle(e)
}

function isScrollParent(e) {
	var t = getComputedStyle(e),
		n = t.overflow,
		r = t.overflowX,
		o = t.overflowY;
	return /auto|scroll|overlay|hidden/.test(n + o + r)
}

function getCompositeRect(e, t, n) {
	void 0 === n && (n = !1);
	var r = getDocumentElement(t),
		o = getBoundingClientRect(e),
		i = isHTMLElement(t),
		a = {
			scrollLeft: 0,
			scrollTop: 0
		},
		s = {
			x: 0,
			y: 0
		};
	return !i && (i || n) || ("body" === getNodeName(t) && !isScrollParent(r) || (a = getNodeScroll(t)), isHTMLElement(t) ? ((s = getBoundingClientRect(t)).x += t.clientLeft, s.y += t.clientTop) : r && (s.x = getWindowScrollBarX(r))), {
		x: o.left + a.scrollLeft - s.x,
		y: o.top + a.scrollTop - s.y,
		width: o.width,
		height: o.height
	}
}

function getLayoutRect(e) {
	return {
		x: e.offsetLeft,
		y: e.offsetTop,
		width: e.offsetWidth,
		height: e.offsetHeight
	}
}

function getParentNode(e) {
	return "html" === getNodeName(e) ? e : e.assignedSlot || e.parentNode || e.host || getDocumentElement(e)
}

function getScrollParent(e) {
	return 0 <= ["html", "body", "#document"].indexOf(getNodeName(e)) ? e.ownerDocument.body : isHTMLElement(e) && isScrollParent(e) ? e : getScrollParent(getParentNode(e))
}

function listScrollParents(e, t) {
	void 0 === t && (t = []);
	var n = getScrollParent(e),
		r = "body" === getNodeName(n),
		o = getWindow(n),
		i = r ? [o].concat(o.visualViewport || [], isScrollParent(n) ? n : []) : n,
		a = t.concat(i);
	return r ? a : a.concat(listScrollParents(getParentNode(i)))
}

function isTableElement(e) {
	return 0 <= ["table", "td", "th"].indexOf(getNodeName(e))
}

function getTrueOffsetParent(e) {
	if (!isHTMLElement(e) || "fixed" === getComputedStyle(e).position) return null;
	var t = e.offsetParent;
	if (t) {
		var n = getDocumentElement(t);
		if ("body" === getNodeName(t) && "static" === getComputedStyle(t).position && "static" !== getComputedStyle(n).position) return n
	}
	return t
}

function getContainingBlock(e) {
	for (var t = getParentNode(e); isHTMLElement(t) && ["html", "body"].indexOf(getNodeName(t)) < 0;) {
		var n = getComputedStyle(t);
		if ("none" !== n.transform || "none" !== n.perspective || n.willChange && "auto" !== n.willChange) return t;
		t = t.parentNode
	}
	return null
}

function getOffsetParent(e) {
	for (var t = getWindow(e), n = getTrueOffsetParent(e); n && isTableElement(n) && "static" === getComputedStyle(n).position;) n = getTrueOffsetParent(n);
	return (!n || "body" !== getNodeName(n) || "static" !== getComputedStyle(n).position) && (n || getContainingBlock(e)) || t
}
Object.defineProperty(exports, "__esModule", {
	value: !0
});
var top = "top",
	bottom = "bottom",
	right = "right",
	left = "left",
	auto = "auto",
	basePlacements = [top, bottom, right, left],
	start = "start",
	end = "end",
	clippingParents = "clippingParents",
	viewport = "viewport",
	popper = "popper",
	reference = "reference",
	variationPlacements = basePlacements.reduce(function (e, t) {
		return e.concat([t + "-" + start, t + "-" + end])
	}, []),
	placements = [].concat(basePlacements, [auto]).reduce(function (e, t) {
		return e.concat([t, t + "-" + start, t + "-" + end])
	}, []),
	beforeRead = "beforeRead",
	read = "read",
	afterRead = "afterRead",
	beforeMain = "beforeMain",
	main = "main",
	afterMain = "afterMain",
	beforeWrite = "beforeWrite",
	write = "write",
	afterWrite = "afterWrite",
	modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function order(e) {
	var r = new Map,
		o = new Set,
		t = [];
	return e.forEach(function (e) {
		r.set(e.name, e)
	}), e.forEach(function (e) {
		o.has(e.name) || ! function n(e) {
			o.add(e.name), [].concat(e.requires || [], e.requiresIfExists || []).forEach(function (e) {
				var t;
				o.has(e) || (t = r.get(e)) && n(t)
			}), t.push(e)
		}(e)
	}), t
}

function orderModifiers(e) {
	var n = order(e);
	return modifierPhases.reduce(function (e, t) {
		return e.concat(n.filter(function (e) {
			return e.phase === t
		}))
	}, [])
}

function debounce(t) {
	var n;
	return function () {
		return n = n || new Promise(function (e) {
			Promise.resolve().then(function () {
				n = void 0, e(t())
			})
		})
	}
}

function format(e) {
	for (var t = arguments.length, n = new Array(1 < t ? t - 1 : 0), r = 1; r < t; r++) n[r - 1] = arguments[r];
	return [].concat(n).reduce(function (e, t) {
		return e.replace(/%s/, t)
	}, e)
}
var INVALID_MODIFIER_ERROR = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s',
	MISSING_DEPENDENCY_ERROR = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available',
	VALID_PROPERTIES = ["name", "enabled", "phase", "fn", "effect", "requires", "options"];

function validateModifiers(r) {
	r.forEach(function (n) {
		Object.keys(n).forEach(function (e) {
			switch (e) {
				case "name":
					"string" != typeof n.name && console.error(format(INVALID_MODIFIER_ERROR, String(n.name), '"name"', '"string"', '"' + String(n.name) + '"'));
					break;
				case "enabled":
					"boolean" != typeof n.enabled && console.error(format(INVALID_MODIFIER_ERROR, n.name, '"enabled"', '"boolean"', '"' + String(n.enabled) + '"'));
				case "phase":
					modifierPhases.indexOf(n.phase) < 0 && console.error(format(INVALID_MODIFIER_ERROR, n.name, '"phase"', "either " + modifierPhases.join(", "), '"' + String(n.phase) + '"'));
					break;
				case "fn":
					"function" != typeof n.fn && console.error(format(INVALID_MODIFIER_ERROR, n.name, '"fn"', '"function"', '"' + String(n.fn) + '"'));
					break;
				case "effect":
					"function" != typeof n.effect && console.error(format(INVALID_MODIFIER_ERROR, n.name, '"effect"', '"function"', '"' + String(n.fn) + '"'));
					break;
				case "requires":
					Array.isArray(n.requires) || console.error(format(INVALID_MODIFIER_ERROR, n.name, '"requires"', '"array"', '"' + String(n.requires) + '"'));
					break;
				case "requiresIfExists":
					Array.isArray(n.requiresIfExists) || console.error(format(INVALID_MODIFIER_ERROR, n.name, '"requiresIfExists"', '"array"', '"' + String(n.requiresIfExists) + '"'));
					break;
				case "options":
				case "data":
					break;
				default:
					console.error('PopperJS: an invalid property has been provided to the "' + n.name + '" modifier, valid properties are ' + VALID_PROPERTIES.map(function (e) {
						return '"' + e + '"'
					}).join(", ") + '; but "' + e + '" was provided.')
			}
			n.requires && n.requires.forEach(function (t) {
				null == r.find(function (e) {
					return e.name === t
				}) && console.error(format(MISSING_DEPENDENCY_ERROR, String(n.name), t, t))
			})
		})
	})
}

function uniqueBy(e, n) {
	var r = new Set;
	return e.filter(function (e) {
		var t = n(e);
		if (!r.has(t)) return r.add(t), !0
	})
}

function getBasePlacement(e) {
	return e.split("-")[0]
}

function mergeByName(e) {
	var t = e.reduce(function (e, t) {
		var n = e[t.name];
		return e[t.name] = n ? Object.assign(Object.assign(Object.assign({}, n), t), {}, {
			options: Object.assign(Object.assign({}, n.options), t.options),
			data: Object.assign(Object.assign({}, n.data), t.data)
		}) : t, e
	}, {});
	return Object.keys(t).map(function (e) {
		return t[e]
	})
}

function getViewportRect(e) {
	var t = getWindow(e),
		n = getDocumentElement(e),
		r = t.visualViewport,
		o = n.clientWidth,
		i = n.clientHeight,
		a = 0,
		s = 0;
	return r && (o = r.width, i = r.height, /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || (a = r.offsetLeft, s = r.offsetTop)), {
		width: o,
		height: i,
		x: a + getWindowScrollBarX(e),
		y: s
	}
}

function getDocumentRect(e) {
	var t = getDocumentElement(e),
		n = getWindowScroll(e),
		r = e.ownerDocument.body,
		o = Math.max(t.scrollWidth, t.clientWidth, r ? r.scrollWidth : 0, r ? r.clientWidth : 0),
		i = Math.max(t.scrollHeight, t.clientHeight, r ? r.scrollHeight : 0, r ? r.clientHeight : 0),
		a = -n.scrollLeft + getWindowScrollBarX(e),
		s = -n.scrollTop;
	return "rtl" === getComputedStyle(r || t).direction && (a += Math.max(t.clientWidth, r ? r.clientWidth : 0) - o), {
		width: o,
		height: i,
		x: a,
		y: s
	}
}

function contains(e, t) {
	var n = Boolean(t.getRootNode && t.getRootNode().host);
	if (e.contains(t)) return !0;
	if (n) {
		var r = t;
		do {
			if (r && e.isSameNode(r)) return !0;
			r = r.parentNode || r.host
		} while (r)
	}
	return !1
}

function rectToClientRect(e) {
	return Object.assign(Object.assign({}, e), {}, {
		left: e.x,
		top: e.y,
		right: e.x + e.width,
		bottom: e.y + e.height
	})
}

function getInnerBoundingClientRect(e) {
	var t = getBoundingClientRect(e);
	return t.top = t.top + e.clientTop, t.left = t.left + e.clientLeft, t.bottom = t.top + e.clientHeight, t.right = t.left + e.clientWidth, t.width = e.clientWidth, t.height = e.clientHeight, t.x = t.left, t.y = t.top, t
}

function getClientRectFromMixedType(e, t) {
	return t === viewport ? rectToClientRect(getViewportRect(e)) : isHTMLElement(t) ? getInnerBoundingClientRect(t) : rectToClientRect(getDocumentRect(getDocumentElement(e)))
}

function getClippingParents(e) {
	var t = listScrollParents(getParentNode(e)),
		n = 0 <= ["absolute", "fixed"].indexOf(getComputedStyle(e).position) && isHTMLElement(e) ? getOffsetParent(e) : e;
	return isElement(n) ? t.filter(function (e) {
		return isElement(e) && contains(e, n) && "body" !== getNodeName(e)
	}) : []
}

function getClippingRect(r, e, t) {
	var n = "clippingParents" === e ? getClippingParents(r) : [].concat(e),
		o = [].concat(n, [t]),
		i = o[0],
		a = o.reduce(function (e, t) {
			var n = getClientRectFromMixedType(r, t);
			return e.top = Math.max(n.top, e.top), e.right = Math.min(n.right, e.right), e.bottom = Math.min(n.bottom, e.bottom), e.left = Math.max(n.left, e.left), e
		}, getClientRectFromMixedType(r, i));
	return a.width = a.right - a.left, a.height = a.bottom - a.top, a.x = a.left, a.y = a.top, a
}

function getVariation(e) {
	return e.split("-")[1]
}

function getMainAxisFromPlacement(e) {
	return 0 <= ["top", "bottom"].indexOf(e) ? "x" : "y"
}

function computeOffsets(e) {
	var t, n = e.reference,
		r = e.element,
		o = e.placement,
		i = o ? getBasePlacement(o) : null,
		a = o ? getVariation(o) : null,
		s = n.x + n.width / 2 - r.width / 2,
		c = n.y + n.height / 2 - r.height / 2;
	switch (i) {
		case top:
			t = {
				x: s,
				y: n.y - r.height
			};
			break;
		case bottom:
			t = {
				x: s,
				y: n.y + n.height
			};
			break;
		case right:
			t = {
				x: n.x + n.width,
				y: c
			};
			break;
		case left:
			t = {
				x: n.x - r.width,
				y: c
			};
			break;
		default:
			t = {
				x: n.x,
				y: n.y
			}
	}
	var p = i ? getMainAxisFromPlacement(i) : null;
	if (null != p) {
		var l = "y" === p ? "height" : "width";
		switch (a) {
			case start:
				t[p] = Math.floor(t[p]) - Math.floor(n[l] / 2 - r[l] / 2);
				break;
			case end:
				t[p] = Math.floor(t[p]) + Math.ceil(n[l] / 2 - r[l] / 2)
		}
	}
	return t
}

function getFreshSideObject() {
	return {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	}
}

function mergePaddingObject(e) {
	return Object.assign(Object.assign({}, getFreshSideObject()), e)
}

function expandToHashMap(n, e) {
	return e.reduce(function (e, t) {
		return e[t] = n, e
	}, {})
}

function detectOverflow(e, t) {
	void 0 === t && (t = {});
	var r, n = t.placement,
		o = void 0 === n ? e.placement : n,
		i = t.boundary,
		a = void 0 === i ? clippingParents : i,
		s = t.rootBoundary,
		c = void 0 === s ? viewport : s,
		p = t.elementContext,
		l = void 0 === p ? popper : p,
		f = t.altBoundary,
		d = void 0 !== f && f,
		u = t.padding,
		m = void 0 === u ? 0 : u,
		g = mergePaddingObject("number" != typeof m ? m : expandToHashMap(m, basePlacements)),
		h = l === popper ? reference : popper,
		b = e.elements.reference,
		v = e.rects.popper,
		y = e.elements[d ? h : l],
		O = getClippingRect(isElement(y) ? y : y.contextElement || getDocumentElement(e.elements.popper), a, c),
		w = getBoundingClientRect(b),
		E = computeOffsets({
			reference: w,
			element: v,
			strategy: "absolute",
			placement: o
		}),
		P = rectToClientRect(Object.assign(Object.assign({}, v), E)),
		x = l === popper ? P : w,
		S = {
			top: O.top - x.top + g.top,
			bottom: x.bottom - O.bottom + g.bottom,
			left: O.left - x.left + g.left,
			right: x.right - O.right + g.right
		},
		R = e.modifiersData.offset;
	return l === popper && R && (r = R[o], Object.keys(S).forEach(function (e) {
		var t = 0 <= [right, bottom].indexOf(e) ? 1 : -1,
			n = 0 <= [top, bottom].indexOf(e) ? "y" : "x";
		S[e] += r[n] * t
	})), S
}
var INVALID_ELEMENT_ERROR = "Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.",
	INFINITE_LOOP_ERROR = "Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.",
	DEFAULT_OPTIONS = {
		placement: "bottom",
		modifiers: [],
		strategy: "absolute"
	};

function areValidElements() {
	for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
	return !t.some(function (e) {
		return !(e && "function" == typeof e.getBoundingClientRect)
	})
}

function popperGenerator(e) {
	void 0 === e && (e = {});
	var t = e.defaultModifiers,
		s = void 0 === t ? [] : t,
		n = e.defaultOptions,
		c = void 0 === n ? DEFAULT_OPTIONS : n;
	return function (r, o, t) {
		void 0 === t && (t = c);
		var l = {
				placement: "bottom",
				orderedModifiers: [],
				options: Object.assign(Object.assign({}, DEFAULT_OPTIONS), c),
				modifiersData: {},
				elements: {
					reference: r,
					popper: o
				},
				attributes: {},
				styles: {}
			},
			a = [],
			f = !1,
			d = {
				state: l,
				setOptions: function (e) {
					i(), l.options = Object.assign(Object.assign(Object.assign({}, c), l.options), e), l.scrollParents = {
						reference: isElement(r) ? listScrollParents(r) : r.contextElement ? listScrollParents(r.contextElement) : [],
						popper: listScrollParents(o)
					};
					var t, n = orderModifiers(mergeByName([].concat(s, l.options.modifiers)));
					return l.orderedModifiers = n.filter(function (e) {
						return e.enabled
					}), "production" !== process.env.NODE_ENV && (validateModifiers(uniqueBy([].concat(n, l.options.modifiers), function (e) {
						return e.name
					})), getBasePlacement(l.options.placement) === auto && (l.orderedModifiers.find(function (e) {
						return "flip" === e.name
					}) || console.error(['Popper: "auto" placements require the "flip" modifier be', "present and enabled to work."].join(" "))), [(t = getComputedStyle(o)).marginTop, t.marginRight, t.marginBottom, t.marginLeft].some(function (e) {
						return parseFloat(e)
					}) && console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', "between the popper and its reference element or boundary.", "To replicate margin, use the `offset` modifier, as well as", "the `padding` option in the `preventOverflow` and `flip`", "modifiers."].join(" "))), l.orderedModifiers.forEach(function (e) {
						var t, n = e.name,
							r = e.options,
							o = void 0 === r ? {} : r,
							i = e.effect;
						"function" == typeof i && (t = i({
							state: l,
							name: n,
							instance: d,
							options: o
						}), a.push(t || function () {}))
					}), d.update()
				},
				forceUpdate: function () {
					if (!f) {
						var e = l.elements,
							t = e.reference,
							n = e.popper;
						if (areValidElements(t, n)) {
							l.rects = {
								reference: getCompositeRect(t, getOffsetParent(n), "fixed" === l.options.strategy),
								popper: getLayoutRect(n)
							}, l.reset = !1, l.placement = l.options.placement, l.orderedModifiers.forEach(function (e) {
								return l.modifiersData[e.name] = Object.assign({}, e.data)
							});
							for (var r, o, i, a, s, c = 0, p = 0; p < l.orderedModifiers.length; p++) {
								if ("production" !== process.env.NODE_ENV && 100 < (c += 1)) {
									console.error(INFINITE_LOOP_ERROR);
									break
								}!0 !== l.reset ? (o = (r = l.orderedModifiers[p]).fn, a = void 0 === (i = r.options) ? {} : i, s = r.name, "function" == typeof o && (l = o({
									state: l,
									options: a,
									name: s,
									instance: d
								}) || l)) : (l.reset = !1, p = -1)
							}
						} else "production" !== process.env.NODE_ENV && console.error(INVALID_ELEMENT_ERROR)
					}
				},
				update: debounce(function () {
					return new Promise(function (e) {
						d.forceUpdate(), e(l)
					})
				}),
				destroy: function () {
					i(), f = !0
				}
			};
		if (!areValidElements(r, o)) return "production" !== process.env.NODE_ENV && console.error(INVALID_ELEMENT_ERROR), d;

		function i() {
			a.forEach(function (e) {
				return e()
			}), a = []
		}
		return d.setOptions(t).then(function (e) {
			!f && t.onFirstUpdate && t.onFirstUpdate(e)
		}), d
	}
}
var passive = {
	passive: !0
};

function effect(e) {
	var t = e.state,
		n = e.instance,
		r = e.options,
		o = r.scroll,
		i = void 0 === o || o,
		a = r.resize,
		s = void 0 === a || a,
		c = getWindow(t.elements.popper),
		p = [].concat(t.scrollParents.reference, t.scrollParents.popper);
	return i && p.forEach(function (e) {
			e.addEventListener("scroll", n.update, passive)
		}), s && c.addEventListener("resize", n.update, passive),
		function () {
			i && p.forEach(function (e) {
				e.removeEventListener("scroll", n.update, passive)
			}), s && c.removeEventListener("resize", n.update, passive)
		}
}
var eventListeners = {
	name: "eventListeners",
	enabled: !0,
	phase: "write",
	fn: function () {},
	effect: effect,
	data: {}
};

function popperOffsets(e) {
	var t = e.state,
		n = e.name;
	t.modifiersData[n] = computeOffsets({
		reference: t.rects.reference,
		element: t.rects.popper,
		strategy: "absolute",
		placement: t.placement
	})
}
var popperOffsets$1 = {
		name: "popperOffsets",
		enabled: !0,
		phase: "read",
		fn: popperOffsets,
		data: {}
	},
	unsetSides = {
		top: "auto",
		right: "auto",
		bottom: "auto",
		left: "auto"
	};

function roundOffsets(e) {
	var t = e.x,
		n = e.y,
		r = window.devicePixelRatio || 1;
	return {
		x: Math.round(t * r) / r || 0,
		y: Math.round(n * r) / r || 0
	}
}

function mapToStyles(e) {
	var t, n, r = e.popper,
		o = e.popperRect,
		i = e.placement,
		a = e.offsets,
		s = e.position,
		c = e.gpuAcceleration,
		p = e.adaptive,
		l = roundOffsets(a),
		f = l.x,
		d = l.y,
		u = a.hasOwnProperty("x"),
		m = a.hasOwnProperty("y"),
		g = left,
		h = top,
		b = window;
	p && ((n = getOffsetParent(r)) === getWindow(r) && (n = getDocumentElement(r)), i === top && (h = bottom, d -= n.clientHeight - o.height, d *= c ? 1 : -1), i === left && (g = right, f -= n.clientWidth - o.width, f *= c ? 1 : -1));
	var v, y = Object.assign({
		position: s
	}, p && unsetSides);
	return c ? Object.assign(Object.assign({}, y), {}, ((v = {})[h] = m ? "0" : "", v[g] = u ? "0" : "", v.transform = (b.devicePixelRatio || 1) < 2 ? "translate(" + f + "px, " + d + "px)" : "translate3d(" + f + "px, " + d + "px, 0)", v)) : Object.assign(Object.assign({}, y), {}, ((t = {})[h] = m ? d + "px" : "", t[g] = u ? f + "px" : "", t.transform = "", t))
}

function computeStyles(e) {
	var t, n = e.state,
		r = e.options,
		o = r.gpuAcceleration,
		i = void 0 === o || o,
		a = r.adaptive,
		s = void 0 === a || a;
	"production" !== process.env.NODE_ENV && (t = getComputedStyle(n.elements.popper).transitionProperty || "", s && ["transform", "top", "right", "bottom", "left"].some(function (e) {
		return 0 <= t.indexOf(e)
	}) && console.warn(["Popper: Detected CSS transitions on at least one of the following", 'CSS properties: "transform", "top", "right", "bottom", "left".', "\n\n", 'Disable the "computeStyles" modifier\'s `adaptive` option to allow', "for smooth transitions, or remove these properties from the CSS", "transition declaration on the popper element if only transitioning", "opacity or background-color for example.", "\n\n", "We recommend using the popper element as a wrapper around an inner", "element that can have any CSS property transitioned for animations."].join(" ")));
	var c = {
		placement: getBasePlacement(n.placement),
		popper: n.elements.popper,
		popperRect: n.rects.popper,
		gpuAcceleration: i
	};
	null != n.modifiersData.popperOffsets && (n.styles.popper = Object.assign(Object.assign({}, n.styles.popper), mapToStyles(Object.assign(Object.assign({}, c), {}, {
		offsets: n.modifiersData.popperOffsets,
		position: n.options.strategy,
		adaptive: s
	})))), null != n.modifiersData.arrow && (n.styles.arrow = Object.assign(Object.assign({}, n.styles.arrow), mapToStyles(Object.assign(Object.assign({}, c), {}, {
		offsets: n.modifiersData.arrow,
		position: "absolute",
		adaptive: !1
	})))), n.attributes.popper = Object.assign(Object.assign({}, n.attributes.popper), {}, {
		"data-popper-placement": n.placement
	})
}
var computeStyles$1 = {
	name: "computeStyles",
	enabled: !0,
	phase: "beforeWrite",
	fn: computeStyles,
	data: {}
};

function applyStyles(e) {
	var o = e.state;
	Object.keys(o.elements).forEach(function (e) {
		var t = o.styles[e] || {},
			n = o.attributes[e] || {},
			r = o.elements[e];
		isHTMLElement(r) && getNodeName(r) && (Object.assign(r.style, t), Object.keys(n).forEach(function (e) {
			var t = n[e];
			!1 === t ? r.removeAttribute(e) : r.setAttribute(e, !0 === t ? "" : t)
		}))
	})
}

function effect$1(e) {
	var o = e.state,
		i = {
			popper: {
				position: o.options.strategy,
				left: "0",
				top: "0",
				margin: "0"
			},
			arrow: {
				position: "absolute"
			},
			reference: {}
		};
	return Object.assign(o.elements.popper.style, i.popper), o.elements.arrow && Object.assign(o.elements.arrow.style, i.arrow),
		function () {
			Object.keys(o.elements).forEach(function (e) {
				var t = o.elements[e],
					n = o.attributes[e] || {},
					r = Object.keys(o.styles.hasOwnProperty(e) ? o.styles[e] : i[e]).reduce(function (e, t) {
						return e[t] = "", e
					}, {});
				isHTMLElement(t) && getNodeName(t) && (Object.assign(t.style, r), Object.keys(n).forEach(function (e) {
					t.removeAttribute(e)
				}))
			})
		}
}
var applyStyles$1 = {
	name: "applyStyles",
	enabled: !0,
	phase: "write",
	fn: applyStyles,
	effect: effect$1,
	requires: ["computeStyles"]
};

function distanceAndSkiddingToXY(e, t, n) {
	var r = getBasePlacement(e),
		o = 0 <= [left, top].indexOf(r) ? -1 : 1,
		i = "function" == typeof n ? n(Object.assign(Object.assign({}, t), {}, {
			placement: e
		})) : n,
		a = (a = i[0]) || 0,
		s = ((s = i[1]) || 0) * o;
	return 0 <= [left, right].indexOf(r) ? {
		x: s,
		y: a
	} : {
		x: a,
		y: s
	}
}

function offset(e) {
	var n = e.state,
		t = e.options,
		r = e.name,
		o = t.offset,
		i = void 0 === o ? [0, 0] : o,
		a = placements.reduce(function (e, t) {
			return e[t] = distanceAndSkiddingToXY(t, n.rects, i), e
		}, {}),
		s = a[n.placement],
		c = s.x,
		p = s.y;
	null != n.modifiersData.popperOffsets && (n.modifiersData.popperOffsets.x += c, n.modifiersData.popperOffsets.y += p), n.modifiersData[r] = a
}
var offset$1 = {
		name: "offset",
		enabled: !0,
		phase: "main",
		requires: ["popperOffsets"],
		fn: offset
	},
	hash = {
		left: "right",
		right: "left",
		bottom: "top",
		top: "bottom"
	};

function getOppositePlacement(e) {
	return e.replace(/left|right|bottom|top/g, function (e) {
		return hash[e]
	})
}
var hash$1 = {
	start: "end",
	end: "start"
};

function getOppositeVariationPlacement(e) {
	return e.replace(/start|end/g, function (e) {
		return hash$1[e]
	})
}

function computeAutoPlacement(n, e) {
	void 0 === e && (e = {});
	var t = e.placement,
		r = e.boundary,
		o = e.rootBoundary,
		i = e.padding,
		a = e.flipVariations,
		s = e.allowedAutoPlacements,
		c = void 0 === s ? placements : s,
		p = getVariation(t),
		l = p ? a ? variationPlacements : variationPlacements.filter(function (e) {
			return getVariation(e) === p
		}) : basePlacements,
		f = l.filter(function (e) {
			return 0 <= c.indexOf(e)
		});
	0 === f.length && (f = l, "production" !== process.env.NODE_ENV && console.error(["Popper: The `allowedAutoPlacements` option did not allow any", "placements. Ensure the `placement` option matches the variation", "of the allowed placements.", 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(" ")));
	var d = f.reduce(function (e, t) {
		return e[t] = detectOverflow(n, {
			placement: t,
			boundary: r,
			rootBoundary: o,
			padding: i
		})[getBasePlacement(t)], e
	}, {});
	return Object.keys(d).sort(function (e, t) {
		return d[e] - d[t]
	})
}

function getExpandedFallbackPlacements(e) {
	if (getBasePlacement(e) === auto) return [];
	var t = getOppositePlacement(e);
	return [getOppositeVariationPlacement(e), t, getOppositeVariationPlacement(t)]
}

function flip(e) {
	var n = e.state,
		t = e.options,
		r = e.name;
	if (!n.modifiersData[r]._skip) {
		for (var o = t.mainAxis, i = void 0 === o || o, a = t.altAxis, s = void 0 === a || a, c = t.fallbackPlacements, p = t.padding, l = t.boundary, f = t.rootBoundary, d = t.altBoundary, u = t.flipVariations, m = void 0 === u || u, g = t.allowedAutoPlacements, h = n.options.placement, b = getBasePlacement(h), v = c || (b === h || !m ? [getOppositePlacement(h)] : getExpandedFallbackPlacements(h)), y = [h].concat(v).reduce(function (e, t) {
				return e.concat(getBasePlacement(t) === auto ? computeAutoPlacement(n, {
					placement: t,
					boundary: l,
					rootBoundary: f,
					padding: p,
					flipVariations: m,
					allowedAutoPlacements: g
				}) : t)
			}, []), O = n.rects.reference, w = n.rects.popper, E = new Map, P = !0, x = y[0], S = 0; S < y.length; S++) {
			var R = y[S],
				M = getBasePlacement(R),
				N = getVariation(R) === start,
				D = 0 <= [top, bottom].indexOf(M),
				j = D ? "width" : "height",
				T = detectOverflow(n, {
					placement: R,
					boundary: l,
					rootBoundary: f,
					altBoundary: d,
					padding: p
				}),
				I = D ? N ? right : left : N ? bottom : top;
			O[j] > w[j] && (I = getOppositePlacement(I));
			var L = getOppositePlacement(I),
				C = [];
			if (i && C.push(T[M] <= 0), s && C.push(T[I] <= 0, T[L] <= 0), C.every(function (e) {
					return e
				})) {
				x = R, P = !1;
				break
			}
			E.set(R, C)
		}
		if (P)
			for (var A = function (n) {
					var e = y.find(function (e) {
						var t = E.get(e);
						if (t) return t.slice(0, n).every(function (e) {
							return e
						})
					});
					if (e) return x = e, "break"
				}, B = m ? 3 : 1; 0 < B; B--) {
				if ("break" === A(B)) break
			}
		n.placement !== x && (n.modifiersData[r]._skip = !0, n.placement = x, n.reset = !0)
	}
}
var flip$1 = {
	name: "flip",
	enabled: !0,
	phase: "main",
	fn: flip,
	requiresIfExists: ["offset"],
	data: {
		_skip: !1
	}
};

function getAltAxis(e) {
	return "x" === e ? "y" : "x"
}

function within(e, t, n) {
	return Math.max(e, Math.min(t, n))
}

function preventOverflow(e) {
	var t, n, r, o, i, a, s, c, p, l, f, d, u, m, g, h, b, v, y, O, w, E, P, x, S, R, M, N = e.state,
		D = e.options,
		j = e.name,
		T = D.mainAxis,
		I = void 0 === T || T,
		L = D.altAxis,
		C = void 0 !== L && L,
		A = D.boundary,
		B = D.rootBoundary,
		_ = D.altBoundary,
		V = D.padding,
		W = D.tether,
		k = void 0 === W || W,
		F = D.tetherOffset,
		H = void 0 === F ? 0 : F,
		q = detectOverflow(N, {
			boundary: A,
			rootBoundary: B,
			padding: V,
			altBoundary: _
		}),
		$ = getBasePlacement(N.placement),
		G = getVariation(N.placement),
		U = !G,
		X = getMainAxisFromPlacement($),
		Y = getAltAxis(X),
		z = N.modifiersData.popperOffsets,
		J = N.rects.reference,
		K = N.rects.popper,
		Q = "function" == typeof H ? H(Object.assign(Object.assign({}, N.rects), {}, {
			placement: N.placement
		})) : H,
		Z = {
			x: 0,
			y: 0
		};
	z && (I && (t = "y" === X ? top : left, n = "y" === X ? bottom : right, r = "y" === X ? "height" : "width", o = z[X], i = z[X] + q[t], a = z[X] - q[n], s = k ? -K[r] / 2 : 0, c = G === start ? J[r] : K[r], p = G === start ? -K[r] : -J[r], l = N.elements.arrow, f = k && l ? getLayoutRect(l) : {
		width: 0,
		height: 0
	}, u = (d = N.modifiersData["arrow#persistent"] ? N.modifiersData["arrow#persistent"].padding : getFreshSideObject())[t], m = d[n], g = within(0, J[r], f[r]), h = U ? J[r] / 2 - s - g - u - Q : c - g - u - Q, b = U ? -J[r] / 2 + s + g + m + Q : p + g + m + Q, y = (v = N.elements.arrow && getOffsetParent(N.elements.arrow)) ? "y" === X ? v.clientTop || 0 : v.clientLeft || 0 : 0, O = N.modifiersData.offset ? N.modifiersData.offset[N.placement][X] : 0, w = z[X] + h - O - y, E = z[X] + b - O, P = within(k ? Math.min(i, w) : i, o, k ? Math.max(a, E) : a), z[X] = P, Z[X] = P - o), C && (x = "x" === X ? top : left, S = "x" === X ? bottom : right, M = within((R = z[Y]) + q[x], R, R - q[S]), z[Y] = M, Z[Y] = M - R), N.modifiersData[j] = Z)
}
var preventOverflow$1 = {
	name: "preventOverflow",
	enabled: !0,
	phase: "main",
	fn: preventOverflow,
	requiresIfExists: ["offset"]
};

function arrow(e) {
	var t, n, r, o, i, a, s, c, p, l, f, d, u, m, g = e.state,
		h = e.name,
		b = g.elements.arrow,
		v = g.modifiersData.popperOffsets,
		y = getBasePlacement(g.placement),
		O = getMainAxisFromPlacement(y),
		w = 0 <= [left, right].indexOf(y) ? "height" : "width";
	b && v && (n = g.modifiersData[h + "#persistent"].padding, r = getLayoutRect(b), o = "y" === O ? top : left, i = "y" === O ? bottom : right, a = g.rects.reference[w] + g.rects.reference[O] - v[O] - g.rects.popper[w], s = v[O] - g.rects.reference[O], p = (c = getOffsetParent(b)) ? "y" === O ? c.clientHeight || 0 : c.clientWidth || 0 : 0, l = a / 2 - s / 2, f = n[o], d = p - r[w] - n[i], m = within(f, u = p / 2 - r[w] / 2 + l, d), g.modifiersData[h] = ((t = {})[O] = m, t.centerOffset = m - u, t))
}

function effect$2(e) {
	var t = e.state,
		n = e.options,
		r = e.name,
		o = n.element,
		i = void 0 === o ? "[data-popper-arrow]" : o,
		a = n.padding,
		s = void 0 === a ? 0 : a;
	null != i && ("string" == typeof i && !(i = t.elements.popper.querySelector(i)) || ("production" !== process.env.NODE_ENV && (isHTMLElement(i) || console.error(['Popper: "arrow" element must be an HTMLElement (not an SVGElement).', "To use an SVG arrow, wrap it in an HTMLElement that will be used as", "the arrow."].join(" "))), contains(t.elements.popper, i) ? (t.elements.arrow = i, t.modifiersData[r + "#persistent"] = {
		padding: mergePaddingObject("number" != typeof s ? s : expandToHashMap(s, basePlacements))
	}) : "production" !== process.env.NODE_ENV && console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', "element."].join(" "))))
}
var arrow$1 = {
	name: "arrow",
	enabled: !0,
	phase: "main",
	fn: arrow,
	effect: effect$2,
	requires: ["popperOffsets"],
	requiresIfExists: ["preventOverflow"]
};

function getSideOffsets(e, t, n) {
	return void 0 === n && (n = {
		x: 0,
		y: 0
	}), {
		top: e.top - t.height - n.y,
		right: e.right - t.width + n.x,
		bottom: e.bottom - t.height + n.y,
		left: e.left - t.width - n.x
	}
}

function isAnySideFullyClipped(t) {
	return [top, right, bottom, left].some(function (e) {
		return 0 <= t[e]
	})
}

function hide(e) {
	var t = e.state,
		n = e.name,
		r = t.rects.reference,
		o = t.rects.popper,
		i = t.modifiersData.preventOverflow,
		a = detectOverflow(t, {
			elementContext: "reference"
		}),
		s = detectOverflow(t, {
			altBoundary: !0
		}),
		c = getSideOffsets(a, r),
		p = getSideOffsets(s, o, i),
		l = isAnySideFullyClipped(c),
		f = isAnySideFullyClipped(p);
	t.modifiersData[n] = {
		referenceClippingOffsets: c,
		popperEscapeOffsets: p,
		isReferenceHidden: l,
		hasPopperEscaped: f
	}, t.attributes.popper = Object.assign(Object.assign({}, t.attributes.popper), {}, {
		"data-popper-reference-hidden": l,
		"data-popper-escaped": f
	})
}
var hide$1 = {
		name: "hide",
		enabled: !0,
		phase: "main",
		requiresIfExists: ["preventOverflow"],
		fn: hide
	},
	defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1],
	createPopper = popperGenerator({
		defaultModifiers: defaultModifiers
	});
exports.createPopper = createPopper, exports.defaultModifiers = defaultModifiers, exports.detectOverflow = detectOverflow, exports.popperGenerator = popperGenerator;
