const utilities = require('./utilities')

describe('parseKey', () => {
    it("successfully splits a key, identifying object structure.", () => {
	let ret = utilities.parseKey("foo.bar[10].baz[2].one[5]")
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

    it("accepts a proxy key. Level keys are object, proxy key takes on original type.", () => {
	let ret = utilities.parseKey("foo.bar[10].baz[2].one[5]", "wizz")
	expect(ret).toEqual([
	    {key: "wizz", is: "object", isProxy: true},
	    {key: "foo", is: "object", isProxy: false},
	    {key: "wizz", is: "object", isProxy: true},
	    {key: "bar", is: "object", isProxy: false},
	    {key: "wizz", is: "array", isProxy: true},
	    {key: 10, is: "object", isProxy: false},
	    {key: "wizz", is: "object", isProxy: true},
	    {key: "baz", is: "object", isProxy: false},
	    {key: "wizz", is: "array", isProxy: true},
	    {key: 2, is: "object", isProxy: false},
	    {key: "wizz", is: "object", isProxy: true},
	    {key: "one", is: "object", isProxy: false},
	    {key: "wizz", is: "array", isProxy: true},
	    {key: 5, is: "leaf", isProxy: false}
	])

	ret = utilities.parseKey("foo.bar[1][2][3]", "fields")
	expect(ret).toEqual([
	    {key: "fields", is: "object", isProxy: true},
	    {key: "foo", is: "object", isProxy: false},
	    {key: "fields", is: "object", isProxy: true},
	    {key: "bar", is: "object", isProxy: false},
	    {key: "fields", is: "array", isProxy: true},
	    {key: 1, is: "object", isProxy: false},
	    {key: "fields", is: "array", isProxy: true},
	    {key: 2, is: "object", isProxy: false},
	    {key: "fields", is: "array", isProxy: true},
	    {key: 3, is: "leaf", isProxy: false}
	])
    })
})

test('isKeyParentOrSelf', () => {
    let keyA, keyB;
    keyA = 'foo'
    keyB = 'foo'
    expect(utilities.isKeyParentOrSelf(keyA, keyB)).toBeTruthy()

    keyA = 'foo'
    keyB = 'foo.bar'
    expect(utilities.isKeyParentOrSelf(keyA, keyB)).toBeFalsy()

    keyA = 'foo'
    keyB = 'bar.foo'
    expect(utilities.isKeyParentOrSelf(keyA, keyB)).toBeFalsy()

    keyA = 'foo.bar[12].baz'
    keyB = 'foo.bar[12]'
    expect(utilities.isKeyParentOrSelf(keyA, keyB)).toBeTruthy()

    keyA = 'foo.bar[12]'
    keyB = 'foo.bar[12].baz'
    expect(utilities.isKeyParentOrSelf(keyA, keyB)).toBeFalsy()
})


test('getParentOrSelfKeys', () => {
    let obj;
    obj = {}
    expect(utilities.getParentOrSelfKeys("fizz", obj)).toEqual([])

    obj = {
	"foo": {},
	"foo.bar": {},
	"foo.baz": {},
	"foo.baz[12]": {},
	"foo.baz[2].foo": {}
    }
    expect(utilities.getParentOrSelfKeys("foo.bar", obj)).toEqual(["foo", "foo.bar"])
    expect(utilities.getParentOrSelfKeys("foo.baz[2].foo", obj)).toEqual(["foo", "foo.baz", "foo.baz[2].foo"])
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

    it("supports non-POJOs", () => {
	class Foo {
	    makeHaste(x) {
		return x + ' with haste!'
	    }
	}
	const foo = new Foo()
	const obj = {foo, bar: 2}
	const clone = utilities.deepClone(obj)
	expect(clone.foo.makeHaste("Code")).toEqual("Code with haste!")

	clone.fiz = 3
	expect(obj.fiz).toBe(undefined)
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

    it("works with proxy key", () => {
	const obj = {}
	utilities.keySet("foo.bar[1][2][3]", {touched: true}, obj, "fields")
	expect(obj.fields.foo.fields.bar.fields[1].fields[2].fields[3].touched).toEqual(true)
    })

    it("accepts an optional property name", () => {
	const obj = {}
	utilities.keySet("foo.bar[1][2][3]", true, obj, "fields", () => ({}), "touched")
	expect(obj.fields.foo.fields.bar.fields[1].fields[2].fields[3].touched).toEqual(true)
    })

    it("accepts default properties for creating proxy objects.", () => {
	const obj = {}
	const defaults = () => ({foo: "bar", baz: 2})

	utilities.keySet("foo.bar[1].baz", {}, obj, "fields", defaults)
	expect(obj).toEqual({
	    fields: {
		foo: {
		    foo: "bar",
		    baz: 2,
		    fields: {
			bar: {
			    foo: "bar",
			    baz: 2,
			    fields: [,{
				foo: "bar",
				baz: 2,
				fields: {
				    baz: {}
				    }
				}
			    ]
			}
		    }

		}
	    }
	})

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

    it("works with a proxy key", () => {
	const obj = {}
	utilities.keySet("foo.bar[1][2][3].foo", 1, obj, "fields")
	utilities.keySet("foo.bar[1][2][3].bar", 2, obj, "fields")
	utilities.keySet("foo.bar[1][2][3].baz", 3, obj, "fields")

	utilities.keyDelete("foo.bar[1][2][3].bar", obj, "fields")
	expect(Object.keys(obj.fields.foo.fields.bar.fields[1].fields[2].fields[3].fields)).toEqual(["foo", "baz"])
    })
})

describe("keySwap", () => {
    it("swaps two object keys", () => {
	const obj = {foo: [{bar: 1, baz: 2}, {wizz: 8, bang: {boom: 9}}]}
	utilities.keySwap("foo[0].bar", "foo[1].bang", obj)
	expect(obj).toEqual({foo: [{bar: {boom: 9}, baz: 2}, {wizz: 8, bang: 1}]})
    })

    it("works with a proxy key", () => {
	const obj = {
	    fields: {
		foo: {
		    fields: {
			bar: {
			    fields: [
				{baz: 2},
				{baz: 3}
                            ]
			},
			baz: {
			    fields: {
				foo: 1
			    }
			}
		    }
		}
	    }
	}
	utilities.keySwap("foo.bar[0]", "foo.baz.foo", obj, "fields")
	expect(obj).toEqual({
	    fields: {
		foo: {
		    fields: {
			bar: {
			    fields: [
				1,
				{baz: 3}
                            ]
			},
			baz: {
			    fields: {
				foo: {baz: 2}
			    }
			}
		    }
		}
	    }
	})

	utilities.keySwap("foo.bar[0]", "foo.bar[1]", obj, "fields")
	expect(obj.fields.foo.fields.bar.fields).toEqual([{baz: 3}, 1])

	utilities.keySwap("foo.bar", "foo.baz", obj, "fields")
	expect(obj.fields.foo.fields.bar.fields.foo.baz).toEqual(2)

    })
})


describe("keySplice", () => {
    it("works for field deletion", () => {
	const obj = {foo: {bar: [1,2,{baz: 3}]}}
	utilities.keySplice("foo.bar", 1, 0, obj, ["foo", "bar"])
	expect(obj.foo.bar).toEqual([1, "foo", "bar", 2,  {baz:3}])

    })

    it("works with a proxy key", () => {
	const obj = {fields: {foo: {fields: {bar: {fields: [1,2,{baz: 3}]}}}}}
	utilities.keySplice("foo.bar", 1, 0, obj, ["foo", "bar"], "fields")
	expect(obj.fields.foo.fields.bar.fields).toEqual([1, "foo", "bar", 2,  {baz:3}])
    })
})


describe("proxyTraverse", () => {
    const obj =  {
	value: 1,
	fields: {
	    foo: {
		value: 1,
		fields: [
		    {value: 1},
		    {value: 1}
		],
	    },
	    bar: {
		value: 1,
		fields: [
		    {
			value: 1,
			fields: {
			    baz: {value: 1},
			    qux: {value: 1}
			}
		    }
                ]
	    }
	}
    }

    it("can be used to collect things.", () => {
	const agg = []
	function traversalCollect(o,k) {
	    agg.push({value: o.value, key: k})
	}
	utilities.proxyTraverse(obj, traversalCollect, "fields")
	expect(agg).toStrictEqual([
	    {key: undefined, value: 1},
	    {key: 'foo', value: 1},
	    {key: 'foo[0]', value: 1},
	    {key: 'foo[1]', value: 1},
	    {key: 'bar', value: 1},
	    {key: 'bar[0]', value: 1},
	    {key: 'bar[0].baz', value: 1},
	    {key: 'bar[0].qux', value: 1}
	])
    })

    it("can be used to modify in place.", () => {
	const agg = []
	function traversalModify(o,k) {
	    o.value = 2
	}
	const _obj = utilities.deepClone(obj)
	utilities.proxyTraverse(_obj, traversalModify, "fields")
	expect(_obj).toStrictEqual(
	    {
		value: 2,
		fields: {
		    foo: {
			value: 2,
			fields: [
			    {value: 2},
			    {value: 2}
			],
		    },
		    bar: {
			value: 2,
			fields: [
			    {
				value: 2,
				fields: {
				    baz: {value: 2},
				    qux: {value: 2}
				}
			    }
			]
		    }
		}
	    }
	)
    })

})

describe("keyApply", () => {
    it("can modify in place.", () => {
	const obj = {
	    foo: {
		bar: [
		    {baz: 1},
		    {baz: 2}
		]
	    }
	}

	utilities.keyApply("foo.bar[1]", obj, o => o.baz = 3)
	expect(obj.foo.bar[1]).toEqual({baz: 3})
    })

    it("works with a proxy key", () => {
	const obj = {
	    fields: {
		foo: {
		    fields: {
			bar: {
			    fields: [
				{baz: 1},
				{baz: 2}
			    ]
			}
		    }
		}
	    }
	}

	utilities.keyApply("foo.bar[1]", obj, o => o.baz = 3, "fields")
	expect(utilities.keyGet("foo.bar[1]", obj, "fields").baz).toEqual(3)
    })
})
