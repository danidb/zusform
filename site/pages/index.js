import * as React from 'react'
import ustyles from '../styles/utilities.module.css'

import { createForm, useFormicious, useField, useAction } from 'formicious'
import TextField from '../components/TextField.jsx'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


// TODO This should include a live view of form state.

export default function Home() {

    const [formJSON, setFormJSON] = React.useState("")
    const [formProps, form, initialized] = useFormicious({
	handleSubmit: v => setFormJSON(JSON.stringify(v))
    })
    const swapField = useAction(form, "swapField")
    const initialize = useAction(form, "initialize")

    React.useEffect(() => {
	initialize({values: {fiz: "buzz"}})
    }, [])

    function handleDragEnd(result) {
	swapField(
	    `foo.anArray[${result.source.index}]`,
	    `foo.anArray[${result.destination.index}]`
	)
    }

    return (
	<div className={ustyles.pageContainer}>
	    <h1 className={ustyles.h1}>Welcome to Formicious 🕺🏻</h1>
	    <p className={ustyles.p}>
		Formicious was built to make designing complex forms easier in React.
	    </p>
	    <p className={ustyles.p}>
		With formicious you should be able handle dynamic arrays, dynamic objects, thousands of fields, multiple validators, field <i> and</i> form-level validation ... All kinds of fun with a minimum of fuss.
            </p>
	    <p className={ustyles.p}>
		There are many ways to handle forms in React and plenty of great libraries/frameworks. Formicious is another tool for those who still aren't satisfied and smiling, perhaps this is "the one."
            </p>
	    <p className={ustyles.p}>
		Formicious handles form state with <code>Zustand</code> and <code>Immer</code>. These are the only two dependencies.
		Formicious also includes some utilities that you may find useful, these will be documented as soon as possible.
            </p>
	    <h2 className={ustyles.h2}>A "not-as-simple-as-it-seems" example</h2>
	    <form {...formProps}>
		{initialized &&
		 <>
		 <TextField
		     type="text"
		     label="A first field. (key: fiz)"
		     name="fiz"
		     defaultValue="Why hello there!"
		     form={form}
		 />
                 <TextField
		     type="text"
		     label="A second field. (key: example1.bar)"
		     name="example1.bar"
		     defaultValue="Why hello there again!"
		     form={form}
                 />
		 <TextField
		     type="text"
		     label="A third field. (key: example1.baz)"
		     name="example1.baz"
		     defaultValue="Why hello there once more!"
		     form={form}
		 />
		 <DragDropContext onDragEnd={handleDragEnd}>
                     <AnArray name="foo.anArray" form={form} />
                 </DragDropContext>
		 <br />
		     <button type="submit">Submit</button>
		     </>
		}
	    </form>
	    <br />
	    <br />
	    {formJSON.length > 1 &&
	     <>
		 <h2>Form contents</h2>
		 <code>{formJSON}</code>
	     </>
	    }
        </div>
    )
}


const AnArray = ({name, form}) => {
    const deleteField = useAction(form, "deleteField")
    const swapField = useAction(form, "swapField")
    const registerField = useAction(form, "registerField")

    const [length, keys] = useField({
	form,
	name,
	defaultValue: [],
	selector: ({value, meta}) => [
	    value.length,
	    meta.fields ? meta.fields.reduce((agg, i) => [...agg, i.key], []) : []
	]
    })

    const renders = React.useRef(1)
    React.useEffect(() => { renders.current += 1 })

    return (
        <>
            <p className={ustyles.p}><b>Below, a dynamic array of fields.</b></p>
	    <p className={ustyles.p}>
		Use the buttons to modify the contents of the array.
		<br/><br/>
		The entire array has been rendered {renders.current} time{renders.current > 1 ? "s" : ""} and
		it currently contains {length === 0 ? "no" : length} field{length === 1 ? "" : "s"}. <br/><br/>

		P.S.: Just for fun, <code> react-beautiful-dnd </code>
		has been integrated into this example; <i>you can change the order of the fields by drag/drop.</i>
	    </p>
	    <button
		onClick={() => registerField(
		    {name: `${name}[${length}]`, defaultValue: length}
		)}
	    >
		Add field
            </button>
	    {length > 0 &&
	     <button
		 onClick={() => {
		     deleteField(name)
		     registerField({name, defaultValue: []})
		 }}
             >
		 Clear all
             </button>
	    }

             <Droppable droppableId={"onlyOne"}>
                 {droppable =>
                    <div {...droppable.droppableProps} ref={droppable.innerRef}>
                        {Array(length).fill(0).map((_, idx) =>
                            <Draggable key={keys[idx]} draggableId={keys[idx]} index={idx}>
                                {draggable =>
                                    <div
                                        className={ustyles.fieldContainer}
                                        {...draggable.draggableProps}
                                        {...draggable.dragHandleProps}
                                        ref={draggable.innerRef}
                                    >
					{console.log(keys[idx])}
                                        {idx > 0 &&
					 <button
					     onClick={
						 () => swapField(
						     `${name}[${idx}]`,
						     `${name}[${idx-1}]`
						 )
					     }
					 >
					     Move Up
					 </button>
					}
                                        {idx < length - 1 &&
					 <button
					     onClick={
						 () => swapField(
						     `${name}[${idx}]`,
						     `${name}[${idx+1}]`
						 )
					     }
					 >
					     Move Down
					 </button>
					}
                                        <button
					    onClick={() => deleteField(`${name}[${idx}]`)}
					>
					    Delete this field
					</button>
                                        <TextField
					    type="text"
                                            name={`${name}[${idx}]`}
                                            defaultValue={idx}
                                            placeholder={`${idx}`}
                                            label={`Currrent field index: ${idx} (key: foo.anArray[${idx}])`}
					    form={form}
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
