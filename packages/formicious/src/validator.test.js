const Yup = require("yup")
const core = require("./core")
const validator = require("./validator")

describe("The Yup validator", () => {
    it("Can be used in a formicious form", () => {
	const schema = Yup.object().shape({
	    foo: Yup.string().matches(["fiz", "foo"]).required(),
	    baz: Yup.array().of(Yup.number().required())
	})

	const yupValidator = new validator.YupValidator(schema)
	const form = core.createForm({
	    values: {foo: "bar", baz: [{bar: 2, baz: 5}, 6]},
	    meta: {validators: [yupValidator]}
	})
	form.getState().actions.validateForm()

	expect(form.getState().meta.fields.foo.formValidation).toBeDefined()
	expect(form.getState().meta.fields.foo.formValidation.length).toEqual(1)
	expect(form.getState().meta.fields.baz.fields[0].formValidation.length).toEqual(1)

	form.getState().actions.validateField("foo")
	expect(form.getState().meta.fields.foo.fieldValidation.length).toEqual(1)
    })


})
