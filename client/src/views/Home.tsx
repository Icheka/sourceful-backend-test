import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

import { Button, Counter } from '../components/elements';
import { processBill } from '../services/checkout';

export const HomeView: FunctionComponent = () => {
    // vars
    const products = ['Apple', 'Pineapple', 'Strawberry', 'Orange'] as const;
    type TProduct = typeof products[number];
    type TCount = Record<TProduct, number>;

    // state
    const [cart, setCart] = useState<Array<TProduct>>([]);
    const [counts, setCounts] = useState<Partial<TCount>>({});
    const [error, setError] = useState<string | null>(null);
    const [bill, setBill] = useState<null | Record<string, any>>(null);
    const [submitting, setSubmitting] = useState(false);

    // utils
    const handleSubmit = async () => {
        setBill(null);
        setSubmitting(true);
        const [code, data] = await processBill(cart);
        setSubmitting(false);
        
        if (code !== 0) {
            setError('An error occurred. Check your network and try again.');
            return setTimeout(() => {
                setError(null);
            }, 6000);;
        }
        setBill(data);
    }

    // hooks
    const addToCart = (product: TProduct) => {
        setCart([...cart, product]);
    }
    const removeFromCart = (product: TProduct) => {
        const idx = cart.findIndex((p) => p === product);
        console.log('->', idx);
        if (idx === -1) return;
        const updatedCart = Array.from(cart);
        updatedCart.splice(idx, 1);
        setCart(updatedCart);
    }

    useEffect(() => {
        const c: Partial<TCount> = {};
        for (const product of cart) {
            c[product] = (c[product] || 0) + 1;
        }
        setCounts(c);
    }, [cart.length]);

    return(
        <div className='p-2 sm:p-4'>
            <div className="flex flex-col w-full items-center justify-center">
                {
                    error !== null && (
                        <div className={`w-full mb-4 rounded-xl border border-red-600 bg-red-300 text-white px-4 py-2`}>
                            {error}
                        </div>
                    )
                }
                {
                    bill !== null && (
                        <div className={`w-full mb-4 rounded-xl border border-green-600 bg-green-100 relative text-gray-800 px-4 py-2 space-y-1`}>
                            <button onClick={() => setBill(null)} className='absolute -right-3 bg-white rounded-full p-2 border border-red-500 -top-3'>
                                <FaTimes />
                            </button>
                            {
                                Object.entries(bill).map(([k, v]) => (
                                    <div className='flex space-x-2'>
                                        <div className='uppercase font-semibold text-lg'>
                                            {k}:
                                        </div>
                                        <div className='font-medium'>
                                            {typeof v === 'number' && `$${v.toFixed(2)}`}
                                            {Array.isArray(v) && (
                                                <ul>
                                                    {
                                                        v.map((product: string) => (
                                                            <li>{product}</li>    
                                                        ))
                                                    }
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    )
                }
                <form onSubmit={e => {e.preventDefault(); handleSubmit();}} className='border border-gray-300 shadow-md rounded-3xl w-full xl:max-w-3xl px-4 py-6 bg-white space-y-6'>
                    <div>
                        <div className='text-3xl text-gray-800 font-bold mb-6'>Add products to your shopping cart</div>
                        <div className='space-y-3'>
                            {products.map((product, i) => (
                                <div className='flex items-center space-x-3' key={i}>
                                    <span className='text-lg text-gray-800 font-semibold'>
                                        {product}
                                    </span>
                                    <Counter value={counts[product] || 0} decrement={() => removeFromCart(product)} increment={() => addToCart(product)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className='center-center'>
                        <Button loading={submitting} type='submit' label="Checkout" />
                    </div>
                </form>
            </div>
        </div>
    );
}