export function is_defined(x: unknown) {
  return typeof x !== "undefined";
}

export function is_number(x: any): x is number {
  return typeof x === "number";
}

export function is_string(x: any): x is string {
  return typeof x === "string";
}

export function is_array(x: any): x is typeof Array {
  return Array.isArray(x);
}

export function is_object(x: any): x is object {
  return !Array.isArray(x) && typeof x === "object";
}

export function is_function(x: any): x is Function {
  return typeof x === "function";
}

export function is_string_integer(value: string) {
  return /^\d+$/.test(value);
}

export function identity(x: any) {
  return x;
}

export function set(
  obj: any,
  path: (string | number)[],
  value: any,
): [any, any] {
  let previous;
  exec_path(obj, path, (x: any) => {
    previous = x;
    if (is_function(value)) {
      return value(x);
    }
    return value;
  });
  return [previous, value];
}

export function get(obj: any, path?: (string | number)[]) {
  function r_get(obj: any, path: (string | number)[]) {
    const step = path[0];
    const next = path[1];
    const next_steps = path.slice(1);

    if (!is_defined(next)) {
      return obj[step];
    }
    if (is_defined(obj[step])) {
      return r_get(obj[step], next_steps);
    }
    return undefined;
  }

  if (!is_array(path)) {
    return obj;
  }

  return r_get(obj, path);
}

export function exec_path(obj: any, path: (string | number)[], fn: any) {
  const step = path[0];
  const next = path[1];

  const next_steps = path.slice(1);

  if (!is_defined(next)) {
    obj[step] = fn(obj[step]);
    return;
  }

  if (is_number(next)) {
    if (!is_defined(obj[step]) || !is_array(obj[step])) {
      obj[step] = [];
    } else {
      obj[step] = [...obj[step]];
    }
  } else {
    if (!is_defined(obj[step]) || !is_object(obj[step])) {
      obj[step] = {};
    } else {
      obj[step] = { ...obj[step] };
    }
  }

  exec_path(obj[step], next_steps, fn);
}

export function parse_path(path: string) {
  const steps = path.split(/\./).map((step) => {
    const key = is_string_integer(step) ? Number(step) : step;
    return key;
  });

  return steps;
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("is_string_integer", () => {
    expect(is_string_integer("3")).toBe(true);
    expect(is_string_integer("3.3")).toBe(false);
    expect(is_string_integer("x3")).toBe(false);
    expect(is_string_integer("pippobaudo")).toBe(false);
  });

  test("is_defined", () => {
    expect(is_defined(null)).toBe(true);
    expect(is_defined(undefined)).toBe(false);
  });
  test("is_number", () => {
    expect(is_number(null)).toBe(false);
    expect(is_number("3")).toBe(false);
    expect(is_number(3)).toBe(true);
  });

  test("parse_path", () => {
    expect(parse_path("foo.bar.0.baz")).toEqual(["foo", "bar", 0, "baz"]);
  });

  test("exec_path", () => {
    const obj = {};
    exec_path(obj, parse_path("foo.bar.0.baz"), () => 3);
    expect(obj).toEqual({
      foo: {
        bar: [{ baz: 3 }],
      },
    });
  });
  test("set, (helper)", () => {
    const obj = {};
    set(obj, parse_path("foo.bar.0.2.baz"), 3);
  });
  test("get, (helper)", () => {
    const obj = {};
    set(obj, parse_path("foo.bar.0.baz"), 7);
    const v = get(obj, parse_path("foo.bar.0"));
    expect(v).toEqual({ baz: 7 });

    expect(get(obj, parse_path("foo"))).toEqual({
      bar: [{ baz: 7 }],
    });

    expect(get(obj)).toEqual({
      foo: {
        bar: [{ baz: 7 }],
      },
    });
  });
}
