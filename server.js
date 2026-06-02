const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.argv[2] || 4173);
const root = path.join(__dirname, "src");

const contentTypes = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png"
};

const server = http.createServer((request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") {
        pathname = "/index.html";
    }

    const filePath = path.normalize(path.join(root, pathname));
    if (!filePath.startsWith(root)) {
        response.writeHead(403);
        response.end("Forbidden");
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }

        response.writeHead(200, {
            "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream"
        });
        response.end(data);
    });
});

server.listen(port, "127.0.0.1", () => {
    console.log(`CS2 Skin Price Tracker running at http://127.0.0.1:${port}`);
});
