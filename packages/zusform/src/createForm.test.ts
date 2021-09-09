import createForm from './createForm'

describe("createForm", () => {
    it("Executes successfully and creates bare initial form state.", () => {
        const form = createForm()
        expect(Object.keys(form.getState())).toEqual(["formProps", "register", "fields"])
    })

    it ("Allows us to register a field with a given default value", () => {
        const form = createForm<any>()
        const register = form.getState().register
        let field = register("foo.bar[1].something", 1729)
        expect(field.value).toEqual(1729)
        expect(form.getState().fields.values.foo.bar[1].something).toEqual(1729)
        expect(form.getState().fields.touched.foo.bar[1].something).toEqual(false)
        expect(form.getState().fields.onChange.foo.bar[1].something).toBeDefined()
    })
})