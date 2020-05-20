import { UnionToIntersection } from '@meta-utils/types';
declare abstract class EventParams {
    source: EventSource;
    target: EventTarget;
}
/**
 * The object bearing information about the event that is passed as an argument to the callback.
 * @template EventName - name of the event
 */
export declare class Event<EventName extends string = string> extends EventParams {
    name: EventName;
    timeStamp: number;
    constructor(name: EventName, params?: Event.Params);
}
/**
 * Event but all unknown properties are `any`.
 * @template EventName - name of the event
 */
export interface LooseEvent<EventName extends string = string> extends Event<EventName> {
    [key: string]: any;
}
export declare namespace Event {
    interface Target extends EventTarget {
    }
    interface Params extends EventParams {
    }
}
interface EventSource {
}
export declare class EventTarget<T extends string | object = string> {
    /**
     * Appends an event listener for events whose type attribute value is type.
     * The callback argument sets the callback that will be invoked when the event is dispatched.
     */
    addEventListener: UnionToIntersection<T extends string ? (this: EventTarget<T>, name: T, callback: (event: LooseEvent<T>) => void) => void : ({
        [K in keyof T & string]: (this: EventTarget<T>, name: K, callback: (event: Event<K> & T[K]) => void) => void;
    })[keyof T & string]>;
    /**
     * Removes the event listener in target's event listener list with the same type and callback.
     */
    removeEventListener: UnionToIntersection<T extends string ? (this: EventTarget<T>, name: T, callback: (event: LooseEvent<T>) => void) => void : ({
        [K in keyof T & string]: (this: EventTarget<T>, name: K, callback: (event: Event<K> & T[K]) => void) => void;
    })[keyof T & string]>;
    /**
     * Dispatches a synthetic event event to target.
     */
    dispatchEvent: UnionToIntersection<T extends string ? (this: EventTarget<T>, name: T, data?: Event.Params) => void : ({
        [K in keyof T & string]: (this: EventTarget<T>, name: K, data: T[K] & Partial<EventParams>) => void;
    })[keyof T & string]>;
    /**
     * Registers a one-time event listener for the specified event and returns a promise
     * that will be fulfilled once the event fires.
     */
    once: UnionToIntersection<T extends string ? (this: EventTarget<T>, name: T) => Promise<LooseEvent<T>> : ({
        [K in keyof T & string]: (this: EventTarget<T>, name: K) => Promise<Event<K> & T[K]>;
    })[keyof T & string]>;
    /** Factory for addEventListener */
    static addEventListener<T extends string | object = string>(): EventTarget<T>['addEventListener'];
    /** Factory for removeEventListener */
    static removeEventListener<T extends string | object = string>(): EventTarget<T>['removeEventListener'];
    /** Factory for dispatchEvent */
    static dispatchEvent<T extends string | object = string>(): EventTarget<T>['dispatchEvent'];
    /** Factory for once */
    static once<T extends string | object = string>(): EventTarget<T>['once'];
}
export {};
//# sourceMappingURL=index.d.ts.map