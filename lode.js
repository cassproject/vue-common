global.jsonld = require('jsonld');


const state = {
    schemata: {},
    schemataLookup: {},
    rawSchemata: {},
    schemaFallback: {},
    objectModel: {},
    competencySearchModalOpen: false,
    copyOrLink: false,
    numPropertyComponentsVisible: {},
    searchType: null
};
const actions = {
    schemata({state, commit}, schema) {
        commit('setSchemata', schema);
        if (EcArray.isArray(schema.obj)) {
            commit('setEmptySchemataLookup', schema);
            for (var i = 0; i < schema.obj.length; i++) {
                let scheme = schema.obj[i];
                commit('setSchemataLookup', {'index': i, 'schema': schema});
                if (scheme["http://schema.org/domainIncludes"] != null) {
                    for (var domainType of scheme["http://schema.org/domainIncludes"]) {
                        if (state.objectModel[domainType["@id"]] == null) {
                            commit('setObjectModel', {'type': domainType, 'val': {}});
                        }
                        let om = state.objectModel[domainType["@id"]];
                        om[scheme["@id"]] = scheme;
                    }
                }
            }
        }
    },
    schemaFallback({state}, schema) {
        for (var i = 0; i < schema.length; i++) {
            let scheme = schema[i];
            state.schemaFallback[scheme["@id"]] = schema[i];
            if (scheme["http://schema.org/domainIncludes"] != null) {
                for (var domainType of scheme["http://schema.org/domainIncludes"]) {
                    if (state.objectModel[domainType["@id"]] == null) {
                        state.objectModel[domainType["@id"]] = {};
                    }
                    let om = state.objectModel[domainType["@id"]];
                    om[scheme["@id"]] = scheme;
                }
            }
        }
    }
};
const mutations = {
    setSchemata(state, schema) {
        state.schemata[schema.id] = schema.obj;
    },
    setSchemataLookup(state, payload) {
        let i = payload.index;
        let schema = payload.schema;
        state.schemataLookup[schema.id][schema.obj[i]["@id"]] = schema.obj[i];
    },
    setEmptySchemataLookup(state, schema) {
        state.schemataLookup[schema.id] = {};
    },
    setObjectModel(state, payload) {
        let domainType = payload.type;
        let val = payload.val;
        state.objectModel[domainType["@id"]] = val;
    },
    rawSchemata(state, schema) {
        state.rawSchemata[schema.id] = schema.obj;
    },
    competencySearchModalOpen(state, bool) {
        state.competencySearchModalOpen = bool;
    },
    copyOrLink(state, bool) {
        state.copyOrLink = bool;
    },
    incrementNumPropertyComponents(state, thingId) {
        if (!state.numPropertyComponentsVisible[thingId]) {
            state.numPropertyComponentsVisible[thingId] = 0;
        }
        state.numPropertyComponentsVisible[thingId]++;
    },
    decrementNumPropertyComponents(state, thingId) {
        state.numPropertyComponentsVisible[thingId]--;
        if (state.numPropertyComponentsVisible[thingId] === 0) {
            delete state.numPropertyComponentsVisible[thingId];
        }
    },
    searchType(state, type) {
        state.searchType = type;
    }
};
const getters = {

};

jsonld.documentLoader = function(url, callback) {
    if (url in state.rawSchemata) {
        return callback(
            null, {
                contextUrl: null, // this is for a context via a link header
                document: state.rawSchemata[url], // this is the actual document that was loaded
                documentUrl: url // this is the actual context URL after redirects
            });
    } else {
        var context;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                context = JSON.parse(this.responseText);
                state.rawSchemata[url] = context;
            }
        };
        xmlhttp.open("GET", url, false);
        xmlhttp.setRequestHeader("Accept", "application/json");
        xmlhttp.send();
        return callback(
            null, {
                contextUrl: null, // this is for a context via a link header
                document: context, // this is the actual document that was loaded
                documentUrl: url // this is the actual context URL after redirects
            });
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};