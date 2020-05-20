import { UnionToIntersection } from '@meta-utils/types';


abstract class EventParams
{
    public source: EventSource;
    public target: EventTarget;
}

/**
 * The object bearing information about the event that is passed as an argument to the callback.
 * @template EventName - name of the event
 */
export class Event<EventName extends string = string> extends EventParams
{
    public name: EventName;
    public timeStamp: number;

    constructor(name: EventName, params?: Event.Params)
    {
        super();
        Object.assign(this, params);

        this.name = name;
        this.timeStamp = Date.now();
    }
}

/**
 * Event but all unknown properties are `any`.
 * @template EventName - name of the event
 */
export interface LooseEvent<EventName extends string = string> extends Event<EventName>
{
    [key: string]: any;
}

export namespace Event
{
    export interface Target extends EventTarget {}
    export interface Params extends EventParams {}
}

interface EventSource {}





export class EventTarget<T extends string | object = string>
{
    // ! Method types

    /**
     * Appends an event listener for events whose type attribute value is type.
     * The callback argument sets the callback that will be invoked when the event is dispatched.
     */
    public addEventListener: UnionToIntersection<
        T extends string
        ? (this: EventTarget<T>, name: T, callback: (event: LooseEvent<T>) => void) => void
        : (
            {
                [K in keyof T & string]:
                (this: EventTarget<T>, name: K, callback: (event: Event<K> & T[K]) => void) => void
            }
        )[keyof T & string]
    >;

    /**
     * Removes the event listener in target's event listener list with the same type and callback.
     */
    public removeEventListener: UnionToIntersection<
        T extends string
        ? (this: EventTarget<T>, name: T, callback: (event: LooseEvent<T>) => void) => void
        : (
            {
                [K in keyof T & string]:
                (this: EventTarget<T>, name: K, callback: (event: Event<K> & T[K]) => void) => void
            }
        )[keyof T & string]
    >;

    /**
     * Dispatches a synthetic event event to target.
     */
    public dispatchEvent: UnionToIntersection<
        T extends string
        ? (this: EventTarget<T>, name: T, data?: Event.Params) => void
        : (
            {
                [K in keyof T & string]:
                (this: EventTarget<T>, name: K, data: T[K] & Partial<EventParams>) => void
            }
        )[keyof T & string]
    >;


    /**
     * Registers a one-time event listener for the specified event and returns a promise
     * that will be fulfilled once the event fires.
     */
    public once: UnionToIntersection<
        T extends string
        ? (this: EventTarget<T>, name: T) => Promise<LooseEvent<T>>
        : (
            {
                [K in keyof T & string]:
                (this: EventTarget<T>, name: K) => Promise<Event<K> & T[K]>
            }
        )[keyof T & string]
    >;



    // ! Method factories

    /** Factory for addEventListener */
    public static addEventListener<
        T extends string | object = string
    >(): EventTarget<T>['addEventListener']
    {
        return EventTarget.prototype.addEventListener as any;
    }

    /** Factory for removeEventListener */
    public static removeEventListener<
        T extends string | object = string
    >(): EventTarget<T>['removeEventListener']
    {
        return EventTarget.prototype.removeEventListener as any;
    }

    /** Factory for dispatchEvent */
    public static dispatchEvent<
        T extends string | object = string
    >(): EventTarget<T>['dispatchEvent']
    {
        return EventTarget.prototype.dispatchEvent as any;
    }

    /** Factory for once */
    public static once<
        T extends string | object = string
    >(): EventTarget<T>['once']
    {
        return EventTarget.prototype.once as any;
    }
}


EventTarget.prototype =
{
    ...EventTarget.prototype,

    // ! Method implementation

    /**
     * Appends an event listener for events whose type attribute value is type.
     * The callback argument sets the callback that will be invoked when the event is dispatched.
     */
    addEventListener(this: EventTarget<any>, name: string, callback: (event: Event<string>) => void)
    {
        accessCallbacks(this, name).add(callback);
    },

    /**
     * Removes the event listener in target's event listener list with the same type and callback.
     */
    removeEventListener(this: EventTarget<any>, name: string, callback: (event: Event<string>) => void)
    {
        accessCallbacks(this, name).delete(callback);
    },

    /**
     * Dispatches a synthetic event event to target.
     */
    dispatchEvent(this: EventTarget<any>, name: string, event?: Partial<Event.Params>)
    {
        const params = { target: this, source: this, ...event};

        for (const fn of accessCallbacks(this, name))
        {
            fn(new Event(name, params));
        }
    },

    /**
     * Registers a one-time event listener for the specified event and returns a promise
     * that will be fulfilled once the event fires.
     */
    once(this: EventTarget<any>, name: string)
    {
        return new Promise<any>(res => {
            const listener = (...props: any[]) => {
                this.removeEventListener(name, listener);
                res(...props)
            }

            this.addEventListener(name, listener)
        });
    },
};



const eventDatabase = new WeakMap<object, Map<string, Set<(data: Event) => void>>>();

function accessCallbacks(obj: object, name: string)
{
    let objectDb = eventDatabase.get(obj);

    if (!objectDb)
    {
        objectDb = new Map();
        eventDatabase.set(obj, objectDb);
    }

    let callbackSet = objectDb.get(name);

    if (!callbackSet)
    {
        callbackSet = new Set();
        objectDb.set(name, callbackSet);
    }

    return callbackSet;
}
