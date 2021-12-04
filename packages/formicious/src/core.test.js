const core = require("./core")


describe("createForm", () => {
    it("creates basic store state.", () => {
	const form = core.createForm({}).getState()
	expect(form).toHaveProperty('formProps')
	expect(form).toHaveProperty('actions')
	expect(form).toHaveProperty('values')
    })

    it("optionally accepts initialValues and initialMeta, and clones them.", () => {
	const initialValues = {foo: "bar"}
	const initialMeta = {"foo": {touched: true}}
	const form = core.createForm({initialValues, initialMeta}).getState()
	initialValues.foo = "baz"
	initialMeta["baz"] = "qux"
	expect(form.values).toEqual({foo: "bar"})
	expect(form.meta).toEqual({"foo": {touched: true}})
	expect(form.initialized).toBeTruthy()
    })
})

describe("a field", () => {
    it("can be registered with metadata and a default value", () => {	
	const form = core.createForm({})
	form.getState().actions.registerField("foo.bar[2].baz", 10)
	expect(form.getState().values.foo.bar[2].baz).toEqual(10)
	expect(form.getState().meta["foo.bar[2].baz"]).toBeDefined()

    })
    it("registration will give precendence to initial value over default value", () => {
	const form = core.createForm({initialValues: {foo: {bar: [0,1,{baz: 2}]}}})
	form.getState().actions.registerField("foo.bar[2].baz", 10)
	expect(form.getState().values.foo.bar[2].baz).toEqual(2)
    })
    it("registers with a null value if neither an initial value or a default value are specified", () => {
	const form = core.createForm({})
	form.getState().actions.registerField("foo.bar[2].baz")
	expect(form.getState().values.foo.bar[2].baz).toBeNull()
    })

    it("can have their values swapped, in an object or an array", () => {
        const form = core.createForm({
	    initialValues: {foo: "bar", bar: [1,2,{baz: 5, qux: 7}]},
	    initialMeta: {"foo": {some: "meta"}, "bar[2]": {more: "data"}}
	})
        form.getState().actions.swapField("foo", "bar[2]")
	expect(form.getState().values.foo).toStrictEqual({baz: 5, qux: 7})
	expect(form.getState().meta["foo"]).toStrictEqual({more: "data"})
	expect(form.getState().values.bar[2]).toEqual("bar")
	expect(form.getState().meta["bar[2]"]).toStrictEqual({some: "meta"})	
    })

    it("can be deleted", () => {
        const form = core.createForm({
	    initialValues: {foo: "bar", bar: [1,2,{baz: 5, qux: 7}]},
	    initialMeta: {"foo": {some: "meta"}, "bar[2]": {more: "data"}}
	})
	form.getState().actions.deleteField("foo")
	form.getState().actions.deleteField("bar[2]")
	expect(form.getState().values).toStrictEqual({bar: [1,2]})
	expect(form.getState().meta).toStrictEqual({})
    })

    it("can be set without registration", () => {
	const form = core.createForm({initialValues: {foo: "bar"}})
	form.getState().actions.setField("bar.baz[2]", 10)
	form.getState().actions.setField("bar.baz[10].qux", "fizz")

	expect(form.getState().values.bar.baz[2]).toEqual(10)
	expect(form.getState().values.bar.baz[10].qux).toEqual("fizz")
	expect(form.getState().meta).toEqual({})
    })
})

describe("the field helper", () => {
    it("automagically registers a field", () => {
	const form = core.createForm({initialValues: {foo: "bar"}})
	const field = core.field({name: "bar.baz", defaultValue: 2})[0](form.getState())

	expect(field.value).toEqual(2)
	expect(field.meta).toEqual(form.getState().meta["bar.baz"])
	expect(form.getState().meta["bar.baz"]).toBeDefined()
	expect(form.getState().values.bar.baz).toEqual(2)
    })

    it("provides all necessary field props", () => {
	const form = core.createForm({})
	const field = core.field({name: "foo.bar[2][3].baz", defaultValue: 2})[0](form.getState())

	expect(field.props).toHaveProperty("onChange")
	expect(field.props).toHaveProperty("onBlur")
	expect(field.props).toHaveProperty("id")
	expect(field.props).toHaveProperty("name")
	expect(field.props.value).toEqual(2)
    })
})

describe("validation", () => {

})




