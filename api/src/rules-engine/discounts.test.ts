import { Event } from 'json-rules-engine';

import { MultiItemDiscountsEngine, SingleItemDiscountsEngine } from './discounts';

const runSingleItemDiscountFact = async (productName: string) => {
    const { events } = await SingleItemDiscountsEngine
        .run({ productName });
    return events;
}

const runMultiItemDiscountFact = async (counts: Record<string, number>) => {
    const { events } = await MultiItemDiscountsEngine
        .run({ counts });
    return events;
}

const runEventExpectations = (events: Array<Event>, {
    eventsLength, discount, message, type
}: {
    eventsLength: number;
    type?: string;
    message?: string;
    discount?: number;
}) => {
    expect(events.length).toBe(eventsLength);
        
    if (events.length > 0) {
        const event = events[0];
        expect(event.type).toBe(type);
        
        const { message, discountPercentage } = event.params as any;
        expect(message).toBe(message);
        expect(discountPercentage).toBe(discount);
    }
}

test('SingleItemDiscountsEngine', async () => {
    type TRule = {
        productName: string;
        eventsLength: number;
        type?: string;
        message?: string;
        discount?: number;
    }
    const products: Array<TRule> = [
        {
            eventsLength: 1,
            productName: 'Pineapple',
            discount: 10,
            message: '10% off Pineapple',
            type: 'pineapple-discount'
        },{
            eventsLength: 0,
            productName: 'Apple',
        }
    ];

    for (const { productName, ...rest } of products) {
        const events = await runSingleItemDiscountFact(productName);
        runEventExpectations(events, rest);
    }
});

test('MultiItemDiscountsEngine', async () => {
    type TRule = {
        counts: Record<string, number>;
        eventsLength: number;
        discount?: number;
        message?: string;
        type?: string;
    }

    const rules: Array<TRule> = [
        // assert 2-apples-strawberry-discount works
        { counts: {Apple: 3, Strawberry: 1}, eventsLength: 1, discount: 50, message: '50% off Strawberry', type: '2-apples-strawberry-discount' },
        // assert rules engine not 'tricked' by 'count' having Apple and Strawberry, but not in sufficient quantities
        { counts: {Apple: 1, Strawberry: 1}, eventsLength: 0 }
    ];

    for (const {counts, ...rest} of rules) {
        const events = await runMultiItemDiscountFact(counts);
        runEventExpectations(events, rest);
    }
});