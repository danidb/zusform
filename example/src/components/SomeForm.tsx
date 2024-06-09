"use client";
import { Form, create_form, useForm } from "@formicious/formicious";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
// import { z } from "zod";
import { MatrixInput, MatrixView } from "./MatrixInput";

// const schema = z.object({
//   foo: z.object({
//     bar: z.array(z.object({ baz: z.number() })),
//   }),
// });
//
// type SomeFormSchema = z.infer<typeof schema>;

// export const form = create_form<SomeFormSchema>({
//   default_values: {
//     foo: {
//       bar: [{ baz: 2 }, , , { baz: 3 }],
//     },
//   },
// });

export const SomeForm = ({ children }) => {
  const [current, set_current] = useState();
  const [previous, set_previous] = useState();
  const form = useForm({
    default_values: {
      foo: {
        bar: [{ baz: 2 }, , , { baz: 3 }],
      },
    },
  });

  const big = form.watch("foo");
  const { value, set_value } = form.useField("foo.biz");

  return (
    <Form value={form}>
      <MatrixView form={form} />

      <MatrixInput form={form} />
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
        Click me
      </Button>
      <pre>{JSON.stringify(big, null, 2)}</pre>
      <p>Children Below</p>
      {children}
    </Form>
  );
};

export const SomeOtherStuff = () => {
  const form = useForm();
  const { set_value } = form.useField("foo.biz");

  return (
    <>
      <Button onClick={() => set_value("foobar")}>Click me</Button>
    </>
  );
};
export const SomeOtherOtherStuff = () => {
  const form = useForm();
  const { set_value } = form.useField("foo.funk");

  return (
    <>
      <Button onClick={() => set_value("foobar")}>Click me</Button>
    </>
  );
};

export const PippoBaudoField = () => {
  const form = useForm();
  const { value, set_value } = form.useField("foo.bar.4.baz");

  return (
    <>
      <Button onClick={() => set_value(value ? value + 1 : 1)}>
        Flying Fish
      </Button>
      <p>{value}</p>
    </>
  );
};

export const PippoWatch = () => {
  const form = useForm();
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
