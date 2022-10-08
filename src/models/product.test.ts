import { findProduct, processProductBill, processProductsBill, Product, removeProductFromList, TBill } from './product';

test('findProduct', () => {
    type TIteration = {
        query: string;
        resultUndefined: boolean;
    }
    const iters: Array<TIteration> = [
        { query: 'Apple', resultUndefined: false },
        { query: 'Orange', resultUndefined: false },
        { query: 'Banana', resultUndefined: true },
    ];

    for (const {query, resultUndefined} of iters) {
        const result = findProduct(query);
        expect((result === undefined && resultUndefined) || (result !== undefined && !resultUndefined)).toBe(true);
    }
});

test('processProductBill', () => {
    const params = {
        product: new Product('Kiwi', 10, 10),
        opts: {
            subTotal: 0,
            discountPercentage: 10
        }
    }
    const {discount, subTotal} = processProductBill(params.product, params.opts);
    
    expect(discount).toBe(1);
    expect(subTotal).toBe(10);
});

test('removeProductFromList', () => {
    const productNames = ['Apple', 'Banana', 'Orange'];
    const productList = ['Apple', 'Orange', 'Pineapple', 'Strawberry'];
    
    for (const productName of productNames) {
        const isProductInList = productList.findIndex((p) => p === productName) !== -1;
        const result = removeProductFromList(productName, productList);
        
        // assert result is an Array
        expect(Array.isArray(result)).toBe(true);
        
        if (!isProductInList) {
            expect(result.length).toBe(productList.length);
        } else {
            expect(result.length).toBeLessThan(productList.length);
        }
    }
});

test('processProductsBill', async () => {
    const PINEAPPLE_DISCOUNT_MSG = '10% off Pineapple';
    const STRAWBERRY_DISCOUNT_MSG = '50% off Strawberry';

    const iters: Array<{
        productList: Array<string>;
        expectedBill: TBill;
    }> = [
        {
            productList: ['Pineapple'],
            expectedBill: {
                discounts: [PINEAPPLE_DISCOUNT_MSG],
                taxes: 3.4986,
                subTotal: 24.99,
                total: 25.9896
            }
        },
        {
            productList: ['Pineapple', 'Apple', 'Apple', 'Strawberry'],
            expectedBill: {
                discounts: [PINEAPPLE_DISCOUNT_MSG, STRAWBERRY_DISCOUNT_MSG],
                taxes: 9.37,
                subTotal: 66.96,
                total: 63.84
            }
        },
    ];

    for (const {expectedBill, productList} of iters) {
        const bill = await processProductsBill(productList);

        // assert discounts are the same
        expect(expectedBill.discounts.length).toBe(bill.discounts.length);
        bill.discounts.sort();
        expectedBill.discounts.sort();
        bill.discounts.forEach((discount, index) => {
            expect(discount).toBe(expectedBill.discounts[index]);
        });

        // assert taxes, subTotal and total values are 'close' (not equal, because their actual values will depend on platform implementation specifics, e.g the bit-system of the underlying runtime)
        for (const [k, v] of Object.entries(bill)) {
            if (k !== 'discounts') {
                expect(v).toBeCloseTo(expectedBill[k as keyof TBill] as number, 2);
            }
        }
    }
});