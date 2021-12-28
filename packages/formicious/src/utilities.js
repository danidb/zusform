import crypto from 'crypto'
export function isDefined(x) { return typeof x !== 'undefined' }
export function isNotDefined(x) { return !isDefined(x) }
export function isObject(x) { return typeof x === 'object' && !Array.isArray(x) }
export function isArray(x) { return Array.isArray(x) }


export const INDEX_IS = {
    object: "object",
    array: "array",
    leaf: "leaf"
}

export function parseKey(key, proxy) {
    /**
     * Given a key string, return an array of objects representing each level of the key.
     * A proxy key can be provided if dealing with structures where there's some kind of metadata etc.
     * at each level. Think of this as similar to the "properties" key in a JSON Schema.
     * @param {string} key - The key string to parse.
     * @param {string} proxy - Proxy key that represnets a key's children.
     **/
    let keys = key.split(/[\[\.]/)
    let ret = keys.reduce((agg, _key, idx) => {
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

    if (isDefined(proxy)) {
	return ret.reduce((agg, _key, idx) => {
	    if (_key.is === INDEX_IS.leaf) {
		return [
		    ...agg,
		    ...(idx === 0 ? [{key: proxy, is: INDEX_IS.object, isProxy: true}] : []),
		    {..._key, isProxy: false}
		]
	    } else {
		return [
		    ...agg,
		    ...(idx === 0 ? [{key: proxy, is: INDEX_IS.object, isProxy: true}] : []),
		    {key: _key.key, is: INDEX_IS.object, isProxy: false},
		    {key: proxy, is: _key.is, isProxy: true}
		]
	    }
	}, [])
    } else {
	return ret
    }
}

export function isKeyParentOrSelf(self, other) { return self.startsWith(other) }
export function getParentOrSelfKeys(self, obj) { return Object.keys(obj).filter(k => isKeyParentOrSelf(self, k)) }
export function getChildrenOrSelfKeys(self, obj) { return Object.keys(obj).filter(k => isKeyParentOrSelf(k, self)) }

// https://stackoverflow.com/questions/38416020/deep-copy-in-es6-using-the-spread-syntax
export function deepClone(obj){
    if(isArray(obj)){
	var arr = [];
	for (var i = 0; i < obj.length; i++) {
	    arr[i] = deepClone(obj[i]);
	}
	return arr;
    }
    if(isObject(obj) && obj !== null){
	var cloned = {};
	// NOTE getOwnPropertyNames gives us all properties, not just
	// enumerable properties.
	for(const key of Object.getOwnPropertyNames(obj)){
	    cloned[key] = deepClone(obj[key])
	}
	Object.setPrototypeOf(cloned, obj.__proto__)
	return cloned;
    }
    return obj;
}


export function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.randomBytes(16)[0] & 15 >> c / 4).toString(16)
    );
  }

/** NOTE re. mutability
 * We want keySet, keySplice, keyDelete to mutate the object.
 * Immutability is a concern of the state store, not these utilities.
 * To work with immutable objects, we pass keySet and friends immer's "draft."
 *
 * Be careful with proxy/defaults. They might now always do what you expect.
 * keySet doesn't consider the proxy for the lowest level key being modified.
 * This is because we will want to move around the proxy structure and the properties
 * for a given key.
 */
export function keySet(key, value, obj, proxy, defaults, property) {
    /** Set a value in obj with a key string.
     */
    const keys = parseKey(key, proxy)
    const lastKey = keys.pop()

    let _obj = keys.reduce((agg, k) => {
	if (isDefined(agg[k.key])) {
            return agg[k.key]
	} else {
	    switch(k.is) {
	    case "array": agg[k.key] = []; return agg[k.key]
	    case "object": {
		if (isDefined(proxy) && isDefined(defaults) && !k.isProxy) {
		    agg[k.key] = deepClone(defaults)
		} else {
		    agg[k.key] = {}
		}
		return agg[k.key]
	    }
	    default: throw new Error(`Did not expect leaf node in setKey`)
	    }
	}
    }, obj)

    if (isDefined(proxy) && isDefined(property)) {
	_obj[lastKey.key] = {
	    ...(isDefined(defaults) ? deepClone(defaults) : {}),
	    ..._obj[lastKey.key],
	    [property]: deepClone(value)
	}
    } else {
	_obj[lastKey.key] = deepClone(value)
    }
}

export function keyGet(key, obj, proxy) {
    /** Get the value of obj at the index specified by a key string
     */
    const keys = parseKey(key, proxy)
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

export function keyDelete(key, obj, proxy) {
    /** Delete the entry specified by the key string.
     */
    const keys = parseKey(key, proxy)
    const lastKey = keys.pop()
    let _obj = obj;
    for (const k of keys) {
	if(isDefined(_obj[k.key])) {
	    _obj = _obj[k.key]
	} else {
	    // Should throw
	    return;
	}
    }

    if (isArray(_obj)) {
	_obj.splice(lastKey.key, 1)
    } else {
	delete _obj[lastKey.key]
    }
    return;
}


export function keySwap(keyA, keyB, obj, proxy) {
    /** Swap the va
 lues specified by two keys.
     */
    const valueA = keyGet(keyA, obj, proxy)
    const valueB = keyGet(keyB, obj, proxy)

    keySet(keyA, valueB, obj, proxy)
    keySet(keyB, valueA, obj, proxy)
}

export function keySplice(key, start, deleteCount, obj, items, proxy) {
    const keys = parseKey(key, proxy)
    let _obj = obj
    for(const k of keys) {
	if(isDefined(_obj[k.key])) {
	    _obj = _obj[k.key]
	} else {
	    // should throw
	    return;
	}
    }
    if (isDefined(proxy)) {
	if (isDefined(_obj[proxy])) {
	    _obj[proxy].splice(start, deleteCount, ...items)
	} else {
	    // should throw
	    return;
	}
    } else {
	if (isArray(_obj)) {
	    _obj.splice(start, deleteCount, ...items)
	} else {
	    // throw
	    return
	}
    }
}

export function keyApply(key, obj, fn, proxy) {
    /** Apply the function fn to a key's value.
     *	The key has to exist already.
     */
    const keys = parseKey(key, proxy)
    let current = obj;
    for(const k of keys) {
	if(isDefined(current[k.key])) {
	    current = current[k.key]
	} else {
	    // TODO throw
	    break
	}
    }
    fn(current)
}

/** NOTE
 * If used with immer, need to pass original(draft)
 * we need to know if we're traversing arrays or objects and
 * immer hides this type information (everything is an object)
 */
export function proxyTraverse(obj, fn, proxy) {
    function _proxyTraverse(obj, fn, proxy, key, fromProxy) {
	if (fromProxy) {
	    if (isArray(obj)) {
		obj.forEach((child, idx) => {
		    _proxyTraverse(child, fn, proxy, `${key}[${idx}]`, false)
		})
	    } else if (isObject(obj)) {
		Object.keys(obj).forEach(childKey => {
		    const nextKey = isDefined(key) ? `${key}.${childKey}` : childKey
		    _proxyTraverse(obj[childKey], fn, proxy, nextKey, false)
		})
	    } else {
		return
	    }
	} else {
	    fn(obj, key)
	    if (isDefined(obj[proxy])) {
		_proxyTraverse(obj[proxy], fn, proxy, key, true)
	    } else {
		return
	    }
	}
    }
    // traversal fn is applied to root
    _proxyTraverse(obj, fn, proxy, undefined, false)
}
