// module.exports = function(app) {

//   // A GET request to scrape the echojs website
//   app.get("/scrape", function(req, res) {
//     // First, we grab the body of the html with request
//     request("https://www.nytimes.com/section/health?action=click&contentCollection=Health&module=SectionsNav&pgtype=sectionfront&region=TopBar&version=BrowseTree", function(error, response, html) {
//       // Then, we load that into cheerio and save it to $ for a shorthand selector
//       var $ = cheerio.load(html);
//       // Now, we grab every h2 within an article tag, and do the following:
//       $("#latest-panel h2").each(function(i, element) {

//         // Save an empty result object
//         var result = {};

//         // Add the header and associated text and save them as properties of the result object
//         result.title = $(this).children("h2.headline").text();
//         result.text = $(this).children("p.summary").text();

//         // Using our Article model, create a new entry
//         // This effectively passes the result object to the entry (and the title and link)
//         var entry = new Article(result);

//         // Now, save that entry to the db
//         entry.save(function(err, doc) {
//           // Log any errors
//           if (err) {
//             console.log(err);
//           }
//           // Or log the doc
//           else {
//             console.log(doc);
//           }
//         });

//       });
//     });
//     // Tell the browser that we finished scraping the text
//     res.send("Scrape Complete");
//   });
// }