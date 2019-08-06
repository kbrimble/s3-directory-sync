const sut = require("../lib/utils");

describe("utils", () => {
    describe("getFileExtension", () => {
        test.each`
        path                    | extension
        ${"hello.txt"}          | ${"txt"}
        ${"subDir/hello.json"}  | ${"json"}
        ${"../subDir/hello.js"} | ${"js"}
        ${"/root/hello.exe"}    | ${"exe"}
        `("converts $path to $extension", ({ path, extension }) => {
            const result = sut.getFileExtension(path);
            expect(result).toBe(extension);
        });
    });

    describe("getContentType", () => {
        test.each`
        extension 
        ${"exe"} 
        ${"sh"} 
        ${"git"} 
        ${"zip"} 
        `("converts $extension to default content type: 'application/octet-stream'", ({ extension }) => {
            const result = sut.getContentType(extension);
            expect(result).toBe('application/octet-stream');
        });

        test.each`
        extension | contentType
        ${"css"}  | ${"text/css"},
        ${"gif"}  | ${"image/gif"},
        ${"html"} | ${"text/html"},
        ${"ico"}  | ${"image/x-icon"},
        ${"jpeg"} | ${"image/jpg"},
        ${"jpg"}  | ${"image/jpg"},
        ${"js"}   | ${"application/x-javascript"},
        ${"json"} | ${"application/json"},
        ${"png"}  | ${"image/png"},
        ${"svg"}  | ${"image/svg+xml"},
        ${"txt"}  | ${"text/plain"},
        ${"xml"}  | ${"application/xml"}
        `("converts $extension to $contentType", ({ extension, contentType }) => {
            const result = sut.getContentType(extension);
            expect(result).toBe(contentType);
        });
    });

    describe("trailingSlash", () => {
        test.each`
        path   | pathWithSlash 
        ${"/"} | ${"/"}
        ${"/noSlash"} | ${"/noSlash/"}
        ${"/slash/"} | ${"/slash/"}
        ${"../relNoSlash"} | ${"../relNoSlash/"}
        ${"../relSlash/"} | ${"../relSlash/"}
        `("ensures $path gets a trailing slash to become $pathWithSlash", ({ path, pathWithSlash }) => {
            const result = sut.trailingSlash(path);
            expect(result).toBe(pathWithSlash);
        });
    });

    describe("noSlash", () => {
        test.each`
        path   | pathWithNoSlash 
        ${"/"} | ${"/"}
        ${"/noSlash"} | ${"/noSlash"}
        ${"/slash/"} | ${"/slash"}
        ${"../relNoSlash"} | ${"../relNoSlash"}
        ${"../relSlash/"} | ${"../relSlash"}
        `("ensures $path gets a trailing slash to become $pathWithNoSlash", ({ path, pathWithNoSlash }) => {
            const result = sut.noSlash(path);
            expect(result).toBe(pathWithNoSlash);
        });
    });
});