const express = require('express');
const newEngine = require('@comunica/actor-init-sparql').newEngine;

const app = express();
const port = 3000;
const engine = newEngine();

const queryTemplate = `
PREFIX dbpedia-owl: <http://dbpedia.org/ontology/>
PREFIX foaf: <http://xmlns.com/foaf/0.1/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?name
{ 
    ?person dbpedia-owl:birthPlace <http://dbpedia.org/resource/Belgium>;
            foaf:name ?name.
    
    %CITY%
}
`;
const sources = [
    { type: 'hypermedia', value: 'https://fragments.dbpedia.org/2016-04/en' }
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
        res.set('content-type', 'text/plain; charset=utf-8');

        result.bindingsStream.on('data', data => res.write(data.get('?name').value + '\n'));
        result.bindingsStream.on('end', () => res.end());
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
