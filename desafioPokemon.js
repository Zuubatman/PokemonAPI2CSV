const axios = require('axios');

async function pokemon() {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://pokeapi.co/api/v2/pokemon?offset=0&limit=1000',
        headers: {}
    };
    let response = await axios.request(config)
    let pokemons = response.data.results
    let pokemonArray = await individualPokemonInfo(pokemons)
    csvGenerator(pokemonArray.sort((a,b) => (
        a.name > b.name ? 1 : -1
    )))
}

async function individualPokemonInfo(pokemons){
    let pokemonPromises = pokemons.map(async pokemon => {
        let url = pokemon.url
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: url,
            headers: {}
        }
        let response = await axios.request(config)
        let pokemonInfo = response.data;
        let pokemonObj = { 
            name: pokemonInfo.name.toUpperCase(),
            height: (pokemonInfo.height / 10).toFixed(1) + 'm',
            weight: (pokemonInfo.weight / 10).toFixed(1) + 'kg',
            base_experience: pokemonInfo.base_experience,
            abilities: pokemonInfo.abilities.map(ability => ability.ability.name.toUpperCase()),
        }
        return pokemonObj
    });

    let pokemonArray = await Promise.all(pokemonPromises);
    return pokemonArray
}

function csvGenerator(pokemonArray) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;

    const csvWriter = createCsvWriter({
        path: 'Pokemons.csv',
        header: [
            { id: 'name', title: 'Name' },
            { id: 'height', title: 'Height' },
            { id: 'weight', title: 'Weight' },
            { id: 'base_experience', title: 'Base Exp.' },
            { id: 'abilities', title: 'Abilities' },
        ]
    });

    csvWriter.writeRecords(pokemonArray)
        .then(() => {
            console.log('Finished');
        });
}

pokemon()