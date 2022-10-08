import { CHECKOUT_TAX_PERCENTAGE } from '../constants';
import { MultiItemDiscountsEngine, SingleItemDiscountsEngine } from '../rules-engine';
import { countArrayElements } from '../utils';

export class Product {
    name: string;
    amount: number;
    discount: number | null;

    constructor(name: string, amount: number, discount?: number | null) {
        this.name = name;
        this.amount = amount;
        this.discount = discount || null;
    }
}

// the Products database is designed to allow O(1) lookups
export const Products: Record<string, Product> = {};
[
    {name: 'Apple', amount: 10.99},
    {name: 'Orange', amount: 14.99},
    {name: 'Strawberry', amount: 19.99},
    {name: 'Pineapple', amount: 24.99, discount: 10},
]
    .map(({name, amount, discount}) => new Product(name, amount, discount))
    .forEach(product => Products[product.name] = product);

/**
 * Queries DB for a Product identified by `id`
 * @param id a unique ID to query by
 * @returns a `Product` if query matches DB records, else `undefined`
 */
export const findProduct = (id: string) => Products[id];

/**
 * Process bill for product, applying any discounts and updating the final sub-total to be returned to the client
 * @param product Product to process bill for
 * @param data a Record of the current subTotal and percentage to be discounted
 * @returns a Record<string, number> for the updated subTotal and the amount to be discounted
 */
export const processProductBill = (product: Product, {discountPercentage, subTotal}: {
    subTotal: number;
    discountPercentage: number;
}) => {    
    const { amount } = product;
    
    subTotal += amount;

    return {
        subTotal,
        discount: (discountPercentage/100) * amount,
    }
}

export const removeProductFromList = (product: string, products: Array<string>) => {
    const index = products.findIndex((productName) => productName === product);
    if (index === -1) return products;
    
    const result = Array.from(products);
    result.splice(index, 1);
    
    return result;
}

export type TBill = {
    discounts: Array<string>;
    taxes: number;
    subTotal: number;
    total: number;
}

/**
 * Processes a list of products and returns a bill (with any taxes and discounts applied)
 * @param products an Array of product names/IDs
 * @returns a TBill
 */
export const processProductsBill = async (products: Array<string>): Promise<TBill> => {
    const productCounts = countArrayElements(products);

    // e.g ["10% off Pineapple"]
    const discountMessages: Array<string> = [];
    // total amount of tax to be paid
    let taxes = 0;
    // 'subTotal' is the sum of product prices before taxation and discounts
    let subTotal = 0;
    // 'discounts' is the sum of product discount amounts
    let discounts = 0;
    // 'total' is the amount payable by the customer. It is 'subTotal' + 'tax' - 'discounts'
    let total = 0;

    const pushDiscountMessage = (message: string, discountAmount: number) => {
        if (message !== undefined) discountMessages.push(`${message}: -$${discountAmount}`);
    }

    // apply multi-item discounts first
    // as discounts are applied, progressively eliminate the product(s) from the 'products' array
    // so that they aren't processed more than once
    const multiDiscounts = await MultiItemDiscountsEngine
        .run({counts: productCounts})
        .then(({ events }) => {
            return events;
        });
    for (const event of multiDiscounts) {
        const discount = event.params?.discountPercentage ?? 0;
        
        switch (event.type) {
            case '2-apples-strawberry-discount':
                const product = findProduct('Strawberry');
                
                // every pair of Apple discounts 1 Strawberry
                for (let i = productCounts.Apple; i > 0; i -= 2) {
                    if (productCounts.Strawberry >= 1) {
                        const bill = processProductBill(product, {
                            subTotal,
                            discountPercentage: discount,
                        });
                        subTotal = bill.subTotal;
                        taxes += (CHECKOUT_TAX_PERCENTAGE/100) * subTotal;
                        discounts += bill.discount;

                        // remove one 'Strawberry' product from list
                        products = removeProductFromList('Strawberry', products);

                        // push message to discountMessages
                        pushDiscountMessage(event.params?.message, bill.discount);
                    } else {
                        // break loop if there are no more Strawberries
                        break
                    }
                }
                break;
        
            default:
                break;
        }
    }

    // process the other products
    for (const productName of products) {
        const events = await SingleItemDiscountsEngine
            .run({ productName })
            .then(({ events }) => events);
        const message: string | null = events.length > 0 ? events[0].params?.message ?? null : null;

        // handle any discounts, but default to 0% if there isn't one
        const discountPercentage: number = events.length > 0 ? events[0].params?.discountPercentage ?? 0 : 0;
        
        const product = findProduct(productName);
        // if productName not found in DB, skip
        if (product === undefined) continue;
        const bill = processProductBill(product, {
            subTotal,
            discountPercentage,
        });
        subTotal = bill.subTotal;
        taxes += (CHECKOUT_TAX_PERCENTAGE/100) * product.amount;
        discounts += bill.discount;

        // push message to discountMessages
        if (message !== null) pushDiscountMessage(message, bill.discount);

        products = removeProductFromList(productName, products);
    }
    total = subTotal + taxes - discounts;

    return {
        discounts: discountMessages,
        taxes,
        subTotal,
        total
    }
}