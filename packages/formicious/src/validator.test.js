const Yup = require("yup")
const validator = require("./validator")

describe("The Yup validator", () => {
    it("Can be used to validate individual fiels", () => {
	const obj = {foo: "bar", baz: [{bar: 2, baz: 5}, 8]}
	const schema = Yup.object().shape({
	    foo: Yup.string().matches("fiz"),
	    baz: Yup.array().of(Yup.number())
	})

	// TODO: Here we are
    })
})
