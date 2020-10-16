const http = require("http");
const urlapi = require("url");
const fs = require("fs");
const path = require("path");
const nStatic = require("node-static");

const filePath = path.join(__dirname, "physarum.html");
var libsFileServer = new nStatic.Server(path.join(__dirname, "/lib"));
var scriptsFileServer = new nStatic.Server(path.join(__dirname, "/scripts"));


var Data = [];
var NewFrame = false;

function index(req, res) {
    fs.readFile(filePath, {encoding: "utf-8"}, function(err, data) {
        if (!err) {
            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        } else {
            console.log(err);
        }
    });
}

function addFrame(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});

    var body = "";
    req.on("data", function (chunk) {
        body += chunk.toString();
    });

    req.on("end", function() {
        Data = JSON.parse(body);
        res.end(JSON.stringify({"ok": true}));
    });

    NewFrame = true;
}

function getFrame(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});
    res.end(JSON.stringify(Data));
    NewFrame = false;
}

function getStatus(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});
    res.end(JSON.stringify({"done": true, "status": NewFrame}));
}

function error404(req, res) {
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("404 Not Found :(");
}

function main(req, res) {
    var url = urlapi.parse(req.url);

    var pathname = url.pathname;

    switch(true) {
        case pathname === "/":
            index(req, res);
            break;
        case pathname === "/add_frame":
            addFrame(req, res);
            break;
        case pathname === "/get_frame":
            getFrame(req, res);
            break;
        case pathname === "/get_status":
            getStatus(req, res);
            break;
        case pathname.startsWith("/lib/"):
            req.url = req.url.replace("/lib", "/");
            libsFileServer.serve(req, res);
            break;
        case pathname.startsWith("/scripts/"):
            req.url = req.url.replace("/scripts", "/");
            scriptsFileServer.serve(req, res);
            break;
        default:
            error404(req, res);
            break;
    }
}

var app = http.createServer(main);
app.listen(8080);
console.log("Listening on 8080");
