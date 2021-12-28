import Yup from 'yup'
import { isDefined } from './utilities'


// NOTE Does this really need to be a class? Can't I just use a factory?
export function YupValidator(schema) {
    this.schema = schema
}
YupValidator.prototype.validate = function(obj) {
    let errors = []
    try {
	this.schema.validateSync(obj, {abortEarly: false})
    } catch (err) {
	errors = err.inner.map(e => ({
	    value: e.params.originalValue,
	    name: e.path,
	    key: e.path,
	    error: e.message
	}))
    }
    return errors
}
YupValidator.prototype.validateField = function({name, value, values}) {
    let errors = []
    try {
	this.schema.validateSyncAt(name, values, {abortEarly: false})
    } catch (err) {
	errors = err.inner.map(e => ({
	    value,
	    name,
	    error: e.message
	}))
    }
    return errors
}
