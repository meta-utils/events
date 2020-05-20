# events
[![Build Status](https://travis-ci.org/meta-utils/events.svg?branch=master)](https://travis-ci.org/meta-utils/events)

This package contains pre-implemented events that you can just glue to your existing class like a breeze.

```typescript
class MyClass extends EventTarget {}
let myInstance = new MyClass();

myInstance.addEventListener('load', () => console.log('hooray!'));
myInstance.dispatchEvent('load'); // hooray!
```

# Key features
* Extensive type checking
* Standards compilant [[1]](https://github.com/Microsoft/TypeScript/blob/master/src/lib/dom.generated.d.ts#L5379)
* Can be both `extends`'ed and `implements`'ed
* Can be used in both TypeScript and pure JavaScript
* Support for one-time events using promises


# One-time events
Sometimes you need to wait until a component is ready before you can continue in your code. Apart from the classic `addEventListener`, you can leverage the promisified method `once` which lets you keep your code clean and flat:
```javascript
class Component extends EventTarget {
    constructor() {
        doThings();
        this.dispatchEvent('loaded', { status: 'ready' });
    }
}

const comp = new Component();
const event = await comp.once('loaded');
event.status === 'ready'
```

# Implementing
Sometimes you need your class to inherit from something different than `EventTarget`. Then you can use the static method factories which are shipped with this library. In JavaScript you can do it like this:
```javascript
class MyClass extends DifferentClass {}

MyClass.prototype.addEventListener = EventTarget.addEventListener();
MyClass.prototype.removeEventListener = EventTarget.removeEventListener();
MyClass.prototype.dispatchEvent = EventTarget.dispatchEvent();
MyClass.prototype.once = EventTarget.once();
```
And in TypeScript like this:
```typescript
class MyClass
extends DifferentClass
implements EventTarget<MyEvents>
{
    public addEventListener = EventTarget.addEventListener<MyEvents>();
    public removeEventListener = EventTarget.removeEventListener<MyEvents>();
    public dispatchEvent = EventTarget.dispatchEvent<MyEvent>();
    public once = EventTarget.once<MyEvent>();
}
```


# Type checking options
If you use TypeScript, you can choose from three type checking options.

### Minimum checking
If you use the non-generic `EventTarget`, you'll get all the functionality without having to worry about any typing at all.
```typescript
class Person extends EventTarget
{
    kill()
    {
        let options = { somethingOther: 42 };
        let eventName: string = 'died';
        this.dispatchEvent(eventName, options);
    }
}

let john = new Person();
john.addEventListener('anything you want', (e) => {
    e.target; // EventTarget
    e.timeStamp // number
    e.somethingOther // any
});
```

### Loose checking
If you want to only allow for certain events, you can pass a union of string literals as the type argument of `EventTarget` to make something like `EventTarget<'load'|'unload'>`.
```typescript
class Person extends EventTarget<'died'>
{
    kill()
    {
        let options = { somethingOther: 42 };

        this.dispatchEvent('died', options);
        this.dispatchEvent('was born', options); // Error
    }
}

let jane = new Person();
myInstance.addEventListener('died', (e) => {
    e.name; // 'died'
    e.target; // EventTarget<'died'>
    e.somethingOther // any
});
```

### Strict checking
If you want to get maximum type safety and cool editor auto-completion, you should describe the events with an interface and then pass the interface to `EventTarget`.
```typescript
interface PersonEvents
{
    died: {};
    killed: { byWhom: Person };
}

class Person extends EventTarget<PersonEvents>
{
    kill(murderer: Person)
    {
        this.dispatchEvent('died');
        this.dispatchEvent('killed', { byWhom: murderer });
    }

    letDie()
    {
        this.dispatchEvent('died');
    }
}

let alex = new Person();

alex.addEventListener('killed', (e) => {
    e.name; // 'killed'
    e.target; // still only EventTarget, not Person, but I'm working on it
    e.byWhom; // Person
});

alex.addEventListener('died', (e) => {
    e.byWhom; // error
});
```
