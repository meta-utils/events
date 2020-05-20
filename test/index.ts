import { expect } from 'chai';
import { describe, it } from 'mocha';

import {
    Event,
    LooseEvent,
    EventTarget,
} from '../src';

type Equals<T, U> = false extends (T extends U ? U extends T ? true : false : false) ? false : true;

function wait(ms: number): Promise<void>
{
    return new Promise(res => {
        //@ts-ignore
        setTimeout(res, ms)
    })
}

// tslint:disable:no-unused-expression





interface HouseEvents
{
    visitor: { who: string };
    mail: { count: number, isPromo: boolean };
}

interface IHouse extends EventTarget<HouseEvents>
{
    visit(who: string): void;
    mail(letters: any[], promo: any[]): void;
}

function testHouse(house: IHouse)
{
    let visitorRun = false;
    let mailRun = false;

    house.addEventListener('visitor', (e) => {
        expect(e.name).to.equal('visitor');
        expect(e.target).to.equal(house);
        expect(e.who).to.equal('mum');

        visitorRun = true;
    });

    house.addEventListener('mail', (e) => {
        expect(e.name).to.equal('mail');
        expect(e.target).to.equal(house);
        expect(e.count).to.equal(2);
        expect(e.isPromo).to.be.true;

        mailRun = true;
    });

    house.visit('mum');
    expect(visitorRun).to.be.true;

    house.mail(['letter from Hogwarts'], ['TV Products']);
    expect(visitorRun).to.be.true;


    const neverRun = () => { throw new Error("This shouldn't have run"); };

    house.addEventListener('visitor', neverRun);
    house.removeEventListener('visitor', neverRun);
    house.visit('mum');
}





describe('Event library', () => {

    it('should be extensible', () => {

        class House extends EventTarget<HouseEvents>
        {
            public visit(who: string): void
            {
                this.dispatchEvent('visitor', { who });
            }

            public mail(letters: any[], promo: any[])
            {
                this.dispatchEvent('mail', {
                    count: letters.length + promo.length,
                    isPromo: !!promo.length,
                });
            }
        }

        testHouse( new House() );

    });


    it('should be implementable', () => {

        class House implements EventTarget<HouseEvents>
        {
            public addEventListener = EventTarget.addEventListener<HouseEvents>();
            public removeEventListener = EventTarget.removeEventListener<HouseEvents>();
            public dispatchEvent = EventTarget.dispatchEvent<HouseEvents>();
            public once = EventTarget.once<HouseEvents>();

            public visit(who: string): void
            {
                this.dispatchEvent('visitor', { who });
            }

            public mail(letters: any[], promo: any[])
            {
                this.dispatchEvent('mail', {
                    count: letters.length + promo.length,
                    isPromo: !!promo.length,
                });
            }
        }

        testHouse( new House() );

    });


    it('should not modify the object', () => {

        const obj = Object.create(null);

        let run = false;

        EventTarget.prototype.addEventListener.call(obj, 'click', () => run = true);
        EventTarget.prototype.dispatchEvent.call(obj, 'click', undefined);

        expect(run).to.be.true;
        expect(obj).to.be.empty;
        expect(Object.getPrototypeOf(obj)).to.be.null;
        expect(Object.getOwnPropertyNames(obj)).to.be.empty;
        expect(Object.getOwnPropertySymbols(obj)).to.be.empty;

    });


    it('should have strict type checking', () => {

        interface Dictionary
        {
            click: {btn: number};
            load: {src: string};
        }

        class LooseChecking
        extends EventTarget<keyof Dictionary> {}

        class StrictChecking
        extends EventTarget<Dictionary> {}

        const loose = new LooseChecking();
        const strict = new StrictChecking();


        loose.addEventListener('click', (e) => {

            const tt1: Equals<typeof e.something, any> = true;
            const tt2: Equals<typeof e.something & null, any> = true;

        });


        const t1: Equals<
            typeof loose.addEventListener,
            {
                (this: EventTarget<'click'>, name: 'click', fn: (e: LooseEvent<'click'>) => void): void;
                (this: EventTarget<'load'>, name: 'load', fn: (e: LooseEvent<'load'>) => void): void;
            }
        > = true;

        const t2: Equals<
            typeof strict.addEventListener,
            {
                (this: EventTarget<Dictionary>, name: 'click', fn: (e: Event<'click'> & {btn: number}) => void): void;
                (this: EventTarget<Dictionary>, name: 'load', fn: (e: Event<'load'> & {src: string}) => void): void;
            }
        > = true;


        const t3: Equals<
            typeof loose.removeEventListener,
            typeof loose.addEventListener
        > = true;

        const t4: Equals<
            typeof strict.removeEventListener,
            typeof strict.addEventListener
        > = true;


        const t5: Equals<
            typeof loose.dispatchEvent,
            {
                (this: EventTarget<'click'>, name: 'click', data?: Event.Params): void;
                (this: EventTarget<'load'>, name: 'load', data?: Event.Params): void;
            }
        > = true;

        const t6: Equals<
            typeof strict.dispatchEvent,
            {
                (this: EventTarget<Dictionary>, name: 'click', data: {btn: number} & Partial<Event.Params>): void;
                (this: EventTarget<Dictionary>, name: 'load', data: {src: string} & Partial<Event.Params>): void;
            }
        > = true;

        const t7: Equals<
            typeof loose.once,
            {
                (this: EventTarget<'click'>, name: 'click'): Promise<LooseEvent<'click'>>;
                (this: EventTarget<'load'>, name: 'load'): Promise<LooseEvent<'load'>>;
            }
        > = true;

        const t8: Equals<
            typeof strict.once,
            {
                (this: EventTarget<Dictionary>, name: 'click'): Promise<Event<'click'> & {btn: number}>;
                (this: EventTarget<Dictionary>, name: 'load'): Promise<Event<'load'> & {src: string}>;
            }
        > = true;

    });


    it('should allow for private dispatchEvent', () => {

        class Person extends EventTarget<'died'>
        {
            public dispatchEvent = (...args: any[]) => { throw new TypeError('You cannot dispatch events yourself.'); };
            private internalDispatch = EventTarget.dispatchEvent<'died'>();

            public kill = () => this.internalDispatch('died');
        }

        let run = false;
        const person = new Person();
        person.addEventListener('died', () => run = true);

        expect(() => person.dispatchEvent('died')).to.throw;

        person.kill();

        expect(run).to.be.true;

    });


    it('should support one-time event awaits', async () => {

        interface Dictionary
        {
            click: {btn: number};
            load: {src: string};
        }

        class Target
        extends EventTarget<Dictionary> {}

        const target = new Target();

        const promise = (async () => {
            const c = await target.once('click')
            expect(c).to.deep.equal({ target, source: target, name: 'click', btn: 42, timeStamp: c.timeStamp, ...Event.prototype })

            const a = await Promise.all([ target.once('load'), target.once('click') ])

            expect(a).to.deep.equal([
                { target, source: target, name: 'load', src: 'foo', timeStamp: a[0].timeStamp, ...Event.prototype  },
                { target, source: target, name: 'click', btn: 69, timeStamp: a[1].timeStamp, ...Event.prototype  }
            ])
        })()

        target.dispatchEvent('click', { btn: 42 })

        await wait(0) // let the other once's register

        target.dispatchEvent('click', { btn: 69 })
        target.dispatchEvent('load', { src: 'foo' })

        await promise
    });

});
