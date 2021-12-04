import create from 'zustand'
import shallow from 'zustand/shallow'
import produce from 'immer'
import {
    deepClone,
    keySet,
    keyGet,
    keyDelete, 
    INDEX_IS,
    isDefined,
    isNotDefined,
    uuidv4
} from "./utilities"

function setField(set, get, key, value, validate) {
    set(draft => {
        keySet(key, value, draft.values)
	if(isDefined(draft.meta[key])) { 
	    draft.meta[key].touched = true
	}
    })
}


function deleteField(set, get, key) {
    set(draft => {
	keyDelete(key, draft.values)
	delete draft.meta[key]
	return draft
    })
}

function validateField(set, get, key) {
    set(draft => {
	const schema = draft.schema
	const validator = draft.meta[key].validator
	if (isDefined(schema)) { 
	    try {	    
		schema.validateSyncAt(key, draft.values)
		draft.meta[key].error = undefined
	    } catch(err) {
		draft.meta[key].error = err.message	    
	    }
	} else if (isDefined(validator)) {
            const error = validator(keyGet(key, draft.values))
            draft.meta[key].error = error 
	}
    })
}


function swapField(set, get, keyA, keyB) {
    set(draft => {
	const valueA = keyGet(keyA, draft.values)
	keySet(keyA, deepClone(keyGet(keyB, draft.values)), draft.values)
	keySet(keyB, deepClone(valueA), draft.values)	
	const metaA = draft.meta[keyA]
	draft.meta[keyA] = deepClone(draft.meta[keyB])
	draft.meta[keyB] = deepClone(metaA)
	return draft 
    })
}


function registerField(set, get, key, value, meta, validate) {
    const _meta = isDefined(meta) ? meta : getDefaultMeta(validate)
    set(draft => {
	const initialValue = keyGet(key, draft.values)
	if (isNotDefined(initialValue)) {
	    if (isDefined(value)) {
		keySet(key, value, draft.values)
	    } else {
		keySet(key, null, draft.values)
	    }
	}

	if (isNotDefined(draft.meta[key])) { 	    
            draft.meta[key] = deepClone(_meta)
	}
	return draft
    })
    return deepClone(_meta)
}

function formSetMiddleware(config) {
    return function(set, get, api) {
	return config((partial, replace) => {
	    const nextState = produce(partial)
	    return set(nextState, replace)
	}, get, api)
    }
}


function getDefaultMeta(validate) {
    const defaultMeta = {
	touched: false,
	error: false,
	errorMessage: undefined,
    }
    return deepClone(defaultMeta)
}

export function field({name, defaultValue, defaultMeta, validate, inTransform, outTransform}) {
    return [
	function(state) {

            let outValue; let meta; 
	    if(isNotDefined(state.meta[name])) {
		meta = state.actions.registerField(name, defaultValue, defaultMeta, validate)		
		outValue = deepClone(defaultValue)

	    } else {
		outValue = deepClone(keyGet(name, state.values))
		meta = deepClone(state.meta[name])
	    }	    
	    outValue = isDefined(outTransform) ? outTransform(outValue) : outValue
			
	    return {
		value: outValue,
		meta,
		props: { 
		    id: name, 
		    name, 
		    onChange: function(e) {
			let inValue; 
			if ('target' in e && 'value' in e.target) {
			    inValue = e.target.value
			    inValue = isDefined(inTransform) ? inTransform(inValue) : inValue 
			} else {
			    inValue = e
			    inValue = isDefined(inTransform) ? inTransform(inValue) : inValue
			}
			state.actions.setField(name, inValue)
		    },
		    onBlur: function() { state.actions.validateField(name) },
		    value: outValue 
		}	
	    }
	},
	shallow
    ]
}


function initializeForm(set, get, values, meta) {
    set(draft => {
	draft.values = isDefined(values) ? deepClone(values) : {}
	draft.meta = isDefined(meta) ? deepClone(meta) : {}
	draft.initialized = true 
	return draft 
    })
}

export  function createForm({initialValues, initialMeta, schema, handleSubmit}) {
    return create(
	formSetMiddleware(
	    (set, get, api) => ({
		schema: isDefined(schema) && deepClone(schema),
		initialized: false || isDefined(initialValues) || isDefined(initialMeta), 
		formProps: {
		    onSubmit: function (e) {
			e.preventDefault();
			if (isDefined(handleSubmit)) {
			    handleSubmit(get().values)
			} else {
			    console .log(get().values)
			}
		    }
		},
		meta: isDefined(initialMeta) ? deepClone(initialMeta) : {},
		values: isDefined(initialValues) ? deepClone(initialValues) : {},
		actions: {
		    registerField: function (name, value, meta, validate) { return registerField(set, get, name, value, meta, validate) },
		    deleteField: function (name) { deleteField(set, get, name) },
		    swapField: function(nameA, nameB) { swapField(set, get, nameA, nameB) },
		    setField: function(name, value, validate) { setField(set, get, name, value, validate) },
		    initialize: function(values, meta) { initializeForm(set, get, values, meta) }
		},
	    })
	)
    )
}


