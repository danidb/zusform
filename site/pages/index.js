import * as React from 'react'
import ustyles from '../styles/utilities.module.css'

import TextField from '../components/TextField';
import createForm, { fieldArray } from 'zusform'

export const useForm = createForm()


const AnArray = (props) => {
    const { value, meta }  = useForm(...fieldArray(props.name))
    const dropArrayField = useForm(form => form.dropArrayField)

    console.log(value)
    console.log(meta)
    return (
        <>
            <h2 className={ustyles.h2}>An array of fields</h2>
            {value && value.map((_, idx) =>
                <div key={meta[idx].key}>
                    <button onClick={() => dropArrayField(props.name, idx)}>Delete this field</button>
                    <TextField
                        name={`${props.name}[${idx}]`}
                        defaultValue={idx}
                        placeholder={`Field ${idx}`}
                        label={`Field ${idx}`}
                        useForm={useForm}
                    />
                </div>
    )}
        </>
    )
}


export default function Home() {
    const initialized = useForm(form => form.initialized)
    const initialize = useForm(form => form.initialize)
    const formProps = useForm(form => form.formProps)
    const pushArrayField = useForm(form => form.pushArrayField)

    React.useEffect(() => {
        initialize(values => console.log(JSON.stringify(values)))
    }, [])

    return (
        <div className={ustyles.pageContainer}>
            <h1 className={ustyles.h1}>Zusform</h1>
            {initialized &&
                <form {...formProps}>
                    <button type="submit">Submit</button>
                    <TextField
                        name="name"
                        defaultValue=""
                        placeholder="Your name..."
                        label="Name"
                        useForm={useForm}
                    />
                     <TextField
                        name="email"
                        defaultValue=""
                        placeholder="Your email..."
                        label="Email"
                        useForm={useForm}
                    />
                    <button type="button" onClick={() => pushArrayField("foo.anArray", "pushed")}>Add item.</button>
                    <AnArray name="foo.anArray" />
                </form>
            }
        </div>
    )
}