import { Option, none, some, fromNullable, option } from 'fp-ts/lib/Option';
import { Predicate } from 'fp-ts/lib/function';
import { mapOption, array } from 'fp-ts/lib/Array';
import { sequenceT, liftA2 } from 'fp-ts/lib/Apply';

// Curring
const add = (a: number) => (b: number) => a + b;
const add1 = add(1);

// Option
// Functor
const result = some(3).map(add1); // some(3)

console.log(result.fold('Kein Ergebnis', a => `Das Ergebnis ist ${a}`));


const div = (b: number) => (a: number): Option<number> => b === 0 ? none : some(a / b);

some(3).map(div(3)) // some(some(1))

// Monads
const result2 = some(3).chain(div(3)).chain(div(0)).map(add(1)) // none - cause div(0) is none
console.log(result2);

const isGreater3: Predicate<number> = (a: number) => a > 3;

console.log(fromNullable(3).fold(false, isGreater3)) // false

some(3).filter(isGreater3) // none

// Tagged unions / sum types
type Cat = { type: 'cat', canMiau: boolean };
type Dog = { type: 'dog', canBark: boolean };
type Animal = Cat | Dog;

// Type guards
const isCat = (a: Animal): a is Cat => a.type === 'cat';

declare let animal: Animal;

// Arrays of Options
const arr = [some('Hello'), some('Bye'), none];
const rarr = mapOption(arr, (a) => a.filter(a => a.length > 3).map(a => a + ' World'));
console.log(rarr); // ['Hello World', 'Bye World']

// flapMap
console.log(array.chain([1, 2, 3], a => [a, 'a'])) // [1, 'a', 2, 'a', 3, 'a']

// Combining multiple Option values
some(1).chain(a => some(2).map(b => a + b)).chain(c => some(3).map(d => c + d))

sequenceT(option)(some(1), some(2), some(3)).map(([a, b, c]) => a + b + c);

// Lifting
console.log(array.of(3)); // [3]
console.log(option.of(3)); // some(3)

const addO = liftA2(option)(add);
const addA = liftA2(array)(add);

console.log(addO(some(1))(some(2))); // some(3)
console.log(addA([1, 2])([3, 4])); // [4, 5, 5, 6]

// Exmaple liftA2 implementation
// const liftA2 = <A>(M: Apply<A>) => (add: (a: A) => (b: A) => A) (a: HKT<M, A>) => (b: HKT<M, A>) => M.ap(M.map(a, add), b);
