import { countArrayElements } from './arrays';

test('countArrayElements should return a count of all elements in a one-dimensional array', () => {
    const arr = ['Me', 'You', 'Me'];
    const counts = countArrayElements(arr);
    
    expect(counts.Me).toBe(2);
    expect(counts.You).toBe(1);
});