import create from 'zustand'
import { select } from './select'

type Field = {
    key: string,
    name: string,
    value: any,
    error: string,
    touched: boolean,
    onChange: (e:any) => void
}
type DefaultFormState<T> = {
    formProps: {
        onSubmit: (e:any) => void
    },
    register: (key:string, value:any) => Field
    fields: {
        name: any, // TODO: The way we've organized this (which is probably going to change, I'm not convinced) can be typed...
        key: any
        values: T,
        error: any,
        touched: any,
        onChange: any
    }
}

function makeStateSlice<T>() {
    return {
        fields: {
            name: {},
            key: {},
            values: {} as T,
            touched: {},
            error: {},
            onChange: {}
        }
    }
}

export default function createForm<T>(handleSubmit:(values:T) => void) {
    function register(key:string, value:any, set:any) {
        function handleChange(e:any, set) {
            set(state => {
                const _state = {...state}
                select(key, false, e.target.value)(_state.fields.values)
                select(key, false, true)(_state.fields.touched)
                select(key, false, "")(_state.fields.error)
                return _state
            })
        }
        const field = {
            name: key,
            key,
            value,
            onChange: e => handleChange(e, set),
            error: "", // TODO: Initial validation
            touched: false,
        }
        set(state => {
            const _state = {...state}
            select(key, true, field.value)(_state.fields.values)
            select(key, true, field.touched)(_state.fields.touched)
            select(key, true, field.name)(_state.fields.name)
            select(key, true, field.key)(_state.fields.key)
            select(key, true, field.error)(_state.fields.error)
            select(key, true, field.onChange)(_state.fields.onChange)
            return _state
        })
        return field
    }
    return create<DefaultFormState<T>>((set, get) => ({
        formProps: {
            onSubmit: e => { e.preventDefault(); handleSubmit(get().fields.values) }
        },
        register: (key, value) => register(key, value, set),
        ...makeStateSlice<T>()
    }))
}

