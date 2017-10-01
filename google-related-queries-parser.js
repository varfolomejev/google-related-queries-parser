const url = require('url');
const nightmare = require('nightmare')({ show: false });
const cheerio = require('cheerio');

class GoogleRelatedQueriesParser
{
    constructor(settings){
        this.protocol = settings.protocol || 'https:';
        this.hostname = settings.hostname || 'www.google.com';
        this.pathname = settings.pathname || '/search';
        this.relatedQueriesBockId = settings.relatedQueriesBockId || 'brs';
    }

    parse(searchString, callback){
        let queries = [];
        nightmare
            .goto(this.getUrl(searchString))
            //.wait('#' + this.relatedQueriesBockId)
            .evaluate(function () {
                return document.querySelector('html').innerHTML;
            })
            .end()
            .then(function (html) {
                if(html){
                    let $ = cheerio.load(html);
                    $('._e4b').each(function(i, elem) {
                        queries.push({
                            title: $(this).text(),
                            url: $(this).find('a').attr('href'),
                            html: $(this).find('a').html(),
                        });
                    });
                }
                callback(null, queries);
            })
            .catch(function (error) {
                callback(error);
            });
    }

    getUrl(searchString){
        let urlObj = {
            protocol: this.protocol,
            hostname: this.hostname,
            pathname: this.pathname,
            query: {
                q: searchString,
                sourceid: 'chrome',
                ie: 'UTF-8'
            },
        };
        return url.format(urlObj)
    }
}

module.exports = GoogleRelatedQueriesParser;