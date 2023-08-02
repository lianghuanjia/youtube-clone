import express from "express";

import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedVideo } from "./storage";
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json())

app.post("/process-video", async (req, res) => {
    // Get the bucket and file name from the Cloud Pub/Sub message
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        // If the data payload is invalid, we treat it as an error
        if (!data.name) {
            throw new Error('Invalid message payload received.');
        }

    }
    catch (error){
        console.error(error);
        return res.status(400).send('Bad Request: missing filename.');
    }

    const inputFileName = data.name; // Format of <UID>-<DATE>.<EXTENSION>
    const outputFileName =  `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0];

    if (!isVideoNew(videoId)) {
        return res.status(400).send('Bad Request: video already processing or processed');
    } else {
        await setVideo(videoId, {
            id: videoId,
            uid: videoId.split('-')[0],
            status: 'processing'
        });
    }

    // Download the raw video from Cloud Storage
    console.log("------About to download the raw video")
    await downloadRawVideo(inputFileName);

    // Update the video's status in the firestore to indicate that it is processed.
    await setVideo(videoId, {
        status: 'processed',
        filename: outputFileName
    });

    console.log("------Finished downloading raw video")
    // Convert the video to 360p
    try{
        await convertVideo(inputFileName, outputFileName);
    }catch (err){
        // use Promise.all to await both delete functions in parallel, this is more efficient thatn
        // calling await in front of each delete functions.
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName)
        ]);
        console.error(err);
        console.error("------Failed processing video")
        return res.status(500).send('Internal Server Error: video processing failed.');
    }

    console.log("------Video finished processing.")

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    console.log("------Finished uploading processed video to GCP bucket.")
    // After uploading the processed video, we need to clean up the local raw and processed video.
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    console.log("------Whole process is finished.");
    return res.status(200).send('------Whole process is finished.');

});

//This is for deployment. Port might be used based on processing environment or if it is not defined, use 3000
const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
})

