import express from "express";
import cors from "cors";
import fs from 'fs';
import ytdl from 'ytdl-core';
import youtubeDl from "youtube-dl-exec";
import path from "path";

const app = express();

app.use(express.json());

app.use(cors());

const DELETE_TIMEOUT = 1000 *60*10;


app.post('/download',async(req,res)=>{
    const youtubeUrl = req.body.youtubeUrl;
    console.log(youtubeUrl);
    
    let downloaded = 0;
    // Example with custom function.
    const videoId  = ytdl.getVideoID(youtubeUrl);
    const title = (await ytdl.getInfo(youtubeUrl)).videoDetails.title;
    const filePath = path.join(__dirname ,".." ,`${videoId}.mp4`);
    console.log(filePath);

    if(!fs.existsSync(filePath)){
        console.log("Downloading .....");
        const video = await youtubeDl(youtubeUrl);
        console.log("video" , video);
        
        // Read the contents of the directory
        fs.readdir(path.join(__dirname,".."),(err , files)=>{
            if(files){
                // Find files that contain the search string
                const matchingFiles = files.filter(file => file.includes(videoId));

                if(matchingFiles.length > 0){
                    const fileName = matchingFiles[0];
                    console.log("Found file" , fileName);
                    fs.renameSync(fileName,`${videoId}.mp4`);

                    setTimeout(()=>{
                        console.log("Deleting .....");
                        fs.unlinkSync(filePath);
                    },DELETE_TIMEOUT);

                    //@ts-ignore
                    console.log(title , videoId);
                    const stat = fs.statSync(filePath);

                    res.writeHead(200, {
                        'Content-Type': 'application/mp4', // Set MIME type based on the file type
                        'Content-Length': stat.size,
                    });
                    // Create a read stream and pipe it to the response
                    const readStream = fs.createReadStream(filePath);
                    readStream.pipe(res);
                    // Handle stream error
                    readStream.on('error', (err) => {
                        console.error('File streaming error:', err);
                        res.sendStatus(500);
                    });
                }
            }
        })
    }
    else{
        const stat = fs.statSync(filePath);

        res.writeHead(200, {
            'Content-Type': 'application/mp4', // Set MIME type based on the file type
            'Content-Length': stat.size,
        });
        // Create a read stream and pipe it to the response
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        // Handle stream error
        readStream.on('error', (err) => {
            console.error('File streaming error:', err);
            res.sendStatus(500);
        });
    }

    
})

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});