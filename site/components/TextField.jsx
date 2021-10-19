import * as React from 'react';
import styles from './TextField.module.css'
import { field } from 'zusform'

export default function TextField(props) {
    const { value, meta, register, registered, handleChangeEvent } = props.useForm(...field(props.name, props.defaultValue))
    React.useEffect(() => {
        if (!registered) {
            register(props.name, props.defaultValue)
        }
    }, [registered])
    const renders = React.useRef(1)
    React.useEffect(() => { renders.current += 1 })

    return (
        <div className={styles.container}>
            {registered &&
                <>
                    <label htmlFor={props.name} className={styles.label}>{props.label} - Renders: {renders.current} </label>
                    <input
                        id={props.name}
                        type="text"
                        className={styles.input}
                        value={value}
                        name={props.name}
                        onChange={handleChangeEvent}
                    />
                </>
            }
        </div>
    )
}