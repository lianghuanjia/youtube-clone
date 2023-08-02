import { credential } from "firebase-admin";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";

initializeApp({credential: credential.applicationDefault()});

const firestore = new Firestore();

const videoCollectionId = 'videos';

export interface Video {
    id?: string,
    uid?: string,
    filename?: string,
    status?: "processing" | "processed",
    title?: string,
    description?: string
}

/**
 * Given a videoId, we fetch this video from firestore.
 * @param videoId The video's ID we want to fetch
 * @returns All fields in the document as an Object. Returns 'undefined' if the document doesn't exist.
 */
async function getVideo(videoId: string) {
    const snapshot = await firestore.collection(videoCollectionId).doc(videoId).get();
    // return the retrieving data as Video interface or empty object if the file doesn't exist in the firestore.
    return (snapshot.data() as Video) ?? {};
}


export function setVideo(videoId: string, video: Video) {
     return firestore.collection(videoCollectionId).doc(videoId).set(video, {merge: true});
     // merge: true allow us to only update the data that doesn't exist in the firestore to that video doc.
     // If there is no merge: true, then setVideo will overwrite everything of the video that existed before.
     // This is inefficient.
}

/**
 * Check if the video new to the firestore
 * @param videoId The video's ID we want to look up for
 * @returns True if the video new to the firestore, False otherwise.
 */
export async function isVideoNew(videoId: string) {
    const video = await getVideo(videoId);
    return video?.status === undefined;
}


