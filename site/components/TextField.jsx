import * as React from 'react';
import styles from './TextField.module.css'
import { getField } from 'zusform'

export default function TextField(props) {
    const register = props.useForm(form => form.register)
    const field = props.useForm(...getField(props.name)) || register(props.name, props.value)

    const renders = React.useRef(1)
    React.useEffect(() => { renders.current += 1 })

    return (
        <div className={styles.container}>
            <label htmlFor={props.name} className={styles.label}>{props.label} - Renders: {renders.current} </label>
            <input id={props.name} type="text" className={styles.input} value={field.value} name={props.name} onChange={field.onChange} />
        </div>
    )
}