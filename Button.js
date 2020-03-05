const whenDOMReady = () => {
	return new Promise(resolve => {
		if (document.body) {
			resolve();
		} else {
			document.addEventListener("DOMContentLoaded", () => {
				resolve();
			});
		}
	});
};

const EventEnrichment = {};

let enriched = false;

EventEnrichment.run = function run() {
	if (enriched) {
		return;
	}

	const stopPropagationSet = new WeakSet();
	const stopImmediatePropagationSet = new WeakSet();

	const originalStopPropagation = Event.prototype.stopPropagation;
	const originalStopImmediatePropagation = Event.prototype.stopImmediatePropagation;

	Event.prototype.stopPropagation = function stopPropagation() {
		stopPropagationSet.add(this);
		return originalStopPropagation.apply(this, arguments); // eslint-disable-line
	};

	Event.prototype.isPropagationStopped = function isPropagationStopped() {
		return stopPropagationSet.has(this);
	};

	Event.prototype.stopImmediatePropagation = function stopImmediatePropagation() {
		stopImmediatePropagationSet.add(this);
		return originalStopImmediatePropagation.apply(this, arguments); // eslint-disable-line
	};

	Event.prototype.isImmediatePropagationStopped = function isImmediatePropagationStopped() {
		return stopImmediatePropagationSet.has(this);
	};

	enriched = true;
};

const ManagedEvents = {};

ManagedEvents.events = [
	"click",
	"dblclick",
	"contextmenu",
	"keydown",
	"keypress",
	"keyup",
	"mousedown",
	"mouseout",
	"mouseover",
	"mouseup",
	"select",
	"selectstart",
	"dragstart",
	"dragenter",
	"dragover",
	"dragleave",
	"dragend",
	"drop",
	"paste",
	"cut",
	"input",
	"touchstart",
	"touchend",
	"touchmove",
	"touchcancel",
];

ManagedEvents.bindAllEvents = callback => {
	if (callback) {
		ManagedEvents.events.forEach(event => {
			document.addEventListener(event, callback);
		});
	}
};

ManagedEvents.unbindAllEvents = callback => {
	if (callback) {
		ManagedEvents.events.forEach(event => {
			document.removeEventListener(event, callback);
		});
	}
};

const getShadowDOMTarget = event => {
	// Default - composedPath should be used (also covered by polyfill)
	if (typeof event.composedPath === "function") {
		const composedPath = event.composedPath();
		if (Array.isArray(composedPath) && composedPath.length) {
			return composedPath[0];
		}
	}

	// Fallback
	return event.target;
};

const handleEvent = function handleEvent(event) {
	// Get the DOM node where the original event occurred
	let target = getShadowDOMTarget(event);

	// Traverse the DOM
	let shouldPropagate = true;
	while (shouldPropagate && target instanceof HTMLElement) {
		shouldPropagate = processDOMNode(target, event);
		if (shouldPropagate) {
			target = getParentDOMNode(target);
		}
	}
};


const processDOMNode = function processDOMNode(node, event) {
	if (node && node.isUI5Element) {
		return dispatchEvent(node, event);
	}
	return true;
};

const dispatchEvent = function dispatchEvent(element, event) {
	if (!element.constructor.getMetadata().getEventHandlersByConvention()) {
		return true;
	}
	// Handle the original event (such as "keydown")
	element._handleEvent(event);
	if (event.isImmediatePropagationStopped()) {
		return false;
	}

	/* eslint-disable */
	if (event.isPropagationStopped()) {
		return false;
	}
	/* eslint-enable */

	return true;
};

const getParentDOMNode = function getParentDOMNode(node) {
	const parentNode = node.parentNode;

	if (parentNode && (parentNode instanceof window.ShadowRoot) && parentNode.host) {
		return parentNode.host;
	}

	return parentNode;
};

const isOtherInstanceRegistered = () => {
	return window["@ui5/webcomponents-base/DOMEventHandler"];
};

const registerInstance = () => {
	window["@ui5/webcomponents-base/DOMEventHandler"] = true;
};

class DOMEventHandler {
	constructor() {
		throw new Error("Static class");
	}

	static start() {
		// register the handlers just once in case other bundles include and call this method multiple times
		if (!isOtherInstanceRegistered()) {
			ManagedEvents.bindAllEvents(handleEvent);
			registerInstance();
		}
	}

	static stop() {
		ManagedEvents.unbindAllEvents(handleEvent);
	}
}

/**
 * Creates a <style> tag in the <head> tag
 * @param cssText - the CSS
 * @param attributes - optional attributes to add to the tag
 * @returns {HTMLElement}
 */
const createStyleInHead = (cssText, attributes = {}) => {
	const style = document.createElement("style");
	style.type = "text/css";

	Object.entries(attributes).forEach(pair => style.setAttribute(...pair));

	style.textContent = cssText;
	document.head.appendChild(style);
	return style;
};

/**
 * CSS font face used for the texts provided by SAP.
 */

/* CDN Locations */
const font72RegularWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular.woff?ui5-webcomponents`;
const font72RegularWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular.woff2?ui5-webcomponents`;

const font72RegularFullWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular-full.woff?ui5-webcomponents`;
const font72RegularFullWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Regular-full.woff2?ui5-webcomponents`;

const font72BoldWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold.woff?ui5-webcomponents`;
const font72BoldWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold.woff2?ui5-webcomponents`;

const font72BoldFullWoff = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold-full.woff?ui5-webcomponents`;
const font72BoldFullWoff2 = `https://ui5.sap.com/sdk/resources/sap/ui/core/themes/sap_fiori_3/fonts/72-Bold-full.woff2?ui5-webcomponents`;

const fontFaceCSS = `
	@font-face {
		font-family: "72";
		font-style: normal;
		font-weight: 400;
		src: local("72"),
			url(${font72RegularWoff2}) format("woff2"),
			url(${font72RegularWoff}) format("woff");
	}
	
	@font-face {
		font-family: "72full";
		font-style: normal;
		font-weight: 400;
		src: local('72-full'),
			url(${font72RegularFullWoff2}) format("woff2"),
			url(${font72RegularFullWoff}) format("woff");
		
	}
	
	@font-face {
		font-family: "72";
		font-style: normal;
		font-weight: 700;
		src: local('72-Bold'),
			url(${font72BoldWoff2}) format("woff2"),
			url(${font72BoldWoff}) format("woff");
	}
	
	@font-face {
		font-family: "72full";
		font-style: normal;
		font-weight: 700;
		src: local('72-Bold-full'),
			url(${font72BoldFullWoff2}) format("woff2"),
			url(${font72BoldFullWoff}) format("woff");
	}
`;

const insertFontFace = () => {
	createStyleInHead(fontFaceCSS, { "data-ui5-font-face": "" });
};

let initialized = false;

const initialConfig = {
	animationMode: "full",
	theme: "sap_fiori_3",
	rtl: null,
	language: null,
	compactSize: false,
	calendarType: null,
	noConflict: false, // no URL
	formatSettings: {},
};

const getTheme = () => {
	initConfiguration();
	return initialConfig.theme;
};

const getRTL = () => {
	initConfiguration();
	return initialConfig.rtl;
};

const getLanguage = () => {
	initConfiguration();
	return initialConfig.language;
};

const getCompactSize = () => {
	initConfiguration();
	return initialConfig.compactSize;
};

const getNoConflict = () => {
	initConfiguration();
	return initialConfig.noConflict;
};

const getCalendarType = () => {
	initConfiguration();
	return initialConfig.calendarType;
};

const getFormatSettings = () => {
	initConfiguration();
	return initialConfig.formatSettings;
};

const booleanMapping = new Map();
booleanMapping.set("true", true);
booleanMapping.set("false", false);

let runtimeConfig = {};

const parseConfigurationScript = () => {
	const configScript = document.querySelector("[data-ui5-config]") || document.querySelector("[data-id='sap-ui-config']"); // for backward compatibility

	let configJSON;

	if (configScript) {
		try {
			configJSON = JSON.parse(configScript.innerHTML);
		} catch (err) {
			console.warn("Incorrect data-sap-ui-config format. Please use JSON"); /* eslint-disable-line */
		}

		if (configJSON) {
			runtimeConfig = Object.assign({}, configJSON);
		}
	}
};

const parseURLParameters = () => {
	const params = new URLSearchParams(window.location.search);

	params.forEach((value, key) => {
		if (!key.startsWith("sap-ui")) {
			return;
		}

		const lowerCaseValue = value.toLowerCase();

		const param = key.split("sap-ui-")[1];

		if (booleanMapping.has(value)) {
			value = booleanMapping.get(lowerCaseValue);
		}

		runtimeConfig[param] = value;
	});
};

const applyConfigurations = () => {
	Object.keys(runtimeConfig).forEach(key => {
		initialConfig[key] = runtimeConfig[key];
	});
};

const initConfiguration = () => {
	if (initialized) {
		return;
	}

	parseConfigurationScript();
	parseURLParameters();
	applyConfigurations();

	initialized = true;
};

const customCSSFor = {};

const getCustomCSS = tag => {
	return customCSSFor[tag] ? customCSSFor[tag].join("") : "";
};

const fetchPromises = new Map();
const jsonPromises = new Map();

const fetchJsonOnce = async url => {
	if (!fetchPromises.get(url)) {
		fetchPromises.set(url, fetch(url));
	}
	const response = await fetchPromises.get(url);

	if (!jsonPromises.get(url)) {
		jsonPromises.set(url, response.json());
	}

	return jsonPromises.get(url);
};

const themeURLs = new Map();
const themeStyles = new Map();
const registeredPackages = new Set();

const registerThemeProperties = (packageName, themeName, style) => {
	if (style._) {
		// JSON object like ({"_": ":root"})
		themeStyles.set(`${packageName}_${themeName}`, style._);
	} else if (style.includes(":root")) {
		// pure string
		themeStyles.set(`${packageName}_${themeName}`, style);
	} else {
		// url for fetching
		themeURLs.set(`${packageName}_${themeName}`, style);
	}
	registeredPackages.add(packageName);
};

const getThemeProperties = async (packageName, themeName) => {
	const style = themeStyles.get(`${packageName}_${themeName}`);
	if (style) {
		return style;
	}

	const data = await fetchThemeProperties(packageName, themeName);
	themeStyles.set(`${packageName}_${themeName}`, data._);
	return data._;
};

const fetchThemeProperties = async (packageName, themeName) => {
	const url = themeURLs.get(`${packageName}_${themeName}`);

	if (!url) {
		throw new Error(`You have to import @ui5/webcomponents/dist/json-imports/Themes module to use theme switching`);
	}
	return fetchJsonOnce(url);
};

const getRegisteredPackages = () => {
	return registeredPackages;
};

let ponyfillTimer;

const ponyfillNeeded = () => !!window.CSSVarsPonyfill;

const runPonyfill = () => {
	ponyfillTimer = undefined;

	window.CSSVarsPonyfill.cssVars({
		rootElement: document.head,
		include: "style[data-ui5-theme-properties],style[data-ui5-element-styles]",
		silent: true,
	});
};

const schedulePonyfill = () => {
	if (!ponyfillTimer) {
		ponyfillTimer = window.setTimeout(runPonyfill, 0);
	}
};

/**
 * Creates/updates a style element holding all CSS Custom Properties
 * @param cssText
 * @param packageName
 */
const injectThemeProperties = (cssText, packageName) => {
	packageName = packageName.replace(/[@/]/g, "-");
	const identifier = `data-ui5-theme-properties-${packageName}`;

	// Needed for all browsers
	const styleElement = document.head.querySelector(`style[${identifier}]`);
	if (styleElement) {
		styleElement.textContent = cssText || "";	// in case of undefined
	} else {
		const attributes = {
			"data-ui5-theme-properties": "",
			[identifier]: "",
		};
		createStyleInHead(cssText, attributes);
	}

	// When changing the theme, run the ponyfill immediately
	if (ponyfillNeeded()) {
		runPonyfill();
	}
};

/**
 * Creates a style element holding the CSS for a web component (and resolves CSS Custom Properties for IE)
 * @param tagName
 * @param cssText
 */
const injectWebComponentStyle = (tagName, cssText) => {
	// Edge and IE
	createStyleInHead(cssText, {
		"data-ui5-element-styles": tagName,
		"disabled": "disabled",
	});

	// When injecting component styles, more might come in the same tick, so run the ponyfill async (to avoid double work)
	if (ponyfillNeeded()) {
		schedulePonyfill();
	}
};

const themeChangeCallbacks = [];

const attachThemeChange = function attachThemeChange(callback) {
	if (themeChangeCallbacks.indexOf(callback) === -1) {
		themeChangeCallbacks.push(callback);
	}
};

const _applyTheme = async theme => {
	let cssText = "";

	const registeredPackages = getRegisteredPackages();
	registeredPackages.forEach(async packageName => {
		cssText = await getThemeProperties(packageName, theme);
		injectThemeProperties(cssText, packageName);
	});

	_executeThemeChangeCallbacks(theme);
};

const _executeThemeChangeCallbacks = theme => {
	themeChangeCallbacks.forEach(callback => callback(theme));
};

const getEffectiveStyle = ElementClass => {
	const tag = ElementClass.getMetadata().getTag();
	const customStyle = getCustomCSS(tag) || "";
	let componentStyles = ElementClass.styles;

	if (Array.isArray(componentStyles)) {
		componentStyles = componentStyles.join(" ");
	}
	return `${componentStyles} ${customStyle}`;
};

let theme = getTheme();

const getTheme$1 = () => {
	return theme;
};

let polyfillLoadedPromise;

const whenPolyfillLoaded = () => {
	if (polyfillLoadedPromise) {
		return polyfillLoadedPromise;
	}

	polyfillLoadedPromise = new Promise(resolve => {
		if (window.WebComponents
			&& !window.WebComponents.ready
			&& window.WebComponents.waitFor) {
			// the polyfill loader is present
			window.WebComponents.waitFor(() => {
				// the polyfills are loaded, safe to execute code depending on their APIs
				resolve();
			});
		} else {
			// polyfill loader missing, modern browsers only
			resolve();
		}
	});

	return polyfillLoadedPromise;
};

EventEnrichment.run();

let bootPromise;

const boot = () => {
	if (bootPromise) {
		return bootPromise;
	}

	bootPromise = new Promise(async resolve => {
		await whenDOMReady();
		await _applyTheme(getTheme$1());
		insertFontFace();
		DOMEventHandler.start();
		await whenPolyfillLoaded();
		resolve();
	});

	return bootPromise;
};

// Fire these events even with noConflict: true
const excludeList = [
	"value-changed",
];

const shouldFireOriginalEvent = eventName => {
	return excludeList.includes(eventName);
};

let noConflict = getNoConflict();

const shouldNotFireOriginalEvent = eventName => {
	return !(noConflict.events && noConflict.events.includes && noConflict.events.includes(eventName));
};

const skipOriginalEvent = eventName => {
	// Always fire these events
	if (shouldFireOriginalEvent(eventName)) {
		return false;
	}

	// Read from the configuration
	if (noConflict === true) {
		return true;
	}

	return !shouldNotFireOriginalEvent(eventName);
};

const compactSize = getCompactSize();

const getCompactSize$1 = () => {
	return compactSize;
};

// Shorthands
const w = window;

// Map of observer objects per dom node
const observers = new WeakMap();

/**
 * Implements universal DOM node observation methods.
 */
class DOMObserver {
	constructor() {
		throw new Error("Static class");
	}

	/**
	 * This function abstracts out mutation observer usage inside shadow DOM.
	 * For native shadow DOM the native mutation observer is used.
	 * When the polyfill is used, the observeChildren ShadyDOM method is used instead.
	 *
	 * @throws Exception
	 * Note: does not allow several mutation observers per node. If there is a valid use-case, this behavior can be changed.
	 *
	 * @param node
	 * @param callback
	 * @param options - Only used for the native mutation observer
	 */
	static observeDOMNode(node, callback, options) {
		let observerObject = observers.get(node);
		if (observerObject) {
			throw new Error("A mutation/ShadyDOM observer is already assigned to this node.");
		}

		if (w.ShadyDOM) {
			observerObject = w.ShadyDOM.observeChildren(node, callback);
		} else {
			observerObject = new MutationObserver(callback);
			observerObject.observe(node, options);
		}

		observers.set(node, observerObject);
	}

	/**
	 * De-registers the mutation observer, depending on its type
	 * @param node
	 */
	static unobserveDOMNode(node) {
		const observerObject = observers.get(node);
		if (!observerObject) {
			return;
		}

		if (observerObject instanceof MutationObserver) {
			observerObject.disconnect();
		} else {
			w.ShadyDOM.unobserveChildren(observerObject);
		}
		observers.delete(node);
	}
}

/**
 * Base class for all data types.
 *
 * @class
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.base.types.DataType
 * @public
 */
class DataType {
	static isValid(value) {
	}

	static generataTypeAcessors(types) {
		Object.keys(types).forEach(type => {
			Object.defineProperty(this, type, {
				get() {
					return types[type];
				},
			});
		});
	}
}

const isDescendantOf = (klass, baseKlass, inclusive = false) => {
	if (typeof klass !== "function" || typeof baseKlass !== "function") {
		return false;
	}
	if (inclusive && klass === baseKlass) {
		return true;
	}
	let parent = klass;
	do {
		parent = Object.getPrototypeOf(parent);
	} while (parent !== null && parent !== baseKlass);
	return parent === baseKlass;
};

class UI5ElementMetadata {
	constructor(metadata) {
		this.metadata = metadata;
	}

	getTag() {
		return this.metadata.tag;
	}

	hasAttribute(propName) {
		const propData = this.getProperties()[propName];
		return propData.type !== Object && !propData.noAttribute;
	}

	getPropsList() {
		return Object.keys(this.getProperties());
	}

	getAttributesList() {
		return this.getPropsList().filter(this.hasAttribute, this);
	}

	getSlots() {
		return this.metadata.slots || {};
	}

	hasSlots() {
		return !!Object.entries(this.getSlots()).length;
	}

	getProperties() {
		return this.metadata.properties || {};
	}

	getEvents() {
		return this.metadata.events || {};
	}

	getEventHandlersByConvention() {
		return this.metadata._eventHandlersByConvention;
	}

	static validatePropertyValue(value, propData) {
		const isMultiple = propData.multiple;
		if (isMultiple) {
			return value.map(propValue => validateSingleProperty(propValue, propData));
		}
		return validateSingleProperty(value, propData);
	}

	static validateSlotValue(value, slotData) {
		return validateSingleSlot(value, slotData);
	}
}

const validateSingleProperty = (value, propData) => {
	const propertyType = propData.type;

	if (propertyType === Boolean) {
		return typeof value === "boolean" ? value : false;
	}
	if (propertyType === String) {
		return (typeof value === "string" || typeof value === "undefined" || value === null) ? value : value.toString();
	}
	if (propertyType === Object) {
		return typeof value === "object" ? value : propData.defaultValue;
	}
	if (isDescendantOf(propertyType, DataType)) {
		return propertyType.isValid(value) ? value : propData.defaultValue;
	}
};

const validateSingleSlot = (value, slotData) => {
	if (value === null) {
		return value;
	}

	const getSlottedNodes = el => {
		const isTag = el instanceof HTMLElement;
		const isSlot = isTag && el.localName === "slot";

		if (isSlot) {
			return el.assignedNodes({ flatten: true }).filter(item => item instanceof HTMLElement);
		}

		return [el];
	};

	const slottedNodes = getSlottedNodes(value);
	slottedNodes.forEach(el => {
		if (!(el instanceof slotData.type)) {
			throw new Error(`${el} is not of type ${slotData.type}`);
		}
	});

	return value;
};

class Integer extends DataType {
	static isValid(value) {
		return Number.isInteger(value);
	}
}

class RenderQueue {
	constructor() {
		this.list = []; // Used to store the web components in order
		this.promises = new Map(); // Used to store promises for web component rendering
	}

	add(webComponent) {
		if (this.promises.has(webComponent)) {
			return this.promises.get(webComponent);
		}

		let deferredResolve;
		const promise = new Promise(resolve => {
			deferredResolve = resolve;
		});
		promise._deferredResolve = deferredResolve;

		this.list.push(webComponent);
		this.promises.set(webComponent, promise);

		return promise;
	}

	shift() {
		const webComponent = this.list.shift();
		if (webComponent) {
			const promise = this.promises.get(webComponent);
			this.promises.delete(webComponent);
			return { webComponent, promise };
		}
	}

	getList() {
		return this.list;
	}

	isAdded(webComponent) {
		return this.promises.has(webComponent);
	}
}

const MAX_RERENDER_COUNT = 10;

// Tells whether a render task is currently scheduled
let renderTaskId;

// Queue for invalidated web components
const invalidatedWebComponents = new RenderQueue();

let renderTaskPromise,
	renderTaskPromiseResolve,
	taskResult;

/**
 * Class that manages the rendering/re-rendering of web components
 * This is always asynchronous
 */
class RenderScheduler {
	constructor() {
		throw new Error("Static class");
	}

	/**
	 * Queues a web component for re-rendering
	 * @param webComponent
	 */
	static renderDeferred(webComponent) {
		// Enqueue the web component
		const res = invalidatedWebComponents.add(webComponent);

		// Schedule a rendering task
		RenderScheduler.scheduleRenderTask();
		return res;
	}

	static renderImmediately(webComponent) {
		// Enqueue the web component
		const res = invalidatedWebComponents.add(webComponent);

		// Immediately start a render task
		RenderScheduler.runRenderTask();
		return res;
	}

	/**
	 * Schedules a rendering task, if not scheduled already
	 */
	static scheduleRenderTask() {
		if (!renderTaskId) {
			// renderTaskId = window.setTimeout(RenderScheduler.renderWebComponents, 3000); // Task
			// renderTaskId = Promise.resolve().then(RenderScheduler.renderWebComponents); // Micro task
			renderTaskId = window.requestAnimationFrame(RenderScheduler.renderWebComponents); // AF
		}
	}

	static runRenderTask() {
		if (!renderTaskId) {
			renderTaskId = 1; // prevent another rendering task from being scheduled, all web components should use this task
			RenderScheduler.renderWebComponents();
		}
	}

	static renderWebComponents() {
		// console.log("------------- NEW RENDER TASK ---------------");

		let webComponentInfo,
			webComponent,
			promise;
		const renderStats = new Map();
		while (webComponentInfo = invalidatedWebComponents.shift()) { // eslint-disable-line
			webComponent = webComponentInfo.webComponent;
			promise = webComponentInfo.promise;

			const timesRerendered = renderStats.get(webComponent) || 0;
			if (timesRerendered > MAX_RERENDER_COUNT) {
				// console.warn("WARNING RERENDER", webComponent);
				throw new Error(`Web component re-rendered too many times this task, max allowed is: ${MAX_RERENDER_COUNT}`);
			}
			webComponent._render();
			promise._deferredResolve();
			renderStats.set(webComponent, timesRerendered + 1);
		}

		// wait for Mutation observer just in case
		setTimeout(() => {
			if (invalidatedWebComponents.getList().length === 0) {
				RenderScheduler._resolveTaskPromise();
			}
		}, 200);

		renderTaskId = undefined;
	}

	/**
	 * return a promise that will be resolved once all invalidated web components are rendered
	 */
	static whenDOMUpdated() {
		if (renderTaskPromise) {
			return renderTaskPromise;
		}

		renderTaskPromise = new Promise(resolve => {
			renderTaskPromiseResolve = resolve;
			window.requestAnimationFrame(() => {
				if (invalidatedWebComponents.getList().length === 0) {
					renderTaskPromise = undefined;
					resolve();
				}
			});
		});

		return renderTaskPromise;
	}

	static getNotDefinedComponents() {
		return Array.from(document.querySelectorAll("*")).filter(el => el.localName.startsWith("ui5-") && !el.isUI5Element);
	}

	/**
	 * return a promise that will be resolved once all ui5 webcomponents on the page have their shadow root ready
	 */
	static async whenShadowDOMReady() {
		const undefinedElements = this.getNotDefinedComponents();

		const definedPromises = undefinedElements.map(
		  el => customElements.whenDefined(el.localName)
		);
		const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));

		await Promise.race([Promise.all(definedPromises), timeoutPromise]);
		const stillUndefined = this.getNotDefinedComponents();
		if (stillUndefined.length) {
			// eslint-disable-next-line
			console.warn("undefined elements after 5 seconds are: " + [...stillUndefined].map(el => el.localName).join(" ; "));
		}

		return Promise.resolve();
	}

	static async whenFinished() {
		await RenderScheduler.whenShadowDOMReady();
		await RenderScheduler.whenDOMUpdated();
	}

	static _resolveTaskPromise() {
		if (invalidatedWebComponents.getList().length > 0) {
			// More updates are pending. Resolve will be called again
			return;
		}

		if (renderTaskPromiseResolve) {
			renderTaskPromiseResolve.call(this, taskResult);
			renderTaskPromiseResolve = undefined;
			renderTaskPromise = undefined;
		}
	}
}

const findClosingParenthesisPos = (str, openingParenthesisPos) => {
	let opened = 1;
	for (let pos = openingParenthesisPos + 1; pos < str.length; pos++) {
		const char = str.charAt(pos);
		if (char === "(") {
			opened++;
		} else if (char === ")") {
			opened--;
		}
		if (opened === 0) {
			return pos;
		}
	}
};

const replaceSelector = (str, selector, selectorStartPos, replacement) => {
	const charAfterSelectorPos = selectorStartPos + selector.length;
	const charAfterSelector = str.charAt(charAfterSelectorPos);

	const upToSelector = str.substring(0, selectorStartPos) + replacement;
	if (charAfterSelector === "(") {
		const closingParenthesisPos = findClosingParenthesisPos(str, charAfterSelectorPos);
		return upToSelector + str.substring(charAfterSelectorPos + 1, closingParenthesisPos) + str.substring(closingParenthesisPos + 1);
	}

	return upToSelector + str.substring(charAfterSelectorPos);
};

/**
 * :host => ui5-button
 * :host([expr]) => ui5-button[expr]
 * ::slotted(expr) => expr
 * @param str - source string
 * @param selector - :host or ::slotted
 * @param replacement - normally tag name
 * @returns {*}
 */
const replaceSelectors = (str, selector, replacement) => {
	let selectorStartPos = str.indexOf(selector);
	while (selectorStartPos !== -1) {
		str = replaceSelector(str, selector, selectorStartPos, replacement);
		selectorStartPos = str.indexOf(selector);
	}
	return str;
};

const adaptLinePart = (line, tag) => {
	line = line.trim();
	line = replaceSelectors(line, "::slotted", ``); // first remove all ::slotted() occurrences

	// Host selector - replace it
	if (line.startsWith(":host")) {
		return replaceSelector(line, ":host", 0, tag);
	}

	// Leave out @keyframes and keyframe values (0%, 100%, etc...)
	// csso shortens '100%' -> 'to', make sure to leave it untouched
	if (line.match(/^[@0-9]/) || line === "to" || line === "to{") {
		return line;
	}

	// IE specific selector (directly written with the tag) - keep it
	if (line.match(new RegExp(`^${tag}[^a-zA-Z0-9-]`))) {
		return line;
	}

	// No host and no tag in the beginning of the selector - prepend the tag
	return `${tag} ${line}`;
};

const adaptCSSForIE = (str, tag) => {
	str = str.replace(/\n/g, ` `);
	str = str.replace(/([{}])/g, `$1\n`);
	let result = ``;
	const lines = str.split(`\n`);
	lines.forEach(line => {
		const mustProcess = line.match(/{$/); // Only work on lines that end on {, otherwise just append to result
		if (mustProcess) {
			const lineParts = line.split(",");
			const processedLineParts = lineParts.map(linePart => {
				return adaptLinePart(linePart, tag);
			});
			line = processedLineParts.join(",");
		}
		result = `${result}${line}`;
	});
	return result;
};

const constructableStyleMap = new Map();
const IEStyleSet = new Set();

/**
 * Creates the needed CSS for a web component class in the head tag
 * Note: IE11, Edge
 * @param ElementClass
 */
const createHeadStyle = ElementClass => {
	const tag = ElementClass.getMetadata().getTag();
	if (IEStyleSet.has(tag)) {
		return;
	}

	let cssContent = getEffectiveStyle(ElementClass);
	cssContent = adaptCSSForIE(cssContent, tag);
	injectWebComponentStyle(tag, cssContent);
	IEStyleSet.add(tag);
};

/**
 * Returns (and caches) a constructable style sheet for a web component class
 * Note: Chrome
 * @param ElementClass
 * @returns {*}
 */
const getConstructableStyle = ElementClass => {
	const tagName = ElementClass.getMetadata().getTag();
	const styleContent = getEffectiveStyle(ElementClass);
	const theme = getTheme$1();
	const key = theme + tagName;
	if (constructableStyleMap.has(key)) {
		return constructableStyleMap.get(key);
	}

	const style = new CSSStyleSheet();
	style.replaceSync(styleContent);

	constructableStyleMap.set(key, style);
	return style;
};

/**
 * Returns the CSS to be injected inside a web component shadow root, or undefined if not needed
 * Note: FF, Safari
 * @param ElementClass
 * @returns {string}
 */
const getShadowRootStyle = ElementClass => {
	if (document.adoptedStyleSheets || window.ShadyDOM) {
		return;
	}

	const styleContent = getEffectiveStyle(ElementClass);
	return styleContent;
};

const kebabToCamelCase = string => toCamelCase(string.split("-"));

const camelToKebabCase = string => string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

const toCamelCase = parts => {
	return parts.map((string, index) => {
		return index === 0 ? string.toLowerCase() : string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
	}).join("");
};

/**
 * Checks whether a property name is valid (does not collide with existing DOM API properties)
 * Note: disabled is present in IE so we explicitly allow it here.
 *
 * @param name
 * @returns {boolean}
 */
const isValidPropertyName = name => {
	if (name === "disabled") {
		return true;
	}
	const classes = [
		HTMLElement,
		Element,
		Node,
	];
	return !classes.some(klass => klass.prototype.hasOwnProperty(name)); // eslint-disable-line
};

const metadata = {
	events: {
		_propertyChange: {},
	},
};

const DefinitionsSet = new Set();
const IDMap = new Map();

class UI5Element extends HTMLElement {
	constructor() {
		super();
		this._generateId();
		this._initializeState();
		this._upgradeAllProperties();
		this._initializeShadowRoot();

		attachThemeChange(this.onThemeChanged.bind(this));

		let deferredResolve;
		this._domRefReadyPromise = new Promise(resolve => {
			deferredResolve = resolve;
		});
		this._domRefReadyPromise._deferredResolve = deferredResolve;

		this._monitoredChildProps = new Map();
	}

	onThemeChanged() {
		if (window.ShadyDOM || !this.constructor.needsShadowDOM()) {
			// polyfill theme handling is in head styles directly
			return;
		}
		const newStyle = getConstructableStyle(this.constructor);
		if (document.adoptedStyleSheets) {
			this.shadowRoot.adoptedStyleSheets = [newStyle];
		} else {
			const oldStyle = this.shadowRoot.querySelector("style");
			oldStyle.textContent = newStyle.textContent;
		}
	}

	_generateId() {
		this._id = this.constructor._nextID();
	}

	_initializeShadowRoot() {
		if (!this.constructor.needsShadowDOM()) {
			return;
		}

		this.attachShadow({ mode: "open" });

		// IE11, Edge
		if (window.ShadyDOM) {
			createHeadStyle(this.constructor);
		}

		// Chrome
		if (document.adoptedStyleSheets) {
			const style = getConstructableStyle(this.constructor);
			this.shadowRoot.adoptedStyleSheets = [style];
		}
	}

	async connectedCallback() {
		const isCompact = getCompactSize$1();
		if (isCompact) {
			this.setAttribute("data-ui5-compact-size", "");
		}

		if (!this.constructor.needsShadowDOM()) {
			return;
		}

		// always register the observer before yielding control to the main thread (await)
		this._startObservingDOMChildren();

		await this._processChildren();
		await RenderScheduler.renderImmediately(this);
		this._domRefReadyPromise._deferredResolve();
		if (typeof this.onEnterDOM === "function") {
			this.onEnterDOM();
		}
	}

	disconnectedCallback() {
		if (!this.constructor.needsShadowDOM()) {
			return;
		}

		this._stopObservingDOMChildren();
		if (typeof this.onExitDOM === "function") {
			this.onExitDOM();
		}
	}

	_startObservingDOMChildren() {
		const shouldObserveChildren = this.constructor.getMetadata().hasSlots();
		if (!shouldObserveChildren) {
			return;
		}
		const mutationObserverOptions = {
			childList: true,
			subtree: true,
			characterData: true,
		};
		DOMObserver.observeDOMNode(this, this._processChildren.bind(this), mutationObserverOptions);
	}

	_stopObservingDOMChildren() {
		DOMObserver.unobserveDOMNode(this);
	}

	onChildrenChanged(mutations) {
	}

	async _processChildren(mutations) {
		const hasSlots = this.constructor.getMetadata().hasSlots();
		if (hasSlots) {
			await this._updateSlots();
		}
		this.onChildrenChanged(mutations);
	}

	async _updateSlots() {
		const slotsMap = this.constructor.getMetadata().getSlots();
		const canSlotText = slotsMap.default && slotsMap.default.type === Node;

		let domChildren;
		if (canSlotText) {
			domChildren = Array.from(this.childNodes);
		} else {
			domChildren = Array.from(this.children);
		}

		// Init the _state object based on the supported slots
		for (const [slotName, slotData] of Object.entries(slotsMap)) { // eslint-disable-line
			this._clearSlot(slotName);
		}

		const autoIncrementMap = new Map();
		const slottedChildrenMap = new Map();

		const allChildrenUpgraded = domChildren.map(async (child, idx) => {
			// Determine the type of the child (mainly by the slot attribute)
			const slotName = this.constructor._getSlotName(child);
			const slotData = slotsMap[slotName];

			// Check if the slotName is supported
			if (slotData === undefined) {
				const validValues = Object.keys(slotsMap).join(", ");
				console.warn(`Unknown slotName: ${slotName}, ignoring`, child, `Valid values are: ${validValues}`); // eslint-disable-line
				return;
			}

			// For children that need individual slots, calculate them
			if (slotData.individualSlots) {
				const nextId = (autoIncrementMap.get(slotName) || 0) + 1;
				autoIncrementMap.set(slotName, nextId);
				child._individualSlot = `${slotName}-${nextId}`;
			}

			// Await for not-yet-defined custom elements
			if (child instanceof HTMLElement) {
				const localName = child.localName;
				const isCustomElement = localName.includes("-");
				if (isCustomElement) {
					const isDefined = window.customElements.get(localName);
					if (!isDefined) {
						const whenDefinedPromise = window.customElements.whenDefined(localName); // Class registered, but instances not upgraded yet
						const timeoutPromise = new Promise(resolve => setTimeout(resolve, 1000));
						await Promise.race([whenDefinedPromise, timeoutPromise]);
					}
					window.customElements.upgrade(child);
				}
			}

			child = this.constructor.getMetadata().constructor.validateSlotValue(child, slotData);

			if (child.isUI5Element) {
				this._attachChildPropertyUpdated(child, slotData);
			}

			const propertyName = slotData.propertyName || slotName;

			if (slottedChildrenMap.has(propertyName)) {
				slottedChildrenMap.get(propertyName).push({ child, idx });
			} else {
				slottedChildrenMap.set(propertyName, [{ child, idx }]);
			}
		});

		await Promise.all(allChildrenUpgraded);

		// Distribute the child in the _state object, keeping the Light DOM order,
		// not the order elements are defined.
		slottedChildrenMap.forEach((children, slot) => {
			this._state[slot] = children.sort((a, b) => a.idx - b.idx).map(_ => _.child);
		});
		this._invalidate();
	}

	// Removes all children from the slot and detaches listeners, if any
	_clearSlot(slotName) {
		const slotData = this.constructor.getMetadata().getSlots()[slotName];
		const propertyName = slotData.propertyName || slotName;

		let children = this._state[propertyName];
		if (!Array.isArray(children)) {
			children = [children];
		}

		children.forEach(child => {
			if (child && child.isUI5Element) {
				this._detachChildPropertyUpdated(child);
			}
		});

		this._state[propertyName] = [];
		this._invalidate(propertyName, []);
	}

	static get observedAttributes() {
		const observedAttributes = this.getMetadata().getAttributesList();
		return observedAttributes.map(camelToKebabCase);
	}

	attributeChangedCallback(name, oldValue, newValue) {
		const properties = this.constructor.getMetadata().getProperties();
		const realName = name.replace(/^ui5-/, "");
		const nameInCamelCase = kebabToCamelCase(realName);
		if (properties.hasOwnProperty(nameInCamelCase)) { // eslint-disable-line
			const propertyTypeClass = properties[nameInCamelCase].type;
			if (propertyTypeClass === Boolean) {
				newValue = newValue !== null;
			}
			if (propertyTypeClass === Integer) {
				newValue = parseInt(newValue);
			}
			this[nameInCamelCase] = newValue;
		}
	}

	_updateAttribute(name, newValue) {
		if (!this.constructor.getMetadata().hasAttribute(name)) {
			return;
		}

		if (typeof newValue === "object") {
			return;
		}

		const attrName = camelToKebabCase(name);
		const attrValue = this.getAttribute(attrName);
		if (typeof newValue === "boolean") {
			if (newValue === true && attrValue === null) {
				this.setAttribute(attrName, "");
			} else if (newValue === false && attrValue !== null) {
				this.removeAttribute(attrName);
			}
		} else if (attrValue !== newValue) {
			this.setAttribute(attrName, newValue);
		}
	}

	_upgradeProperty(prop) {
		if (this.hasOwnProperty(prop)) { // eslint-disable-line
			const value = this[prop];
			delete this[prop];
			this[prop] = value;
		}
	}

	_upgradeAllProperties() {
		const allProps = this.constructor.getMetadata().getPropsList();
		allProps.forEach(this._upgradeProperty.bind(this));
	}

	static async define() {
		await boot();
		const tag = this.getMetadata().getTag();

		const definedLocally = DefinitionsSet.has(tag);
		const definedGlobally = customElements.get(tag);

		if (definedGlobally && !definedLocally) {
			console.warn(`Skipping definition of tag ${tag}, because it was already defined by another instance of ui5-webcomponents.`); // eslint-disable-line
		} else if (!definedGlobally) {
			this.generateAccessors();
			DefinitionsSet.add(tag);
			window.customElements.define(tag, this);
		}
		return this;
	}

	static get metadata() {
		return metadata;
	}

	static get styles() {
		return "";
	}

	_initializeState() {
		const defaultState = this.constructor._getDefaultState();
		this._state = Object.assign({}, defaultState);
	}

	static getMetadata() {
		let klass = this; // eslint-disable-line

		if (klass.hasOwnProperty("_metadata")) { // eslint-disable-line
			return klass._metadata;
		}

		const metadatas = [Object.assign(klass.metadata, {})];
		while (klass !== UI5Element) {
			klass = Object.getPrototypeOf(klass);
			metadatas.push(klass.metadata);
		}

		const result = metadatas[0];

		result.properties = this._mergeMetadataEntry(metadatas, "properties"); // merge properties
		result.slots = this._mergeMetadataEntry(metadatas, "slots"); // merge slots
		result.events = this._mergeMetadataEntry(metadatas, "events"); // merge events

		this._metadata = new UI5ElementMetadata(result);
		return this._metadata;
	}

	static _mergeMetadataEntry(metadatas, prop) {
		return metadatas.reverse().reduce((result, current) => { // eslint-disable-line
			Object.assign(result, current[prop] || {});
			return result;
		}, {});
	}

	_attachChildPropertyUpdated(child, propData) {
		const listenFor = propData.listenFor,
			childMetadata = child.constructor.getMetadata(),
			slotName = this.constructor._getSlotName(child), // all slotted children have the same configuration
			childProperties = childMetadata.getProperties();

		let observedProps = [],
			notObservedProps = [];

		if (!listenFor) {
			return;
		}

		if (Array.isArray(listenFor)) {
			observedProps = listenFor;
		} else {
			observedProps = Array.isArray(listenFor.props) ? listenFor.props : Object.keys(childProperties);
			notObservedProps = Array.isArray(listenFor.exclude) ? listenFor.exclude : [];
		}

		if (!this._monitoredChildProps.has(slotName)) {
			this._monitoredChildProps.set(slotName, { observedProps, notObservedProps });
		}

		child.addEventListener("_propertyChange", this._invalidateParentOnPropertyUpdate);
	}

	_detachChildPropertyUpdated(child) {
		child.removeEventListener("_propertyChange", this._invalidateParentOnPropertyUpdate);
	}

	_invalidateParentOnPropertyUpdate(prop) {
		// The web component to be invalidated
		const parentNode = this.parentNode;
		if (!parentNode) {
			return;
		}

		const slotName = parentNode.constructor._getSlotName(this);
		const propsMetadata = parentNode._monitoredChildProps.get(slotName);

		if (!propsMetadata) {
			return;
		}
		const { observedProps, notObservedProps } = propsMetadata;

		if (observedProps.includes(prop.detail.name) && !notObservedProps.includes(prop.detail.name)) {
			parentNode._invalidate("_parent_", this);
		}
	}

	/**
	 * Asynchronously re-renders an already rendered web component
	 * @private
	 */
	_invalidate() {
		if (this._invalidated) {
			// console.log("already invalidated", this, ...arguments);
			return;
		}

		if (this.getDomRef() && !this._suppressInvalidation) {
			this._invalidated = true;
			// console.log("INVAL", this, ...arguments);
			RenderScheduler.renderDeferred(this);
		}
	}

	_render() {
		// suppress invalidation to prevent state changes scheduling another rendering
		this._suppressInvalidation = true;

		if (typeof this.onBeforeRendering === "function") {
			this.onBeforeRendering();
		}

		// Intended for framework usage only. Currently ItemNavigation updates tab indexes after the component has updated its state but before the template is rendered
		this.dispatchEvent(new CustomEvent("_componentStateFinalized"));

		// resume normal invalidation handling
		delete this._suppressInvalidation;

		// Update the shadow root with the render result
		// console.log(this.getDomRef() ? "RE-RENDER" : "FIRST RENDER", this);
		delete this._invalidated;
		this._updateShadowRoot();

		// Safari requires that children get the slot attribute only after the slot tags have been rendered in the shadow DOM
		this._assignIndividualSlotsToChildren();

		// Call the onAfterRendering hook
		if (typeof this.onAfterRendering === "function") {
			this.onAfterRendering();
		}
	}

	_updateShadowRoot() {
		const renderResult = this.constructor.template(this);
		// For browsers that do not support constructable style sheets (and not using the polyfill)
		const styleToPrepend = getShadowRootStyle(this.constructor);
		this.constructor.render(renderResult, this.shadowRoot, styleToPrepend, { eventContext: this });
	}

	_assignIndividualSlotsToChildren() {
		const domChildren = Array.from(this.children);

		domChildren.forEach(child => {
			if (child._individualSlot) {
				child.setAttribute("slot", child._individualSlot);
			}
		});
	}

	getDomRef() {
		if (!this.shadowRoot || this.shadowRoot.children.length === 0) {
			return;
		}

		return this.shadowRoot.children.length === 1
			? this.shadowRoot.children[0] : this.shadowRoot.children[1];
	}

	_waitForDomRef() {
		return this._domRefReadyPromise;
	}

	getFocusDomRef() {
		const domRef = this.getDomRef();
		if (domRef) {
			const focusRef = domRef.querySelector("[data-sap-focus-ref]");
			return focusRef || domRef;
		}
	}

	async focus() {
		await this._waitForDomRef();

		const focusDomRef = this.getFocusDomRef();

		if (focusDomRef && typeof focusDomRef.focus === "function") {
			focusDomRef.focus();
		}
	}

	/**
	 * Calls the event handler on the web component for a native event
	 *
	 * @param event The event object
	 * @private
	 */
	_handleEvent(event) {
		const sHandlerName = `on${event.type}`;

		if (this[sHandlerName]) {
			this[sHandlerName](event);
		}
	}

	_propertyChange(name, value) {
		this._updateAttribute(name, value);

		const customEvent = new CustomEvent("_propertyChange", {
			detail: { name, newValue: value },
			composed: false,
			bubbles: true,
		});

		this.dispatchEvent(customEvent);
	}

	/**
	 *
	 * @param name - name of the event
	 * @param data - additional data for the event
	 * @param cancelable - true, if the user can call preventDefault on the event object
	 * @returns {boolean} false, if the event was cancelled (preventDefault called), true otherwise
	 */
	fireEvent(name, data, cancelable) {
		let compatEventResult = true; // Initialized to true, because if the event is not fired at all, it should be considered "not-prevented"

		const noConflictEvent = new CustomEvent(`ui5-${name}`, {
			detail: data,
			composed: false,
			bubbles: true,
			cancelable,
		});

		// This will be false if the compat event is prevented
		compatEventResult = this.dispatchEvent(noConflictEvent);

		if (skipOriginalEvent(name)) {
			return compatEventResult;
		}

		const customEvent = new CustomEvent(name, {
			detail: data,
			composed: false,
			bubbles: true,
			cancelable,
		});

		// This will be false if the normal event is prevented
		const normalEventResult = this.dispatchEvent(customEvent);

		// Return false if any of the two events was prevented (its result was false).
		return normalEventResult && compatEventResult;
	}

	getSlottedNodes(slotName) {
		const reducer = (acc, curr) => {
			if (curr.localName !== "slot") {
				return acc.concat([curr]);
			}
			return acc.concat(curr.assignedNodes({ flatten: true }).filter(item => item instanceof HTMLElement));
		};

		return this[slotName].reduce(reducer, []);
	}

	/**
	 * Used to duck-type UI5 elements without using instanceof
	 * @returns {boolean}
	 * @public
	 */
	get isUI5Element() {
		return true;
	}

	/**
	 * Used to generate the next auto-increment id for the current class
	 * @returns {string}
	 * @private
	 */
	static _nextID() {
		const className = "el";
		const lastNumber = IDMap.get(className);
		const nextNumber = lastNumber !== undefined ? lastNumber + 1 : 1;
		IDMap.set(className, nextNumber);
		return `__${className}${nextNumber}`;
	}

	static _getSlotName(child) {
		// Text nodes can only go to the default slot
		if (!(child instanceof HTMLElement)) {
			return "default";
		}

		// Discover the slot based on the real slot name (f.e. footer => footer, or content-32 => content)
		const slot = child.getAttribute("slot");
		if (slot) {
			const match = slot.match(/^(.+?)-\d+$/);
			return match ? match[1] : slot;
		}

		// Use default slot as a fallback
		return "default";
	}

	static needsShadowDOM() {
		return !!this.template;
	}

	static _getDefaultState() {
		if (this._defaultState) {
			return this._defaultState;
		}

		const MetadataClass = this.getMetadata();
		const defaultState = {};

		// Initialize properties
		const props = MetadataClass.getProperties();
		for (const propName in props) { // eslint-disable-line
			const propType = props[propName].type;
			const propDefaultValue = props[propName].defaultValue;

			if (propType === Boolean) {
				defaultState[propName] = false;

				if (propDefaultValue !== undefined) {
					console.warn("The 'defaultValue' metadata key is ignored for all booleans properties, they would be initialized with 'false' by default"); // eslint-disable-line
				}
			} else if (props[propName].multiple) {
				defaultState[propName] = [];
			} else if (propType === Object) {
				defaultState[propName] = "defaultValue" in props[propName] ? props[propName].defaultValue : {};
			} else if (propType === String) {
				defaultState[propName] = "defaultValue" in props[propName] ? props[propName].defaultValue : "";
			} else {
				defaultState[propName] = propDefaultValue;
			}
		}

		// Initialize slots
		const slots = MetadataClass.getSlots();
		for (const [slotName, slotData] of Object.entries(slots)) { // eslint-disable-line
			const propertyName = slotData.propertyName || slotName;
			defaultState[propertyName] = [];
		}

		this._defaultState = defaultState;
		return defaultState;
	}

	static generateAccessors() {
		const proto = this.prototype;

		// Properties
		const properties = this.getMetadata().getProperties();
		for (const [prop, propData] of Object.entries(properties)) { // eslint-disable-line
			if (!isValidPropertyName(prop)) {
				throw new Error(`"${prop}" is not a valid property name. Use a name that does not collide with DOM APIs`);
			}

			if (propData.type === "boolean" && propData.defaultValue) {
				throw new Error(`Cannot set a default value for property "${prop}". All booleans are false by default.`);
			}

			Object.defineProperty(proto, prop, {
				get() {
					if (this._state[prop] !== undefined) {
						return this._state[prop];
					}

					const propDefaultValue = propData.defaultValue;

					if (propData.type === Boolean) {
						return false;
					} else if (propData.type === String) {  // eslint-disable-line
						return propDefaultValue;
					} else if (propData.multiple) { // eslint-disable-line
						return [];
					} else {
						return propDefaultValue;
					}
				},
				set(value) {
					value = this.constructor.getMetadata().constructor.validatePropertyValue(value, propData);

					const oldState = this._state[prop];

					if (oldState !== value) {
						this._state[prop] = value;
						this._invalidate(prop, value);
						this._propertyChange(prop, value);
					}
				},
			});
		}

		// Slots
		const slots = this.getMetadata().getSlots();
		for (const [slotName, slotData] of Object.entries(slots)) { // eslint-disable-line
			if (!isValidPropertyName(slotName)) {
				throw new Error(`"${slotName}" is not a valid property name. Use a name that does not collide with DOM APIs`);
			}

			const propertyName = slotData.propertyName || slotName;
			Object.defineProperty(proto, propertyName, {
				get() {
					if (this._state[propertyName] !== undefined) {
						return this._state[propertyName];
					}
					return [];
				},
				set() {
					throw new Error("Cannot set slots directly, use the DOM APIs");
				},
			});
		}
	}
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const directives = new WeakMap();
/**
 * Brands a function as a directive factory function so that lit-html will call
 * the function during template rendering, rather than passing as a value.
 *
 * A _directive_ is a function that takes a Part as an argument. It has the
 * signature: `(part: Part) => void`.
 *
 * A directive _factory_ is a function that takes arguments for data and
 * configuration and returns a directive. Users of directive usually refer to
 * the directive factory as the directive. For example, "The repeat directive".
 *
 * Usually a template author will invoke a directive factory in their template
 * with relevant arguments, which will then return a directive function.
 *
 * Here's an example of using the `repeat()` directive factory that takes an
 * array and a function to render an item:
 *
 * ```js
 * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
 * ```
 *
 * When `repeat` is invoked, it returns a directive function that closes over
 * `items` and the template function. When the outer template is rendered, the
 * return directive function is called with the Part for the expression.
 * `repeat` then performs it's custom logic to render multiple items.
 *
 * @param f The directive factory function. Must be a function that returns a
 * function of the signature `(part: Part) => void`. The returned function will
 * be called with the part object.
 *
 * @example
 *
 * import {directive, html} from 'lit-html';
 *
 * const immutable = directive((v) => (part) => {
 *   if (part.value !== v) {
 *     part.setValue(v)
 *   }
 * });
 */
const directive = (f) => ((...args) => {
    const d = f(...args);
    directives.set(d, true);
    return d;
});
const isDirective = (o) => {
    return typeof o === 'function' && directives.has(o);
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * True if the custom elements polyfill is in use.
 */
const isCEPolyfill = window.customElements !== undefined &&
    window.customElements.polyfillWrapFlushCallback !==
        undefined;
/**
 * Reparents nodes, starting from `start` (inclusive) to `end` (exclusive),
 * into another container (could be the same container), before `before`. If
 * `before` is null, it appends the nodes to the container.
 */
const reparentNodes = (container, start, end = null, before = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.insertBefore(start, before);
        start = n;
    }
};
/**
 * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
 * `container`.
 */
const removeNodes = (container, start, end = null) => {
    while (start !== end) {
        const n = start.nextSibling;
        container.removeChild(start);
        start = n;
    }
};

/**
 * @license
 * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = {};
/**
 * A sentinel value that signals a NodePart to fully clear its content.
 */
const nothing = {};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An expression marker with embedded unique key to avoid collision with
 * possible text in templates.
 */
const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
/**
 * An expression marker used text-positions, multi-binding attributes, and
 * attributes with markup-like text values.
 */
const nodeMarker = `<!--${marker}-->`;
const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
/**
 * Suffix appended to all bound attribute names.
 */
const boundAttributeSuffix = '$lit$';
/**
 * An updateable Template that tracks the location of dynamic parts.
 */
class Template {
    constructor(result, element) {
        this.parts = [];
        this.element = element;
        const nodesToRemove = [];
        const stack = [];
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        // Keeps track of the last index associated with a part. We try to delete
        // unnecessary nodes, but we never want to associate two different parts
        // to the same index. They must have a constant node between.
        let lastPartIndex = 0;
        let index = -1;
        let partIndex = 0;
        const { strings, values: { length } } = result;
        while (partIndex < length) {
            const node = walker.nextNode();
            if (node === null) {
                // We've exhausted the content inside a nested template element.
                // Because we still have parts (the outer for-loop), we know:
                // - There is a template in the stack
                // - The walker will find a nextNode outside the template
                walker.currentNode = stack.pop();
                continue;
            }
            index++;
            if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                if (node.hasAttributes()) {
                    const attributes = node.attributes;
                    const { length } = attributes;
                    // Per
                    // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                    // attributes are not guaranteed to be returned in document order.
                    // In particular, Edge/IE can return them out of order, so we cannot
                    // assume a correspondence between part index and attribute index.
                    let count = 0;
                    for (let i = 0; i < length; i++) {
                        if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                            count++;
                        }
                    }
                    while (count-- > 0) {
                        // Get the template literal section leading up to the first
                        // expression in this attribute
                        const stringForPart = strings[partIndex];
                        // Find the attribute name
                        const name = lastAttributeNameRegex.exec(stringForPart)[2];
                        // Find the corresponding attribute
                        // All bound attributes have had a suffix added in
                        // TemplateResult#getHTML to opt out of special attribute
                        // handling. To look up the attribute value we also need to add
                        // the suffix.
                        const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                        const attributeValue = node.getAttribute(attributeLookupName);
                        node.removeAttribute(attributeLookupName);
                        const statics = attributeValue.split(markerRegex);
                        this.parts.push({ type: 'attribute', index, name, strings: statics });
                        partIndex += statics.length - 1;
                    }
                }
                if (node.tagName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
            }
            else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                const data = node.data;
                if (data.indexOf(marker) >= 0) {
                    const parent = node.parentNode;
                    const strings = data.split(markerRegex);
                    const lastIndex = strings.length - 1;
                    // Generate a new text node for each literal section
                    // These nodes are also used as the markers for node parts
                    for (let i = 0; i < lastIndex; i++) {
                        let insert;
                        let s = strings[i];
                        if (s === '') {
                            insert = createMarker();
                        }
                        else {
                            const match = lastAttributeNameRegex.exec(s);
                            if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                s = s.slice(0, match.index) + match[1] +
                                    match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                            }
                            insert = document.createTextNode(s);
                        }
                        parent.insertBefore(insert, node);
                        this.parts.push({ type: 'node', index: ++index });
                    }
                    // If there's no text, we must insert a comment to mark our place.
                    // Else, we can trust it will stick around after cloning.
                    if (strings[lastIndex] === '') {
                        parent.insertBefore(createMarker(), node);
                        nodesToRemove.push(node);
                    }
                    else {
                        node.data = strings[lastIndex];
                    }
                    // We have a part for each match found
                    partIndex += lastIndex;
                }
            }
            else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                if (node.data === marker) {
                    const parent = node.parentNode;
                    // Add a new marker node to be the startNode of the Part if any of
                    // the following are true:
                    //  * We don't have a previousSibling
                    //  * The previousSibling is already the start of a previous part
                    if (node.previousSibling === null || index === lastPartIndex) {
                        index++;
                        parent.insertBefore(createMarker(), node);
                    }
                    lastPartIndex = index;
                    this.parts.push({ type: 'node', index });
                    // If we don't have a nextSibling, keep this node so we have an end.
                    // Else, we can remove it to save future costs.
                    if (node.nextSibling === null) {
                        node.data = '';
                    }
                    else {
                        nodesToRemove.push(node);
                        index--;
                    }
                    partIndex++;
                }
                else {
                    let i = -1;
                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        // TODO (justinfagnani): consider whether it's even worth it to
                        // make bindings in comments work
                        this.parts.push({ type: 'node', index: -1 });
                        partIndex++;
                    }
                }
            }
        }
        // Remove text binding nodes after the walk to not disturb the TreeWalker
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
    }
}
const endsWith = (str, suffix) => {
    const index = str.length - suffix.length;
    return index >= 0 && str.slice(index) === suffix;
};
const isTemplatePartActive = (part) => part.index !== -1;
// Allows `document.createComment('')` to be renamed for a
// small manual size-savings.
const createMarker = () => document.createComment('');
/**
 * This regex extracts the attribute name preceding an attribute-position
 * expression. It does this by matching the syntax allowed for attributes
 * against the string literal directly preceding the expression, assuming that
 * the expression is in an attribute-value position.
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \x09\x0a\x0c\x0d" are HTML space characters:
 * https://www.w3.org/TR/html5/infrastructure.html#space-characters
 *
 * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
 * space character except " ".
 *
 * So an attribute is:
 *  * The name: any character except a control character, space character, ('),
 *    ("), ">", "=", or "/"
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const lastAttributeNameRegex = /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * An instance of a `Template` that can be attached to the DOM and updated
 * with new values.
 */
class TemplateInstance {
    constructor(template, processor, options) {
        this.__parts = [];
        this.template = template;
        this.processor = processor;
        this.options = options;
    }
    update(values) {
        let i = 0;
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.setValue(values[i]);
            }
            i++;
        }
        for (const part of this.__parts) {
            if (part !== undefined) {
                part.commit();
            }
        }
    }
    _clone() {
        // There are a number of steps in the lifecycle of a template instance's
        // DOM fragment:
        //  1. Clone - create the instance fragment
        //  2. Adopt - adopt into the main document
        //  3. Process - find part markers and create parts
        //  4. Upgrade - upgrade custom elements
        //  5. Update - set node, attribute, property, etc., values
        //  6. Connect - connect to the document. Optional and outside of this
        //     method.
        //
        // We have a few constraints on the ordering of these steps:
        //  * We need to upgrade before updating, so that property values will pass
        //    through any property setters.
        //  * We would like to process before upgrading so that we're sure that the
        //    cloned fragment is inert and not disturbed by self-modifying DOM.
        //  * We want custom elements to upgrade even in disconnected fragments.
        //
        // Given these constraints, with full custom elements support we would
        // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
        //
        // But Safari dooes not implement CustomElementRegistry#upgrade, so we
        // can not implement that order and still have upgrade-before-update and
        // upgrade disconnected fragments. So we instead sacrifice the
        // process-before-upgrade constraint, since in Custom Elements v1 elements
        // must not modify their light DOM in the constructor. We still have issues
        // when co-existing with CEv0 elements like Polymer 1, and with polyfills
        // that don't strictly adhere to the no-modification rule because shadow
        // DOM, which may be created in the constructor, is emulated by being placed
        // in the light DOM.
        //
        // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
        // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
        // in one step.
        //
        // The Custom Elements v1 polyfill supports upgrade(), so the order when
        // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
        // Connect.
        const fragment = isCEPolyfill ?
            this.template.element.content.cloneNode(true) :
            document.importNode(this.template.element.content, true);
        const stack = [];
        const parts = this.template.parts;
        // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
        const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
        let partIndex = 0;
        let nodeIndex = 0;
        let part;
        let node = walker.nextNode();
        // Loop through all the nodes and parts of a template
        while (partIndex < parts.length) {
            part = parts[partIndex];
            if (!isTemplatePartActive(part)) {
                this.__parts.push(undefined);
                partIndex++;
                continue;
            }
            // Progress the tree walker until we find our next part's node.
            // Note that multiple parts may share the same node (attribute parts
            // on a single element), so this loop may not run at all.
            while (nodeIndex < part.index) {
                nodeIndex++;
                if (node.nodeName === 'TEMPLATE') {
                    stack.push(node);
                    walker.currentNode = node.content;
                }
                if ((node = walker.nextNode()) === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    node = walker.nextNode();
                }
            }
            // We've arrived at our part's node.
            if (part.type === 'node') {
                const part = this.processor.handleTextExpression(this.options);
                part.insertAfterNode(node.previousSibling);
                this.__parts.push(part);
            }
            else {
                this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
            }
            partIndex++;
        }
        if (isCEPolyfill) {
            document.adoptNode(fragment);
            customElements.upgrade(fragment);
        }
        return fragment;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const commentMarker = ` ${marker} `;
/**
 * The return type of `html`, which holds a Template and the values from
 * interpolated expressions.
 */
class TemplateResult {
    constructor(strings, values, type, processor) {
        this.strings = strings;
        this.values = values;
        this.type = type;
        this.processor = processor;
    }
    /**
     * Returns a string of HTML used to create a `<template>` element.
     */
    getHTML() {
        const l = this.strings.length - 1;
        let html = '';
        let isCommentBinding = false;
        for (let i = 0; i < l; i++) {
            const s = this.strings[i];
            // For each binding we want to determine the kind of marker to insert
            // into the template source before it's parsed by the browser's HTML
            // parser. The marker type is based on whether the expression is in an
            // attribute, text, or comment poisition.
            //   * For node-position bindings we insert a comment with the marker
            //     sentinel as its text content, like <!--{{lit-guid}}-->.
            //   * For attribute bindings we insert just the marker sentinel for the
            //     first binding, so that we support unquoted attribute bindings.
            //     Subsequent bindings can use a comment marker because multi-binding
            //     attributes must be quoted.
            //   * For comment bindings we insert just the marker sentinel so we don't
            //     close the comment.
            //
            // The following code scans the template source, but is *not* an HTML
            // parser. We don't need to track the tree structure of the HTML, only
            // whether a binding is inside a comment, and if not, if it appears to be
            // the first binding in an attribute.
            const commentOpen = s.lastIndexOf('<!--');
            // We're in comment position if we have a comment open with no following
            // comment close. Because <-- can appear in an attribute value there can
            // be false positives.
            isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                s.indexOf('-->', commentOpen + 1) === -1;
            // Check to see if we have an attribute-like sequence preceeding the
            // expression. This can match "name=value" like structures in text,
            // comments, and attribute values, so there can be false-positives.
            const attributeMatch = lastAttributeNameRegex.exec(s);
            if (attributeMatch === null) {
                // We're only in this branch if we don't have a attribute-like
                // preceeding sequence. For comments, this guards against unusual
                // attribute values like <div foo="<!--${'bar'}">. Cases like
                // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                // below.
                html += s + (isCommentBinding ? commentMarker : nodeMarker);
            }
            else {
                // For attributes we use just a marker sentinel, and also append a
                // $lit$ suffix to the name to opt-out of attribute-specific parsing
                // that IE and Edge do for style and certain SVG attributes.
                html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                    attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                    marker;
            }
        }
        html += this.strings[l];
        return html;
    }
    getTemplateElement() {
        const template = document.createElement('template');
        template.innerHTML = this.getHTML();
        return template;
    }
}
/**
 * A TemplateResult for SVG fragments.
 *
 * This class wraps HTML in an `<svg>` tag in order to parse its contents in the
 * SVG namespace, then modifies the template to remove the `<svg>` tag so that
 * clones only container the original fragment.
 */
class SVGTemplateResult extends TemplateResult {
    getHTML() {
        return `<svg>${super.getHTML()}</svg>`;
    }
    getTemplateElement() {
        const template = super.getTemplateElement();
        const content = template.content;
        const svgElement = content.firstChild;
        content.removeChild(svgElement);
        reparentNodes(content, svgElement.firstChild);
        return template;
    }
}

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const isPrimitive = (value) => {
    return (value === null ||
        !(typeof value === 'object' || typeof value === 'function'));
};
const isIterable = (value) => {
    return Array.isArray(value) ||
        // tslint:disable-next-line:no-any
        !!(value && value[Symbol.iterator]);
};
/**
 * Writes attribute values to the DOM for a group of AttributeParts bound to a
 * single attibute. The value is only set once even if there are multiple parts
 * for an attribute.
 */
class AttributeCommitter {
    constructor(element, name, strings) {
        this.dirty = true;
        this.element = element;
        this.name = name;
        this.strings = strings;
        this.parts = [];
        for (let i = 0; i < strings.length - 1; i++) {
            this.parts[i] = this._createPart();
        }
    }
    /**
     * Creates a single part. Override this to create a differnt type of part.
     */
    _createPart() {
        return new AttributePart(this);
    }
    _getValue() {
        const strings = this.strings;
        const l = strings.length - 1;
        let text = '';
        for (let i = 0; i < l; i++) {
            text += strings[i];
            const part = this.parts[i];
            if (part !== undefined) {
                const v = part.value;
                if (isPrimitive(v) || !isIterable(v)) {
                    text += typeof v === 'string' ? v : String(v);
                }
                else {
                    for (const t of v) {
                        text += typeof t === 'string' ? t : String(t);
                    }
                }
            }
        }
        text += strings[l];
        return text;
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            this.element.setAttribute(this.name, this._getValue());
        }
    }
}
/**
 * A Part that controls all or part of an attribute value.
 */
class AttributePart {
    constructor(committer) {
        this.value = undefined;
        this.committer = committer;
    }
    setValue(value) {
        if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
            this.value = value;
            // If the value is a not a directive, dirty the committer so that it'll
            // call setAttribute. If the value is a directive, it'll dirty the
            // committer if it calls setValue().
            if (!isDirective(value)) {
                this.committer.dirty = true;
            }
        }
    }
    commit() {
        while (isDirective(this.value)) {
            const directive = this.value;
            this.value = noChange;
            directive(this);
        }
        if (this.value === noChange) {
            return;
        }
        this.committer.commit();
    }
}
/**
 * A Part that controls a location within a Node tree. Like a Range, NodePart
 * has start and end locations and can set and update the Nodes between those
 * locations.
 *
 * NodeParts support several value types: primitives, Nodes, TemplateResults,
 * as well as arrays and iterables of those types.
 */
class NodePart {
    constructor(options) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.options = options;
    }
    /**
     * Appends this part into a container.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendInto(container) {
        this.startNode = container.appendChild(createMarker());
        this.endNode = container.appendChild(createMarker());
    }
    /**
     * Inserts this part after the `ref` node (between `ref` and `ref`'s next
     * sibling). Both `ref` and its next sibling must be static, unchanging nodes
     * such as those that appear in a literal section of a template.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterNode(ref) {
        this.startNode = ref;
        this.endNode = ref.nextSibling;
    }
    /**
     * Appends this part into a parent part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    appendIntoPart(part) {
        part.__insert(this.startNode = createMarker());
        part.__insert(this.endNode = createMarker());
    }
    /**
     * Inserts this part after the `ref` part.
     *
     * This part must be empty, as its contents are not automatically moved.
     */
    insertAfterPart(ref) {
        ref.__insert(this.startNode = createMarker());
        this.endNode = ref.endNode;
        ref.endNode = this.startNode;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        const value = this.__pendingValue;
        if (value === noChange) {
            return;
        }
        if (isPrimitive(value)) {
            if (value !== this.value) {
                this.__commitText(value);
            }
        }
        else if (value instanceof TemplateResult) {
            this.__commitTemplateResult(value);
        }
        else if (value instanceof Node) {
            this.__commitNode(value);
        }
        else if (isIterable(value)) {
            this.__commitIterable(value);
        }
        else if (value === nothing) {
            this.value = nothing;
            this.clear();
        }
        else {
            // Fallback, will render the string representation
            this.__commitText(value);
        }
    }
    __insert(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    __commitNode(value) {
        if (this.value === value) {
            return;
        }
        this.clear();
        this.__insert(value);
        this.value = value;
    }
    __commitText(value) {
        const node = this.startNode.nextSibling;
        value = value == null ? '' : value;
        // If `value` isn't already a string, we explicitly convert it here in case
        // it can't be implicitly converted - i.e. it's a symbol.
        const valueAsString = typeof value === 'string' ? value : String(value);
        if (node === this.endNode.previousSibling &&
            node.nodeType === 3 /* Node.TEXT_NODE */) {
            // If we only have a single text node between the markers, we can just
            // set its value, rather than replacing it.
            // TODO(justinfagnani): Can we just check if this.value is primitive?
            node.data = valueAsString;
        }
        else {
            this.__commitNode(document.createTextNode(valueAsString));
        }
        this.value = value;
    }
    __commitTemplateResult(value) {
        const template = this.options.templateFactory(value);
        if (this.value instanceof TemplateInstance &&
            this.value.template === template) {
            this.value.update(value.values);
        }
        else {
            // Make sure we propagate the template processor from the TemplateResult
            // so that we use its syntax extension, etc. The template factory comes
            // from the render function options so that it can control template
            // caching and preprocessing.
            const instance = new TemplateInstance(template, value.processor, this.options);
            const fragment = instance._clone();
            instance.update(value.values);
            this.__commitNode(fragment);
            this.value = instance;
        }
    }
    __commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If _value is an array, then the previous render was of an
        // iterable and _value will contain the NodeParts from the previous
        // render. If _value is not an array, clear this part and make a new
        // array for NodeParts.
        if (!Array.isArray(this.value)) {
            this.value = [];
            this.clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this.value;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            // Try to reuse an existing part
            itemPart = itemParts[partIndex];
            // If no existing part, create a new one
            if (itemPart === undefined) {
                itemPart = new NodePart(this.options);
                itemParts.push(itemPart);
                if (partIndex === 0) {
                    itemPart.appendIntoPart(this);
                }
                else {
                    itemPart.insertAfterPart(itemParts[partIndex - 1]);
                }
            }
            itemPart.setValue(item);
            itemPart.commit();
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
            this.clear(itemPart && itemPart.endNode);
        }
    }
    clear(startNode = this.startNode) {
        removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
    }
}
/**
 * Implements a boolean attribute, roughly as defined in the HTML
 * specification.
 *
 * If the value is truthy, then the attribute is present with a value of
 * ''. If the value is falsey, the attribute is removed.
 */
class BooleanAttributePart {
    constructor(element, name, strings) {
        this.value = undefined;
        this.__pendingValue = undefined;
        if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
            throw new Error('Boolean attributes can only contain a single expression');
        }
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const value = !!this.__pendingValue;
        if (this.value !== value) {
            if (value) {
                this.element.setAttribute(this.name, '');
            }
            else {
                this.element.removeAttribute(this.name);
            }
            this.value = value;
        }
        this.__pendingValue = noChange;
    }
}
/**
 * Sets attribute values for PropertyParts, so that the value is only set once
 * even if there are multiple parts for a property.
 *
 * If an expression controls the whole property value, then the value is simply
 * assigned to the property under control. If there are string literals or
 * multiple expressions, then the strings are expressions are interpolated into
 * a string first.
 */
class PropertyCommitter extends AttributeCommitter {
    constructor(element, name, strings) {
        super(element, name, strings);
        this.single =
            (strings.length === 2 && strings[0] === '' && strings[1] === '');
    }
    _createPart() {
        return new PropertyPart(this);
    }
    _getValue() {
        if (this.single) {
            return this.parts[0].value;
        }
        return super._getValue();
    }
    commit() {
        if (this.dirty) {
            this.dirty = false;
            // tslint:disable-next-line:no-any
            this.element[this.name] = this._getValue();
        }
    }
}
class PropertyPart extends AttributePart {
}
// Detect event listener options support. If the `capture` property is read
// from the options object, then options are supported. If not, then the thrid
// argument to add/removeEventListener is interpreted as the boolean capture
// value so we should only pass the `capture` property.
let eventOptionsSupported = false;
try {
    const options = {
        get capture() {
            eventOptionsSupported = true;
            return false;
        }
    };
    // tslint:disable-next-line:no-any
    window.addEventListener('test', options, options);
    // tslint:disable-next-line:no-any
    window.removeEventListener('test', options, options);
}
catch (_e) {
}
class EventPart {
    constructor(element, eventName, eventContext) {
        this.value = undefined;
        this.__pendingValue = undefined;
        this.element = element;
        this.eventName = eventName;
        this.eventContext = eventContext;
        this.__boundHandleEvent = (e) => this.handleEvent(e);
    }
    setValue(value) {
        this.__pendingValue = value;
    }
    commit() {
        while (isDirective(this.__pendingValue)) {
            const directive = this.__pendingValue;
            this.__pendingValue = noChange;
            directive(this);
        }
        if (this.__pendingValue === noChange) {
            return;
        }
        const newListener = this.__pendingValue;
        const oldListener = this.value;
        const shouldRemoveListener = newListener == null ||
            oldListener != null &&
                (newListener.capture !== oldListener.capture ||
                    newListener.once !== oldListener.once ||
                    newListener.passive !== oldListener.passive);
        const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        if (shouldAddListener) {
            this.__options = getOptions(newListener);
            this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
        }
        this.value = newListener;
        this.__pendingValue = noChange;
    }
    handleEvent(event) {
        if (typeof this.value === 'function') {
            this.value.call(this.eventContext || this.element, event);
        }
        else {
            this.value.handleEvent(event);
        }
    }
}
// We copy options because of the inconsistent behavior of browsers when reading
// the third argument of add/removeEventListener. IE11 doesn't support options
// at all. Chrome 41 only reads `capture` if the argument is an object.
const getOptions = (o) => o &&
    (eventOptionsSupported ?
        { capture: o.capture, passive: o.passive, once: o.once } :
        o.capture);

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * Creates Parts when a template is instantiated.
 */
class DefaultTemplateProcessor {
    /**
     * Create parts for an attribute-position binding, given the event, attribute
     * name, and string literals.
     *
     * @param element The element containing the binding
     * @param name  The attribute name
     * @param strings The string literals. There are always at least two strings,
     *   event for fully-controlled bindings with a single expression.
     */
    handleAttributeExpressions(element, name, strings, options) {
        const prefix = name[0];
        if (prefix === '.') {
            const committer = new PropertyCommitter(element, name.slice(1), strings);
            return committer.parts;
        }
        if (prefix === '@') {
            return [new EventPart(element, name.slice(1), options.eventContext)];
        }
        if (prefix === '?') {
            return [new BooleanAttributePart(element, name.slice(1), strings)];
        }
        const committer = new AttributeCommitter(element, name, strings);
        return committer.parts;
    }
    /**
     * Create parts for a text-position binding.
     * @param templateFactory
     */
    handleTextExpression(options) {
        return new NodePart(options);
    }
}
const defaultTemplateProcessor = new DefaultTemplateProcessor();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
/**
 * The default TemplateFactory which caches Templates keyed on
 * result.type and result.strings.
 */
function templateFactory(result) {
    let templateCache = templateCaches.get(result.type);
    if (templateCache === undefined) {
        templateCache = {
            stringsArray: new WeakMap(),
            keyString: new Map()
        };
        templateCaches.set(result.type, templateCache);
    }
    let template = templateCache.stringsArray.get(result.strings);
    if (template !== undefined) {
        return template;
    }
    // If the TemplateStringsArray is new, generate a key from the strings
    // This key is shared between all templates with identical content
    const key = result.strings.join(marker);
    // Check if we already have a Template for this key
    template = templateCache.keyString.get(key);
    if (template === undefined) {
        // If we have not seen this key before, create a new Template
        template = new Template(result, result.getTemplateElement());
        // Cache the Template for this key
        templateCache.keyString.set(key, template);
    }
    // Cache all future queries for this TemplateStringsArray
    templateCache.stringsArray.set(result.strings, template);
    return template;
}
const templateCaches = new Map();

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const parts = new WeakMap();
/**
 * Renders a template result or other value to a container.
 *
 * To update a container with new values, reevaluate the template literal and
 * call `render` with the new result.
 *
 * @param result Any value renderable by NodePart - typically a TemplateResult
 *     created by evaluating a template tag like `html` or `svg`.
 * @param container A DOM parent to render to. The entire contents are either
 *     replaced, or efficiently updated if the same result type was previous
 *     rendered there.
 * @param options RenderOptions for the entire render tree rendered to this
 *     container. Render options must *not* change between renders to the same
 *     container, as those changes will not effect previously rendered DOM.
 */
const render = (result, container, options) => {
    let part = parts.get(container);
    if (part === undefined) {
        removeNodes(container, container.firstChild);
        parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
        part.appendInto(container);
    }
    part.setValue(result);
    part.commit();
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
// TODO(justinfagnani): inject version number at build time
(window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.1.2');
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 */
const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);
/**
 * Interprets a template literal as an SVG template that can efficiently
 * render to and update a container.
 */
const svg = (strings, ...values) => new SVGTemplateResult(strings, values, 'svg', defaultTemplateProcessor);

const litRender = (templateResult, domNode, styles, { eventContext } = {}) => {
	if (styles) {
		templateResult = html`<style>${styles}</style>${templateResult}`;
	}
	render(templateResult, domNode, { eventContext });
};

var mKeyCodes = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  SHIFT: 16,
  CONTROL: 17,
  ALT: 18,
  BREAK: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACE: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  PRINT: 44,
  INSERT: 45,
  DELETE: 46,
  DIGIT_0: 48,
  DIGIT_1: 49,
  DIGIT_2: 50,
  DIGIT_3: 51,
  DIGIT_4: 52,
  DIGIT_5: 53,
  DIGIT_6: 54,
  DIGIT_7: 55,
  DIGIT_8: 56,
  DIGIT_9: 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  WINDOWS: 91,
  CONTEXT_MENU: 93,
  TURN_OFF: 94,
  SLEEP: 95,
  NUMPAD_0: 96,
  NUMPAD_1: 97,
  NUMPAD_2: 98,
  NUMPAD_3: 99,
  NUMPAD_4: 100,
  NUMPAD_5: 101,
  NUMPAD_6: 102,
  NUMPAD_7: 103,
  NUMPAD_8: 104,
  NUMPAD_9: 105,
  NUMPAD_ASTERISK: 106,
  NUMPAD_PLUS: 107,
  NUMPAD_MINUS: 109,
  NUMPAD_COMMA: 110,
  NUMPAD_SLASH: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  NUM_LOCK: 144,
  SCROLL_LOCK: 145,
  OPEN_BRACKET: 186,
  PLUS: 187,
  COMMA: 188,
  SLASH: 189,
  DOT: 190,
  PIPE: 191,
  SEMICOLON: 192,
  MINUS: 219,
  GREAT_ACCENT: 220,
  EQUALS: 221,
  SINGLE_QUOTE: 222,
  BACKSLASH: 226
};

const isEnter = event => (event.key ? event.key === "Enter" : event.keyCode === mKeyCodes.ENTER) && !hasModifierKeys(event);

const isSpace = event => (event.key ? (event.key === "Spacebar" || event.key === " ") : event.keyCode === mKeyCodes.SPACE) && !hasModifierKeys(event);

const hasModifierKeys = event => event.shiftKey || event.altKey || getCtrlKey(event);

const getCtrlKey = event => !!(event.metaKey || event.ctrlKey); // double negation doesn't have effect on boolean but ensures null and undefined are equivalent to false.

const language = getLanguage();

const getLanguage$1 = () => {
	return language;
};

var getDesigntimePropertyAsArray = value => {
	const m = /\$([-a-z0-9A-Z._]+)(?::([^$]*))?\$/.exec(value);
	return m && m[2] ? m[2].split(/,/) : null;
};

var detectNavigatorLanguage = () => {
	const browserLanguages = navigator.languages;

	const navigatorLanguage = () => {
		return navigator.language;
	};

	const rawLocale = (browserLanguages && browserLanguages[0]) || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage;

	return rawLocale || "en";
};

const M_ISO639_OLD_TO_NEW = {
	"iw": "he",
	"ji": "yi",
	"in": "id",
	"sh": "sr",
};

const A_RTL_LOCALES = getDesigntimePropertyAsArray("$cldr-rtl-locales:ar,fa,he$") || [];

const impliesRTL = language => {
	language = (language && M_ISO639_OLD_TO_NEW[language]) || language;

	return A_RTL_LOCALES.indexOf(language) >= 0;
};

const getRTL$1 = () => {
	const configurationRTL = getRTL();

	if (configurationRTL !== null) {
		return !!configurationRTL;
	}

	return impliesRTL(getLanguage$1() || detectNavigatorLanguage());
};

const features = new Map();

const getFeature = name => {
	return features.get(name);
};

var class2type = {};
var hasOwn = class2type.hasOwnProperty;
var toString = class2type.toString;
var fnToString = hasOwn.toString;
var ObjectFunctionString = fnToString.call(Object);
var fnIsPlainObject = function (obj) {
  var proto, Ctor;
  if (!obj || toString.call(obj) !== "[object Object]") {
    return false;
  }
  proto = Object.getPrototypeOf(obj);
  if (!proto) {
    return true;
  }
  Ctor = hasOwn.call(proto, "constructor") && proto.constructor;
  return typeof Ctor === "function" && fnToString.call(Ctor) === ObjectFunctionString;
};

/* eslint-disable */

var jQuery = {
	extend: function() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[ 0 ] || {},
			i = 1,
			length = arguments.length,
			deep = false;

		// Handle a deep copy situation
		if ( typeof target === "boolean" ) {
			deep = target;

			// Skip the boolean and the target
			target = arguments[ i ] || {};
			i++;
		}

		// Handle case when target is a string or something (possible in deep copy)
		if ( typeof target !== "object" && typeof target !== "function" ) {
			target = {};
		}

		// Extend jQuery itself if only one argument is passed
		if ( i === length ) {
			target = this;
			i--;
		}

		for ( ; i < length; i++ ) {

			// Only deal with non-null/undefined values
			if ( ( options = arguments[ i ] ) != null ) {

				// Extend the base object
				for ( name in options ) {
					src = target[ name ];
					copy = options[ name ];

					// Prevent never-ending loop
					if ( target === copy ) {
						continue;
					}

					// Recurse if we're merging plain objects or arrays
					if ( deep && copy && ( fnIsPlainObject( copy ) ||
							( copyIsArray = Array.isArray( copy ) ) ) ) {

						if ( copyIsArray ) {
							copyIsArray = false;
							clone = src && Array.isArray( src ) ? src : [];

						} else {
							clone = src && fnIsPlainObject( src ) ? src : {};
						}

						// Never move original objects, clone them
						target[ name ] = extend( deep, clone, copy );

						// Don't bring in undefined values
					} else if ( copy !== undefined ) {
						target[ name ] = copy;
					}
				}
			}
		}

		// Return the modified object
		return target;
	},
	ajaxSettings: {
		converters: {
			"text json": (data) => JSON.parse( data + "" )
		}
	},
	trim: function (str) {
		return str.trim();
	}
};

window.jQuery = window.jQuery || jQuery;

/* eslint-enable */

const rLocale = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;

class Locale {
	constructor(sLocaleId) {
		const aResult = rLocale.exec(sLocaleId.replace(/_/g, "-"));
		if (aResult === null) {
			throw new Error(`The given language ${sLocaleId} does not adhere to BCP-47.`);
		}
		this.sLocaleId = sLocaleId;
		this.sLanguage = aResult[1] || null;
		this.sScript = aResult[2] || null;
		this.sRegion = aResult[3] || null;
		this.sVariant = (aResult[4] && aResult[4].slice(1)) || null;
		this.sExtension = (aResult[5] && aResult[5].slice(1)) || null;
		this.sPrivateUse = aResult[6] || null;
		if (this.sLanguage) {
			this.sLanguage = this.sLanguage.toLowerCase();
		}
		if (this.sScript) {
			this.sScript = this.sScript.toLowerCase().replace(/^[a-z]/, s => {
				return s.toUpperCase();
			});
		}
		if (this.sRegion) {
			this.sRegion = this.sRegion.toUpperCase();
		}
	}

	getLanguage() {
		return this.sLanguage;
	}

	getScript() {
		return this.sScript;
	}

	getRegion() {
		return this.sRegion;
	}

	getVariant() {
		return this.sVariant;
	}

	getVariantSubtags() {
		return this.sVariant ? this.sVariant.split("-") : [];
	}

	getExtension() {
		return this.sExtension;
	}

	getExtensionSubtags() {
		return this.sExtension ? this.sExtension.slice(2).split("-") : [];
	}

	getPrivateUse() {
		return this.sPrivateUse;
	}

	getPrivateUseSubtags() {
		return this.sPrivateUse ? this.sPrivateUse.slice(2).split("-") : [];
	}

	hasPrivateUseSubtag(sSubtag) {
		return this.getPrivateUseSubtags().indexOf(sSubtag) >= 0;
	}

	toString() {
		const r = [this.sLanguage];

		if (this.sScript) {
			r.push(this.sScript);
		}
		if (this.sRegion) {
			r.push(this.sRegion);
		}
		if (this.sVariant) {
			r.push(this.sVariant);
		}
		if (this.sExtension) {
			r.push(this.sExtension);
		}
		if (this.sPrivateUse) {
			r.push(this.sPrivateUse);
		}
		return r.join("-");
	}

	static get _cldrLocales() {
		return getDesigntimePropertyAsArray("$cldr-locales:ar,ar_EG,ar_SA,bg,br,ca,cs,da,de,de_AT,de_CH,el,el_CY,en,en_AU,en_GB,en_HK,en_IE,en_IN,en_NZ,en_PG,en_SG,en_ZA,es,es_AR,es_BO,es_CL,es_CO,es_MX,es_PE,es_UY,es_VE,et,fa,fi,fr,fr_BE,fr_CA,fr_CH,fr_LU,he,hi,hr,hu,id,it,it_CH,ja,kk,ko,lt,lv,ms,nb,nl,nl_BE,nn,pl,pt,pt_PT,ro,ru,ru_UA,sk,sl,sr,sv,th,tr,uk,vi,zh_CN,zh_HK,zh_SG,zh_TW$");
	}

	static get _coreI18nLocales() {
		return getDesigntimePropertyAsArray("$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,es,et,fi,fr,hi,hr,hu,it,iw,ja,ko,lt,lv,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$");
	}
}

const convertToLocaleOrNull = lang => {
	try {
		if (lang && typeof lang === "string") {
			return new Locale(lang);
		}
	} catch (e) {
		// ignore
	}
};

/**
 * Returns the locale based on the configured language Configuration#getLanguage
 * If no language has been configured - a new locale based on browser language is returned
 */
const getLocale = () => {
	if (getLanguage$1()) {
		return new Locale(getLanguage$1());
	}

	return convertToLocaleOrNull(detectNavigatorLanguage());
};

/**
 * Returns the language of #getLocale return value
 */
const getLanguage$2 = () => {
	return getLocale().sLanguage;
};

const mSettings = {};

const getFormatLocale = () => {
	const fallback = () => {
		let oLocale = getLocale();
		// if any user settings have been defined, add the private use subtag "sapufmt"
		if (!Object.keys(mSettings).length === 0) {
			let l = oLocale.toString();
			if (l.indexOf("-x-") < 0) {
				l += "-x-sapufmt";
			} else if (l.indexOf("-sapufmt") <= l.indexOf("-x-")) {
				l += "-sapufmt";
			}
			oLocale = new Locale(l);
		}
		return oLocale;
	};

	// we do not support setting of locale, so we just leave the default behaviour
	return fallback();
};

const setConfiguration = configuration => {
};

const getCustomLocaleData = () => {
	return mSettings;
};

// needed for compatibilty
const getLegacyDateFormat = () => {};
const getLegacyDateCalendarCustomizing = () => {};

var FormatSettings = /*#__PURE__*/Object.freeze({
	__proto__: null,
	setConfiguration: setConfiguration,
	getFormatLocale: getFormatLocale,
	getLegacyDateFormat: getLegacyDateFormat,
	getLegacyDateCalendarCustomizing: getLegacyDateCalendarCustomizing,
	getCustomLocaleData: getCustomLocaleData
});

var CalendarType = {
  Gregorian: "Gregorian",
  Islamic: "Islamic",
  Japanese: "Japanese",
  Persian: "Persian",
  Buddhist: "Buddhist"
};

const calendarType = getCalendarType();

const getCalendarType$1 = () => {
	if (calendarType) {
		const type = Object.keys(CalendarType).find(calType => calType === calendarType);

		if (type) {
			return type;
		}
	}

	return CalendarType.Gregorian;
};

const formatSettings = getFormatSettings();

const getFirstDayOfWeek = () => {
	return formatSettings.firstDayOfWeek;
};

/**
 * Shim for the OpenUI5 core
 * @deprecated - do not add new functionality
 */

const Configuration = {
	getLanguage: getLanguage$1,
	getCalendarType: getCalendarType$1,
	getFirstDayOfWeek,
	getSupportedLanguages: () => {
		return getDesigntimePropertyAsArray("$core-i18n-locales:,ar,bg,ca,cs,da,de,el,en,es,et,fi,fr,hi,hr,hu,it,iw,ja,ko,lt,lv,nl,no,pl,pt,ro,ru,sh,sk,sl,sv,th,tr,uk,vi,zh_CN,zh_TW$");
	},
	getOriginInfo: () => {},
};

const Core = {
	/**
	 * @deprecated - must be here for compatibility
	 */
	getConfiguration() {
		return Configuration;
	},

	/**
	 * @deprecated - must be here for compatibility
	 */
	getLibraryResourceBundle() {
	},

	getFormatSettings() {
		return FormatSettings;
	},
};

window.sap = window.sap || {};
window.sap.ui = window.sap.ui || {};

/**
 * @deprecated
 */
window.sap.ui.getWCCore = function getWCCore() {
	return Core;
};

const localeRegEX = /^((?:[A-Z]{2,3}(?:-[A-Z]{3}){0,3})|[A-Z]{4}|[A-Z]{5,8})(?:-([A-Z]{4}))?(?:-([A-Z]{2}|[0-9]{3}))?((?:-[0-9A-Z]{5,8}|-[0-9][0-9A-Z]{3})*)((?:-[0-9A-WYZ](?:-[0-9A-Z]{2,8})+)*)(?:-(X(?:-[0-9A-Z]{1,8})+))?$/i;
const SAPSupportabilityLocales = /(?:^|-)(saptrc|sappsd)(?:-|$)/i;

/* Map for old language names for a few ISO639 codes. */
const M_ISO639_NEW_TO_OLD = {
	"he": "iw",
	"yi": "ji",
	"id": "in",
	"sr": "sh",
};

/**
 * Normalizes the given locale in BCP-47 syntax.
 * @param {string} locale locale to normalize
 * @returns {string} Normalized locale or undefined if the locale can't be normalized
 */
const normalizeLocale = locale => {
	let m;

	if (typeof locale === "string" && (m = localeRegEX.exec(locale.replace(/_/g, "-")))) {/* eslint-disable-line */
		let language = m[1].toLowerCase();
		let region = m[3] ? m[3].toUpperCase() : undefined;
		const script = m[2] ? m[2].toLowerCase() : undefined;
		const variants = m[4] ? m[4].slice(1) : undefined;
		const isPrivate = m[6];

		language = M_ISO639_NEW_TO_OLD[language] || language;

		// recognize and convert special SAP supportability locales (overwrites m[]!)
		if ((isPrivate && (m = SAPSupportabilityLocales.exec(isPrivate))) /* eslint-disable-line */ ||
			(variants && (m = SAPSupportabilityLocales.exec(variants)))) {/* eslint-disable-line */
			return `en_US_${m[1].toLowerCase()}`; // for now enforce en_US (agreed with SAP SLS)
		}

		// Chinese: when no region but a script is specified, use default region for each script
		if (language === "zh" && !region) {
			if (script === "hans") {
				region = "CN";
			} else if (script === "hant") {
				region = "TW";
			}
		}

		return language + (region ? "_" + region + (variants ? "_" + variants.replace("-", "_") : "") : ""); /* eslint-disable-line */
	}
};


/**
 * Calculates the next fallback locale for the given locale.
 *
 * @param {string} locale Locale string in Java format (underscores) or null
 * @returns {string|null} Next fallback Locale or null if there is no more fallback
 */
const nextFallbackLocale = locale => {
	if (!locale) {
		return null;
	}

	if (locale === "zh_HK") {
		return "zh_TW";
	}

	// if there are multiple segments (separated by underscores), remove the last one
	const p = locale.lastIndexOf("_");
	if (p >= 0) {
		return locale.slice(0, p);
	}

	// for any language but 'en', fallback to 'en' first before falling back to the 'raw' language (empty string)
	return locale !== "en" ? "en" : "";
};

const bundleData = new Map();
const bundleURLs = new Map();

/**
 * Sets a map with texts and ID the are related to.
 * @param {string} packageName package ID that the i18n bundle will be related to
 * @param {Object} data an object with string locales as keys and text translataions as values
 * @public
 */
const setI18nBundleData = (packageName, data) => {
	bundleData.set(packageName, data);
};

const getI18nBundleData = packageName => {
	return bundleData.get(packageName);
};

/**
 * This method preforms the asyncronous task of fething the actual text resources. It will fetch
 * each text resource over the network once (even for multiple calls to the same method).
 * It should be fully finished before the i18nBundle class is created in the webcomponents.
 * This method uses the bundle URLs that are populated by the <code>registerI18nBundle</code> method.
 * To simplify the usage, the synchronization of both methods happens internally for the same <code>bundleId</code>
 * @param {packageName} packageName the node project package id
 * @public
 */
const fetchI18nBundle = async packageName => {
	const bundlesForPackage = bundleURLs.get(packageName);

	if (!bundlesForPackage) {
		console.warn(`Message bundle assets are not configured. Falling back to english texts.`, /* eslint-disable-line */
		` You need to import @ui5/webcomponents/dist/json-imports/i18n.js with a build tool that supports JSON imports.`); /* eslint-disable-line */
		return;
	}

	const language = getLanguage$2();

	let localeId = normalizeLocale(language);
	while (!bundlesForPackage[localeId]) {
		localeId = nextFallbackLocale(localeId);
	}

	const bundleURL = bundlesForPackage[localeId];

	if (typeof bundleURL === "object") { // inlined from build
		setI18nBundleData(packageName, bundleURL);
		return bundleURL;
	}

	const data = await fetchJsonOnce(bundleURL);
	setI18nBundleData(packageName, data);
};

const messageFormatRegEX = /('')|'([^']+(?:''[^']*)*)(?:'|$)|\{([0-9]+(?:\s*,[^{}]*)?)\}|[{}]/g;

const formatMessage = (text, values) => {
	values = values || [];

	return text.replace(messageFormatRegEX, ($0, $1, $2, $3, offset) => {
		if ($1) {
			return '\''; /* eslint-disable-line */
		}

		if ($2) {
			return $2.replace(/''/g, '\''); /* eslint-disable-line */
		}

		if ($3) {
			return String(values[parseInt($3)]);
		}

		throw new Error(`[i18n]: pattern syntax error at pos ${offset}`);
	});
};

const I18nBundleInstances = new Map();

class I18nBundle {
	constructor(packageName) {
		this.packageName = packageName;
	}

	getText(textObj, ...params) {
		if (!textObj || !textObj.key || !textObj.defaultText) {
			return "";
		}
		const bundle = getI18nBundleData(this.packageName);

		if (!bundle || !bundle[textObj.key]) {
			return formatMessage(textObj.defaultText, params); // Fallback to "en"
		}

		return formatMessage(bundle[textObj.key], params);
	}
}

const getI18nBundle = packageName => {
	if (I18nBundleInstances.has(packageName)) {
		return I18nBundleInstances.get(packageName);
	}

	const i18nBunle = new I18nBundle(packageName);
	I18nBundleInstances.set(packageName, i18nBunle);
	return i18nBunle;
};

/**
 * Different types of Button.
 */
const ButtonTypes = {
	/**
	 * default type (no special styling)
	 */
	Default: "Default",

	/**
	 * accept type (green button)
	 */
	Positive: "Positive",

	/**
	 * reject style (red button)
	 */
	Negative: "Negative",

	/**
	 * transparent type
	 */
	Transparent: "Transparent",

	/**
	 * emphasized type
	 */
	Emphasized: "Emphasized",
};

class ButtonDesign extends DataType {
	static isValid(value) {
		return !!ButtonTypes[value];
	}
}

ButtonDesign.generataTypeAcessors(ButtonTypes);

/*
	lit-html directive that removes and attribute if it is undefined
*/
var ifDefined = directive(value => part => {
	if ((value === undefined) && part instanceof AttributePart) {
		if (value !== part.value) {
			const name = part.committer.name;
			part.committer.element.removeAttribute(name);
		}
	} else if (part.committer && part.committer.element && part.committer.element.getAttribute(part.committer.name) === value) {
		part.setValue(noChange);
	} else {
		part.setValue(value);
	}
});

const block0 = (context) => { return html`<button		type="button"		class="ui5-button-root"		?disabled="${ifDefined(context.disabled)}"		data-sap-focus-ref				dir="${ifDefined(context.rtl)}"		@focusout=${ifDefined(context._onfocusout)}		@focusin=${ifDefined(context._onfocusin)}		@click=${ifDefined(context._onclick)}		@mousedown=${ifDefined(context._onmousedown)}		@mouseup=${ifDefined(context._onmouseup)}		@keydown=${ifDefined(context._onkeydown)}		@keyup=${ifDefined(context._onkeyup)}		tabindex=${ifDefined(context.tabIndexValue)}		aria-expanded="${ifDefined(context.accInfo.ariaExpanded)}"		aria-controls="${ifDefined(context.accInfo.ariaControls)}"		title="${ifDefined(context.accInfo.title)}"	>		${ context.icon ? block1(context) : undefined }<span id="${ifDefined(context._id)}-content" class="ui5-button-text"><bdi><slot></slot></bdi></span>		${ context.hasButtonType ? block2(context) : undefined }</button>`; };
const block1 = (context) => { return html`<ui5-icon				class="ui5-button-icon"				name="${ifDefined(context.icon)}"				show-tooltip=${ifDefined(context.iconOnly)}			></ui5-icon>		`; };
const block2 = (context) => { return html`<span class="ui5-hidden-text">${ifDefined(context.buttonTypeText)}</span>		`; };

const registry = new Map();
const iconCollectionPromises = new Map();

const DEFAULT_COLLECTION = "SAP-icons";

const calcKey = (name, collection) => {
	// silently support ui5-compatible URIs
	if (name.startsWith("sap-icon://")) {
		name = name.replace("sap-icon://", "");
		[name, collection] = name.split("/").reverse();
	}
	collection = collection || DEFAULT_COLLECTION;
	return `${collection}:${name}`;
};

const getIconDataSync = (name, collection = DEFAULT_COLLECTION) => {
	const key = calcKey(name, collection);
	return registry.get(key);
};

const getIconData = async (name, collection = DEFAULT_COLLECTION) => {
	const key = calcKey(name, collection);

	if (!iconCollectionPromises.has(collection)) {
		iconCollectionPromises.set(collection, Promise.reject());
	}

	await iconCollectionPromises.get(collection);
	return registry.get(key);
};

const block0$1 = (context) => { return html`<svg	class="ui5-icon-root"	dir="${ifDefined(context.dir)}"	viewBox="0 0 512 512"	role="img"	focusable="false"	preserveAspectRatio="xMidYMid meet"	aria-label="${ifDefined(context.accessibleNameText)}"	xmlns="http://www.w3.org/2000/svg">${blockSVG1(context)}</svg>`; };
const block1$1 = (context) => { return svg`<title id="${ifDefined(context._id)}-tooltip">${ifDefined(context.accessibleNameText)}</title>	`; };

const blockSVG1 = (context) => {return svg`	${ context.hasIconTooltip ? block1$1(context) : undefined }<g role="presentation"><path transform="translate(0, 512) scale(1, -1)" d="${ifDefined(context.pathData)}"/></g>`};

var fiori3Base = ":root{--sapBrandColor:#0a6ed1;--sapBaseColor:#fff;--sapBackgroundImage:none;--sapBackgroundImageOpacity:1;--sapCompanyLogo:none;--sapContent_GridSize:1rem;--sapContent_MarkerIconColor:#286eb4;--sapContent_MarkerTextColor:#0f828f;--sapContent_BadgeBackground:#d04343;--sapFontFamily:\"72\",\"72full\",Arial,Helvetica,sans-serif;--sapFontSize:0.875rem;--sapTextColor:#32363a;--sapLinkColor:#0a6ed1;--sapShellColor:#354a5f;--sapPrimary1:#354a5f;--sapPrimary2:#0a6ed1;--sapPrimary3:#fff;--sapPrimary4:#edeff0;--sapPrimary5:#89919a;--sapPrimary6:#32363a;--sapPrimary7:#6a6d70;--sapAccentColor1:#d08014;--sapAccentColor2:#d04343;--sapAccentColor3:#db1f77;--sapAccentColor4:#c0399f;--sapAccentColor5:#6367de;--sapAccentColor6:#286eb4;--sapAccentColor7:#0f828f;--sapAccentColor8:#7ca10c;--sapAccentColor9:#925ace;--sapAccentColor10:#647987;--sapErrorBorderColor:#b00;--sapWarningBorderColor:#e9730c;--sapSuccessBorderColor:#107e3e;--sapInformationBorderColor:#0a6ed1;--sapNeutralBorderColor:#6a6d70;--sapNegativeElementColor:#b00;--sapCriticalElementColor:#e9730c;--sapPositiveElementColor:#107e3e;--sapInformativeElementColor:#0a6ed1;--sapNeutralElementColor:#6a6d70;--sapNegativeTextColor:#b00;--sapCriticalTextColor:#e9730c;--sapPositiveTextColor:#107e3e;--sapNeutralTextColor:#6a6d70;--sapNegativeColor:#b00;--sapCriticalColor:#e9730c;--sapPositiveColor:#107e3e;--sapInformativeColor:#0a6ed1;--sapNeutralColor:#6a6d70;--sapErrorColor:#b00;--sapWarningColor:#e9730c;--sapSuccessColor:#107e3e;--sapInformationColor:#0a6ed1;--sapIndicationColor_1:#800;--sapIndicationColor_2:#b00;--sapIndicationColor_3:#e9730c;--sapIndicationColor_4:#107e3e;--sapIndicationColor_5:#0a6ed1;--sapSelectedColor:#0854a0;--sapActiveColor:#0854a0;--sapTitleColor:#32363a;--sapElement_LineHeight:2.75rem;--sapElement_Height:2.25rem;--sapElement_BorderWidth:0.0625rem;--sapContent_LineHeight:1.4;--sapContent_ElementHeight:1.37em;--sapContent_ElementHeight_PX:22px;--sapContent_IconHeight:1rem;--sapContent_IconColor:#0854a0;--sapContent_ContrastIconColor:#fff;--sapContent_NonInteractiveIconColor:#6a6d70;--sapContent_ImagePlaceholderForegroundColor:#fff;--sapContent_FocusColor:#000;--sapContent_ContrastFocusColor:#fff;--sapContent_ShadowColor:#000;--sapContent_ContrastShadowColor:#fff;--sapContent_SearchHighlightColor:#ebf5fe;--sapContent_HelpColor:#3f8600;--sapContent_LabelColor:#6a6d70;--sapContent_DisabledOpacity:0.4;--sapContent_ContrastTextThreshold:0.65;--sapContent_ContrastTextColor:#fff;--sapContent_ForegroundBorderColor:#89919a;--sapShell_Background:#edeff0;--sapShell_BackgroundImage:none;--sapShell_BackgroundImageOpacity:1;--sapShell_BackgroundImageRepeat:false;--sapShell_BackgroundPatternColor:transparent;--sapShell_BackgroundGradient:none;--sapShell_BorderColor:#354a5f;--sapShell_InteractiveTextColor:#d1e8ff;--sapShell_Favicon:none;--sapButton_BorderColor:#0854a0;--sapButton_BorderWidth:0.0625rem;--sapButton_BorderCornerRadius:0.25rem;--sapButton_Background:#fff;--sapButton_Hover_BorderColor:#0854a0;--sapButton_Active_Background:#0854a0;--sapButton_Emphasized_Background:#0a6ed1;--sapButton_Emphasized_BorderColor:#0a6ed1;--sapButton_Reject_Background:#fff;--sapButton_Accept_Background:#fff;--sapField_Background:#fff;--sapField_BorderColor:#89919a;--sapField_TextColor:#32363a;--sapField_HelpBackground:#fff;--sapField_BorderWidth:0.0625rem;--sapField_BorderCornerRadius:0;--sapField_Hover_Background:#fff;--sapField_Hover_BorderColor:#0854a0;--sapField_Hover_HelpBackground:#ebf5fe;--sapField_Focus_Background:#fff;--sapField_Focus_BorderColor:#89919a;--sapField_Focus_HelpBackground:#fff;--sapField_ReadOnly_BorderColor:#89919a;--sapField_ReadOnly_HelpBackground:hsla(0,0%,94.9%,0.5);--sapField_InvalidColor:#b00;--sapField_InvalidBackground:#fff;--sapField_WarningColor:#e9730c;--sapField_WarningBackground:#fff;--sapField_SuccessColor:#107e3e;--sapField_SuccessBackground:#fff;--sapGroup_TitleBackground:transparent;--sapGroup_Title_FontSize:0.875rem;--sapGroup_ContentBackground:#fff;--sapGroup_BorderWidth:0.0625rem;--sapGroup_BorderCornerRadius:0;--sapGroup_FooterBackground:transparent;--sapToolbar_Background:transparent;--sapInfobar_Background:#0f828f;--sapList_Active_Background:#0854a0;--sapList_HeaderBorderColor:#e5e5e5;--sapList_BorderWidth:0.0625rem;--sapList_HighlightColor:#0854a0;--sapList_Background:#fff;--sapScrollBar_BorderColor:#b3b3b3;--sapScrollBar_SymbolColor:#0854a0;--sapScrollBar_Dimension:0.7rem;--sapPageHeader_Background:#fff;--sapPageFooter_Background:#fff;--sapObjectHeader_Background:#fff;--sapBlockLayer_Background:#000;--sapTile_Background:#fff;--sapTile_BorderColor:transparent;--sapHighlightColor:#0854a0;--sapBackgroundColorDefault:#f7f7f7;--sapBackgroundColor:#f7f7f7;--sapErrorBackground:#ffebeb;--sapWarningBackground:#fef7f1;--sapSuccessBackground:#f1fdf6;--sapInformationBackground:#f5faff;--sapNeutralBackground:#f4f4f4;--sapInformativeTextColor:#053b70;--sapHighlightTextColor:#fff;--sapContent_ImagePlaceholderBackground:#ccc;--sapContent_DisabledTextColor:rgba(50,54,58,0.6);--sapContent_ForegroundColor:#efefef;--sapContent_ForegroundTextColor:#32363a;--sapShell_TextColor:#fff;--sapShell_Hover_Background:#283848;--sapShell_Active_Background:#23303e;--sapShell_Active_TextColor:#fff;--sapButton_Hover_Background:#ebf5fe;--sapButton_TextColor:#0854a0;--sapButton_Active_TextColor:#fff;--sapButton_Hover_TextColor:#0854a0;--sapButton_Emphasized_Hover_Background:#085caf;--sapButton_Emphasized_Active_Background:#0854a0;--sapButton_Emphasized_TextColor:#fff;--sapButton_Reject_TextColor:#b00;--sapButton_Accept_TextColor:#107e3e;--sapButton_Reject_Active_Background:#a20000;--sapButton_IconColor:#0854a0;--sapButton_Accept_Active_Background:#0d6733;--sapField_PlaceholderTextColor:#74777a;--sapField_ReadOnly_Background:hsla(0,0%,94.9%,0.5);--sapField_RequiredColor:#ce3b3b;--sapGroup_TitleBorderColor:#d9d9d9;--sapGroup_TitleTextColor:#32363a;--sapGroup_ContentBorderColor:#d9d9d9;--sapList_TextColor:#32363a;--sapList_HeaderTextColor:#32363a;--sapList_BorderColor:#e5e5e5;--sapList_FooterBackground:#fafafa;--sapList_SelectionBackgroundColor:#e5f0fa;--sapList_HeaderBackground:#f2f2f2;--sapList_Hover_Background:#fafafa;--sapList_Active_TextColor:#fff;--sapList_TableGroupHeaderBackground:#efefef;--sapList_TableGroupHeaderBorderColor:#d9d9d9;--sapList_TableGroupHeaderTextColor:#32363a;--sapScrollBar_FaceColor:#b3b3b3;--sapScrollBar_TrackColor:#fff;--sapScrollBar_Hover_FaceColor:#ababab;--sapInfobar_Hover_Background:#0e7581;--sapObjectHeader_BorderColor:#d9d9d9;--sapPageHeader_BorderColor:#d9d9d9;--sapPageHeader_TextColor:#32363a;--sapPageFooter_TextColor:#32363a;--sapPageFooter_BorderColor:#d9d9d9;--sapTile_TitleTextColor:#32363a;--sapTile_TextColor:#6a6d70;--sapTile_IconColor:#5a7da0;--sapToolbar_SeparatorColor:#d9d9d9;--sapUiBrand:#0a6ed1;--sapUiHighlight:#0854a0;--sapUiBaseColor:#fff;--sapUiShellColor:#354a5f;--sapUiBaseBG:#f7f7f7;--sapUiGlobalBackgroundColor:#f7f7f7;--sapUiFontFamily:\"72\",\"72full\",Arial,Helvetica,sans-serif;--sapUiFontSize:16px;--sapUiBaseText:#32363a;--sapUiLink:#0a6ed1;--sapUiGlobalLogo:none;--sapUiGlobalBackgroundImage:none;--sapUiBackgroundImage:none;--sapUiGlobalBackgroundImageOpacity:1;--sapUiSelected:#0854a0;--sapUiActive:#0854a0;--sapUiHighlightTextColor:#fff;--sapUiTextTitle:#32363a;--sapUiElementLineHeight:2.75rem;--sapUiElementHeight:2.25rem;--sapUiElementBorderWidth:0.0625rem;--sapUiContentLineHeight:1.4;--sapUiContentElementHeight:1.37em;--sapUiContentElementHeightPX:22px;--sapUiContentIconHeight:1rem;--sapUiContentIconColor:#0854a0;--sapUiContentContrastIconColor:#fff;--sapUiContentNonInteractiveIconColor:#6a6d70;--sapUiContentMarkerIconColor:#286eb4;--sapUiContentMarkerTextColor:#0f828f;--sapUiContentImagePlaceholderBackground:#ccc;--sapUiContentImagePlaceholderForegroundColor:#fff;--sapUiContentFocusColor:#000;--sapUiContentContrastFocusColor:#fff;--sapUiContentShadowColor:#000;--sapUiContentContrastShadowColor:#fff;--sapUiContentSearchHighlightColor:#ebf5fe;--sapUiContentHelpColor:#3f8600;--sapUiContentLabelColor:#6a6d70;--sapUiContentDisabledTextColor:rgba(50,54,58,0.6);--sapUiContentDisabledOpacity:0.4;--sapUiContentContrastTextThreshold:0.65;--sapUiContentContrastTextColor:#fff;--sapUiContentForegroundColor:#efefef;--sapUiContentForegroundBorderColor:#89919a;--sapUiContentForegroundTextColor:#32363a;--sapUiContentBadgeBackground:#d04343;--sapUiShellBackground:#edeff0;--sapUiShellHoverBackground:#283848;--sapUiShellActiveBackground:#23303e;--sapUiShellActiveTextColor:#fff;--sapUiShellBackgroundImage:none;--sapUiShellBackgroundImageOpacity:1;--sapUiShellBackgroundImageRepeat:false;--sapUiShellBackgroundPatternColor:transparent;--sapUiShellBorderColor:#354a5f;--sapUiShellTextColor:#fff;--sapUiShellInteractiveTextColor:#d1e8ff;--sapUiShellFavicon:none;--sapUiButtonBorderWidth:0.0625rem;--sapUiButtonBorderCornerRadius:0.25rem;--sapUiButtonBackground:#fff;--sapUiButtonBorderColor:#0854a0;--sapUiButtonTextColor:#0854a0;--sapUiButtonIconColor:#0854a0;--sapUiButtonHoverBackground:#ebf5fe;--sapUiButtonHoverBorderColor:#0854a0;--sapUiButtonActiveTextColor:#fff;--sapUiButtonHoverTextColor:#0854a0;--sapUiButtonEmphasizedHoverBackground:#085caf;--sapUiButtonEmphasizedActiveBackground:#0854a0;--sapUiButtonEmphasizedBackground:#0a6ed1;--sapUiButtonEmphasizedBorderColor:#0a6ed1;--sapUiButtonEmphasizedTextColor:#fff;--sapUiButtonRejectBackground:#fff;--sapUiButtonAcceptBackground:#fff;--sapUiButtonAcceptActiveBackground:#0d6733;--sapUiButtonRejectTextColor:#b00;--sapUiButtonAcceptTextColor:#107e3e;--sapUiButtonRejectActiveBackground:#a20000;--sapUiFieldPlaceholderTextColor:#74777a;--sapUiFieldBorderWidth:0.0625rem;--sapUiFieldBorderCornerRadius:0;--sapUiFieldBackground:#fff;--sapUiFieldBorderColor:#89919a;--sapUiFieldTextColor:#32363a;--sapUiFieldHelpBackground:#fff;--sapUiFieldHoverBackground:#fff;--sapUiFieldHoverBorderColor:#0854a0;--sapUiFieldHoverHelpBackground:#ebf5fe;--sapUiFieldFocusBackground:#fff;--sapUiFieldFocusBorderColor:#89919a;--sapUiFieldFocusHelpBackground:#fff;--sapUiFieldReadOnlyBackground:hsla(0,0%,94.9%,0.5);--sapUiFieldReadOnlyBorderColor:#89919a;--sapUiFieldReadOnlyHelpBackground:hsla(0,0%,94.9%,0.5);--sapUiFieldRequiredColor:#ce3b3b;--sapUiFieldInvalidColor:#b00;--sapUiFieldInvalidBackground:#fff;--sapUiFieldWarningColor:#e9730c;--sapUiFieldWarningBackground:#fff;--sapUiFieldSuccessColor:#107e3e;--sapUiFieldSuccessBackground:#fff;--sapUiGroupTitleBackground:transparent;--sapUiGroupTitleBorderColor:#d9d9d9;--sapUiGroupTitleTextColor:#32363a;--sapUiGroupContentBackground:#fff;--sapUiGroupContentBorderColor:#d9d9d9;--sapUiGroupBorderWidth:0.0625rem;--sapUiGroupFooterBackground:transparent;--sapUiToolbarBackground:transparent;--sapUiToolbarSeparatorColor:#d9d9d9;--sapUiListHeaderBackground:#f2f2f2;--sapUiListHeaderBorderColor:#e5e5e5;--sapUiListHeaderTextColor:#32363a;--sapUiListActiveTextColor:#fff;--sapUiListFooterBackground:#fafafa;--sapUiListTableGroupHeaderBackground:#efefef;--sapUiListTableGroupHeaderBorderColor:#d9d9d9;--sapUiListTableGroupHeaderTextColor:#32363a;--sapUiListBorderColor:#e5e5e5;--sapUiListBorderWidth:0.0625rem;--sapUiListHighlightColor:#0854a0;--sapUiListSelectionBackgroundColor:#e5f0fa;--sapUiListBackground:#fff;--sapUiListHoverBackground:#fafafa;--sapUiScrollBarFaceColor:#b3b3b3;--sapUiScrollBarTrackColor:#fff;--sapUiScrollBarBorderColor:#b3b3b3;--sapUiScrollBarSymbolColor:#0854a0;--sapUiScrollBarDimension:0.7rem;--sapUiScrollBarHoverFaceColor:#ababab;--sapUiPageHeaderBackground:#fff;--sapUiPageHeaderBorderColor:#d9d9d9;--sapUiPageHeaderTextColor:#32363a;--sapUiPageFooterBackground:#fff;--sapUiPageFooterTextColor:#32363a;--sapUiPageFooterBorderColor:#d9d9d9;--sapUiInfobarBackground:#0f828f;--sapUiInfobarHoverBackground:#0e7581;--sapUiObjectHeaderBorderColor:#d9d9d9;--sapUiObjectHeaderBackground:#fff;--sapUiBlockLayerBackground:#000;--sapUiTileBackground:#fff;--sapUiTileBorderColor:transparent;--sapUiTileTitleTextColor:#32363a;--sapUiTileTextColor:#6a6d70;--sapUiTileIconColor:#5a7da0;--sapUiContentGridSize:1rem;--sapUiPrimary1:#354a5f;--sapUiPrimary2:#0a6ed1;--sapUiPrimary3:#fff;--sapUiPrimary4:#edeff0;--sapUiPrimary5:#89919a;--sapUiPrimary6:#32363a;--sapUiPrimary7:#6a6d70;--sapUiAccent1:#d08014;--sapUiAccent2:#d04343;--sapUiAccent3:#db1f77;--sapUiAccent4:#c0399f;--sapUiAccent5:#6367de;--sapUiAccent6:#286eb4;--sapUiAccent7:#0f828f;--sapUiAccent8:#7ca10c;--sapUiAccent9:#925ace;--sapUiAccent10:#647987;--sapUiErrorBG:#ffebeb;--sapUiWarningBG:#fef7f1;--sapUiSuccessBG:#f1fdf6;--sapUiInformationBG:#f5faff;--sapUiNeutralBG:#f4f4f4;--sapUiErrorBorder:#b00;--sapUiWarningBorder:#e9730c;--sapUiSuccessBorder:#107e3e;--sapUiInformationBorder:#0a6ed1;--sapUiNeutralBorder:#6a6d70;--sapUiNegativeElement:#b00;--sapUiCriticalElement:#e9730c;--sapUiPositiveElement:#107e3e;--sapUiInformativeElement:#0a6ed1;--sapUiNeutralElement:#6a6d70;--sapUiNegativeText:#b00;--sapUiCriticalText:#e9730c;--sapUiPositiveText:#107e3e;--sapUiInformativeText:#053b70;--sapUiNeutralText:#6a6d70;--sapUiNegative:#b00;--sapUiCritical:#e9730c;--sapUiPositive:#107e3e;--sapUiInformative:#0a6ed1;--sapUiNeutral:#6a6d70;--sapUiIndication1:#800;--sapUiIndication2:#b00;--sapUiIndication3:#e9730c;--sapUiIndication4:#107e3e;--sapUiIndication5:#0a6ed1;--sapUiFontCondensedFamily:\"72 Condensed\",\"Arial Narrow\",HelveticaNeue-CondensedBold,Arial,sans-serif;--sapUiFontHeaderFamily:\"72\",\"72full\",Arial,Helvetica,sans-serif;--sapUiFontHeaderWeight:normal;--sapMFontHeader1Size:2.25rem;--sapMFontHeader2Size:1.5rem;--sapMFontHeader3Size:1.25rem;--sapMFontHeader4Size:1.125rem;--sapMFontHeader5Size:1rem;--sapMFontHeader6Size:0.875rem;--sapMFontSmallSize:0.75rem;--sapMFontMediumSize:0.875rem;--sapMFontLargeSize:1rem;--sapUiTranslucentBGOpacity:0;--sapMPlatformDependent:false;--sapUiDesktopFontFamily:\"72\",\"72full\",Arial,Helvetica,sans-serif;--sapUiDesktopFontSize:12px;--sapUiFontLargeSize:13px;--sapUiFontSmallSize:11px;--sapUiFontHeader1Size:26px;--sapUiFontHeader2Size:20px;--sapUiFontHeader3Size:18px;--sapUiFontHeader4Size:16px;--sapUiFontHeader5Size:14px;--sapUiFontHeader6Size:13px;--sapUiLineHeight:18px;--sapUiShellContainerBackground:#fff;--sapUiShellAltContainerBackground:#fff;--sapUiShellGroupTextColor:#32363a;--sapUiLinkActive:#0a6ed1;--sapUiLinkVisited:#0a6ed1;--sapUiButtonActiveBackground:#0854a0;--sapUiButtonActiveBorderColor:#0854a0;--sapUiButtonEmphasizedHoverBorderColor:#085caf;--sapUiButtonEmphasizedActiveBorderColor:#0854a0;--sapUiButtonEmphasizedTextShadow:transparent;--sapUiButtonAcceptBorderColor:#107e3e;--sapUiButtonAcceptHoverBackground:#f1fdf6;--sapUiButtonAcceptHoverBorderColor:#107e3e;--sapUiButtonAcceptActiveBorderColor:#0d6733;--sapUiButtonRejectBorderColor:#b00;--sapUiButtonRejectHoverBackground:#ffebeb;--sapUiButtonRejectHoverBorderColor:#b00;--sapUiButtonRejectActiveBorderColor:#a20000;--sapUiButtonLiteBackground:transparent;--sapUiButtonLiteBorderColor:transparent;--sapUiButtonLiteTextColor:#0854a0;--sapUiButtonLiteHoverBackground:#ebf5fe;--sapUiButtonLiteHoverBorderColor:#ebf5fe;--sapUiButtonLiteActiveBackground:#0854a0;--sapUiButtonLiteActiveBorderColor:#0854a0;--sapUiButtonHeaderTextColor:#0854a0;--sapUiButtonHeaderDisabledTextColor:#0854a0;--sapUiButtonFooterHoverBackground:#ebf5fe;--sapUiButtonActionSelectBackground:#fff;--sapUiButtonActionSelectBorderColor:#e5e5e5;--sapUiButtonLiteActionSelectHoverBackground:#fafafa;--sapUiToggleButtonPressedBackground:#0854a0;--sapUiToggleButtonPressedBorderColor:#0854a0;--sapUiToggleButtonPressedHoverBorderColor:#085caf;--sapUiSegmentedButtonBackground:#fff;--sapUiSegmentedButtonBorderColor:#0854a0;--sapUiSegmentedButtonHoverBackground:#ebf5fe;--sapUiSegmentedButtonActiveBackground:#0854a0;--sapUiSegmentedButtonSelectedBackground:#0854a0;--sapUiSegmentedButtonSelectedTextColor:#fff;--sapUiSegmentedButtonSelectedHoverBackground:#085caf;--sapUiSegmentedButtonSelectedHoverBorderColor:#085caf;--sapUiSegmentedButtonFooterBorderColor:#0854a0;--sapUiSegmentedButtonFooterHoverBackground:#ebf5fe;--sapUiFieldActiveBackground:#0854a0;--sapUiFieldActiveBorderColor:#0854a0;--sapUiFieldActiveTextColor:#fff;--sapUiListTextColor:#32363a;--sapUiListVerticalBorderColor:#e5e5e5;--sapUiListActiveBackground:#0854a0;--sapUiListFooterTextColor:#32363a;--sapUiListGroupHeaderBackground:#fff;--sapUiListTableFooterBorder:#e5e5e5;--sapUiListTableTextSize:0.875rem;--sapUiListTableIconSize:1rem;--sapUiInfobarActiveBackground:#0854a0;--sapUiCalendarColorToday:#c0399f;--sapUiDragAndDropColor:#6a6d70;--sapUiDragAndDropBackground:#fff;--sapUiDragAndDropBorderColor:#89919a;--sapUiDragAndDropActiveColor:#0a6ed1;--sapUiDragAndDropActiveBorderColor:#0a6ed1;--sapUiShadowText:0 0 0.125rem #fff;--sapUiLinkHover:#0854a0;--sapUiLinkInverted:#d3e8fd;--sapUiNotificationBarBG:rgba(106,109,112,0.98);--sapUiNotifierSeparator:#383a3c;--sapUiNotificationBarBorder:#9da0a3;--sapUiButtonFooterTextColor:#0854a0;--sapUiSegmentedButtonIconColor:#0854a0;--sapUiSegmentedButtonActiveIconColor:#fff;--sapUiSegmentedButtonSelectedIconColor:#fff;--sapUiSegmentedButtonTextColor:#0854a0;--sapUiSegmentedButtonActiveTextColor:#fff;--sapUiToggleButtonPressedTextColor:#fff;--sapUiToggleButtonPressedHoverBackground:#085caf;--sapUiListSelectionHoverBackground:#d8e8f7;--sapUiButtonBackgroundDarken24:#c2c2c2;--sapUiButtonHoverBorderColorLighten30:#4ba1f6;--sapUiContentShadowColorFade10:rgba(0,0,0,0.1);--sapUiContentShadowColorFade15:rgba(0,0,0,0.15);--sapUiContentShadowColorFade30:rgba(0,0,0,0.3);--sapUiShadowHeader:0 0 0.25rem 0 rgba(0,0,0,0.15),inset 0 -0.0625rem 0 0 #d9d9d9;--sapUiShadowLevel0:0 0 0 1px rgba(0,0,0,0.1),0 0.125rem 0.5rem 0 rgba(0,0,0,0.1);--sapUiShadowLevel1:0 0 0 1px rgba(0,0,0,0.15),0 0.125rem 0.5rem 0 rgba(0,0,0,0.3);--sapUiShadowLevel2:0 0 0 1px rgba(0,0,0,0.15),0 0.625rem 1.875rem 0 rgba(0,0,0,0.3);--sapUiShadowLevel3:0 0 0 1px rgba(0,0,0,0.15),0 1.25rem 5rem 0 rgba(0,0,0,0.3);--sapUiCalloutShadow:0px 6px 12px 0px rgba(0,0,0,0.3);--sapUiFieldWarningColorDarken100:#000;--sapUiListBackgroundDarken3:#f7f7f7;--sapUiListBackgroundDarken10:#e6e6e6;--sapUiListBackgroundDarken13:#dedede;--sapUiListBackgroundDarken15:#d9d9d9;--sapUiListBackgroundDarken20:#ccc;--sapUiTileBackgroundDarken20:#ccc;--sapUiListBorderColorLighten10:#fff;--sapUiActiveLighten3:#085caf;--sapUiLinkDarken15:#074888;--sapUiSelectedDarken10:#053b70;--sapUiToggleButtonPressedBackgroundLighten50Desaturate47:#c0d4e7;--sapUiToggleButtonPressedBorderColorLighten19Desaturate46:#4d85bb;--sapUiSuccessBGLighten5:#fff;--sapUiErrorBGLighten4:#fff;--sapUiButtonBackgroundDarken7:#ededed;--sapUiButtonBackgroundDarken2:#fafafa;--sapUiButtonHoverBackgroundDarken2:#e2f0fe;--sapUiButtonHoverBackgroundDarken5:#d3e8fd;--sapUiButtonRejectActiveBackgroundDarken5:#800;--sapUiButtonAcceptActiveBackgroundDarken5:#0a5128;--sapUiContentForegroundColorLighten5:#fcfcfc;--sapUiContentForegroundColorLighten7:#fff;--sapUiContentForegroundColorDarken3:#e8e8e8;--sapUiContentForegroundColorDarken5:#e3e3e3;--sapUiContentForegroundColorDarken10:#d6d6d6;--sapUiButtonRejectActiveBackgroundLighten5:#b00;--sapUiButtonAcceptActiveBackgroundLighten5:#107e3e;--sapUiButtonBackgroundDarken10:#e6e6e6;--sapBackgroundColorFade72:hsla(0,0%,96.9%,0.72);--sapUiAccent1Lighten50:#fdf3e6;--sapUiAccent2Lighten40:#f9e6e6;--sapUiAccent3Lighten46:#fce9f2;--sapUiAccent4Lighten46:#f9ebf5;--sapUiAccent5Lighten32:#eaeafa;--sapUiAccent6Lighten52:#ebf3fa;--sapUiAccent7Lighten64:#e8fafd;--sapUiAccent8Lighten61:#f8fde7;--sapUiAccent9Lighten37:#f2ebf9;--sapUiAccent10Lighten49:#f1f3f4;--sapUiShellBorderColorLighten30:#7996b4}";

var fiori3 = ":root{--ui5-badge-font-size:0.75em;--ui5-badge-bg-color-scheme-1:var(--sapUiAccent1Lighten50);--ui5-badge-border-color-scheme-1:var(--sapUiAccent1);--ui5-badge-bg-color-scheme-2:var(--sapUiAccent2Lighten40);--ui5-badge-border-color-scheme-2:var(--sapUiAccent2);--ui5-badge-bg-color-scheme-3:var(--sapUiAccent3Lighten46);--ui5-badge-border-color-scheme-3:var(--sapUiAccent3);--ui5-badge-bg-color-scheme-4:var(--sapUiAccent4Lighten46);--ui5-badge-border-color-scheme-4:var(--sapUiAccent4);--ui5-badge-bg-color-scheme-5:var(--sapUiAccent5Lighten32);--ui5-badge-border-color-scheme-5:var(--sapUiAccent5);--ui5-badge-bg-color-scheme-6:var(--sapUiAccent6Lighten52);--ui5-badge-border-color-scheme-6:var(--sapUiAccent6);--ui5-badge-bg-color-scheme-7:var(--sapUiAccent7Lighten64);--ui5-badge-border-color-scheme-7:var(--sapUiAccent7);--ui5-badge-bg-color-scheme-8:var(--sapUiAccent8Lighten61);--ui5-badge-border-color-scheme-8:var(--sapUiAccent8);--ui5-badge-bg-color-scheme-9:var(--sapUiAccent9Lighten37);--ui5-badge-border-color-scheme-9:var(--sapUiAccent9);--ui5-badge-bg-color-scheme-10:var(--sapUiAccent10Lighten49);--ui5-badge-border-color-scheme-10:var(--sapUiAccent10);--_ui5_button_base_min_compact_width:2rem;--_ui5_button_compact_height:1.625rem;--_ui5_button_compact_padding:0.4375rem;--_ui5_button_outline:1px dotted var(--sapUiContentFocusColor);--_ui5_button_outline_offset:-0.1875rem;--_ui5_button_focus_offset:1px;--_ui5_button_focus_width:1px;--_ui5_button_focus_color:var(--sapUiContentFocusColor);--_ui5_button_transparent_border_color:transparent;--_ui5_button_transparent_hover_border_color:var(--sapUiButtonBorderColor);--_ui5_button_active_border_color:var(--sapUiButtonActiveBorderColor);--_ui5_button_positive_border_color:var(--sapUiButtonAcceptBorderColor);--_ui5_button_positive_border_hover_color:var(--sapUiButtonAcceptHoverBorderColor);--_ui5_button_positive_border_active_color:var(--sapUiButtonAcceptActiveBorderColor);--_ui5_button_positive_border_focus_hover_color:var(--sapUiContentFocusColor);--_ui5_button_positive_focus_border_color:var(--sapUiButtonAcceptBorderColor);--_ui5_button_negative_focus_border_color:var(--sapUiButtonRejectBorderColor);--_ui5_button_negative_active_border_color:var(--sapUiButtonRejectActiveBorderColor);--_ui5_button_emphasized_focused_border_color:var(--sapUiButtonEmphasizedBorderColor);--_ui5_button_base_min_width:2.25rem;--_ui5_button_base_height:2.25rem;--_ui5_button_border_radius:0.25rem;--_ui5_button_base_padding:0.5625rem;--_ui5_button_base_icon_only_padding:0.5625rem;--_ui5_button_base_icon_margin:0.375rem;--_ui5_button_base_icon_only_font_size:1rem;--_ui5_button_emphasized_font_weight:bold;--_ui5_button_text_shadow:none;--ui5-busyindicator-color:var(--sapUiContentIconColor);--_ui5_card_border_color:var(--sapUiTileBackgroundDarken20);--_ui5_card_content_padding:1rem;--_ui5_card_header_hover_bg:var(--sapUiListHoverBackground);--_ui5_card_header_active_bg:var(--_ui5_card_header_hover_bg);--_ui5_card_header_border_color:var(--_ui5_card_border_color);--_ui5_card_header_focus_border:1px dotted var(--sapUiContentFocusColor);--_ui5_checkbox_hover_background:var(--sapUiFieldHoverBackground);--_ui5_checkbox_inner_width_height:1.375rem;--_ui5_checkbox_inner_error_border:0.125rem solid var(--sapUiFieldInvalidColor);--_ui5_checkbox_inner_warning_border:0.125rem solid var(--sapUiFieldWarningColor);--_ui5_checkbox_checkmark_warning_color:var(--sapUiFieldWarningColorDarken100);--_ui5_checkbox_checkmark_color:var(--sapUiSelected);--_ui5_checkbox_wrapped_focus_left_top_bottom_position:.5625rem;--_ui5_checkbox_focus_outline:1px dotted var(--sapUiContentFocusColor);--_ui5_checkbox_compact_wrapper_padding:.5rem;--_ui5_checkbox_compact_width_height:2rem;--_ui5_checkbox_compact_inner_size:1rem;--_ui5_checkbox_compact_focus_position:.375rem;--_ui5_checkbox_wrapper_padding:.6875rem;--_ui5_checkbox_width_height:2.75rem;--_ui5_checkbox_inner_border:.0625rem solid var(--sapUiFieldBorderColor);--_ui5_checkbox_focus_position:0.5625rem;--_ui5_checkbox_inner_border_radius:.125rem;--_ui5_checkbox_wrapped_content_margin_top:0;--_ui5_checkbox_wrapped_focus_padding:.5rem;--_ui5_checkbox_inner_readonly_border:1px solid var(--sapUiFieldReadOnlyBorderColor);--_ui5_checkbox_compact_wrapped_label_margin_top:-0.125rem;--_ui5_datepicker_icon_border:none;--_ui5_daypicker_item_margin:2px;--_ui5_daypicker_item_border:none;--_ui5_daypicker_item_outline_width:1px;--_ui5_daypicker_item_outline_offset:1px;--_ui5_daypicker_daynames_container_height:2rem;--_ui5_daypicker_weeknumbers_container_padding_top:2rem;--_ui5_daypicker_item_othermonth_background_color:var(--sapUiListBackground);--_ui5_daypicker_item_othermonth_color:var(--sapUiContentLabelColor);--_ui5_daypicker_item_othermonth_hover_color:var(--sapUiContentLabelColor);--_ui5_daypicker_dayname_color:var(--sapUiContentLabelColor);--_ui5_daypicker_weekname_color:var(--sapUiContentLabelColor);--_ui5_daypicker_item_now_selected_focus_after_width:calc(100% - 0.125rem);--_ui5_daypicker_item_now_selected_focus_after_height:calc(100% - 0.125rem);--_ui5_daypicker_item_now_selected_text_border_color:var(--sapUiListBorderColorLighten10);--_ui5_daypicker_item_background_color:var(--sapUiListBackgroundDarken3);--_ui5_daypicker_item_hover_background_color:var(--sapUiListBackgroundDarken15);--_ui5_daypicker_item_selected_background_color:var(--sapUiActiveLighten3);--_ui5_daypicker_item_selected_hover_background_color:var(--sapUiActiveLighten3);--_ui5_daypicker_item_weekend_background_color:var(--sapUiListBackgroundDarken13);--_ui5_daypicker_item_weekend_hover_background_color:var(--sapUiListBackgroundDarken20);--_ui5_daypicker_item_othermonth_hover_background_color:var(--sapUiListBackgroundDarken10);--_ui5_daypicker_item_border_radius:0.25rem;--_ui5_daypicker_item_now_inner_border_radius:0.125rem;--ui5-group-header-listitem-background-color:var(--sapUiListGroupHeaderBackground);--_ui5_input_compact_height:1.625rem;--_ui5_input_state_border_width:0.125rem;--_ui5_input_error_font_weight:normal;--_ui5_input_focus_border_width:1px;--_ui5_input_error_warning_border_style:solid;--_ui5_input_error_warning_font_style:normal;--_ui5_input_disabled_color:var(--sapUiContentDisabledTextColor);--_ui5_input_disabled_font_weight:normal;--_ui5_input_disabled_border_color:var(--sapUiFieldBorderColor);--_ui5_input_disabled_background:var(--sapUiFieldBackground);--_ui5_input_icon_padding:0.625rem .6875rem;--sap_wc_input_icon_min_width:2.375rem;--sap_wc_input_compact_min_width:2rem;--_ui5_input_height:2.25rem;--sap_wc_input_disabled_opacity:0.4;--_ui5_input_wrapper_border_radius:0.125rem;--_ui5-input-icon-padding:.56275rem .6875rem;--_ui5_link_outline_element_size:calc(100% - 0.125rem);--_ui5_link_subtle_color:var(--sapUiLinkDarken15);--_ui5_link_opacity:0.4;--ui5-listitem-background-color:var(--sapUiListBackground);--ui5-listitem-border-bottom:1px solid var(--sapUiListBorderColor);--_ui5_listitembase_focus_width:1px;--_ui5_monthpicker_item_selected_hover:var(--sapUiSelectedDarken10);--_ui5_monthpicker_item_selected_focus:var(--sapUiSelectedDarken10);--_ui5_monthpicker_item_border:none;--_ui5_monthpicker_item_margin:1px;--_ui5_monthpicker_item_focus_after_width:calc(100% - 0.375rem);--_ui5_monthpicker_item_focus_after_height:calc(100% - 0.375rem);--_ui5_monthpicker_item_focus_after_border:1px dotted var(--sapUiContentFocusColor);--_ui5_monthpicker_item_focus_after_offset:2px;--_ui5_monthpicker_item_background_color:var(--sapUiListBackgroundDarken3);--_ui5_monthpicker_item_hover_background_color:var(--sapUiListBackgroundDarken3);--_ui5_monthpicker_item_focus_background_color:var(--sapUiListBackgroundDarken3);--_ui5_monthpicker_item_border_radius:0.25rem;--_ui5_messagestrip_icon_width:2.5rem;--_ui5_messagestrip_border_radius:0.1875rem;--_ui5_messagestrip_button_border_width:0;--_ui5_messagestrip_button_border_style:none;--_ui5_messagestrip_button_border_color:transparent;--_ui5_messagestrip_button_border_radius:0;--_ui5_messagestrip_padding:0.125rem .125rem;--_ui5_messagestrip_button_height:1.625rem;--_ui5_messagestrip_border_width:1px;--_ui5_messagestrip_close_button_border:none;--_ui5_messagestrip_close_button_size:1.625rem;--_ui5_messagestrip_icon_top:0.4375rem;--_ui5_messagestrip_focus_width:1px;--_ui5_panel_focus_border:1px dotted var(--sapUiContentFocusColor);--_ui5_panel_header_height:2.75rem;--_ui5_panel_header_title_size:var(--sapMFontHeader5Size);--_ui5_panel_button_root_width:2.75rem;--_ui5_popover_arrow_shadow_color:rgba(0,0,0,0.3);--_ui5_popover_content_padding:.4375em;--_ui5_radiobutton_hover_fill:var(--sapUiFieldHoverBackground);--_ui5_radiobutton_border_width:1px;--_ui5_radiobutton_selected_fill:var(--sapUiSelected);--_ui5_radiobutton_selected_error_fill:var(--sapUiFieldInvalidColor);--_ui5_radiobutton_selected_warning_fill:var(--sapUiFieldWarningColorDarken100);--_ui5_radiobutton_warning_error_border_dash:0;--_ui5_select_disabled_background:var(--sapUiFieldBackground);--_ui5_select_disabled_border_color:var(--sapUiFieldBorderColor);--_ui5_select_state_error_warning_border_style:solid;--_ui5_select_state_error_warning_border_width:0.125rem;--_ui5_select_hover_icon_left_border:1px solid transparent;--_ui5_select_rtl_hover_icon_left_border:none;--_ui5_select_rtl_hover_icon_right_border:none;--_ui5_select_focus_width:1px;--_ui5_switch_height:2.75rem;--_ui5_switch_width:3.875rem;--_ui5_switch_no_label_width:3.25rem;--_ui5_switch_outline:1px;--_ui5_switch_compact_height:2rem;--_ui5_switch_compact_width:3.5rem;--_ui5_switch_compact_no_label_width:2.5rem;--_ui5_switch_track_height:1.375rem;--_ui5_switch_track_no_label_height:1.25rem;--_ui5_switch_track_compact_no_label_height:1rem;--_ui5_switch_track_bg:var(--sapUiButtonBackgroundDarken7);--_ui5_switch_track_checked_bg:var(--sapUiToggleButtonPressedBackgroundLighten50Desaturate47);--_ui5_switch_track_hover_bg:var(--sapUiButtonBackgroundDarken7);--_ui5_switch_track_hover_checked_bg:var(--sapUiToggleButtonPressedBackgroundLighten50Desaturate47);--_ui5_switch_track_checked_border_color:var(--sapUiToggleButtonPressedBorderColorLighten19Desaturate46);--_ui5_switch_track_hover_border_color:var(--_ui5_switch_track_checked_border_color);--_ui5_switch_track_border_radius:0.75rem;--_ui5_switch_track_disabled_bg:var(--_ui5_switch_track_bg);--_ui5_switch_track_disabled_checked_bg:var(--_ui5_switch_track_checked_bg);--_ui5_switch_track_disabled_border_color:var(--sapUiContentForegroundBorderColor);--_ui5_switch_track_disabled_semantic_checked_bg:var(--sapUiSuccessBG);--_ui5_switch_track_disabled_semantic_checked_border_color:var(--sapUiSuccessBorder);--_ui5_switch_track_disabled_semantic_bg:var(--sapUiErrorBG);--_ui5_switch_track_disabled_semantic_border_color:var(--sapUiErrorBorder);--_ui5_switch_handle_width:2rem;--_ui5_switch_handle_height:2rem;--_ui5_switch_handle_border_width:1px;--_ui5_switch_handle_border_radius:1rem;--_ui5_switch_handle_bg:var(--sapUiButtonBackgroundDarken2);--_ui5_switch_handle_hover_bg:var(--sapUiButtonHoverBackgroundDarken2);--_ui5_switch_handle_checked_bg:var(--sapUiToggleButtonPressedBackground);--_ui5_switch_handle_checked_border_color:var(--sapUiToggleButtonPressedBorderColor);--_ui5_switch_handle_checked_hover_bg:var(--sapUiToggleButtonPressedHoverBackground);--_ui5_switch_handle_semantic_hover_bg:var(--sapUiErrorBG);--_ui5_switch_handle_semantic_checked_hover_bg:var(--sapUiSuccessBG);--_ui5_switch_handle_semantic_hover_border_color:var(--sapUiErrorBorder);--_ui5_switch_handle_semantic_checked_hover_border_color:var(--sapUiSuccessBorder);--_ui5_switch_handle_compact_width:1.625rem;--_ui5_switch_handle_compact_height:1.625rem;--_ui5_switch_handle_disabled_bg:var(--_ui5_switch_handle_bg);--_ui5_switch_handle_disabled_checked_bg:var(--_ui5_switch_handle_checked_bg);--_ui5_switch_handle_disabled_border_color:var(--sapUiContentForegroundBorderColor);--_ui5_switch_handle_disabled_semantic_checked_bg:var(--sapUiSuccessBGLighten5);--_ui5_switch_handle_disabled_semantic_checked_border_color:var(--sapUiSuccessBorder);--_ui5_switch_handle_disabled_semantic_bg:var(--sapUiErrorBGLighten4);--_ui5_switch_handle_disabled_semantic_border_color:var(--sapUiErrorBorder);--_ui5_switch_text_on_semantic_color:var(--sapUiPositiveElement);--_ui5_switch_text_off_semantic_color:var(--sapUiNegativeElement);--_ui5_switch_text_disabled_color:var(--sapUiBaseText);--_ui5_tc_headeritem_text_selected_color:var(--sapUiSelected);--_ui5_tc_headerItem_positive_selected_border_color:var(--sapUiPositive);--_ui5_tc_headerItem_negative_selected_border_color:var(--sapUiNegative);--_ui5_tc_headerItem_critical_selected_border_color:var(--sapUiCritical);--_ui5_tc_headerItem_neutral_selected_border_color:var(--sapUiNeutral);--_ui5_tc_headerItem_focus_border:1px dotted var(--sapUiContentFocusColor);--_ui5_tc_headerItemSemanticIcon_display:none;--_ui5_tc_headerItemIcon_border:1px solid var(--sapUiHighlight);--_ui5_tc_headerItemIcon_color:var(--sapUiHighlight);--_ui5_tc_headerItemIcon_selected_background:var(--sapUiHighlight);--_ui5_tc_headerItemIcon_selected_color:var(--sapUiGroupContentBackground);--_ui5_tc_headerItemIcon_positive_selected_background:var(--sapUiPositive);--_ui5_tc_headerItemIcon_negative_selected_background:var(--sapUiNegative);--_ui5_tc_headerItemIcon_critical_selected_background:var(--sapUiCritical);--_ui5_tc_headerItemIcon_neutral_selected_background:var(--sapUiNeutral);--_ui5_tc_headerItemIcon_semantic_selected_color:var(--sapUiGroupContentBackground);--_ui5_tc_header_box_shadow:var(--sapUiShadowHeader);--_ui5_tc_header_border_bottom:0.0625rem solid var(--sapUiObjectHeaderBackground);--_ui5_tc_headerItem_color:var(--sapUiContentLabelColor);--_ui5_tc_headerItemContent_border_bottom:0.188rem solid var(--sapUiSelected);--_ui5_tc_overflowItem_default_color:var(--sapUiHighlight);--_ui5_tc_content_border_bottom:0.0625rem solid var(--sapUiObjectHeaderBorderColor);--_ui5_textarea_focus_after_width:1px;--_ui5_textarea_warning_border_style:solid;--_ui5_textarea_warning_border_width:2px;--_ui5_TimelineItem_arrow_size:1.625rem;--_ui5_TimelineItem_bubble_outline_width:0.0625rem;--_ui5_TimelineItem_bubble_outline_top:-0.125rem;--_ui5_TimelineItem_bubble_outline_right:-0.125rem;--_ui5_TimelineItem_bubble_outline_bottom:-0.125rem;--_ui5_TimelineItem_bubble_outline_left:-0.625rem;--_ui5_TimelineItem_bubble_rtl_left_offset:-0.125rem;--_ui5_TimelineItem_bubble_rtl_right_offset:-0.625rem;--_ui5_toggle_button_pressed_focussed:var(--sapUiToggleButtonPressedBorderColor);--_ui5_toggle_button_pressed_focussed_hovered:var(--sapUiToggleButtonPressedBorderColor);--_ui5_toggle_button_pressed_negative_hover:var(--sapUiButtonRejectActiveBackgroundLighten5);--_ui5_toggle_button_pressed_positive_hover:var(--sapUiButtonAcceptActiveBackgroundLighten5);--_ui5_yearpicker_item_border:none;--_ui5_yearpicker_item_margin:1px;--_ui5_yearpicker_item_focus_after_width:calc(100% - 0.375rem);--_ui5_yearpicker_item_focus_after_height:calc(100% - 0.375rem);--_ui5_yearpicker_item_focus_after_border:1px dotted var(--sapUiContentFocusColor);--_ui5_yearpicker_item_focus_after_offset:2px;--_ui5_yearpicker_item_border_radius:0.25rem;--_ui5_yearpicker_item_background_color:var(--sapUiListBackgroundDarken3);--_ui5_yearpicker_item_hover_background_color:var(--sapUiListBackgroundDarken3);--_ui5_yearpicker_item_focus_background_color:var(--sapUiListBackgroundDarken3);--_ui5_yearpicker_item_selected_focus:var(--sapUiSelectedDarken10);--_ui5_calendar_header_arrow_button_border:none;--_ui5_calendar_header_arrow_button_border_radius:0.25rem;--_ui5_calendar_header_middle_button_width:2.5rem;--_ui5_calendar_header_middle_button_flex:1;--_ui5_calendar_header_middle_button_focus_border_radius:0.25rem;--_ui5_calendar_header_middle_button_focus_border:none;--_ui5_calendar_header_middle_button_focus_after_display:block;--_ui5_calendar_header_middle_button_focus_after_width:calc(100% - 0.375rem);--_ui5_calendar_header_middle_button_focus_after_height:calc(100% - 0.375rem);--_ui5_calendar_header_middle_button_focus_after_top_offset:0.125rem;--_ui5_calendar_header_middle_button_focus_after_left_offset:0.125rem;--ui5_table_header_row_outline_width:1px;--ui5_table_row_outline_width:1px;--_ui5_token_background:var(--sapUiButtonBackgroundDarken2);--_ui5_token_border_color:var(--sapUiButtonBackgroundDarken24);--_ui5_token_border_radius:0.25rem;--_ui5_token_text_color:var(--sapUiBaseText);--_ui5_token_icon_color:var(--sapUiContentIconColor);--_ui5_token_hover_border_color:var(--sapUiButtonHoverBorderColorLighten30);--_ui5-multi_combobox_token_margin_top:1px}";

registerThemeProperties("@ui5/webcomponents-theme-base", "sap_fiori_3", fiori3Base);
registerThemeProperties("@ui5/webcomponents", "sap_fiori_3", fiori3);

var iconCss = ":host(:not([hidden])){display:inline-block}:host{width:1rem;height:1rem;color:var(--sapUiContentNonInteractiveIconColor);fill:currentColor;outline:none}:host(:not([dir=ltr])) .ui5-icon-root[dir=rtl]{transform:scale(-1)}.ui5-icon-root{display:flex;transform:scaleY(-1)}";

/**
 * @public
 */
const metadata$1 = {
	tag: "ui5-icon",
	properties: /** @lends sap.ui.webcomponents.main.Icon.prototype */ {

		/**
		 * Defines the source URI of the <code>ui5-icon</code>.
		 * <br><br>
		 * To browse all available icons, see the
		 * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
		 * <br><br>
		 * Example:
		 * <br>
		 * <code>src='sap-icon://add'</code>, <code>src='sap-icon://delete'</code>, <code>src='sap-icon://employee'</code>.
		 *<b> NOTE: This property is about to be removed in the next version! Please use the <code>name</code> property instead.</b>
		 *
		 * @type {string}
		 * @public
		 * @deprecated
		*/
		src: {
			type: String,
		},

		/**
		 * Defines the unique identifier (icon name) of each <code>ui5-icon</code>.
		 * <br><br>
		 * To browse all available icons, see the
		 * <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
		 * <br><br>
		 * Example:
		 * <br>
		 * <code>name='add'</code>, <code>name='delete'</code>, <code>name='employee'</code>.
		 *
		 * @type {string}
		 * @public
		*/
		name: {
			type: String,
		},

		/**
		 * Defines the text alternative of the <code>ui5-icon</code>.
		 * If not provided a default text alternative will be set, if present.
		 * <br><br>
		 * <b>Note:</b> Every icon should have a text alternative in order to
		 * calculate its accessible name.
		 *
		 * @type {string}
		 * @public
		 */
		accessibleName: {
			type: String,
		},

		/**
		 * Defines whether the <code>ui5-icon</code> should have a tooltip.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		showTooltip: {
			type: Boolean,
		},

		/**
		 * @private
		 */
		pathData: {
			type: String,
			noAttribute: true,
		},

		/**
		 * @private
		 */
		accData: {
			type: Object,
			noAttribute: true,
		},
	},
	events: {
	},
};

/**
 * @class
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>ui5-icon</code> component represents an SVG icon.
 * There are two main scenarios how the <code>ui5-icon</code> component is used:
 * as a purely decorative element; or as a visually appealing clickable area in the form of an icon button.
 * <br><br>
 * A large set of built-in icons is available
 * and they can be used by setting the <code>name</code> property on the <code>ui5-icon</code>.
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/Icon.js";</code>
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.main.Icon
 * @extends sap.ui.webcomponents.base.UI5Element
 * @tagname ui5-icon
 * @public
 */
class Icon extends UI5Element {
	constructor() {
		super();
		this.i18nBundle = getI18nBundle("@ui5/webcomponents");
	}

	static get metadata() {
		return metadata$1;
	}

	static get render() {
		return litRender;
	}

	static get template() {
		return block0$1;
	}

	static get styles() {
		return iconCss;
	}

	static async define(...params) {
		this.createGlobalStyle(); // hide all icons until the first icon has rendered (and added the Icon.css)
		await fetchI18nBundle("@ui5/webcomponents");

		super.define(...params);
	}

	static createGlobalStyle() {
		if (!window.ShadyDOM) {
			return;
		}
		const styleElement = document.head.querySelector(`style[data-ui5-icon-global]`);
		if (!styleElement) {
			createStyleInHead(`ui5-icon { display: none !important; }`, { "data-ui5-icon-global": "" });
		}
	}

	static removeGlobalStyle() {
		if (!window.ShadyDOM) {
			return;
		}
		const styleElement = document.head.querySelector(`style[data-ui5-icon-global]`);
		if (styleElement) {
			document.head.removeChild(styleElement);
		}
	}

	async onBeforeRendering() {
		const name = this.name || this.src;
		if (this.src) {
			/* eslint-disable-next-line */
			console.warn(`The src property is about to be depricated in the next version of UI5 Web Components. Please use the name property!`);
		}

		let iconData = getIconDataSync(name);
		if (!iconData) {
			try {
				iconData = await getIconData(name);
			} catch (e) {
				/* eslint-disable-next-line */
				return console.warn(`Required icon is not registered. You can either import the icon as a module in order to use it e.g. "@ui5/webcomponents/dist/icons/${name.replace("sap-icon://", "")}.js", or setup a JSON build step and import "@ui5/webcomponents-icons/dist/json-imports/Icons.js".`);
			}
		}
		this.pathData = iconData.pathData;
		this.accData = iconData.accData;
	}

	get hasIconTooltip() {
		return this.showTooltip && this.accessibleNameText;
	}

	get accessibleNameText() {
		if (this.accessibleName) {
			return this.accessibleName;
		}

		return this.i18nBundle.getText(this.accData);
	}

	get dir() {
		return getRTL$1() ? "rtl" : "ltr";
	}

	async onEnterDOM() {
		setTimeout(() => {
			this.constructor.removeGlobalStyle(); // remove the global style as Icon.css is already in place
		}, 0);
	}
}

Icon.define();

const BUTTON_ARIA_TYPE_ACCEPT = {key: "BUTTON_ARIA_TYPE_ACCEPT", defaultText: "Positive Action"};const BUTTON_ARIA_TYPE_REJECT = {key: "BUTTON_ARIA_TYPE_REJECT", defaultText: "Negative Action"};const BUTTON_ARIA_TYPE_EMPHASIZED = {key: "BUTTON_ARIA_TYPE_EMPHASIZED", defaultText: "Emphasized"};

var buttonCss = ".ui5-hidden-text{position:absolute;clip:rect(1px,1px,1px,1px);user-select:none;left:0;top:0}:host(:not([hidden])){display:inline-block}:host{min-width:var(--_ui5_button_base_min_width);height:var(--_ui5_button_base_height);font-family:var(--sapUiFontFamily);font-size:var(--sapMFontMediumSize);text-shadow:var(--_ui5_button_text_shadow);border-radius:var(--_ui5_button_border_radius);border-width:.0625rem;cursor:pointer;background-color:var(--sapUiButtonBackground);border:1px solid var(--sapUiButtonBorderColor);color:var(--sapUiButtonTextColor);box-sizing:border-box}:host([has-icon]) button[dir=rtl].ui5-button-root .ui5-button-text{margin-right:var(--_ui5_button_base_icon_margin);margin-left:0}:host([has-icon][icon-end]) button[dir=rtl].ui5-button-root .ui5-button-icon{margin-right:var(--_ui5_button_base_icon_margin);margin-left:0}:host([data-ui5-compact-size]) .ui5-button-icon{font-size:1rem}:host([data-ui5-compact-size]){height:var(--_ui5_button_compact_height);min-width:var(--_ui5_button_base_min_compact_width)}:host([data-ui5-compact-size]) .ui5-button-root{padding:0 var(--_ui5_button_compact_padding)}.ui5-button-root{min-width:inherit;cursor:inherit;height:100%;width:100%;box-sizing:border-box;display:flex;justify-content:center;align-items:center;outline:none;padding:0 var(--_ui5_button_base_padding);position:relative;background:transparent;border:none;color:inherit;text-shadow:inherit;font:inherit}:host(:not([active]):hover){background:var(--sapUiButtonHoverBackground)}.ui5-button-icon{font-size:var(--_ui5_button_base_icon_only_font_size);height:0;top:-.5rem;position:relative;color:inherit}:host([icon-end]) .ui5-button-root{flex-direction:row-reverse}:host([icon-end]) .ui5-button-icon{margin-left:var(--_ui5_button_base_icon_margin)}:host([icon-only]) .ui5-button-root{min-width:auto}:host([icon-only]) .ui5-button-text{display:none}.ui5-button-text{outline:none;position:relative}:host([has-icon]) .ui5-button-text{margin-left:var(--_ui5_button_base_icon_margin)}:host([disabled]){opacity:.5;pointer-events:none}:host([focused]){outline:var(--_ui5_button_outline);outline-offset:var(--_ui5_button_outline_offset)}.ui5-button-root::-moz-focus-inner{border:0}bdi{display:flex;justify-content:flex-start;align-items:center}:host([active]:not([disabled])){background-image:none;background-color:var(--sapUiButtonActiveBackground);border-color:var(--_ui5_button_active_border_color);color:var(--sapUiButtonActiveTextColor);text-shadow:none}:host([active]){outline-color:var(--sapUiContentContrastFocusColor)}:host([design=Positive]){background-color:var(--sapUiButtonAcceptBackground);border-color:var(--_ui5_button_positive_border_color);color:var(--sapUiButtonAcceptTextColor);text-shadow:var(--_ui5_button_text_shadow)}:host([design=Positive]:hover){background-color:var(--sapUiButtonAcceptHoverBackground);border-color:var(--_ui5_button_positive_border_hover_color)}:host([design=Positive][active]){background-color:var(--sapUiButtonAcceptActiveBackground);border-color:var(--_ui5_button_positive_border_active_color);color:var(--sapUiButtonActiveTextColor);text-shadow:none}:host([design=Positive][focused]){outline-color:var(--_ui5_button_positive_border_focus_hover_color);border-color:var(--_ui5_button_positive_focus_border_color)}:host([design=Positive][active][focused]){outline-color:var(--sapUiContentContrastFocusColor)}:host([design=Negative]){background-color:var(--sapUiButtonRejectBackground);border-color:var(--sapUiButtonRejectBorderColor);color:var(--sapUiButtonRejectTextColor);text-shadow:var(--_ui5_button_text_shadow)}:host([design=Negative]:hover){background-color:var(--sapUiButtonRejectHoverBackground);border-color:var(--sapUiButtonRejectHoverBorderColor)}:host([design=Negative][focused]){border-color:var(--_ui5_button_negative_focus_border_color);outline-color:var(--_ui5_button_positive_border_focus_hover_color)}:host([design=Negative][active]){background-color:var(--sapUiButtonRejectActiveBackground);border-color:var(--_ui5_button_negative_active_border_color);color:var(--sapUiButtonActiveTextColor);text-shadow:none}:host([design=Negative][active][focused]){outline-color:var(--sapUiContentContrastFocusColor)}:host([design=Emphasized]){background-color:var(--sapUiButtonEmphasizedBackground);border-color:var(--sapUiButtonEmphasizedBorderColor);color:var(--sapUiButtonEmphasizedTextColor);text-shadow:0 0 .125rem var(--sapUiButtonEmphasizedTextShadow);font-weight:var(--_ui5_button_emphasized_font_weight)}:host([design=Emphasized]:not([active]):hover){background-color:var(--sapUiButtonEmphasizedHoverBackground);border-color:var(--sapUiButtonEmphasizedHoverBorderColor)}:host([design=Empasized][active]){background-color:var(--sapUiButtonEmphasizedActiveBackground);border-color:var(--sapUiButtonEmphasizedActiveBorderColor);color:var(--sapUiButtonActiveTextColor);text-shadow:none}:host([design=Emphasized][focused]){outline-color:var(--sapUiContentContrastFocusColor);border-color:var(--_ui5_button_emphasized_focused_border_color)}:host([design=Transparent]){background-color:var(--sapUiButtonLiteBackground);color:var(--sapUiButtonLiteTextColor);text-shadow:var(--_ui5_button_text_shadow);border-color:var(--_ui5_button_transparent_border_color)}:host([design=Transparent]):hover{background-color:var(--sapUiButtonLiteHoverBackground)}:host([design=Transparent][active]){background-color:var(--sapUiButtonLiteActiveBackground);color:var(--sapUiButtonActiveTextColor);text-shadow:none}:host([design=Transparent]:not([active]):hover){border-color:var(--_ui5_button_transparent_hover_border_color)}ui5-button[focused]{outline:none}ui5-button[focused] .ui5-button-root{position:relative}ui5-button[focused] .ui5-button-root:after{content:\"\";position:absolute;border-width:1px;border-style:dotted;border-color:var(--_ui5_button_focus_color);top:var(--_ui5_button_focus_offset);bottom:var(--_ui5_button_focus_offset);left:var(--_ui5_button_focus_offset);right:var(--_ui5_button_focus_offset)}ui5-button[active] .ui5-button-root:after{border-color:var(--sapUiContentContrastFocusColor)}ui5-button[design=Positive][focused] .ui5-button-root:after{border-color:var(--_ui5_button_positive_border_focus_hover_color)}ui5-button[design=Positive][active][focused] .ui5-button-root:after{border-color:var(--sapUiContentContrastFocusColor)}ui5-button[design=Negative][focused] .ui5-button-root:after{border-color:var(--_ui5_button_positive_border_focus_hover_color)}ui5-button[design=Negative][active][focused] .ui5-button-root:after{border-color:var(--sapUiContentContrastFocusColor)}ui5-button[design=Emphasized][focused] .ui5-button-root:after{border-color:var(--sapUiContentContrastFocusColor)}ui5-button ui5-icon.ui5-button-icon{height:1rem;top:0}";

/**
 * @public
 */
const metadata$2 = {
	tag: "ui5-button",
	properties: /** @lends sap.ui.webcomponents.main.Button.prototype */ {

		/**
		 * Defines the <code>ui5-button</code> design.
		 * <br><br>
		 * <b>Note:</b> Available options are "Default", "Emphasized", "Positive",
		 * "Negative", and "Transparent".
		 *
		 * @type {ButtonDesign}
		 * @defaultvalue "Default"
		 * @public
		 */
		design: {
			type: ButtonDesign,
			defaultValue: ButtonDesign.Default,
		},

		/**
		 * Defines whether the <code>ui5-button</code> is disabled
		 * (default is set to <code>false</code>).
		 * A disabled <code>ui5-button</code> can't be pressed or
		 * focused, and it is not in the tab chain.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		disabled: {
			type: Boolean,
		},

		/**
		 * Defines the icon to be displayed as graphical element within the <code>ui5-button</code>.
		 * The SAP-icons font provides numerous options.
		 * <br><br>
		 * Example:
		 * <br>
		 * <pre>ui5-button icon="palette"</pre>
		 *
		 * See all the available icons in the <ui5-link target="_blank" href="https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/iconExplorer/webapp/index.html" class="api-table-content-cell-link">Icon Explorer</ui5-link>.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 */
		icon: {
			type: String,
		},

		/**
		 * Defines whether the icon should be displayed after the <code>ui5-button</code> text.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		iconEnd: {
			type: Boolean,
		},

		/**
		 * When set to <code>true</code>, the <code>ui5-button</code> will
		 * automatically submit the nearest form element upon <code>press</code>.
		 *
		 * <b>Important:</b> For the <code>submits</code> property to have effect, you must add the following import to your project:
		 * <code>import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";</code>
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		submits: {
			type: Boolean,
		},

		/**
		 * Used to switch the active state (pressed or not) of the <code>ui5-button</code>.
		 * @private
		 */
		active: {
			type: Boolean,
		},

		/**
		 * Defines if a content has been added to the default slot
		 * @private
		 */
		iconOnly: {
			type: Boolean,
		},

		/**
		 * Indicates if the elements is on focus
		 * @private
		 */
		focused: {
			type: Boolean,
		},

		/**
		 * Indicates if the elements has a slotted icon
		 * @private
		 */
		hasIcon: {
			type: Boolean,
		},

		/**
		 * Indicates if the element if focusable
		 * @private
		 */
		nonFocusable: {
			type: Boolean,
		},

		_iconSettings: {
			type: Object,
		},
	},
	slots: /** @lends sap.ui.webcomponents.main.Button.prototype */ {
		/**
		 * Defines the text of the <code>ui5-button</code>.
		 * <br><b>Note:</b> Аlthough this slot accepts HTML Elements, it is strongly recommended that you only use text in order to preserve the intended design.
		 *
		 * @type {Node[]}
		 * @slot
		 * @public
		 */
		"default": {
			type: Node,
		},
	},
	events: /** @lends sap.ui.webcomponents.main.Button.prototype */ {

		/**
		 * Fired when the <code>ui5-button</code> is activated either with a
		 * mouse/tap or by using the Enter or Space key.
		 * <br><br>
		 * <b>Note:</b> The event will not be fired if the <code>disabled</code>
		 * property is set to <code>true</code>.
		 *
		 * @event
		 * @public
		 */
		click: {},
	},
};

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 *
 * The <code>ui5-button</code> component represents a simple push button.
 * It enables users to trigger actions by clicking or tapping the <code>ui5-button</code>, or by pressing
 * certain keyboard keys, such as Enter.
 *
 *
 * <h3>Usage</h3>
 *
 * For the <code>ui5-button</code> UI, you can define text, icon, or both. You can also specify
 * whether the text or the icon is displayed first.
 * <br><br>
 * You can choose from a set of predefined types that offer different
 * styling to correspond to the triggered action.
 * <br><br>
 * You can set the <code>ui5-button</code> as enabled or disabled. An enabled
 * <code>ui5-button</code> can be pressed by clicking or tapping it. The button changes
 * its style to provide visual feedback to the user that it is pressed or hovered over with
 * the mouse cursor. A disabled <code>ui5-button</code> appears inactive and cannot be pressed.
 *
 * <h3>ES6 Module Import</h3>
 *
 * <code>import "@ui5/webcomponents/dist/Button";</code>
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.main.Button
 * @extends UI5Element
 * @tagname ui5-button
 * @public
 */
class Button extends UI5Element {
	static get metadata() {
		return metadata$2;
	}

	static get styles() {
		return buttonCss;
	}

	static get render() {
		return litRender;
	}

	static get template() {
		return block0;
	}

	constructor() {
		super();

		this._deactivate = () => {
			if (this.active) {
				this.active = false;
			}
		};

		this.i18nBundle = getI18nBundle("@ui5/webcomponents");
	}

	onBeforeRendering() {
		const FormSupport = getFeature("FormSupport");
		if (this.submits && !FormSupport) {
			console.warn(`In order for the "submits" property to have effect, you should also: import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";`); // eslint-disable-line
		}

		this.iconOnly = !this.childNodes.length;
		this.hasIcon = !!this.icon;
	}

	onEnterDOM() {
		document.addEventListener("mouseup", this._deactivate);
	}

	onExitDOM() {
		document.removeEventListener("mouseup", this._deactivate);
	}

	_onclick(event) {
		event.isMarked = "button";
		const FormSupport = getFeature("FormSupport");
		if (FormSupport) {
			FormSupport.triggerFormSubmit(this);
		}
	}

	_onmousedown(event) {
		event.isMarked = "button";
		this.active = true;
	}

	_onmouseup(event) {
		event.isMarked = "button";
	}

	_onkeydown(event) {
		if (isSpace(event) || isEnter(event)) {
			this.active = true;
		}
	}

	_onkeyup(event) {
		if (isSpace(event) || isEnter(event)) {
			this.active = false;
		}
	}

	_onfocusout(_event) {
		this.active = false;
		this.focused = false;
	}

	_onfocusin() {
		this.focused = true;
	}

	get rtl() {
		return getRTL$1() ? "rtl" : undefined;
	}

	get hasButtonType() {
		return this.design !== ButtonDesign.Default && this.design !== ButtonDesign.Transparent;
	}

	get accInfo() {
		return {
			"ariaExpanded": this._buttonAccInfo && this._buttonAccInfo.ariaExpanded,
			"ariaControls": this._buttonAccInfo && this._buttonAccInfo.ariaControls,
			"title": this._buttonAccInfo && this._buttonAccInfo.title,
		};
	}

	static typeTextMappings() {
		return {
			"Positive": BUTTON_ARIA_TYPE_ACCEPT,
			"Negative": BUTTON_ARIA_TYPE_REJECT,
			"Emphasized": BUTTON_ARIA_TYPE_EMPHASIZED,
		};
	}

	get buttonTypeText() {
		return this.i18nBundle.getText(Button.typeTextMappings()[this.design]);
	}

	get tabIndexValue() {
		return this.nonFocusable ? "-1" : "0";
	}

	static async define(...params) {
		await Promise.all([
			Icon.define(),
			fetchI18nBundle("@ui5/webcomponents"),
		]);

		super.define(...params);
	}
}

Button.define();

export default Button;
