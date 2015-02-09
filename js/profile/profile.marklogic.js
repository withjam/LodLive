'use strict';
var MarkLogicProfile = {};

// LodLive will match connection by the base URL of the query used, so the key must match the URL 
MarkLogicProfile.connection = {
  // http matches all http requests, so this will be the only connection settings used
 'http:' : {
    sparql : {
      allClasses : 'SELECT DISTINCT ?object WHERE {[] a ?object}',
      findSubject : 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} }  LIMIT 1  ',
      documentUri : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object} ORDER BY ?property',
      document : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object}',
      bnode : 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
      inverse : 'SELECT DISTINCT * WHERE {?object ?property <{URI}>.} LIMIT 100',
      inverseSameAs : 'SELECT DISTINCT * WHERE {{?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}> } UNION { ?object <http://www.w3.org/2004/02/skos/core#exactMatch> <{URI}>}}'
    },
    endpoint : "http://localhost:8321/lodlive.xqy",
    description : {
      en : "MarkLogic LodLive"  
    }
  }
};

// here we define the known relationships so that labels will appear
MarkLogicProfile.arrows = {
  'http://www.w3.org/2002/07/owl#sameAs' : 'isSameAs',
  'http://purl.org/dc/terms/isPartOf' : 'isPartOf',
  'http://purl.org/dc/elements/1.1/type' : 'isType',
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' : 'isType'
};

// this is the default data configuration, this is important.  It informs LodLive how to construct queries and how to read the data that comes back
MarkLogicProfile.default = {
  sparql : {
    allClasses : 'SELECT DISTINCT ?object WHERE {[] a ?object}',
    findSubject : 'SELECT DISTINCT ?subject WHERE { {?subject a <{CLASS}>;<http://purl.org/dc/elements/1.1/title> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2000/01/rdf-schema#label> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} UNION {?subject a <{CLASS}>;<http://www.w3.org/2004/02/skos/core#prefLabel> ?object. FILTER(regex(str(?object),\'{VALUE}\',\'i\'))} }  LIMIT 1  ',
    documentUri : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object} ORDER BY ?property',
    document : 'SELECT DISTINCT * WHERE {<{URI}> ?property ?object}',
    bnode : 'SELECT DISTINCT *  WHERE {<{URI}> ?property ?object}',
    inverse : 'SELECT DISTINCT * WHERE {?object ?property <{URI}>.} LIMIT 100',
    inverseSameAs : 'SELECT DISTINCT * WHERE {{?object <http://www.w3.org/2002/07/owl#sameAs> <{URI}> } UNION { ?object <http://www.w3.org/2004/02/skos/core#exactMatch> <{URI}>}}'
  },
  endpoint : 'http://labs.regesta.com/resourceProxy/',
  document : {
    className : 'standard',
    titleProperties : 'http://www.w3.org/2004/02/skos/core#prefLabel'
  }, // http://www.w3.org/2000/01/rdf-schema#label
};

MarkLogicProfile.UI = {
  ignoreBnodes: true,
  tools: [
    { builtin: 'rootNode'},
    { 
      icon: 'fa fa-thumb-tack', 
      title: 'Pin in SPARQL',
      handler: function(node, inst) {
        var uri = node.attr('rel');
        if (node.is('.pinned')) {
          node.removeClass('pinned');
          var ind = inst.pinned.indexOf(uri);
          inst.pinned.slice(ind,1);
        } else {
          node.addClass('pinned');
          if (!inst.pinned) {
            inst.pinned = [ uri ];
          } else {
            inst.pinned.push(uri);
          }
        }
      }
    },
    { builtin: 'expand' }
  ],
  relationships: {
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': {
      color: '#000'
    },
    'http://www.w3.org/2004/02/skos/core#broader': {
      color: '#69C'
    },
    'http://www.w3.org/2004/02/skos/core#related': {
      color: '#FFF444'
    }
  }
};

MarkLogicProfile.endpoints = {
  all : 'output=json&format=json&timeout=0',
  jsonp: true
};