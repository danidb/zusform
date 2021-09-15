import * as React from 'react'
import ustyle from '../styles/utilities.module.css'

import TextField from '../components/TextField';
import AnotherComponent from '../components/AnotherComponent';
import createForm, { getField } from 'zusform'
import shallow from 'zustand/shallow'


export const useForm = createForm()

function DependentField () {
    const fieldA = useForm(...getField("foo.fieldA"))
    const fieldB = useForm(...getField("foo.fieldB"))
    React.useEffect(() => {
        if (fieldB && fieldA && fieldA.value.length > 10) {
            fieldB.setValue("I set you!")
        }
    }, [fieldA, fieldB])

    return (
        <>
            <TextField label="A field that controls another." name="foo.fieldA" value="" useForm={useForm} />
            {fieldA && fieldA.value.length > 2 &&
                <TextField label="B field that is controlled by the field above." name="foo.fieldB" value="" useForm={useForm} />
            }
        </>
    )

}

export default function Home() {
    const initialize = useForm(form => form.actions.initialize)
    React.useEffect(() => {
        initialize(values => console.log(values), {foo: {foo: "init Foo", bar: {baz: 12, qux: 2}}})
    }, [])

    const initialized = useForm(form => form.initialized)
    const formProps = useForm(form => form.formProps)

    return (
        <div className={ustyle.pageContainer}>
            <h1 className={ustyle.h1}>Zusform, a work in progress</h1>
            <AnotherComponent />
            {initialized &&
                <form {...formProps} >
                    <button className={ustyle.button} type="submit"> submit </button><br />
                    <DependentField />
                    <TextField label="Foo label" name={`foo.foo`} useForm={useForm} />
                    <TextField label="Baz label" name={`foo.bar.baz`} value={`Baz`} useForm={useForm} />
                    {Array.from(Array(20)).map((_, idx) => idx).map(idx =>
                        <div key={idx}>
                            <TextField label={`Label ${idx} (I'm in an array, [ ] )`} name={`foo.qux[${idx}]`} value={`Hello from item ${idx} in this field array "foo.qux."`} useForm={useForm} /><br />
                            <TextField label={`Label ${idx} (I'm in an object, . )`} name={`more.nesting.fred.${idx}`} value={`Hello from index ${idx} in the object "more.nesting.fred." `} useForm={useForm} /><br />
                        </div>
                    )}
                </form>
            }
        </div>
    )
}






