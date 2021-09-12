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

// TODO: This function does too many things to be called 'select'. Consider breaking it up or renaming it.
export function select(key:string, build?:boolean, value?:any) {
    console.log(key, build, value)
    return parseKey(key).reduce((selector, _key) => {
        if (build) {
            return v => {
                if (typeof selector(v, build, value)[_key.key] !== 'undefined' && _key.type != 'leaf') {
                    return selector(v, build, value)[_key.key]
                } else {
                    switch(_key.type) {
                        case "array": selector(v, build, value)[_key.key] = []; break;
                        case "object": selector(v, build, value)[_key.key] = {}; break;
                        case "leaf": {
                            if (typeof value !== 'undefined') {
                                selector(v, build, value)[_key.key] = value;
                                break;
                            } else {
                                break;
                            }
                        }
                        default: break;
                    }
                    return selector(v, build, value)[_key.key]
                }
            }
        }
        return v => {
            if (typeof selector(v, build, value) !== 'undefined') {
                if (_key.type === 'leaf' && typeof value !== 'undefined') {
                    selector(v, build, value)[_key.key] = value
                }
                return selector(v, build, value)[_key.key]
            } else {
                return undefined
            }
        }
    }, v => v)
}
