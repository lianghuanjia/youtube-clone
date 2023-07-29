import express from "express";

import { convertVideo, deleteProcessedVideo, deleteRawVideo, downloadRawVideo, setupDirectories, uploadProcessedvideo } from "./storage";

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

    const inputFileName = data.name;
    const outputFileName =  `processed-${inputFileName}`;

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

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
        return res.status(500).send('Internal Server Error: video processing failed.');
    }


    // Upload the processed video to Cloud Storage
    await uploadProcessedvideo(outputFileName);

    // After uploading the processed video, we need to clean up the local raw and processed video.
    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName)
    ]);

    return res.status(200).send('Processing finished successfully.');

});

//This is for deployment. Port might be used based on processing environment or if it is not defined, use 3000
const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
})

