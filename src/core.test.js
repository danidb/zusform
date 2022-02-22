const core = require("./core")
const { keyGet } = require("./utilities.js")

const { randomFillSync } = require("crypto")
Object.defineProperty(window, "crypto", {
    value: {getRandomValues: randomFillSync }
})

describe("createForm", () => {
    it("creates basic store state.", () => {
	const form = core.createForm({}).getState()
	const props = ['formProps', 'meta', 'actions', 'values']
	props.map(p => expect(form).toHaveProperty(p))
    })

    it("optionally accepts initialValues and initialMeta, and clones them (not mutable).", () => {
	const values = {foo: "bar"}
	const meta = {fields: {foo: {touched: true}}}
	const form = core.createForm({values, meta}).getState()
	values.foo = "baz"
	meta.fields.foo.touched = false
	expect(form.values).toEqual({foo: "bar"})
	expect(form.meta).toEqual({validators: [], fields: {foo: {touched: true}}})
	expect(!form.initialized).toBeTruthy()
    })
})

describe("a field", () => {
    it("can be registered with metadata and a default value", () => {
	const form = core.createForm({})
	form.getState().actions.registerField({name: "foo.bar[2].baz", defaultValue: 10})
	expect(keyGet("foo.bar[2].baz", form.getState().values)).toEqual(10)
	expect(keyGet("foo.bar[2].baz", form.getState().meta, core.PROXY_KEY)).toBeDefined()
    })

    it("registration will give precendence to initial value over default value", () => {
	const form = core.createForm({values: {foo: {bar: [0,1,{baz: 2}]}}})
	form.getState().actions.registerField({name: "foo.bar[2].baz", defaultValue: 10})
	expect(keyGet("foo.bar[2].baz", form.getState().values)).toEqual(2)
    })

    it("registers only metadata if neither an initial value or a default value are specified", () => {
	const form = core.createForm({})
	form.getState().actions.registerField({name: "foo.bar[2].baz"})
	expect(form.getState().values.foo.bar[2].baz).toEqual(undefined)
	expect(keyGet("foo.bar[2].baz", form.getState().meta, core.PROXY_KEY).isRegistered).toBeTruthy()
    })

    it("can have values swapped, in an object or an array", () => {
        const form = core.createForm({
	    values: {foo: "bar", bar: [1,2,{baz: 5, qux: 7}]},
	    meta: {fields: {foo: {some: "meta"}, bar: {fields: [,,{more: "data"}]}}}
	})
        form.getState().actions.swapField("foo", "bar[2]")
	expect(form.getState().values.foo).toStrictEqual({baz: 5, qux: 7})
	expect(form.getState().meta.fields.foo).toStrictEqual({more: "data"})
	expect(form.getState().values.bar[2]).toEqual("bar")
	expect(form.getState().meta.fields.bar.fields[2]).toEqual({some: "meta"})
    })

    it("can be deleted", () => {
        const form = core.createForm({
	    values: {foo: "bar", bar: [1,2,{baz: 5, qux: 7}]},
	    meta: {
		fields: {
		    foo: {some: "meta"},
		    bar: {
			fields: [
			    ,,{more: "data"}
			]
		    }
		}
	    }
	})
	form.getState().actions.deleteField("foo")
	form.getState().actions.deleteField("bar[2]")
	expect(form.getState().values).toStrictEqual({bar: [1,2]})
	expect(form.getState().meta).toStrictEqual({
	    validators: [],
	    fields: {bar: {fields: [undefined, undefined]}}
	})
    })

    it("can be set without registration", () => {
	const form = core.createForm({values: {foo: "bar"}})
	form.getState().actions.setField("bar.baz[2]", 10)
	form.getState().actions.setField("bar.baz[10].qux", "fizz")

	expect(form.getState().values.bar.baz[2]).toEqual(10)
	expect(form.getState().values.bar.baz[10].qux).toEqual("fizz")
	expect(form.getState().meta).toEqual({validators: []})
    })

})


describe("Validation", () => {
    function  even({name, value, values}) {
	if (!(value % 2)) {
	    return [{name, error: `Must be even`, data: {value}}]
	} else {
	    return []
	}
    }

    function odd({name, value, values}) {
	if (value % 2) {

	    return [{name, error: `Must be odd`, data: {value}}]
	} else {
	    return []
	}
    }

    test("Field registration accepts a validator function.", () => {
	const form = core.createForm({initialValues: {foo: "bar", bar: [{baz: 2}, {qux: 3}]}})
	form.getState().actions.registerField({form: form, name: "bar[0].baz", defaultMeta: {validators: [even]}})

	expect(
	    keyGet("bar[0].baz", form.getState().meta, core.PROXY_KEY).validators
	).toStrictEqual([even])

    })

    test("Form validators with validateField methods are applied during field validation.", () => {
	const validator = {
	    validateField: (args) => {
		if (args.name === "foo") {
		    return odd(args)
		} else {
		    return even(args)
		}
	    }
	}

	const form = core.createForm({
	    values: {foo: "bar", bar: [{baz: 2}, {qux: 3}]},
	    meta: {validators: [validator]}
	})

	form.getState().actions.registerField({name: "bar[0].baz", defaultMeta: {validators: [even]}})
	form.getState().actions.validateField("bar[0].baz")


	expect(
	    keyGet("bar[0].baz", form.getState().meta, core.PROXY_KEY).fieldValidation[0].data.value
	).toEqual(2)

	form.getState().actions.setField("bar[0].baz", 3)
	form.getState().actions.validateField("bar[0].baz")

	expect(
	    keyGet("bar[0].baz", form.getState().meta, core.PROXY_KEY).fieldValidation
	).toEqual([])
    })

    test("Form validation applies all form validators and stores errors in user-specified keys.", () => {
	const validator1 = {
	    validate: (values) => {
		if (values.foo === 2) {
		    return [{key: "foo", error: "bad"}, {key: "bar", error: "bad"}]
		} else {
		    return []
		}
	    }
	}
	const validator2 = {
	    validate: (values) => {
		if (values.foo === 2 && !(values.bar === 3)) {
		    return [{key: "foo", error: "worse"}]
		} else {
		    return []
		}
	    }
	}

	const form = core.createForm({
	    values: {foo: 2, bar: [{baz: 2}, {qux: 3}]},
	    meta: {validators: [validator1, validator2]}
	})

	form.getState().actions.validateForm()
	expect(
	    keyGet("foo", form.getState().meta, core.PROXY_KEY).formValidation.length
	).toEqual(2)

    })
})
