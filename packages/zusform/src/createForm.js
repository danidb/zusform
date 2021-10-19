import create from 'zustand'
import shallow from 'zustand/shallow'
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

const head = ([h]) => h
const tail = ([,...t]) => t

export function getField(obj, key, value) {
    /**
     * @param {any} - The object
     * @param {string} key - Field key, e.g. "foo.bar[2].baz"
     * @param {any=undefined} value - The default to return if the field doesn't exist.
     */
    const keys = parseKey(key)
    function _getField(obj, keys, value) {
        const _key = head(keys)
        const _obj = obj[_key.key]
        if (typeof _obj === 'undefined') {
            return value
        }
        switch(_key.type) {
            case "array":
            case "object":
                return _getField(_obj, tail(keys), value)
            default:
                return _obj || value
        }
    }
    return _getField(obj, keys, value)
}

export function setField(obj, key, value) {
    /**
     * Creates nested structures if they do not exist.
     * @param {any} obj - The object
     * @param {string} key - Field key, e.g. "foo.bar[3].baz"
     * @param {value} value - The value to set
     */
    const keys = parseKey(key)
    function _setField(obj, keys, value) {
        const _key = head(keys)
        switch (_key.type) {
            case "array":
                if (typeof obj[_key.key] === 'undefined') {
                    obj[_key.key] = [];
                }
                return _setField(obj[_key.key], tail(keys), value)
            case "object":
                if (typeof obj[_key.key] === 'undefined') {
                    obj[_key.key] = {}
                }
                return _setField(obj[_key.key], tail(keys), value)
            case "leaf":
                obj[_key.key] = value
                break;
            default: break;
        }
    }
    _setField(obj, keys, value)
}

// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }

export function buildDefaultMeta(name, set, get) {
    const key = uuidv4()
    return {
        key: key,
        touched: false,
        error: ""
    }
}


function validateField(name, set, get) {
    set(produce(
        draft => {
            const schema = get().yupSchema
            if (schema) {
                let validation;
                try {
                    schema.validateSyncAt(name, get().values)
                    if (name in Object.keys(draft.errors)) {
                        delete draft.errors[name]
                        setField(draft.meta, `${name}.error`, "")
                    }
                } catch(err) {
                    draft.errors[name] = err.message
                    setField(draft.meta, `${name}.error`, err.message)
                }
            }
        }
    ))
}

function handleChange(name, set, get) {
    return v => {
        set(produce(
            draft => {
                setField(draft.values, name, v)
                setField(draft.meta, `${name}.touched`, true)
            }
        ))
        validateField(name, set, get)
    }
}

function pushArrayField(arrayKey, defaultValue, set, get) {
    set(produce(
        draft => {
            const value = getField(get().values, arrayKey)
            let idx = 0;
            if (typeof value === 'undefined') {
                setField(draft.values, arrayKey, [])
            } else {
                idx = value.length
            }
            const key = `${arrayKey}[${idx}]`
            setField(draft.values, key, defaultValue)
            setField(draft.meta, key, buildDefaultMeta(`${arrayKey}[${idx}]`, set, get))
        }
    ))
}

function dropArrayField(arrayKey, index, set, get) {
    set(produce(
        draft => {
            const value = [...getField(get().values, arrayKey)]
            const meta = [...getField(get().meta, arrayKey)]
            value.splice(index, 1)
            meta.splice(index, 1)
            setField(draft.values, arrayKey, value)
            setField(draft.meta, arrayKey, meta)
        }
    ))
}

function registerField(name, defaultValue, set, get) {
    set(produce(
        draft => {
            const value = getField(draft.values, name)
            if (typeof value === 'undefined') {
                setField(draft.values, name, defaultValue)
            }
            const meta = getField(draft.meta, name)
            if (typeof meta === 'undefined') {
                setField(draft.meta, name, buildDefaultMeta(name, set, get))
            }
        }
    ))
}

export function fieldArray(name) {
    return [
        form => {
            return  { value: getField(form.values, name), meta: getField(form.meta, name) }
        },
        (a, b) => {
            if (typeof b.meta !== 'undefined') {
                if (typeof a.meta !== 'undefined') {
                    return JSON.stringify(a.meta.map(e => e.key)) === JSON.stringify(b.meta.map(e => e.key))
                } else {
                    return false
                }
            }
            return true
        }
    ]
}

export function field(name, defaultValue, register) {
    return [
        form => {
            const meta = getField(form.meta, name)
            const value = getField(form.values, name)
            return {
                value,
                meta,
                register: form.registerField,
                registered: typeof meta !== 'undefined',
                handleChange: form.handleChange(name),
                handleChangeEvent: e => form.handleChange(name)(e.target.value)
            }
        },
        (a ,b) => JSON.stringify(a) === JSON.stringify(b)
    ]
}

export default function createForm() {
    return create((set, get) => ({
        initialized: false,
        yupSchema: undefined,
        errors: {},
        values: {},
        meta: {},
        formProps: {},
        handleChange: function (name) {
            /**
             * Constructs the onChange callback for a given field. Returns a function.
             * @param {string} name - Field name (key path in form state).
             */
            return handleChange(name, set, get)
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
                set(produce(
                    draft => {
                draft.formProps.onSubmit = function (e) {
                    e.preventDefault(); handleSubmit(get().values)
                }
                draft.values = initialValues || draft.values
                draft.meta = {}
                draft.initialized = true
                draft.yupSchema = yupSchema
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
        dropArrayField: function(arrayKey, index) {
            /**
             * Drop a field from an array.
             * @param {string} arrayKey - The key of the array (not them element)
             * @param {integer} index - Index of the item to delete.
             */
            dropArrayField(arrayKey, index, set, get)
        },
    }))
}
