import create from 'zustand'
import { select } from './select'
import produce from 'immer'

type Field = {
    key: string,
    name: string,
    value: any,
    error: string,
    touched: boolean,
    onChange: (e:any) => void
}

type DefaultFormState<T> = {
    initialized: boolean,
    handleSubmit: (values:T) => void,
    formProps: {
        onSubmit: (e:any) => void
    },
    actions: {
        register: (key:string, value:any) => Field,
        initialize: (handleSubmit, initialValues) => void
    },
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

export default function createForm<T>() {
    function register(key:string, value:any, set:any) {
        function handleChange(e:any, set) {
            set(produce<DefaultFormState<T>>(state => {
                select(key, false, e.target.value)(state.fields.values)
                select(key, false, true)(state.fields.touched)
                select(key, false, "")(state.fields.error)
            }))
        }
        const field = {
            name: key,
            key,
            value,
            onChange: e => handleChange(e, set),
            error: "", // TODO: Initial validation
            touched: false,
        }
        set(produce<DefaultFormState<T>>(state => {
            select(key, true, field.value)(state.fields.values)
            select(key, true, field.touched)(state.fields.touched)
            select(key, true, field.name)(state.fields.name)
            select(key, true, field.key)(state.fields.key)
            select(key, true, field.error)(state.fields.error)
            select(key, true, field.onChange)(state.fields.onChange)
        }))
        return field
    }
    return create<DefaultFormState<T>>((set, get) => ({
        initialized: false,
        handleSubmit: values => console.log(JSON.stringify(values)),
        actions: {
            register: (key, value) => register(key, value, set),
            initialize: (handleSubmit, initialValues) => {
                set(produce(state => {
                    state.handleSubmit = handleSubmit
                    state.fields.values = initialValues
                    state.initialized = true
                }))
            }
        },
        formProps: {
            onSubmit: e => { e.preventDefault(); get().handleSubmit(get().fields.values)}
        },
        register: (key, value) => register(key, value, set),
        ...makeStateSlice<T>()
    }))
}

