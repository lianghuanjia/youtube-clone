import express from "express";
import ffmpeg from "fluent-ffmpeg";
import { stderr } from "process";

const app = express();
app.use(express.json())

app.post("/process-video", (req, res) => {
    console.log(req.body.inputFilePath)
    // get path of the input video file from the request body
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath; 

    if (!inputFilePath || !outputFilePath){
        res.status(400).send("Bad Request: Missing file path.");
    }
    console.log("Processing video")
    ffmpeg(inputFilePath)
        .outputOptions("-vf", "scale=-2:360") //360p
        .on("end",() => {
            res.status(200).send("Video processing successfully.")
        })
        .on('stderr', (stderr) => {
            console.log(stderr)
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            res.status(500).send(`Internal Server Error: ${err.message}`);
        })
        .save(outputFilePath);
});

//This is for deployment. Port might be used based on processing environment or if it is not defined, use 3000
const port = process.env.PORT || 3000;

app.listen(port,() => {
    console.log(
        `Video processing service listening at http://localhost:${port}`);
})

