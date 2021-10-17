const createForm = require('./createForm').default
const getEntrySelector = require('./createForm').getEntrySelector
const buildDefaultMeta = require('./createForm').buildDefaultMeta
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

describe("getField", () => {
    it("registers a field and returns value, meta.", () => {
        const form = createForm()
        const { value, meta } = form.getState().getField("foo.bar", 12)
        expect(value).toEqual(12)
        expect(meta.touched).toBeFalsy()
        meta.handleChange(1729)
        expect(form.getState().values.foo.bar).toEqual(1729)
        expect(form.getState().getField("foo.bar").value).toEqual(1729)
        expect(form.getState().getField("foo.bar").meta.touched).toBeTruthy()
        expect(form.getState().getField("foo.bar", "foo").meta.touched).toBeTruthy()
    })

    it("performs validation based on a provided Yup schema, if it is available.", () => {
        const form = createForm()
        form.getState().initialize(
            v => v,
            {foo: {bar: [0,1,15]}},
            Yup.object().shape({
                foo: Yup.object().shape({
                    bar: Yup.array().of(Yup.number().lessThan(20, "Absolutely not."))
                })
            })
        )
        const { value, meta } = form.getState().getField("foo.bar[2]")
        meta.handleChange(25)
        expect(form.getState().errors["foo.bar[2]"]).toEqual("Absolutely not.")
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

describe("getEntrySelector", () => {
    it ("retrieves values by key.", () => {
        const obj = {foo: {bar: [1,2,3,{fiz: "buzz"}]}}
        const key = "foo.bar[3].fiz"
        const entry = getEntrySelector(key)
        expect(entry(obj)).toEqual("buzz")
    })

    it ("can set a value by key.", () => {
        const obj = {foo: {bar: [1,2,3,{fiz: "buzz"}]}}
        const key = "foo.bar[3]"
        const entry = getEntrySelector(key, false, 12)
        expect(entry(obj)).toEqual(12)
        expect(obj).toEqual({foo: {bar: [1,2,3,12]}})
    })
    it ("can be used to manipulate the original object.", () => {
        const obj = {foo: {bar: [1,2,3,{fiz: "buzz"}]}}
        const key = "foo.bar[3]"
        const entry = getEntrySelector(key)
        entry(obj).fiz = "figs"
        expect(entry(obj).fiz).toEqual("figs")
    })

    it ("can be used to perform array operations.", () => {
        const obj = {foo: {bar: [1,2,3]}}
        const key = "foo.bar"
        const entry = getEntrySelector(key)
        entry(obj).push(1729)
        expect(entry(obj)[3]).toEqual(1729)
    })
    it("can be configured to build entries on empty objects.", () => {
        const obj = {}
        const key = "foo.bar[12].baz.value"
        const entry = getEntrySelector(key, true, 1729)
        const value = entry(obj)
        expect(value).toEqual(1729)
        expect(obj).toEqual({foo: {bar: [,,,,,,,,,,,,{baz: {value: 1729}}]}})
    })

    it("can be configured to build entries on nonempty objects.", () => {
        const obj = {foo: {bin: 12, bar: [2,3,4]}, bar: 2}
        const key = "foo.bar[12].baz.value"
        const entry = getEntrySelector(key, true, 1729)
        const value = entry(obj)
        expect(value).toEqual(1729)
        expect(obj).toEqual({bar: 2, foo: {bin: 12, bar: [2,3,4,,,,,,,,,,{baz: {value: 1729}}]}})
    })

    it("will not overwrite when building.", () => {
        const obj = {foo: {bin: 12, bar: [2,3,4]}, bar: 2}
        const key = "foo.bar[2].foo"
        const entry = getEntrySelector(key, true, 1729)
        const value = entry(obj)
        expect(value).toEqual(4)
        expect(obj).toEqual({foo: {bin: 12, bar: [2,3,4]}, bar: 2})
    })
})

describe("handleChange", () => {
    it("updates the field value, runs validation and sets metadata.", () => {
    const form = createForm()
        form.getState().registerField('foo.bar[2]', 'fiz')
        form.getState().meta.foo.bar[2].handleChange(4)
        expect(form.getState().values.foo.bar[2]).toEqual(4)
        expect(form.getState().meta.foo.bar[2].touched).toBeTruthy()
        expect(form.getState().meta.foo.bar[2].error).toEqual("")
    })
})
describe("handleChangeEvent", () => {
    it("updates the field value, runs validation and sets metadata.", () => {
    const form = createForm()
        form.getState().registerField('foo.bar[2]', 'fiz')
        form.getState().meta.foo.bar[2].handleChangeEvent({target: {value: 4}})
        expect(form.getState().values.foo.bar[2]).toEqual(4)
        expect(form.getState().meta.foo.bar[2].touched).toBeTruthy()
        expect(form.getState().meta.foo.bar[2].error).toEqual("")
    })
})
