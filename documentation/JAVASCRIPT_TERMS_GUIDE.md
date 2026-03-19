# JavaScript Terms Guide

## Purpose

This guide explains the common words, symbols, and coding terms you see in the Roomie project.

It is not possible to explain literally every single word in the whole codebase one by one, because some words are just variable names chosen by the developer. But this file covers the important JavaScript, Node.js, Express, and backend terms that show up again and again, especially in files like `authController.js`.

## Very Common JavaScript Words

### `const`

`const` creates a variable whose reference should not be reassigned.

Example:

```js
const name = 'Roomie';
```

Meaning:
- make a variable called `name`
- store `'Roomie'` inside it
- do not later replace `name` with a different value

Important:
- with objects and arrays, `const` means the variable name cannot point somewhere else
- the inside of the object or array can still change

### `let`

`let` creates a variable that can change later.

Example:

```js
let count = 1;
count = 2;
```

### `var`

`var` is an older way to create variables. Modern code usually prefers `const` and `let`.

### `true` and `false`

These are boolean values. They represent yes/no or on/off.

Example:

```js
const success = true;
```

### `null`

`null` means "intentionally empty."

Example:

```js
const user = null;
```

### `undefined`

`undefined` usually means a value has not been set yet.

### `if`

`if` checks a condition and runs code only when the condition is true.

Example:

```js
if (!result.success) {
  return res.status(400).json(result);
}
```

Meaning:
- if `result.success` is not true
- send an error response

### `else`

`else` runs when the `if` condition is false.

### `return`

`return` sends a value back from a function and stops that function.

Example:

```js
return res.status(400).json(result);
```

Meaning:
- send the response
- stop running the rest of the function

## Functions

### `function`

A function is reusable code that performs a task.

Example:

```js
function sayHello() {
  console.log('Hello');
}
```

### Arrow function `=>`

This is a shorter way to write a function.

Example:

```js
const loginUser = async (req, res) => {
  // code here
};
```

Meaning:
- create a function called `loginUser`
- it accepts `req` and `res`
- it runs the code inside the braces

### Parameters

Parameters are the inputs a function receives.

Example:

```js
async (req, res) => {}
```

Here:
- `req` is one parameter
- `res` is another parameter

## Async JavaScript

### `async`

`async` means the function works with asynchronous operations, such as:
- database calls
- file reads
- API requests
- password hashing

Example:

```js
const registerUser = async (req, res) => {
```

Meaning:
- this function may need to wait for slow work to finish

### `await`

`await` pauses the function until an async task finishes.

Example:

```js
const hashedPassword = await bcrypt.hash(password, saltRounds);
```

Meaning:
- ask `bcrypt` to hash the password
- wait until the hash is ready
- then store the result in `hashedPassword`

### `try`

`try` means "attempt to run this code."

### `catch`

`catch` means "if something goes wrong, handle the error here."

Example:

```js
try {
  const result = await userService.createUser(userData);
} catch (error) {
  console.error('Registration error:', error);
}
```

Meaning:
- try the user creation
- if it fails, move into `catch`

## Objects and Properties

### Object

An object stores related values using keys.

Example:

```js
const userData = {
  id: '123',
  role: 'Student'
};
```

This object has:
- key `id`
- key `role`

### Property

A property is one piece of data inside an object.

Example:

```js
userData.role
```

This accesses the `role` property.

### `req.body.identifier`

This means:
- `req` = the request object
- `body` = the data sent by the frontend
- `identifier` = one field inside that data

So `req.body.identifier` means:
"the identifier value sent from the frontend request body"

### Destructuring

This pulls values out of an object into separate variables.

Example:

```js
const { identifier, password } = req.body;
```

Meaning:
- take `identifier` from `req.body`
- take `password` from `req.body`
- create local variables with those names

## Console Words

### `console`

`console` is a built-in object used for printing information.

### `console.log`

Prints normal information.

Example:

```js
console.log('Server started');
```

### `console.error`

Prints error information.

Example:

```js
console.error('Login error:', error);
```

## Node.js / Module Words

### `require`

`require` imports code from another package or file.

Example:

```js
const bcrypt = require('bcryptjs');
```

Meaning:
- load the `bcryptjs` package
- store it in a variable called `bcrypt`

### `module.exports`

This makes code available to other files.

Example:

```js
module.exports = {
  registerUser,
  loginUser,
  updateProfile
};
```

Meaning:
- export these functions
- other files can import and use them

## Express Backend Words

These are very important in Roomie's backend.

### `req`

Short for request.

It contains information sent into the backend, such as:
- URL parameters
- query parameters
- request body
- headers

Examples:
- `req.body`
- `req.params`
- `req.query`

### `res`

Short for response.

It is what the backend uses to send data back to the frontend.

Examples:

```js
res.json(result);
res.status(400).json(result);
```

### `res.status(400)`

This sets the HTTP status code.

Common ones:
- `200` = success
- `201` = created successfully
- `400` = bad request
- `401` = unauthorized
- `404` = not found
- `500` = server error

### `res.json(...)`

This sends JSON back to the frontend.

Example:

```js
res.json({
  success: true,
  message: 'Login successful'
});
```

### `req.body`

The JSON data sent from the frontend.

Example from Roomie:

```js
{
  "identifier": "student@unbc.ca",
  "password": "test123"
}
```

### `req.params`

Values taken from the URL path.

Example route:

```js
/api/auth/profile/:id
```

If the URL is:

```txt
/api/auth/profile/123
```

then:

```js
req.params.id
```

will be:

```js
'123'
```

### `req.query`

Values taken from the query string in the URL.

Example:

```txt
/api/listings/favorites?userIdentifier=student@unbc.ca
```

then:

```js
req.query.userIdentifier
```

contains the value after `=`.

## Common Auth Words

### `bcrypt`

`bcrypt` is used to hash passwords.

Hashing means:
- do not store the original password directly
- store a protected scrambled version of it

### `bcrypt.hash`

Turns a plain password into a hash.

### `bcrypt.compare`

Checks whether a plain password matches a stored hash.

### `jwt`

`jwt` stands for JSON Web Token.

It is often used to represent a logged-in session.

### `jwt.sign`

Creates a token.

Example:

```js
const token = jwt.sign(
  { userId: user.id, identifier: user.identifier },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

Meaning:
- create a token
- put user information inside it
- sign it with a secret key
- make it expire in 7 days

### `process.env`

This reads environment variables.

Example:

```js
process.env.JWT_SECRET
```

Meaning:
- get the value of `JWT_SECRET` from the environment

## Symbols You See Often

### `=`

Assign a value.

Example:

```js
const name = 'Roomie';
```

### `===`

Strict comparison.

Checks whether two values are exactly equal.

Example:

```js
if (role === 'Landlord')
```

### `!`

Means "not."

Example:

```js
if (!result.success)
```

Meaning:
- if success is not true

### `||`

Means "or."

Example:

```js
bio: bio || ''
```

Meaning:
- use `bio` if it exists
- otherwise use an empty string

### `&&`

Means "and."

Example:

```js
user && user.identifier
```

Meaning:
- only continue if `user` exists and has `identifier`

### `.`

Access a property or method.

Example:

```js
result.success
res.json()
```

### `()`

Used for:
- calling a function
- passing parameters
- grouping expressions

Example:

```js
console.log('Hello');
```

### `{ }`

Curly braces are used for:
- object creation
- function blocks
- `if` blocks
- `try/catch` blocks

### `[ ]`

Square brackets are used for arrays.

Example:

```js
const roles = ['Student', 'Landlord'];
```

## Example Line-by-Line

Take this line:

```js
const result = await userService.createUser(userData);
```

Meaning:
- `const` = create a variable
- `result` = variable name
- `=` = assign a value
- `await` = wait for async work to finish
- `userService` = the imported service object
- `.createUser` = call the `createUser` function from that object
- `(userData)` = send `userData` into that function

So the full meaning is:

"Wait for `userService.createUser` to finish creating the user, then store the returned value inside `result`."

## Example From Express

Take this line:

```js
return res.status(400).json(result);
```

Meaning:
- `return` = stop the function here
- `res` = the response object
- `.status(400)` = set the HTTP status code to 400
- `.json(result)` = send the `result` object back as JSON

Full meaning:

"Stop here and send an HTTP 400 response containing `result`."

## Words That Are Not Special JavaScript Words

Some names look important, but they are just names chosen by the developer.

Examples:
- `userService`
- `registerUser`
- `hashedPassword`
- `identifier`
- `displayName`
- `saltRounds`

These are not built-in JavaScript keywords. They are just variable or function names.

## Best Way To Read Code

When reading a line of code, break it into parts:

1. What variable or function name do I see?
2. Is this creating something, checking something, or calling something?
3. Is it reading data from `req`?
4. Is it sending data with `res`?
5. Is it waiting on async work with `await`?

That method makes backend code much easier to read.

## Short Cheat Sheet

- `const` = make a variable that should not be reassigned
- `let` = make a variable that can change
- `async` = function uses async work
- `await` = wait for async work to finish
- `if` = check a condition
- `return` = send a value back and stop
- `req` = incoming request
- `res` = outgoing response
- `res.json()` = send JSON back
- `res.status()` = set HTTP status
- `require()` = import code
- `module.exports` = export code
- `console.log()` = print info
- `console.error()` = print error info
- `bcrypt.hash()` = hash password
- `bcrypt.compare()` = compare password to hash
- `jwt.sign()` = create token

## Final Note

If you want, the next helpful step would be a second guide called something like:

- `HOW_TO_READ_ROOMIE_BACKEND_CODE.md`

That one could explain full lines and code blocks from your actual files in even more beginner-friendly language.
