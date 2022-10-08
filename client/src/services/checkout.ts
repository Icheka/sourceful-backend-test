import { constants } from '../constants';

export const processBill = async (cart: Array<string>) => {
    return fetch(`${constants.baseURL}/checkout`, {
        body: JSON.stringify({cart}),
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(res => [0, res])
    .catch(err => {
        console.log(err);
        return [1, null];
    })
}