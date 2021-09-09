import * as React from 'react'
import { getField } from 'zusform'

import ustyles from '../styles/utilities.module.css'
import styles from './AnotherComponent.module.css'

import { useForm } from '../pages'

export default function AnotherComponent () {
    const qux15 = useForm(...getField("foo.qux[15]"))
    const fooBarBaz = useForm(...getField("foo.bar.baz"))

    return (
        <div className={styles.wrapper}>
            <h2 className={ustyles.h2}>This component is outside the form.</h2>
            <p className={ustyles.p}>{`"foo.qux[15]": ${qux15 && qux15.value}`}</p>
            <p className={ustyles.p}>{`"foo.bar.baz": ${fooBarBaz && fooBarBaz.value}`}</p>
            <p className={ustyles.p}>Take a look at the code, then edit the corresponding fields below...</p>
        </div>
    )
}