const express = require('express');
const newEngineDynamic = require('@comunica/actor-init-sparql').newEngineDynamic;

const app = express();
const port = 3000;

const queryTemplate = `
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX dc: <http://purl.org/dc/terms/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>

SELECT ?name ?title
{ 
    ?person dbpedia-owl:birthPlace <http://dbpedia.org/resource/Belgium>.
    %CITY%
    
    ?viafID schema:sameAs ?person;
            schema:name ?name.
    ?book dc:contributor [ foaf:name ?name ];
          dc:title ?title.
}
`;
const sources = [
    { type: 'hypermedia', value: 'http://fragments.dbpedia.org/2016-04/en' },
    { type: 'hypermedia', value: 'http://data.linkeddatafragments.org/viaf' },
    { type: 'hypermedia', value: 'http://data.linkeddatafragments.org/harvard' }
];

app.get('/', (req, res) => {
    const city = req.query.city;
    // A real solution would take query injection into account!
    let query = queryTemplate.replace('%CITY%', city ? `?person dbpedia-owl:birthPlace [ rdfs:label "${city}"@en ].` : '');
    newEngineDynamic().then(function (myEngine) {
        myEngine.query(query, { sources: sources.slice() })
            .then((result) => {

                res.set('content-type', 'text/plain; charset=utf-8');

                result.bindingsStream.on('data', data => res.write(`${data.get('?name').value}: ${data.get('?title').value}\n`) );
                result.bindingsStream.on('end', () => res.end());

            });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));