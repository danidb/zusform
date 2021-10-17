import create from 'zustand'
import produce from 'immer'


export function parseKey(key) {
    const keys = key.split(/[\[\.]/)
    return keys.reduce((agg, _key, idx) => {
        const child = keys[idx+1]
        if (agg[idx-1] && agg[idx-1].type === "array") {
            _key = Number(_key.replace(/]/, ''))
        }
        if (child) {
            if (child.endsWith(']')) {
                return [...agg, {key: _key, type: "array"}]
            } else {
                return [...agg, {key: _key, type: "object"}]
            }
        } else {
            return [...agg, {key: _key, type: "leaf"}]
        }
    }, [])
}


// https://stackoverflow.com/questions/38416020/deep-copy-in-es6-using-the-spread-syntax
function deepClone(obj){
	if(Array.isArray(obj)){
		var arr = [];
		for (var i = 0; i < obj.length; i++) {
			arr[i] = deepClone(obj[i]);
		}
		return arr;
	}
	if(typeof(obj) == "object"){
		var cloned = {};
		for(let key in obj){
			cloned[key] = deepClone(obj[key])
		}
		return cloned;
	}
	return obj;
}
export function getEntrySelector(key, build, value) {
    const keys = parseKey(key)
    return keys.slice(0).reduce((selector, _key, idx, arr) => {

        return v => {
            const selected = selector(v, build, value)
            const current = selected[_key.key]
            if (typeof selected !== 'object' && typeof current === 'undefined') {
                // Eject
                arr.splice(1)
                return selector(v, build, value)
            }
            if (build && typeof current === 'undefined') {
                switch(_key.type) {
                    case "array": selector(v, build, value)[_key.key] = []; break;
                    case "object": selector(v, build, value)[_key.key] = {}; break;
                    case "leaf": selector(v, build, value)[_key.key] = deepClone(value); break;
                    default: break;
                }
            }
            if (!build && value && idx === arr.length - 1) {
                selector(v, build, value)[_key.key] = deepClone(value)
            }
            return selector(v, build, value)[_key.key]
        }
    }, v => v)
}


export function buildDefaultMeta(name, set, get) {
    const handleChange = buildHandleChange(name, set, get)
    return {
        touched: false,
        error: "",
        handleChange,
        handleChangeEvent: function (e) {
            handleChange(e.target.value)
        }
    }
}


function validateField(name, set, get) {
    set(produce(
        state => {
            const entryMeta = getEntrySelector(name)
            const schema = get().yupSchema
            if (schema) {
                let validation;
                try {
                    schema.validateSyncAt(name, get().values)
                    if (name in Object.keys(state.errors)) {
                        delete state.errors[name]
                        entryMeta(state.meta).error = ""
                    }
                } catch(err) {
                    state.errors[name] = err.message
                    entryMeta(state.meta).error = err.message
                }
            }
            return state
        }
    ))
}

function buildHandleChange(name, set, get) {
    return v => {
        set(produce(
            state => {
                const entryValue = getEntrySelector(name, false, v)
                const entryMeta = getEntrySelector(name)
                entryValue(state.values)
                entryMeta(state.meta).touched = true
                return state
            }
        ))
        validateField(name, set, get)
    }
}

function pushArrayField(arrayKey, defaultValue, set, get) {
    set(produce(
        state => {
            const entry = getEntrySelector(arrayKey, true, [])
            const len = entry(state.values).push(defaultValue)
            const idx = len - 1
            entry(state.meta)[idx] = buildDefaultMeta(`${arrayKey}[${idx}]`, set, get)
            return state
        }
    ))
}

function dropArrayField(arrayKey, index, set) {
    set(produce(
        state => {
            const entry = getEntrySelector(arrayKey)
            entry(state.values).splice(index, 1)
            entry(state.meta).splice(index, 1)
            return state
        }
    ))
}

function registerField(name, defaultValue, set, get) {
    set(produce(
        state => {
            const entryValue = getEntrySelector(name, true, defaultValue)
            entryValue(state.values)
            const entryMeta = getEntrySelector(name, true, buildDefaultMeta(name, set, get))
            entryMeta(state.meta)
            return state
        }
    ))
}


export default function createForm() {
    return create((set, get) => ({
        initialized: false,
        yupSchema: undefined,
        errors: {},
        values: {},
        meta: {},
        formProps: {},
        getField: function(name, defaultValue) {
            /**
             * Get and register form field, return value and metadata.
             * @param {string} name - Field name/key.
             * @param {any} defaultValue - Default value to set if the field has not be initialized.
             */
            get().registerField(name, defaultValue, set, get)
            const entry = getEntrySelector(name)
            const value = entry(get().values)
            const meta = entry(get().meta)
            return { value, meta }
        },
        registerField: function (name, defaultValue) {
            /**
             * Register a form field with an optional default value.
             * @param {string} name - Form field path.
             * @param {any} defaultValue - Default value. Only used if field does not already have a value specified by initialValues in initialize.
             */
            registerField(name, defaultValue, set, get)
        },
        initialize: function (handleSubmit, initialValues, yupSchema) {
            /**
             * Initialize the form with initial values, provide submit handler.
             * @param {function} handelSubmit - Function of the form values, passed directly to onSubmit via formProps.
             * @param {any} initialValues - Self explanatory. Note that fields are not registered with metadata until a field definition is rendered.
             */
            set(produce(state => {
                state.formProps.onSubmit = function (e) {
                    e.preventDefault(); get().handleSubmit(get().values)
                }
                state.values = initialValues
                state.meta = {}
                state.initialized = true
                state.yupSchema = yupSchema
                return state
            }))
        },
        pushArrayField: function (key, defaultValue) {
            /**
            * Push a field to the end of a field array.
            * @param {string} arrayKey - The key of the array (not the element).
            * @param {any} defaultValue - The defaultValue of the field to be pushed.
            */
            pushArrayField(key, defaultValue, set, get)
        },
        dropArrayField: function( arrayKey, index) {
            /**
             * Drop a field from an array.
             * @param {string} arrayKey - The key of the array (not them element)
             * @param {integer} index - Index of the item to delete.
             */
            dropArrayField(arrayKey, index, set)
        }
    }))
}
