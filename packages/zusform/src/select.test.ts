import { parseKey, select } from './select'

describe("parseKey", () => {
    it ("Recognizes that keys point to either arrays, objects or leaves.", () => {
        expect(parseKey("foo.bar[0].two")).toEqual([
            {key: "foo", type: "object"},
            {key: "bar", type: "array"},
            {key: 0, type: "object"},
            {key: "two", type: "leaf"}
        ])
    })
})

describe("select", () => {
    const _obj = {
        foo: "bar",
        bar: "baz",
        qux: [
            1729,
            {
                one: "two",
                three: "cubes"
            }
        ]
    }
    it("Build a basic selector given the dot and bracket syntax.", () => {
        const obj = JSON.parse(JSON.stringify(_obj))
        expect(select("foo")(obj)).toEqual("bar")
        expect(select("qux.0")(obj)).toEqual(1729)
        expect(select("qux[1].three")(obj)).toEqual("cubes")
        expect(select("qux[1]")(obj)).toEqual({one: "two", three: "cubes"})
        expect(select("foo.bar[1]")({})).toEqual(undefined)
    })
    it("Allows us to update values of non-primitives in the parent object", () => {
        const obj = JSON.parse(JSON.stringify(_obj))
        select("qux[1]")(obj).one = 2
        expect(select("qux[1].one")(obj)).toEqual(2)
    })

    it ("Allows us to update the value of a leaf", () => {
        const obj = JSON.parse(JSON.stringify(_obj))
        console.log(_obj)
        select("qux[1]", false, 10)(obj)
        console.log(_obj)
        expect(obj.qux[1]).toEqual(10)
    })

    it("Allows us to create a field", () => {
        const obj:any = JSON.parse(JSON.stringify(_obj))
        select("qux[1]")(obj).two = 2
        expect(obj.qux[1].two).toEqual(2)
    })
    it("Allows us to delete a field", () => {
        const obj:any = JSON.parse(JSON.stringify(_obj))
        delete select("qux[1]")(obj).one
        expect(obj.qux[1].one).toEqual(undefined)
    })
    it("Builds slices if they do not exist", () => {
        const obj:any = {foo: {}, bar: {baz: 1}}
        select("foo.bar[4].two.cat", true, 10)(obj)
        expect(obj.foo.bar[4].two.cat).toEqual(10)
        expect(obj.bar.baz).toEqual(1)
        expect(obj.foo.bar[4].two).toEqual({cat: 10})
    })
})