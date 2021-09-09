
# 🚧 WARNING - It won't be the same tomorrow morning. 🏗️
This library is under very active development and the API is volatile ☢️. Don't use it yet, but feel free to contribute if you see something you like!

# 🐻‍❄️ Zusform
Oversimplified React form handling with Zustand.

## Non-Trivial Example

The structure of the form is generated based on keys and an initial value is specified when you `register` a field.

Square brackets in keys denote arrays, dots denote objects. For example, `foo.qux[15]` means we expect `foo` to be an object, and `foo.qux` to be an array. If we had written `foo.qux.15` then `foo.qux` would be an object.

```javascript
import * as React from 'react'

import createForm from 'zusform'
import { getField } from 'zusform'

export const useForm = createForm(console.log)

function AnotherComponent () {
    const qux15 = useForm(...getField("foo.qux[15]"))
    const fooBarBaz = useForm(...getField("foo.bar.baz"))

    return (
        <>
            <p><b>This component lives outside our form</b></p>
            <p>{`foo.bar.baz: ${fooBarBaz ? fooBarBaz.value : ''}`}</p>
            <p>{`foo.qux[15]: ${qux15 ? qux15.value : ''}`}</p>
        </>
    )
}

function TextField(props) {
    const register = props.useForm(form => form.register)
    const field = props.useForm(...getField(props.name)) || register(props.name, props.value)

    const renders = React.useRef(1)
    React.useEffect(() => { renders.current += 1 })

    return (
        <>
            <label htmlFor={props.name}>{props.label} - Renders: {renders.current} </label><br />
            <input id={props.name} type="text" value={field.value} name={props.name} onChange={field.onChange} /><br />
        </>
    )
}

export default function Home() {
    const formProps = useForm(form => form.formProps)

    return (
        <>
        <h1>Using values outside the form</h1>
        <AnotherComponent />
        <h1>A Sample Form</h1>
        <form {...formProps} >
            <button type="submit">Submit</button><br />
            <TextField label="Foo label" name={`foo.foo`} value={`Foo`} />
            <TextField label="Baz label" name={`foo.bar.baz`} value={`Baz`} />
            {Array.from(Array(20)).map((_, idx) => idx).map(idx =>
                <div key={idx}>
                    <TextField
                        label={`Label (foo.qux[${idx}], I'm in an array)`}
                        name={`foo.qux[${idx}]`}
                        value={`Hello from item ${idx} in this field array "foo.qux."`}
                        useForm={useForm}
                    /><br />
                    <TextField
                        label={`Label (more.nesting.fred.${idx}, I'm in an object)`}
                        name={`more.nesting.fred.${idx}`}
                        value={`Hello from index ${idx} in the object "more.nesting.fred." `}
                        useForm={useForm}
                    /><br />
                </div>
            )}
        </form>
        </>
    )
}
```

## Why
1. I wanted a performant React form handling library with a simpler API for the features that matter most to me, based on controlled components.
2. I've been using Zustand quite often and I think it's great, handling forms with Zustand would mean fewer moving parts.
3. I'm working on a project for a client where this would make sense.
4. Enjoyment.

## Contributing
Contributions and constructive criticism are welcome. Feel free to reach out! I'm sure there are flagrant issues and errors to be found. If you like what you see, consider contributing!

### TODO
1. [ ] Validation _IN PROGRESS_
   1. [ ] Easy Yup
   2. [ ] Easy API for *< insert other favorites here >* or DIY
2. [ ] Realistic test cases that cover integration with React and common errors.
3. [ ] Array utilities for ordering and deletion _IN PROGRESS_
4. [ ] Complete typing of the fields object on our form state (error, touched, etc.) once satisfied with the structure.
5. [ ] CI, build and release actions
6. [ ] Make it possible to attach a "zusform" to an existing zustand store, rather than create a new one.