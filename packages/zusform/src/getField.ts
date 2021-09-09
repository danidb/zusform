import { select } from './select'
import shallow from 'zustand/shallow'

export default function getField(key:string) {
    return [
        form => {
            const value = select(key)(form.fields.values)
            if (typeof value !== 'undefined') {
                return {
                    value: value,
                    touched: select(key)(form.fields.touched),
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