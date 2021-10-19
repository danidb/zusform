const createForm = require('./createForm').default
const buildDefaultMeta = require('./createForm').buildDefaultMeta
const setField = require('./createForm').setField
const getField = require('./createForm').getField
const Yup = require('yup')

describe("Form", () => {

    it("scaffolding is created by createForm", () => {
        const form = createForm()
        const state = form.getState()
        const properties = [
            "values",
            "meta",
            "initialized",
            "initialize",
            "registerField",
            "pushArrayField",
            "dropArrayField"
        ]
        properties.map(p => expect(state).toHaveProperty(p))
    })
})


describe("initialize", () => {
    it("sets initial values, onSubmit and the initialized flag, but does not set field metadata.", () => {
        const form = createForm()
        const initialValues = {foo: {bar: [1,2,3]}}
        form.getState().initialize(v => v, initialValues)
        expect(form.getState().values).toEqual(initialValues)
        expect(form.getState().initialized).toBeTruthy()
        expect(form.getState().meta).toEqual({})
        expect(form.getState().formProps.onSubmit).toBeDefined()
    })
})

describe("setField", () => {
    it ("sets a field in an existing object.", () => {
        const obj = {foo: {bar: [1,2,3]}}
        setField(obj, "foo.bar[10]", 1729)
        setField(obj, "foo.bar[2]", 8)
        expect(obj.foo.bar[10]).toEqual(1729)
        expect(obj.foo.bar[2]).toEqual(8)
    })

    it("creates fields that don't exist.", () => {
        const obj = {foo: {}}
        setField(obj, "foo.bar[10].baz", 10)
        setField(obj, "bar.baz[19].bin[10].baz", [1980])
        expect(obj.foo.bar[10].baz).toEqual(10)
        expect(obj.bar.baz[19].bin[10].baz).toEqual([1980])
    })
})

describe("getField", () => {
    it ("returns default values if the field or any of its parents don't exist.", () => {
        const obj = {foo: {}}
        expect(getField(obj, "foo.bar[10]", 15)).toEqual(15)
    })
    it ("successfully returns field if it exists.", () => {
        const obj = {foo: {bar: [,,,{baz: [,,[1729]]}]}}
        expect(getField(obj, "foo.bar[3].baz[2]", 10)).toEqual([1729])
        expect(getField(obj, "foo.bar[3].baz[2]")).toEqual([1729])
        expect(getField(obj, "foo.bar.baz")).toEqual(undefined)
    })
})

describe("registerField", () => {
    it("creates field metadata for a field whose value was already specified during initialization.", () => {
        const form = createForm()
        form.getState().initialize(v => v, {foo: {bar: [1,2,3]}})
        form.getState().registerField("foo.bar[0]")
        expect(form.getState().values.foo.bar[0]).toEqual(1)
        expect(form.getState().meta.foo.bar[0]).toHaveProperty("touched")
    })

    it("sets the specificed default value if none has been set by initialValues", () => {
        const form = createForm()
        form.getState().registerField("foo.bar[5]", "foo")
        expect(form.getState().values.foo.bar[5]).toEqual("foo")
    })

    it("sets the specificed default value if none has been set by initialValues", () => {
        const form = createForm()
        form.getState().registerField("foo.bar[5]", "foo")
        expect(form.getState().values.foo.bar[5]).toEqual("foo")
    })

    it("does not overwrite a value set by initialize.", () => {
        const form = createForm()
        form.getState().initialize(v => v, {foo: {bar: [,,,"fiz"]}})
        form.getState().registerField("foo.bar[3]", "buzz")
        expect(form.getState().values.foo.bar[3]).toEqual("fiz")
    })
})


describe("pushArrayField", () => {
    it("creates an array that does not exist.", () => {
        const form = createForm()
        form.getState().pushArrayField("foo.bar", {foo: "bar"})
        expect(form.getState().values).toEqual({foo: {bar: [{foo: "bar"}]}})
        expect(form.getState().meta.foo.bar.length).toEqual(1)
    })

    it("can add an item to an existing array.", () => {
        const form = createForm()
        form.getState().initialize(console.log, {bar: {baz: [1,2]}})
        form.getState().pushArrayField("bar.baz", "piece")
        expect(form.getState().values).toEqual({bar: {baz: [1,2,"piece"]}})
        expect(form.getState().meta.bar.baz.length).toEqual(3)
    })
})

describe("dropArrayField", () => {
    it("just works.", () => {
        const form = createForm()
        const initialState = {bar: {baz: [1,2,3]}}
        form.getState().initialize(console.log, initialState)
        form.getState().pushArrayField("bar.baz", 4)
        expect(form.getState().values).toEqual({bar: {baz: [1,2,3,4]}})
        expect(form.getState().meta.bar.baz.length).toEqual(4)
        form.getState().dropArrayField("bar.baz", 2)
        expect(form.getState().values).toEqual({bar: {baz: [1,2,4]}})
        expect(form.getState().meta.bar.baz.length).toEqual(3)
    })
})

describe("handleChange", () => {
    it("updates the field value, runs validation and sets metadata.", () => {
    const form = createForm()
        form.getState().registerField('foo.bar[2]', 'fiz')
        form.getState().handleChange('foo.bar[2]')(4)
        expect(form.getState().values.foo.bar[2]).toEqual(4)
        expect(form.getState().meta.foo.bar[2].touched).toBeTruthy()
        expect(form.getState().meta.foo.bar[2].error).toEqual("")
    })
})
