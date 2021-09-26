import create from 'zustand'
import { select } from './select'
import produce from 'immer'

function makeStateSlice() {
    return {
        fields: {
            name: {},
            key: {},
            values: {},
            touched: {},
            error: {},
            setValue: {},
            onChange: {}
        }
    }
}

export default function createForm() {
    function register(key, value, set) {
        function setValue(v, key, set) {
            set(produce(state => {
                select(key, false, v)(state.fields.values)
                select(key, false, true)(state.fields.touched)
                select(key, false, "")(state.fields.error)
            }))
        }
        function handleChange(e, set) {
            setValue(e.target.value, key, set)
        }
        const field = {
            name: key,
            key,
            value,
            setValue: value => setValue(value, key, set),
            onChange: e => handleChange(e, set),
            error: "", // TODO: Initial validation
            touched: false,
        }
        set(produce(state => {
            select(key, true, field.value)(state.fields.values)
            select(key, true, field.touched)(state.fields.touched)
            select(key, true, field.name)(state.fields.name)
            select(key, true, field.key)(state.fields.key)
            select(key, true, field.error)(state.fields.error)
            select(key, true, field.setValue)(state.fields.setValue)
            select(key, true, field.onChange)(state.fields.onChange)
        }))
        return field
    }
    return create((set, get) => ({
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
        ...makeStateSlice()
    }))
}

