type Field = {
    key: string,
    name: string,
    value: any,
    error: string,
    touched: boolean,
    setValue: (value:any) => void
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
        setValue: any,
        onChange: any
    }
}

export default function createForm<T>()


