import * as React from 'react'
import ustyles from '../styles/utilities.module.css'

import TextField from '../components/TextField';
import createForm, { fieldArray } from 'zusform'

import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
export const useForm = createForm()


const AnArray = (props) => {
    const { value, meta }  = useForm(...fieldArray(props.name))
    const dropArrayField = useForm(form => form.dropArrayField)
    const swapArrayField = useForm(form => form.swapArrayField)

    return (
        <>
            <h2 className={ustyles.h2}>An array of fields</h2>
            <Droppable droppableId={"onlyOne"}>
                {droppable =>
                <div {...droppable.droppableProps} ref={droppable.innerRef}>
                    {value && value.map((_, idx) =>
                        <Draggable key={meta[idx].key} draggableId={meta[idx].key} index={idx}>
                            {draggable =>
                                <div
                                    className={ustyles.fieldContainer}
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
        <div className={ustyles.pageContainer}>
            <h1 className={ustyles.h1}>Zusform</h1>
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