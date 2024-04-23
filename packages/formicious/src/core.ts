import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { get, is_defined, is_function, parse_path, set } from "./utils";

export type FormParams<TData> = {
  default_values?: TData;
};

// export type FormMeta<TData> = {};

export type Form<TData> = {
  values: TData | {};
  params: FormParams<TData>;
  //   meta: FormMeta<TData>;
  // actions: FormInteraction[];
  listeners: { name: string; listener: any }[];
};

// NOTE: Using exec_path, I can save the previous value
// and update the value, with one round of index-digging.
// This makes storing "undo" info easy. cool beans.

const form_actions = ["get_value", "set_value"] as const;

type FormAction = (typeof form_actions)[number];

function emit<TData>(form: Form<TData>) {
  for (const listener of form.listeners) {
    listener.listener();
  }
}

type FieldOptions = {
  on_change?: (current: any, previous: any) => void;
  on_blur?: (current: any, pevious: any) => void;
  default_value: any;
};

function build_field_hook<TData>(
  subscribe: (name: string) => any,
  get_snapshot: (path: (string | number)[]) => () => any,
  // get_server_snapshot: (path: (string | number)[]) => any,
  set_value: (path: (string | number)[], value: any) => [any, any],
  get_value: (path: (string | number)[]) => any,
) {
  return function (name: string, options?: FieldOptions) {
    const id = useId();
    const ref = useRef<HTMLInputElement>();
    const [previous_value, set_previous_value] = useState();
    const path = useMemo(() => parse_path(name), [name]);
    const value = useSyncExternalStore(
      subscribe(name),
      get_snapshot(["values", ...path]),
      get_snapshot(["params", "default_values", ...path]),
    );

    useEffect(() => {
      if (Object.is(previous_value, value)) {
        return;
      }

      if (is_function(options?.on_change)) {
        options?.on_change(value, previous_value);
      }

      set_previous_value(value);
    }, [options?.on_change, value, previous_value]);

    const local_set_value = useCallback(
      (new_value: any) => {
        return set_value(path, new_value);
      },
      [path],
    );

    return {
      id,
      ref,
      name,
      value: value ?? options?.default_value,
      set_value: local_set_value,
      get_value,
      onChange: (new_value: any) => {
        if (is_defined(new_value?.currentTarget?.value)) {
          set_value(path, new_value?.currentTarget?.value);
        } else {
          set_value(path, new_value);
        }
      },
      onBlur: () => {
        if (is_function(options?.on_blur)) {
          options?.on_blur(value, previous_value);
        }
      },
    };
  };
}

export function build_form_hook<TData>(params?: FormParams<TData>) {
  const id = useId();
  const ref = useRef();
}

export function create_form<TData>(params?: FormParams<TData>) {
  const form = {
    values: structuredClone(params?.default_values) ?? {},
    params: structuredClone(params) ?? {},
    // meta: {},
    // actions: [],
    listeners: [],
  } as Form<TData>;

  function subscribe(name: string) {
    return (listener: any) => {
      form.listeners.push({
        name,
        listener,
      });
      return () => {
        form.listeners
          .filter((item) => item.name !== name)
          .map((item) => item.listener);
      };
    };
  }

  function get_snapshot(path: (string | number)[]) {
    return () => get(form, path);
  }

  function set_value(path: (string | number)[], new_value: any): [any, any] {
    const ret = set(form.values, path, new_value);
    emit(form);
    return ret;
  }

  function get_value(path: (string | number)[]) {
    return get(form.values, path);
  }

  const field_hook = build_field_hook(
    subscribe,
    get_snapshot,
    set_value,
    get_value,
  );

  function watch(name: string) {
    const { value } = field_hook(name);
    return value;
  }

  function field(name: string, options?: FieldOptions) {
    const { value, onChange, onBlur } = field_hook(name, options);
    return {
      value,
      onChange,
      onBlur,
    };
  }

  return {
    ...form,
    useField: field_hook,
    rhf: {
      watch,
      register: field,
    },
    watch,
    field,
  };
}

// TODO tmp
type FormInteraction = {
  action: FormAction;
  params: any;
};

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;
  test("set_value, get_value", () => {
    const form = create_form();
  });
}
