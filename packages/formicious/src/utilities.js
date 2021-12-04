export function isDefined(x) { return typeof x !== 'undefined' }
export function isNotDefined(x) { return !isDefined(x) }

export const INDEX_IS = {
    object: "object",
    array: "array",
    leaf: "leaf"
}

export function parseKey(key) {
    /**
     * Given a key string, return an array of objects representing each level of the key.
     * @param {string} key - The key string to parse.
     **/
    const keys = key.split(/[\[\.]/)
    return keys.reduce((agg, _key, idx) => {
        const child = keys[idx+1]
        if (agg[idx-1] && agg[idx-1].is === INDEX_IS.array) {
            _key = Number(_key.replace(/]/, ''))
        }
        if (child) {
            if (child.endsWith(']')) {
                return [...agg, {key: _key, is: INDEX_IS.array}]
            } else {
                return [...agg, {key: _key, is: INDEX_IS.object}]
            }
        } else {
            return [...agg, {key: _key, is: INDEX_IS.leaf}]
        }
    }, [])
}

// https://stackoverflow.com/questions/38416020/deep-copy-in-es6-using-the-spread-syntax
export function deepClone(obj){
	if(Array.isArray(obj)){
		var arr = [];
		for (var i = 0; i < obj.length; i++) {
			arr[i] = deepClone(obj[i]);
		}
		return arr;
	}
	if(typeof(obj) == "object" && obj !== null){
		var cloned = {};
		for(let key in obj){
			cloned[key] = deepClone(obj[key])
		}
		return cloned;
	}
	return obj;
}


export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
  }


export function keySet(key, value, obj) {
    /** Set a value in obj with a key string. 
     */
    const keys = parseKey(key)
    const lastKey = keys.pop()
    const _obj = keys.reduce((agg, k) => {
	if (isDefined(agg[k.key])) {
            return agg[k.key]
	} else {
	    switch(k.is) {
	    case "array": agg[k.key] = []; return agg[k.key]
	    case "object": agg[k.key] = {}; return agg[k.key]
	    default: throw new Error(`Did not expect leaf node in setKey`)
	    }
	}
    }, obj)
    _obj[lastKey.key] = deepClone(value)
}


export function keyGet(key, obj) {
    /** Get the value of obj at the index specified by a key string
     */
    const keys = parseKey(key)
    let ret = obj; 
    for(const k of keys) {
	if(isDefined(ret[k.key])) {
	    ret = ret[k.key]
	} else {
	    ret = undefined
	    break
	}
    }
    return ret 
}

export function keyDelete(key, obj) {
    /** Delete the entry specified by the key string.
     */
    const keys = parseKey(key)
    const lastKey = keys.pop()
    let _obj = obj;
    let parentType = typeof obj; 
    for (const k of keys) {
	if(isDefined(_obj[k.key])) {
	    _obj = _obj[k.key]
	    parentType = k.is
	} else {
	    return; 
	}
    }

    // With immer we can't ask typeof _obj, it's always an object.
    if (parentType === INDEX_IS.array) {
	_obj.splice(lastKey.key, 1)
    } else {
	delete _obj[lastKey.key]
    }
    return;    
}
