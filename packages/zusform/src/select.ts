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
    return parseKey(key).reduce((selector, _key) => {
        if (build) {
            return v => {
                if (selector(v, build, value)[_key.key]) {
                    return selector(v, build, value)[_key.key]
                } else {
                    switch(_key.type) {
                        case "array": selector(v, build, value)[_key.key] = []; break;
                        case "object": selector(v, build, value)[_key.key] = {}; break;
                        case "leaf": selector(v, build, value)[_key.key] = value; break;
                        default: break;
                    }
                    return selector(v, build, value)[_key.key]
                }
            }
        }
        return v => {
            if (selector(v, build, value)) {
                if (_key.type === 'leaf' && value != undefined) {
                    selector(v, build, value)[_key.key] = value
                }
                return selector(v, build, value)[_key.key]
            } else {
                return undefined
            }
        }
    }, v => v)
}
