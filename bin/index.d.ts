import { UnionToIntersection } from '@meta-utils/types';
abstract class EventParams {
    source: EventSource;
    target: EventTarget;
}
/**
 * The object bearing information about the event that is passed as an argument to the callback.
 * @template T - name of the event
 */
export declare class Event<T extends string = string> extends EventParams {
    name: T;
    timeStamp: number;
    constructor(name: T, params?: Event.Params);
}
/**
 * Event but all unknown properties are `any`.
 * @template T - name of the event
 */
export interface LooseEvent<T extends string = string> extends Event<T> {
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
declare type EventDictionary<T extends string = string> = string extends T ? never : {
    [K in T]: {};
};
export declare class EventTarget<T extends string | EventDictionary<T extends string ? string : keyof T> = string> {
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
    /** Factory for addEventListener */
    static addEventListener<T extends string | EventDictionary<T extends string ? string : keyof T> = string>(): EventTarget<T>['addEventListener'];
    /** Factory for removeEventListener */
    static removeEventListener<T extends string | EventDictionary<T extends string ? string : keyof T> = string>(): EventTarget<T>['removeEventListener'];
    /** Factory for dispatchEvent */
    static dispatchEvent<T extends string | EventDictionary<T extends string ? string : keyof T> = string>(): EventTarget<T>['dispatchEvent'];
}
export {};
//# sourceMappingURL=index.d.ts.map