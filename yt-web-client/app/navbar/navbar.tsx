'use client'
import Image from "next/image";
import styles from "./navbar.module.css";
import Link from "next/link";
import SignIn from "./sign-in";
import { useState, useEffect } from "react";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import { User } from "firebase/auth"; 
export default function Navbar(){
    // use hook to remember the state of user
    const [user, setUser] = useState<User | null>(null);

    useEffect( () => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    })
    return (
        <nav className={styles.nav}>
            <Link href="/" className={styles.logoContainer}>
            <Image width={90} height={20}
                src="/youtube-logo.svg" alt="YouTube Logo"/>
            </Link>
            <SignIn user={user} />
        </nav>
    );
}