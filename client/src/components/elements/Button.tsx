import { FunctionComponent, ReactNode } from 'react';
import { FaSpinner } from 'react-icons/fa';

export type TButton = Partial<HTMLButtonElement> & {
    label?: string;
    children?: ReactNode;
    loading?: boolean;
}

export const Button: FunctionComponent<TButton> = ({
    label, children, loading, ...rest
}) => {
    return (
        <button className="bg-blue-600 rounded-md px-3 py-1 text-white center-center text-lg" {...rest as any}>
            {
                loading ? (
                    <div className='spin'>
                        <FaSpinner />
                    </div>
                ) : label ?? children
            }
        </button>
    );
}