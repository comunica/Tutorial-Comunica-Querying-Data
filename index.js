const express = require('express');
const newEngine = require('@comunica/actor-init-sparql').newEngine;

const app = express();
const port = 3000;
const engine = newEngine();

app.use(express.static('public'));

const queryTemplate = `
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX dc: <http://purl.org/dc/terms/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>
SELECT ?name ?title ?publisher ?thumbnail
{ 
    ?person dbpedia-owl:birthPlace <http://dbpedia.org/resource/Belgium>.
    %CITY%
    
    ?viafID schema:sameAs ?person;
            schema:name ?name.
    ?book dc:contributor [ foaf:name ?name ];
          dc:title ?title;
          dc:publisher ?publisher.
  
    ?person dbpedia-owl:thumbnail ?thumbnail.
}
`;
const sources = [
    { type: 'hypermedia', value: 'https://fragments.dbpedia.org/2016-04/en' },
    { type: 'hypermedia', value: 'http://data.linkeddatafragments.org/viaf' },
    { type: 'hypermedia', value: 'http://data.linkeddatafragments.org/harvard' }
];

function cleanInput(str) {
    if (str)
        return str.replace(/["\\]/g, '');
    else
        return '';
}

app.get('/', (req, res) => {
    const city = cleanInput(req.query.city);
    let query = queryTemplate.replace('%CITY%', city ? `?person dbpedia-owl:birthPlace [ rdfs:label "${city}"@en ].` : '');
    engine.query(query, { sources: sources }).then(result => {
        res.set('content-type', 'text/html; charset=utf-8');

        res.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Belgian writers${city ? ' from ' + city : ''}</title>
                <link rel="stylesheet" href="style.css">
            </head>
            <body>
            <ul>
        `);

        result.bindingsStream.on('data', data => {
            res.write('<li>');
            res.write(`<img alt="thumbnail" src="${data.get('?thumbnail').value}" />`);
            res.write(`<strong>${data.get('?title').value}</strong><br/>`);
            res.write(`<em>Author: ${data.get('?name').value}</em><br/>`);
            res.write(`<span>Publisher: ${data.get('?publisher').value}</span>`);
            res.write('</li>');
        });
        result.bindingsStream.on('end', () => res.end('</ul></body></html>'));
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
