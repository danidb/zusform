const createForm = require('./createForm').default

describe("Forms", () => {
    it("Can be initialized with actions.initialize", () => {
        const form = createForm()
        expect(form.getState().initialized).toBeFalsy()
        const initialize = form.getState().actions.initialize
        initialize(values => expect(values).toEqual({foo: "bar"}), {foo: "bar"}) // How kosher is this test in a callback? :-)
        expect(form.getState().initialized).toBeTruthy()
        expect(form.getState().fields.values.foo).toEqual("bar")
        form.getState().formProps.onSubmit({preventDefault: () => undefined}) // See above. :-)
    })
})

describe("Fields", () => {
    it ("can be registered with 'register,' with a default value, if no initial value is provided", () => {
        const form = createForm()
        const register = form.getState().actions.register
        let field = register("foo.bar[1].something", 1729)
        expect(field.value).toEqual(1729)
        expect(form.getState().fields.values.foo.bar[1].something).toEqual(1729)
        expect(form.getState().fields.touched.foo.bar[1].something).toEqual(false)
        expect(form.getState().fields.onChange.foo.bar[1].something).toBeDefined()
    })

    it ("can be registered without providing a default value, if one has already been set", () => {
        const form = createForm()
        const register = form.getState().actions.register
        let field = register("foo.bar[1].something", 1729)
        expect(field.value).toEqual(1729)
        expect(form.getState().fields.values.foo.bar[1].something).toEqual(1729)
        expect(form.getState().fields.touched.foo.bar[1].something).toEqual(false)
        expect(form.getState().fields.onChange.foo.bar[1].something).toBeDefined()
    })

    it("can be registered with a default value that overides one that has already been set", () => {
        const form = createForm()
        const initialize = form.getState().actions.initialize
        initialize(v => undefined, {foo: {bar: "bar"}})
        const register = form.getState().actions.register
        register("foo.bar", 1729)
        expect(form.getState().fields.values.foo.bar).toEqual(1729)
    })

    it("include a function that can be used to set their value", () => {
        const form = createForm()
        const initialize = form.getState().actions.initialize
        initialize(v => undefined, {foo: {bar: "bar"}})
        const register = form.getState().actions.register
        register("foo.bar", 1729)
        const setValue = form.getState().fields.setValue.foo.bar
        setValue(12)
        expect(form.getState().fields.values.foo.bar).toEqual(12)
    })
})