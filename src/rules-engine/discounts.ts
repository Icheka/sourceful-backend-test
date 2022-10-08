import { Engine, RuleProperties } from 'json-rules-engine';

const pineappleDiscount: RuleProperties = {
    conditions: {
        any: [{
            fact: 'productName',
            operator: 'equal',
            value: 'Pineapple'
        }]
    },
    event: {
        type: 'pineapple-discount',
        params: {
            message: '10% off Pineapple',
            discountPercentage: 10
        }
    }
}

const twoApplesOneStrawberry: RuleProperties = {
    conditions: {
        all: [
            {
                fact: 'counts',
                operator: 'greaterThanInclusive',
                value: 2,
                path: '$.Apple'
            },
            {
                fact: 'counts',
                operator: 'greaterThanInclusive',
                value: 1,
                path: '$.Strawberry'
            },
        ]
    },
    event: {
        type: '2-apples-strawberry-discount',
        params: {
            message: '50% off Strawberry',
            discountPercentage: 50
        }
    }
}

export const SingleItemDiscountsEngine = new Engine();
SingleItemDiscountsEngine.addRule(pineappleDiscount);

export const MultiItemDiscountsEngine = new Engine();
MultiItemDiscountsEngine.addRule(twoApplesOneStrawberry);