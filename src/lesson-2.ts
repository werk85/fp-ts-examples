import { some, option, none } from "fp-ts/lib/Option";
import { liftA3 } from "fp-ts/lib/Apply";
import { left, right, Either } from "fp-ts/lib/Either";
import * as t from 'io-ts'
import { createOptionFromNullable } from 'io-ts-types/lib/fp-ts/createOptionFromNullable'
import { fallback } from 'io-ts-types/lib/fallback';
import { Option } from 'fp-ts/lib/Option'

// Wiederholung von lession-1
const a = option.of(1);
const b = option.of(2);

const add1 = (a: number) => a + 1;

const add = (a: number) => (b: number) => (c: number) => a + b;

const r = option.ap(
  option.ap(
    option.map(a, add),
    b
  ),
  option.of(3)
);

const s = liftA3(option)(add)(a)(b)(option.of(3))

console.log(r === s);

const div = (a: number) => (b: number) => a === 0 ? some(a / b) : none;

a.chain(div(2))

a.fold('Nix', a => `Irgenwas ${a}`)

// Either Monad
const divE = (a: number) => (b: number): Either<string, number> => a === 0 ? left('Du darfst nicht durch 0 devidieren') : right(b / a);

divE(0)(3).fold(
  (l) => `<h1 class="error">${l}</h2>`,
  a => `<p class="result">${a}</p>`
);

// Aufbau eigener Fehler typen. Verwendung im Left Teil von Either
// Helper: unionize (https://github.com/pelotom/unionize)
type AppError<A = any> =
  | { type: 'UnknownError', message: string }
  | { type: 'FileError', message: string }
  | { type: 'HttpError', status: number, response: A };

// const writeFile = (): Either<Error, void> => {};

// const app: Either<AppError, void> = writeFile().mapLeft(err => ({ type: 'FileError', message: err.message }))

// app.fold(
//   l => {
//     switch (l.type) {
//       case 'UnknownError': return '<h2>Unknown Error</h2>';
//       ...
//     }
//   },
//   r => `<p>${r}</p>`
// );

// io-ts

// Brands
interface PositiveBrand {
  readonly Positive: unique symbol // use `unique symbol` here to ensure uniqueness across modules / packages
}

const Positive = t.brand(
  t.number, // a codec representing the type to be refined
  (n): n is t.Branded<number, PositiveBrand> => n >= 0, // a custom type guard using the build-in helper `Branded`
  'Positive' // the name must match the readonly field in the brand
)

type Positive = t.TypeOf<typeof Positive>

const p1: Positive = Positive.decode(0).getOrElseL(() => { throw new Error('Invalid') });
console.log(p1);

const p2: Positive = 3 as any;

const p3 = Positive.decode(p1 + p2).getOrElseL(() => { throw new Error() })

// Interfaces/types
const User = t.type({
  userId: t.number,
  name: fallback(t.string)('Keine Angabe'),
  age: fallback(createOptionFromNullable(Positive))(none),
  description: createOptionFromNullable(t.string)
}, 'User')
type User = t.TypeOf<typeof User>; // User that comes out
type UserOutput = t.OutputOf<typeof User>; // User that comes in

const isUserWithLongName = (user: User) => user.name.length > 3;

const Users = t.array(User);
type Users = t.TypeOf<typeof Users>;

const user: UserOutput = {
  userId: 1,
  name: 'Malte',
  age: 3 as any,
  description: null
}

const users = Users.decode([user]);

console.log(users);

// console.log(User.encode({
//   userId: 2,
//   name: 'Martin',
//   age: 3 as any,
//   description: none
// }))

declare const p4: Option<Positive>;
declare function test(a: Positive): Positive;

// p4.map(test)

// p4.chain(b => b > 3 ? some(b) : none)

// Combinieren mehrer Types zu einem
const Cat = t.interface({
  wiskers: t.number
});

const Dog = t.interface({
  canBark: t.boolean
});

const CatDog = t.intersection([Cat, Dog]);

console.log(CatDog.decode({
  wiskers: 4,
  canBark: true
}))
