const express = require("express");
const request = require("request");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
// const $ = cheerio.load("http://gutenberg.net.au/ebooks10/1000531h.html");

const app = express();
app.use(express.static("public"));

// const partOne = [];

// I was wrong, this actually gets everything, which makes sense:
const partTwo = [];

app.get("/poems/:id", (req, res) => {
    console.log(req.params, req.id);
    if (req.params.id === 1) {
        // res.send(partOne);
    } else {
        res.send(partTwo);
    }
});

app.get("/search/:term", (req, res) => {
    const term = req.params.term;
    const result = [];
    partTwo.forEach(poem => {
        poem.text.forEach(line => {
            if (line.indexOf(term) > -1) {
                result.push({
                    line,
                    title: poem.title,
                    part: poem.partNo
                })
            }
        });
    });
    res.send(result);
});

let partNo = 1;

request({
    url: "http://gutenberg.net.au/ebooks10/1000531h.html",
    encoding: null
}, (err, resp, html) => {
    var utf8String = iconv.decode(new Buffer(html), "ISO-8859-1");

    const $ = cheerio.load(utf8String);

    // First 26 poems:
    // console.log($("p").text());

    // Second 26 poems:
    // console.log($("body").text());

    // const partOneText = $("p").text().split("\n"); // using .html() shows unicode for the question mark...so it must be in request
    const partTwoText = $("body").text().split("\n");
    // const partOneHtml = $("p").html().split("\n");
    // console.log(partOneText[58]);
    // console.log(partOneHtml[58]);

    function makePoemArray(poems, part) {
        let poemTitle = '';
        let poemText = [];
        poems.forEach((text, i) => {
            if (((/^[IVX]*$/).test(text) && text) ||
                (i === poems.length - 1)) {
                part.push({
                    title: poemTitle,
                    text: poemText,
                    partNo
                })
                poemTitle = text;
                poemText = [];
            } else {
                poemText.push(text);
            }
            if (text === "Raumgewinn.") partNo = 2;

        });
    }

    // makePoemArray(partOneText, partOne);
    makePoemArray(partTwoText, partTwo);



    // console.log($("p").text().split("\n").filter(x => (/^[IVX]*?/).test(x)));

    // console.log($("p").text().split("\n").filter(x => (/^[IVX]*$/).test(x)).filter(x => x));


});


app.listen(3000, () => { console.log("thanks for listening on 3000") });