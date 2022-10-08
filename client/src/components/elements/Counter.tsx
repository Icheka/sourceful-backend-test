import { FunctionComponent, ReactNode } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

export const Counter: FunctionComponent<{ value: number; increment: VoidFunction; decrement: VoidFunction; }> = ({
    value, increment, decrement
}) => {
    return(
        <div className='center-center border border-gray-800 bg-gray-100 rounded-md space-x-3'>
            <Pressable icon={<FaMinus />} onClick={decrement} />
            <div className='text-gray-700'>
                {value}
            </div>
            <Pressable icon={<FaPlus />} onClick={increment} />
        </div>
    );
}

const Pressable: FunctionComponent<{ icon: ReactNode, onClick: VoidFunction }> = ({ icon, onClick }) => (
    <button type="button" className='bg-gray-50 border border-gray-100 rounded-md p-1 text-gray-700' onClick={onClick}>
        {icon}
    </button>
);