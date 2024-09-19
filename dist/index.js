"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const youtube_dl_exec_1 = __importDefault(require("youtube-dl-exec"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const DELETE_TIMEOUT = 1000 * 60 * 10;
app.post('/download', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const youtubeUrl = req.body.youtubeUrl;
    console.log(youtubeUrl);
    let downloaded = 0;
    // Example with custom function.
    const videoId = youtubeUrl.split("?v=")[1];
    const filePath = path_1.default.join(__dirname, "..", `${videoId}.mp4`);
    console.log(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        console.log("Downloading .....");
        const video = yield (0, youtube_dl_exec_1.default)(youtubeUrl);
        console.log("video", video);
        // Read the contents of the directory
        fs_1.default.readdir(path_1.default.join(__dirname, ".."), (err, files) => {
            if (files) {
                // Find files that contain the search string
                const matchingFiles = files.filter(file => file.includes(videoId));
                if (matchingFiles.length > 0) {
                    const fileName = matchingFiles[0];
                    console.log("Found file", fileName);
                    fs_1.default.renameSync(fileName, `${videoId}.mp4`);
                    setTimeout(() => {
                        console.log("Deleting .....");
                        fs_1.default.unlinkSync(filePath);
                    }, DELETE_TIMEOUT);
                    //@ts-ignore
                    console.log(title, videoId);
                    const stat = fs_1.default.statSync(filePath);
                    res.writeHead(200, {
                        'Content-Type': 'application/mp4', // Set MIME type based on the file type
                        'Content-Length': stat.size,
                    });
                    // Create a read stream and pipe it to the response
                    const readStream = fs_1.default.createReadStream(filePath);
                    readStream.pipe(res);
                    // Handle stream error
                    readStream.on('error', (err) => {
                        console.error('File streaming error:', err);
                        res.sendStatus(500);
                    });
                }
            }
        });
    }
    else {
        const stat = fs_1.default.statSync(filePath);
        res.writeHead(200, {
            'Content-Type': 'application/mp4', // Set MIME type based on the file type
            'Content-Length': stat.size,
        });
        // Create a read stream and pipe it to the response
        const readStream = fs_1.default.createReadStream(filePath);
        readStream.pipe(res);
        // Handle stream error
        readStream.on('error', (err) => {
            console.error('File streaming error:', err);
            res.sendStatus(500);
        });
    }
}));
app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.listen(8080, () => {
    console.log("Server is running on port 8080");
});
