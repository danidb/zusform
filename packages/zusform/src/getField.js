import { select } from './select'
import shallow from 'zustand/shallow'

export default function getField(key) {
    return [
        form => {
            const touched = select(key)(form.fields.touched)
            if (typeof touched !== 'undefined') {
                return {
                    value: select(key)(form.fields.values),
                    touched: touched,
                    onChange: select(key)(form.fields.onChange),
                    setValue: select(key)(form.fields.setValue),
                    error: select(key)(form.fields.error),
                }
            } else {
                return undefined
            }
        },
        shallow
    ]
}

