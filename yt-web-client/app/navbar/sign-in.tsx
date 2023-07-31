'use client';

import { Fragment } from "react";
import styles from './sign-in.module.css';
import { signInWithGoogle, signOut } from "../firebase/firebase";
import { User } from "firebase/auth";

interface SignInProps {
    user: User | null;
}

export default function SignIn({user}: SignInProps){



    return(
        //
        <Fragment>
            {
                // if user is defined, render sign out button. if user is NOT defined, render the sign in button
                user ?
                (
                    <button className={styles.signin} onClick={signOut}>
                    Sign Out
                    </button>
                ) : (
                    <button className={styles.signin} onClick={signInWithGoogle}>
                    Sign In
                </button>
                )
            }
        </Fragment>
    )
}