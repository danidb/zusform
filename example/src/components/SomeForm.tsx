"use client";
import { create_form } from "@formicious/formicious";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";

const form = create_form<{
  foo: {
    bar: ({ baz: number } | undefined)[];
  };
}>({
  default_values: {
    foo: {
      bar: [{ baz: 2 }, , , { baz: 3 }],
    },
  },
});

export const SomeForm = () => {
  const [current, set_current] = useState();
  const [previous, set_previous] = useState();

  const big = form.watch("foo");
  const { value, set_value } = form.useField("foo.biz");

  return (
    <>
      <p>Value: {value}</p>
      <p>Current: {current}</p>
      <p>Previous: {previous}</p>
      <Input
        type="text"
        {...form.field("foo.biz", {
          on_change: (current, previous) => {
            set_current(current);
            set_previous(previous);
          },
          default_value: "",
        })}
      />
      <Button onClick={() => set_value("This is the song that never ends")}>
        Click me you bastard
      </Button>
      <pre>{JSON.stringify(big, null, 2)}</pre>
    </>
  );
};

export const SomeOtherStuff = () => {
  const { set_value } = form.useField("foo.biz");

  return (
    <>
      <Button onClick={() => set_value("foobar")}>Click me you fool</Button>
      <p>Note that since we pass </p>
    </>
  );
};
export const SomeOtherOtherStuff = () => {
  const { set_value } = form.useField("foo.funk");

  return (
    <>
      <Button onClick={() => set_value("foobar")}>Click me you wiseone</Button>
      <p>Note that since we pass </p>
    </>
  );
};

export const PippoBaudoField = () => {
  const { value, set_value } = form.useField("foo.bar.4.baz");

  return (
    <>
      <Button onClick={() => set_value(value ? value + 1 : 1)}>
        Uppety friend
      </Button>
      <p>{value}</p>
    </>
  );
};

export const PippoWatch = () => {
  const value = form.rhf.watch("foo.bar.4.baz");
  const { set_value } = form.useField("foo.bar.5.baz");

  const [effected, set_effected] = useState();

  useEffect(() => {
    if (value) {
      set_effected(value + 1);
      set_value(value + 2);
    }
  }, [value, set_effected, set_value]);

  return (
    <>
      <p>Effected: {effected}</p>
      <p>Value: {value}</p>
    </>
  );
};
