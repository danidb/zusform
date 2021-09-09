import * as React from 'react'
import ustyle from '../styles/utilities.module.css'

import TextField from '../components/TextField';
import AnotherComponent from '../components/AnotherComponent';
import createForm from 'zusform'


export const useForm = createForm(console.log)


export default function Home() {
    const formProps = useForm(form => form.formProps)

    return (
        <div className={ustyle.pageContainer}>
        <h1 className={ustyle.h1}>Zusform, a work in progress</h1>
        <AnotherComponent />
        <form {...formProps} >
            <button className={ustyle.button} type="submit">Submit</button><br />
            <TextField label="Foo label" name={`foo.foo`} value={`Foo`} />
            <TextField label="Baz label" name={`foo.bar.baz`} value={`Baz`} />
            {Array.from(Array(20)).map((_, idx) => idx).map(idx =>
                <>
                    <TextField label={`Label ${idx} (I'm in an array, [ ] )`} key={`foo.qux[${idx}]`} name={`foo.qux[${idx}]`} value={`Hello from item ${idx} in this field array "foo.qux."`} /><br />
                    <TextField label={`Label ${idx} (I'm in an object, . )`} key={`more.nesting.fred.${idx}`} name={`more.nesting.fred.${idx}`} value={`Hello from index ${idx} in the object "more.nesting.fred." `} /><br />
                </>
            )}
        </form>
        </div>
    )
}






