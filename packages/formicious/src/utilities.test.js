const utilities = require('./utilities')

describe('parseKey', () => {
    it("parses object indices as string keys and returns an array of objects describing each index level.", () => {
	let ret; 
	ret = utilities.parseKey("foo.bar[10].baz[2].one[5]")
	expect(ret).toEqual([
	    {key: "foo", is: "object"},
	    {key: "bar", is: "array"},
	    {key: 10, is: "object"},
	    {key: "baz", is: "array"},
	    {key: 2, is: "object"},
	    {key: "one", is: "array"},
	    {key: 5, is: "leaf"}
	])

	ret = utilities.parseKey("bar[2]")
	expect(ret).toEqual([
	    {key: "bar", is: "array"},
	    {key: 2, is: "leaf"}
	])
	
    })
})

describe("deepClone", () => {
    it("produces an equivalent object, but not the same object.", () => {
	const obj = {foo: null, one: {two: [{foo: {bar: [1,2,3]}}]}}
	const clone = utilities.deepClone(obj)
	expect(obj).toBe(obj)
	expect(obj).not.toBe(clone)
	expect(obj).toStrictEqual(clone)	
    })

    it("resists this classic mistake when cloning with spreads.", () => {
	const subObj = {foo: {bar: 2}}
	const obj = {qux: subObj}
	const clone = utilities.deepClone(obj)

	// This modifies both obj and subObj
	obj.qux.foo.bar = 3
	expect(obj.qux.foo.bar).toEqual(3)
	expect(subObj.foo.bar).toEqual(3)

	// But the clone is resistant 
	expect(clone.qux.foo.bar).toEqual(2)
	clone.qux.foo = {fizz: "buzz"}
	expect(subObj.foo).toEqual({bar: 3})
	expect(obj.qux.foo).toEqual({bar: 3})
	expect(clone.qux.foo).toEqual({fizz: "buzz"})	
    })

})

describe("keySet", () => {
    it("sets deeply nested fields", () => {
	const obj = {foo: 1, bar: [{baz: 2}, {baz: 3}]}

	utilities.keySet("foo", 2, obj)
	utilities.keySet("bar[0].baz", 1729, obj)
	utilities.keySet("bar[1]", "fiz", obj)
	
	expect(obj.foo).toEqual(2)
	expect(obj.bar[0].baz).toEqual(1729)
	expect(obj.bar[1]).toEqual("fiz")
    })

    it("creates structure that doesn't exist", () => {
	const obj = {}

	utilities.keySet("foo", 2, obj)
	utilities.keySet("bar[0].baz", 1729, obj)
	utilities.keySet("bar[1]", "fiz", obj)

	expect(obj.foo).toEqual(2)
	expect(obj.bar[0].baz).toEqual(1729)
	expect(obj.bar[1]).toEqual("fiz")

    })

    it("deeply clones values to avoid unhappy accidents", () => {
	const obj = {}
	const val = {a: 2, b: [1,2,3]}

	utilities.keySet("foo.bar", val, obj)
	val.a = 5
	
	expect(obj.foo.bar.a).toEqual(2)
	
    })

    it("can even handle nester arrays", () => {
	const obj = {}
	utilities.keySet("foo.bar[1][2][3]", {one: "two"}, obj)
	expect(obj.foo.bar[1][2][3]).toStrictEqual({one: "two"})
    })
})


describe("keyGet", () => {
    it("returns undefined if a key is not found", () => {
	const obj = {foo: "bar"}
	expect(utilities.keyGet("bar.baz", obj)).toEqual(undefined)
    })

    it("works as expected if key exists", () => {
	const obj = {foo: 1, bar: [{baz: 2}, {baz: 3}]}

	expect(utilities.keyGet("foo", obj)).toEqual(1)
	expect(utilities.keyGet("bar[0].baz", obj)).toEqual(2)
	expect(utilities.keyGet("bar[1]", obj)).toEqual({baz: 3})
    })
})


describe("keyDelete", () => {
    it("works as expected and deletes a key", () => {
	const obj = {foo: 1, bar: [{baz: 2}, {baz: 5, bar: 3}]}

	utilities.keyDelete("foo", obj)
	utilities.keyDelete("bar[1].bar", obj)

	expect(obj).toEqual({bar: [{baz: 2}, {baz: 5}]})
    })
})
