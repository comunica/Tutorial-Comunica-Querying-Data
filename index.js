const express = require('express');
const newEngineDynamic = require('@comunica/actor-init-sparql').newEngineDynamic;

const app = express();
const port = 3000;

const query = `
SELECT *
{ 
    ?s dbpedia-owl:birthPlace <http://dbpedia.org/resource/Belgium> 
}
LIMIT 5
`;
const sources = [ { type: 'hypermedia', value: 'http://fragments.dbpedia.org/2015/en' } ];

app.get('/', (req, res) => {
    newEngineDynamic().then(function (myEngine) {
        myEngine.query(query, { sources: sources })
            .then((result) => {

                const output = [];
                result.bindingsStream.on('data', data => output.push(data));
                result.bindingsStream.on('end', () => res.json(output));

            });
    });
});

app.listen(port, () => console.log(`Listening on port ${port}!`));