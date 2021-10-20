
# 🐻‍❄️ Zusform
Not-too-opinionated form handling for React, with Zustand.

**Please note that this is a 🏗️  work in progress.**

- Small API, flexible.
- Just a wrapper around a zustand store, so you can extend this as you wish. Anywhere you can use state tracked with Zustand, you can use this.
- Supports Yup for validation
- Supports basic operations for field arrays.

## Where I'd like this to go
- Easy to create and modify arbitrary field collections and track metadata for the collection (track metadata for every node in the form tree)
- Support for easy validation of arbitary field collections

## Non-trivial Example
The non-trivial a.k.a. kitchen sink example includes most of the key features of Zusform. Also included is an integration with `react-beautiful-dnd` for a pleasant drag-and-drop experience on a field array.

```js
import * as React from 'react'

import createForm, { fieldArray, field } from 'zusform'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
export const useForm = createForm()

function TextField(props) {
    const { value, meta, register, registered, handleChangeEvent } = props.useForm(...field(props.name, props.defaultValue))
    React.useEffect(() => {
        if (!registered) {
            register(props.name, props.defaultValue)
        }
    }, [registered])
    const renders = React.useRef(1)
    React.useEffect(() => { renders.current += 1 })

    return (
        <>
            {registered &&
                <>
                    <label htmlFor={props.name}>{props.label} - Renders: {renders.current} </label>
                    <input
                        id={props.name}
                        type="text"
                        value={value}
                        name={props.name}
                        onChange={handleChangeEvent}
                    />
                </>
            }
        </>
    )
}

const AnArray = (props) => {
    const { value, meta }  = useForm(...fieldArray(props.name))
    const dropArrayField = useForm(form => form.dropArrayField)
    const swapArrayField = useForm(form => form.swapArrayField)

    return (
        <>
            <h2>An array of fields</h2>
            <Droppable droppableId={"onlyOne"}>
                {droppable =>
                <div {...droppable.droppableProps} ref={droppable.innerRef}>
                    {value && value.map((_, idx) =>
                        <Draggable key={meta[idx].key} draggableId={meta[idx].key} index={idx}>
                            {draggable =>
                                <div
                                    {...draggable.draggableProps}
                                    {...draggable.dragHandleProps}
                                    ref={draggable.innerRef}
                                >
                                    {idx > 0 && <button onClick={() => swapArrayField(props.name, idx, idx-1)}>Move Up</button>}
                                    {idx < value.length - 1 && <button onClick={() => swapArrayField(props.name, idx, idx+1)}>Move Down</button>}
                                    <button onClick={() => dropArrayField(props.name, idx)}>Delete this field</button>
                                    <TextField
                                        name={`${props.name}[${idx}]`}
                                        defaultValue={idx}
                                        placeholder={`Field ${idx}`}
                                        label={`Field ${idx}`}
                                        useForm={useForm}
                                    />
                                </div>
                            }
                        </Draggable>
                    )}
                    {droppable.placeholder}
                </div>
            }
        </Droppable>
        </>
    )
}


export default function Home() {
    const initialized = useForm(form => form.initialized)
    const initialize = useForm(form => form.initialize)
    const formProps = useForm(form => form.formProps)
    const pushArrayField = useForm(form => form.pushArrayField)
    const swapArrayField = useForm(form => form.swapArrayField)

    React.useEffect(() => {
        initialize(values => console.log(JSON.stringify(values)))
    }, [])

    function handleDragEnd(result) {
        swapArrayField("foo.anArray", result.source.index, result.destination.index)
    }

    return (
        <div>
            <h1>Zusform</h1>
            {initialized &&
                <form {...formProps}>
                    <button type="submit">Submit</button>
                    <TextField
                        name="name"
                        defaultValue=""
                        placeholder="Your name..."
                        label="Name"
                        useForm={useForm}
                    />
                     <TextField
                        name="email"
                        defaultValue=""
                        placeholder="Your email..."
                        label="Email"
                        useForm={useForm}
                    />
                    <button type="button" onClick={() => pushArrayField("foo.anArray")}>Add item.</button>
                    <DragDropContext
                        onDragEnd={handleDragEnd}
                    >
                    <AnArray name="foo.anArray" />
                    </DragDropContext>
                </form>
            }
        </div>
    )
}
```
## Why

1. I wanted a performant React form handling library with a simpler API for the features that matter most to me, based on controlled components.
2. I've been using Zustand quite often and I think it's great, handling forms with Zustand would mean fewer moving parts.
3. I'm working on a project where this would make sense.
4. Enjoyment.

## Contributing
Contributions and constructive criticism are welcome. Feel free to reach out!
I'm sure there are flagrant issues to be found. If you like what you see, consider contributing!

### TODO
1. [x] Validation with Yup.
2. [ ] Custom validation functions.
3. [x] Basic array operations (push, delete).
4. [ ] Typing for TS users.
5. [ ] CI/workflow setup
6. [ ] Publish to NPM
7. [ ] Support for validation of any field collection (In progress)
8. [ ] Betters for arbitrary, meaningful field collections (In progress)
