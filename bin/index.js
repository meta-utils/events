"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var EventParams = /** @class */ (function () {
    function EventParams() {
    }
    return EventParams;
}());
/**
 * The object bearing information about the event that is passed as an argument to the callback.
 * @template EventName - name of the event
 */
var Event = /** @class */ (function (_super) {
    __extends(Event, _super);
    function Event(name, params) {
        var _this = _super.call(this) || this;
        Object.assign(_this, params);
        _this.name = name;
        _this.timeStamp = Date.now();
        return _this;
    }
    return Event;
}(EventParams));
exports.Event = Event;
var EventTarget = /** @class */ (function () {
    function EventTarget() {
    }
    // ! Method factories
    /** Factory for addEventListener */
    EventTarget.addEventListener = function () {
        return EventTarget.prototype.addEventListener;
    };
    /** Factory for removeEventListener */
    EventTarget.removeEventListener = function () {
        return EventTarget.prototype.removeEventListener;
    };
    /** Factory for dispatchEvent */
    EventTarget.dispatchEvent = function () {
        return EventTarget.prototype.dispatchEvent;
    };
    /** Factory for once */
    EventTarget.once = function () {
        return EventTarget.prototype.once;
    };
    return EventTarget;
}());
exports.EventTarget = EventTarget;
EventTarget.prototype = __assign(__assign({}, EventTarget.prototype), { 
    // ! Method implementation
    /**
     * Appends an event listener for events whose type attribute value is type.
     * The callback argument sets the callback that will be invoked when the event is dispatched.
     */
    addEventListener: function (name, callback) {
        accessCallbacks(this, name).add(callback);
    },
    /**
     * Removes the event listener in target's event listener list with the same type and callback.
     */
    removeEventListener: function (name, callback) {
        accessCallbacks(this, name).delete(callback);
    },
    /**
     * Dispatches a synthetic event event to target.
     */
    dispatchEvent: function (name, event) {
        var e_1, _a;
        var params = __assign({ target: this, source: this }, event);
        try {
            for (var _b = __values(accessCallbacks(this, name)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var fn = _c.value;
                fn(new Event(name, params));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    },
    /**
     * Registers a one-time event listener for the specified event and returns a promise
     * that will be fulfilled once the event fires.
     */
    once: function (name) {
        var _this = this;
        return new Promise(function (res) {
            var listener = function () {
                var props = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    props[_i] = arguments[_i];
                }
                _this.removeEventListener(name, listener);
                res.apply(void 0, __spread(props));
            };
            _this.addEventListener(name, listener);
        });
    } });
var eventDatabase = new WeakMap();
function accessCallbacks(obj, name) {
    var objectDb = eventDatabase.get(obj);
    if (!objectDb) {
        objectDb = new Map();
        eventDatabase.set(obj, objectDb);
    }
    var callbackSet = objectDb.get(name);
    if (!callbackSet) {
        callbackSet = new Set();
        objectDb.set(name, callbackSet);
    }
    return callbackSet;
}
