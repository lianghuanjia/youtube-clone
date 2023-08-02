// eslint-disable
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import {Storage} from "@google-cloud/storage";
import {onCall} from "firebase-functions/v2/https";


initializeApp();

const firestore = new Firestore();
const storage = new Storage();

const rawVideoBucketName = "hjl-yt-clone-raw-videos";

/**
 *
 */
export const createUser = functions.auth.user().onCreate((user) => {
    const userInfo = {
        uid: user.uid,
        email: user.email,
        photoUrl: user.photoURL,
    };
    firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
});


export const generateUploadUrl = onCall( {maxInstances: 1}, async (request) => {
    // Check if the user is authenticated
    if (!request.auth) {
        throw new functions.https.HttpsError(
            "failed-precondition",
            "The function must be called while authenticated."
        );
    }

    const auth = request.auth;
    const data = request.data;
    const bucket = storage.bucket(rawVideoBucketName);

    // Generate a unique filename for the file that the user wants
    // to upload. We don't care the filename that the user gives,
    // we create one name for them for our convenience. The way we
    // generate fileName: user's UID + the current Time + file extension(if
    // don't include this, our upload file signed URL won't work).
    // Potential problem: If one user upload the same file more
    // than once at the same time, they might get the same name.
    const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

    // Get a v4 signed URL for uploading video
    const [url] = await bucket.file(fileName).getSignedUrl({
        version: "v4",
        action: "write",
        expires: Date.now() + 15*60*1000,
        // Starting from now, the signed URL is valid for 15 minutes.
    });
    return {url, fileName};
});

