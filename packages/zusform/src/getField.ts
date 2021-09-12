import { select } from './select'
import shallow from 'zustand/shallow'

export default function getField(key:string) {
    return [
        form => {
            const touched = select(key)(form.fields.touched)
            console.log(touched)
            if (typeof touched !== 'undefined') {
                return {
                    value: select(key)(form.fields.values),
                    touched: touched,
                    onChange: select(key)(form.fields.onChange),
                    error: select(key)(form.fields.error),
                }
            } else {
                return undefined
            }
        },
        shallow
    ]
}