# Formicious :man_dancing:
Form handling for React, with a focus on easier development of complex cases with a minimum of fuss.

Development is ongoing, and the API may be somewhat volatile in the near future. Let me know if you like this and/or if you have any suggestions!

## Idea
The primary goal of Formicious is to make developing arbitrarily complex forms in React less frustrating.

By "complex forms" I mean forms containing dynamic arrays of fields, dynamic keys, multiple field-level or form-level validators, dependent inputs/components, transforms that need to be applied to values to support funky stuff...

Formicious assumes that you want to use controlled components.

There are a lot of great tools for building forms in React but none of them left me "satisfied and smiling" when I had to deal with non-trivial/complex/enormous forms. If you're like me, perhaps you will like Formicious, if not there are plenty of alternatives like Formik, react-final-form, react-hook-form, etc.

## Basics
Formicious relies on Zustand and Immer to handle form state. Thanks to Zustand, forms can be defined both inside *and* outside of components, depending on what you want to accomplish.

```js
const form = createForm({})
function SomeComponent() {
	const [form, formProps] = useFormicious({form})
	//...
}
```

```js
function SomeComponent() {
	const [form, formProps] = useFormicious({})
	//...
}
```

Formicious assumes that you wrap your `<input></input>` in components.

To work with Formicious, you'll usually be using one of the three provided hooks: `useField(...), useFormicious(...) and useAction(...)`.

If you want direct access to all the form state, you can get that too.


## ...Docs and Examples are Coming Soon, stay tuned!
In the meantime a not-too-trivial example (with a dynamic array, `react-beautiful-dnd` and some other goodies) can be found in `/site/index.js`
