# Formicious :man_dancing: 
Form handling for React, with a focus on easy development of complex cases. 

## Philosophy 
The primary goal of this library is to make developing arbitrarily complex forms in React less frustrating. 

Complex forms may have dynamic arrays of fields, dynamic key-value objects of fields, multiple non-trivial validation requirements for individual fields, 
sets of fields or the whole form, dependent inputs/components, and may require transforms to be applied to form state to support funky custom input components. 

Forms are generalized as an arbitrary object and a set of metadata for a subset of individual fields. A form handling library
is a way of manipulating that metadata, for the fields we are interested in tracking, and keeping form state in tune with form inputs. 

I found that I often needed extra dependencies or the same boiler-plate code (or "hacks") to build performant, complex forms in React with other common libraries. 

`formicious` has dependencies, and every other aspect of the library will only ever be secondary to the stated goal of making it simpler and more
straightforward to develop very complicated, performant forms. 

We should be able to let developers handle all of the following: 

- Turn arbitrary objects into forms. 
- Arbitrarily complex fields. 
- Arbitrarily complex fields that depend on one another. 
- Metadata and tracking field value are handled separately. 
- Easily access form values from outside the form, for arbitrary sets of fields. 
- Can handle walk-through style forms.
- Easy dynamic arrays (or objects) of fields.
- Real-time validation of individual fields.
- Let developers bring their own input components. 
- Handle multiple validation strategies for the form, fields. 
- Access validation errors for whole form or fields. 
- Form data, metadata, errors can be serialized. 

## Form State 
Formicious relies on Zustand and Immer to handle form state. Both libraries are succinct and don't have a large footprint. 
If there is sufficient interest, one could encapsulate state management and optionally back Formicious with other state managers like Redux. 

## Work in Progress - Docs forthcoming

 
 
