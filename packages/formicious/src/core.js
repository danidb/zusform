import * as React from "react";
import create from "zustand";
import { produce, original } from "immer";
import {
  deepClone,
  keySet,
  keyGet,
  keyDelete,
  keyApply,
  keySwap,
  INDEX_IS,
  isDefined,
  isNotDefined,
  getParentOrSelfKeys,
  proxyTraverse,
  uuidv4,
} from "./utilities";

export const PROXY_KEY = "fields";

function setField(set, get, key, value) {
  set((draft) => {
    keySet(key, value, draft.values);
    if (isDefined(keyGet(key, draft.meta, PROXY_KEY))) {
      keySet(key, true, draft.meta, PROXY_KEY, getDefaultMeta, "touched");
    }
  });
}

function deleteField(set, get, key) {
  set((draft) => {
    keyDelete(key, draft.values);
    keyDelete(key, draft.meta, PROXY_KEY);
  });
}

function validateForm(set, get) {
  let validation = [];
  set((draft) => {
    proxyTraverse(
      draft.meta,
      (obj) => {
        obj.formValidation = [];
      },
      PROXY_KEY
    );

    validation = draft.meta.validators.reduce((agg, validator) => {
      return [...agg, ...validator.validate(draft.values)];
    }, []);

    validation.forEach((v) => {
      if (isDefined(v.key)) {
        const current = keyGet(v.key, draft.meta, PROXY_KEY);
        keySet(
          v.key,
          [
            ...(isDefined(current) && isDefined(current.formValidation)
              ? current.formValidation
              : []),
            v,
          ],
          draft.meta,
          PROXY_KEY,
          getDefaultMeta,
          "formValidation"
        );
      } else {
        draft.meta.formValidation.push(v);
      }
    });
  });
  return validation;
}

function validateField(set, get, key) {
  set((draft) => {
    let validation = draft.meta.validators.reduce((agg, formValidator) => {
      if (isDefined(formValidator.validateField)) {
        return [
          ...agg,
          ...formValidator.validateField({
            name: key,
            value: keyGet(key, draft.values),
            values: draft.values,
          }),
        ];
      } else {
        return agg;
      }
    }, []);
    const _meta = keyGet(key, draft.meta, PROXY_KEY);
    const _validators = isDefined(_meta) ? _meta.validators : [];
    if (isDefined(_validators)) {
      validation = [
        ...validation,
        ..._validators.reduce((agg, validator) => {
          return [
            ...agg,
            ...validator({
              name: key,
              value: keyGet(key, draft.values),
              form: draft,
            }),
          ];
        }, []),
      ];
    }
    keySet(
      key,
      validation,
      draft.meta,
      PROXY_KEY,
      getDefaultMeta,
      "fieldValidation"
    );
  });
}

function swapField(set, get, keyA, keyB) {
  set((draft) => {
    keySwap(keyA, keyB, draft.values);
    keySwap(keyA, keyB, draft.meta, PROXY_KEY);
  });
}

function rectifyValue({ defaultValue, value }) {
  let _value = deepClone(value);
  return isDefined(_value) ? _value : deepClone(defaultValue);
}

function rectifyMeta({ defaultMeta, meta, value }) {
  let _meta = deepClone(meta);
  _meta = { ...defaultMeta, ..._meta };

  if (Array.isArray(value)) {
    if (isNotDefined(_meta.fields)) {
      _meta.fields = [];
    }
    for (let idx = 0; idx < value.length; idx++) {
      if (isNotDefined(_meta.fields[idx])) {
        _meta.fields[idx] = { key: uuidv4() };
      } else {
        if (isNotDefined(_meta.fields[idx].key)) {
          _meta.fields[idx].key = uuidv4();
        }
      }
    }
  } else if (typeof value === "object" && value !== null) {
    if (isNotDefined(_meta.fields)) {
      _meta.fields = {};
    }
    for (const k of Object.keys(value)) {
      if (isDefined(_meta.fields[k])) {
        if (isNotDefined(_meta.fields[k].key)) {
          _meta.fields[k].key = uuidv4();
        }
      } else {
        _meta.fields[k] = { key: uuidv4() };
      }
    }
  }
  _meta = { ...getDefaultMeta(), ..._meta };
  return _meta;
}

function setFieldValueAndMeta({ set, get, name, meta, value }) {
  set((draft) => {
    keySet(name, value, draft.values);
    keySet(name, meta, draft.meta, PROXY_KEY, getDefaultMeta);
  });
}

function registerField({ set, get, name, defaultValue, defaultMeta }) {
  set((draft) => {
    let value = keyGet(name, draft.values);
    value = rectifyValue({ value, defaultValue });
    keySet(name, value, draft.values);

    let meta = keyGet(name, draft.meta, PROXY_KEY);
    meta = rectifyMeta({ meta, defaultMeta, value });
    meta.isRegistered = true;
    keySet(name, meta, draft.meta, PROXY_KEY, getDefaultMeta);
  });
}

// Use immer for all calls to zustand set
function formSetMiddleware(config) {
  return function (set, get, api) {
    return config(
      (partial, replace) => {
        const nextState = produce(partial);
        return set(nextState, replace);
      },
      get,
      api
    );
  };
}

export function getDefaultMeta(key) {
  const defaultMeta = {
    isRegistered: false,
    validators: [],
    fieldValidation: [],
    formValidation: [],
    touched: false,
    key: isDefined(key) ? key : uuidv4(),
    user: {},
  };
  return deepClone(defaultMeta);
}

export function useFormicious(params) {
  const { form, values, meta, validators, handleSubmit } = params || {};
  const [_form] = React.useState(
    React.useCallback(() =>
      isDefined(form) ? form : createForm({ values, meta, handleSubmit })
    ),
    [form, values, meta]
  );

  const formProps = _form(React.useCallback((form) => form.formProps, []));
  const initialized = _form(React.useCallback((form) => form.initialized, []));
  const initialize = _form(
    React.useCallback((form) => form.actions.initialize, [])
  );
  return [formProps, _form, initialized, initialize];
}

export function useAction(form, action) {
  const _selector = React.useCallback((form) => form.actions[action], []);
  return form(_selector);
}

export function useField({
  form,
  name,
  defaultValue,
  defaultMeta,
  transformValueIn,
  transformValueOut,
  selector,
  skipPrep,
}) {
  const validateField = useAction(form, "validateField");
  const registerField = useAction(form, "registerField");
  const setFieldValueAndMeta = useAction(form, "setFieldValueAndMeta");
  const setField = useAction(form, "setField");
  const swapField = useAction(form, "swapField");
  const deleteField = useAction(form, "deleteField");

  const ret = form(
    React.useCallback(
      (state) => {
        let value = keyGet(name, state.values);
        value = rectifyValue({
          value,
          defaultValue: isDefined(transformValueIn)
            ? transformValueIn(defaultValue)
            : defaultValue,
        });
        const transformedValue = isDefined(transformValueOut)
          ? transformValueOut(value)
          : value;

        let meta = keyGet(name, state.meta, PROXY_KEY);
        meta = rectifyMeta({ meta, defaultMeta, value });
        meta.isRegistered = true;

        const ret = {
          value: transformedValue,
          meta,
          actions: {
            registerField: function () {
              registerField({
                name,
                value,
                meta,
              });
            },
            prepField: function () {
              setFieldValueAndMeta({
                name,
                value,
                meta,
              });
            },
            validateField: function () {
              validateField(name);
            },
            setField: function (value) {
              setField(name, value);
            },
            deleteField: function () {
              deleteField(name);
            },
            swapWith: function (key) {
              swapField(name, key);
            },
          },
          props: {
            id: name,
            name,
            value: transformedValue,
            onChange: function (e) {
              let inValue;
              if ("target" in e && "value" in e.target) {
                inValue = e.target.value;
              } else {
                inValue = e;
              }
              inValue = isDefined(transformValueIn)
                ? transformValueIn(inValue)
                : inValue;
              setField(name, inValue);
            },
            onBlur: function () {
              state.actions.validateField(name);
            },
          },
        };

        if (isDefined(selector)) {
          ret.selector = selector(ret);
        }
        return ret;
      },
      [
        name,
        defaultValue,
        defaultMeta,
        transformValueIn,
        transformValueOut,
        selector,
      ]
    ),

    // NOTE This seems a bit silly, but it works...
    (a, b) => {
      if (isDefined(a.selector) || isDefined(b.selector)) {
        return JSON.stringify(a.selector) === JSON.stringify(b.selector);
      } else {
        return JSON.stringify(a) === JSON.stringify(b);
      }
    }
  );

  if (!skipPrep) {
    React.useEffect(ret.actions.prepField, []);
  }

  if (isDefined(selector)) {
    return ret.selector;
  } else {
    return ret;
  }
}

function initializeForm({ set, get, values, meta }) {
  set((draft) => {
    draft.values = isDefined(values) ? deepClone(values) : {};
    draft.meta = {
      validators: [],
      ...(isDefined(meta) ? deepClone(meta) : {}),
      ...draft.meta,
    };
    draft.initialized = true;
  });
}

export function createForm({ values, meta, validators, handleSubmit }) {
  /** Create a formicious form.
   */
  const ret = create(
    formSetMiddleware((set, get, api) => ({
      initialized: false,
      values: isDefined(values) ? deepClone(values) : {},
      meta: { validators: [], ...(isDefined(meta) ? deepClone(meta) : {}) },
      formProps: {
        onSubmit: function (e) {
          e.preventDefault();
          if (isDefined(handleSubmit)) {
            handleSubmit(get().values, e);
          } else {
            console.log(get().values);
          }
        },
      },
      actions: {
        registerField: function ({ name, defaultValue, defaultMeta }) {
          return registerField({
            set,
            get,
            name,
            defaultValue,
            defaultMeta,
          });
        },
        deleteField: function (name) {
          deleteField(set, get, name);
        },
        swapField: function (nameA, nameB) {
          swapField(set, get, nameA, nameB);
        },
        blurField: function (name) {
          blurField(set, get, name);
        },
        setField: function (name, value) {
          setField(set, get, name, value);
        },
        setFieldValueAndMeta: function ({ name, value, meta }) {
          setFieldValueAndMeta({ set, get, name, value, meta });
        },
        validateField: function (name) {
          validateField(set, get, name);
        },
        validateForm: function () {
          validateForm(set, get);
        },
        initialize: function ({ values, meta }) {
          initializeForm({ set, get, values, meta });
        },
      },
    }))
  );
  return ret;
}
