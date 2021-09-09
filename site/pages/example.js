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
    const register = useForm(form => form.register)
    const field = useForm(...getField(props.name)) || register(props.name, props.value)

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
                <>
                    <TextField label={`Label ${idx} (I'm in an array, [ ] )`} key={`foo.qux[${idx}]`} name={`foo.qux[${idx}]`} value={`Hello from item ${idx} in this field array "foo.qux."`} /><br />
                    <TextField label={`Label ${idx} (I'm in an object, . )`} key={`more.nesting.fred.${idx}`} name={`more.nesting.fred.${idx}`} value={`Hello from index ${idx} in the object "more.nesting.fred." `} /><br />
                </>
            )}
        </form>
        </>
    )
}






