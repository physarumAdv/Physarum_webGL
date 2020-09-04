const http = require("http");
const urlapi = require("url");
const fs = require("fs");
const path = require("path");
const nStatic = require("node-static");

const filePath = path.join(__dirname, "physarum_ThreeJS.html");
var jsFolderFileServer = new nStatic.Server(path.join(__dirname, "/build"));

var Data = [];
var Movie = [];
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

    Movie.push(Data);
    fs.writeFile("build/saves/new_save.json", JSON.stringify(Movie), "utf8", function (err) {
        if (err) {
            return console.log(err);
        }
    }); 
    NewFrame = true
}

function getFrame(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});
    res.end(JSON.stringify(Data));
    NewFrame = false
}

function getStatus(req, res) {
    res.writeHead(200, {"Content-Type": "text/json"});
    res.end(JSON.stringify({"done": true, "status": NewFrame}));
}

function refresh(req, res) {
    req.url = req.url.replace("/physarum/build/", "/");
    jsFolderFileServer.serve(req, res);
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
        case pathname === "/physarum":
            index(req, res);
            break;
        case pathname === "/physarum/add_frame":
            addFrame(req, res);
            break;
        case pathname === "/physarum/get_frame":
            getFrame(req, res);
            break;
        case pathname === "/physarum/get_status":
            getStatus(req, res);
            break;
        case pathname === "/physarum/refresh":
            refresh(req, res)
            break;
        case pathname.startsWith("/physarum/build"):
            req.url = req.url.replace("/physarum/build", "/");
            jsFolderFileServer.serve(req, res);
            break;
        default:
            error404(req, res);
            break;
    }
}

app = http.createServer(main);
app.listen(8080);
console.log("Listening on 8080");
