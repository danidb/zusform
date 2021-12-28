import * as React from 'react'
import styles from './TextField.module.css'
import { useField } from 'formicious'


export default function TextField(props) {
    const field = useField(props)

    const renders = React.useRef(1)
    React.useEffect(() => { renders.current += 1 })

    if (field.meta.isRegistered) { // still necessary? don't think so...
	return (
	    <div className={styles.container}>
		<label htmlFor={field.props.id} className={field.meta.fieldValidation[0] ? styles.labelError : styles.label}>
		    {`${props.label || field.validation.field[0]} - Renders: ${renders.current}`}
		</label>
		<input type="text" className={styles.textFieldInput} {...field.props} />
            </div>
	)
    } else {
	return null
    }
}
