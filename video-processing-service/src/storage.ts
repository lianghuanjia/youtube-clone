// 1. GCS file interactions
// 2. Local file interactions

import { Storage } from "@google-cloud/storage";
import fs from 'fs';
import ffmpeg from "fluent-ffmpeg";
import { resolve } from "path";
import { rejects } from "assert";

//Create an instance for GCS
const storage = new Storage();

//Name of bucket name in the GCS. GCS bucket name has to be globally unique.
const rawVideoBucketName = "hjl-yt-clone-raw-videos";
const proccessedVideoBucketName = "hjl-yt-clone-processed-videos";

const localRawVideoPath = './raw-videos';
const localProcessedVideoPath = './processed-videos';

/**
 * Creates the local directoreis for raw and processed videos
 */
export function setupDirectories(){
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
}


export async function downloadRawVideo(fileName:string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({destination: `${localRawVideoPath}/${fileName}`});

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    )
}


export async function uploadProcessedvideo(fileName:string){
    const bucket = storage.bucket(proccessedVideoBucketName);

    //upload the local processed file to the GCS's processed video bucket
    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${localProcessedVideoPath}/${fileName} uploaded to gs://${proccessedVideoBucketName}/${fileName}.`
    );

    await bucket.file(fileName).makePublic();
}

export function deleteRawVideo(fileName:string){
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

export function deleteProcessedVideo(fileName:string){
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


function deleteFile(filePath:string): Promise<void> {
    return new Promise((resolve, reject)=>{
        // if file exists, we will try to delete it.
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                // if there is an error occured while deleting the file
                if (err){
                    console.log(`Failed to delete file at ${filePath}.`);
                    reject(err);
                }
                // we deleted the file successfully
                else {
                    console.log(`File deleted at ${filePath}.`);
                    resolve()
                }
            })
        }
        // if file not exists, just skip the delete process and return
        else{
            console.log(`File not found at ${filePath}, skipping the delete`);
            resolve();
        }
    })
}



function ensureDirectoryExistence(dirPath: string){
    if (!fs.existsSync(dirPath)){
        fs.mkdirSync(dirPath, {recursive:true}); //"recursive: true" enables making nested directory
        console.log(`Directory created at ${dirPath}`);
    }
}


/**
 * 
 * @param rawVideoName 
 * @param processedVideoName 
 * @returns A promise that resolves when the video is converted
 */
export function convertVideo(rawVideoName: string, processedVideoName: string){
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-2:360") //360p
        .on("end",() => {
            console.log("Video processing successfully.");
            resolve();
        })
        .on('stderr', (stderr) => {
            console.log(stderr);
            reject(stderr);
        })
        .on("error", (err) => {
            console.log(`An error occurred: ${err.message}`);
            reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}