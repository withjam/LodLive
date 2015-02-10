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
  nodeIcons: [
    { builtin: 'tools' },
    { builtin: 'docInfo' },
    { 
      icon: 'fa fa-thumb-tack', 
      title: 'Pin in SPARQL',
      handler: function(node, inst) {
        var icon = this, pinner = jQuery('.rsuite-pinner'), pos, to, uri = node.attr('rel');
        // make sure pinned exists on the instance
        if (!inst.rsuitePinned) {
          inst.rsuitePinned = [];
          inst.context.parent().on('scroll', function() { console.log('on scroll'); pinner.fadeOut('fast'); });
        }
        function doTypeAhead(inp,uri) {
          var val = inp.val();
          var resdiv = pinner.find('.rsuite-pinner-results').empty().addClass('loading');
          var sparql = 'SELECT ?subject ?title WHERE { ' +
                       '?subject <http://purl.org/dc/elements/1.1/type> <' + uri +'>; '+
                       '<http://purl.org/dc/elements/1.1/title> ?title FILTER(contains(?title,"' + val + '")) '+
                      '}';
          // console.log('sparql', sparql);
          //do the search
          $.ajax({
            url: inst.options.connection['http:'].endpoint + '?' + inst.options.endpoints.all + '&query=' +  encodeURIComponent(sparql),
            contentType: 'json',
            dataType: inst.getAjaxDataType(),
            success: function(resp) { 
              var b = resp.results.bindings;
              if (!b.length) {
                resdiv.html('<div class="noresults">no matches</div>');
                return;
              }
              for (var i=0; i < b.length; i++) {
                $('<div class="rsuite-pinner-result-item" data-pinned-value="'+ b[i].subject.value +'"> ' + b[i].title.value + '"</div>' )
                  .addClass(inst.rsuitePinned.indexOf(b[i].subject.value) > -1 ? 'rsuite-is-pinned' : '')
                  .appendTo(resdiv);
              }
            },
            error: function() { console.log('error', arguments); }
          });
        }
        if (!pinner.length) {
          pinner = $('<div class="rsuite-pinner"></div>').hide().appendTo(document.body);
          var pinpanel = $('<div class="rsuite-pinner-panel"></div>').appendTo(pinner);
          pinpanel.append('<div class="rsuite-pinner-search"><input type="text" class="rsuite-pinner-text"></div>');
          pinpanel.append('<div class="rsuite-pinner-results"><div class="noresults">type to search</div></div>');
          pinpanel.append('<div class="rsuite-pinner-footer"><button class="rsuite-pinner-btn">done</button></div>');
          pinpanel.find('.rsuite-pinner-text').on('keyup', function(evt) {
            //handle type ahead if not a modifier key
            if (evt.which && (evt.which >= 46 || evt.which === 8)) {
              var inp = $(this);
              clearTimeout(to);
              to = setTimeout(function() { doTypeAhead(inp,uri); },250); //timeout so val() gives the latest value
            }
          });
          pinner.on('click',function(evt) {
            var t = $(evt.target);
            console.log('target',t);
            if (t.is('.rsuite-pinner-btn')) {
              pinner.fadeOut('fast');
            } else {
              evt.preventDefault();
              evt.stopPropagation();
            }
            return false;
          });
          pinpanel.on('click', '.rsuite-pinner-result-item', function() {
            var item = $(this), uri = item.data('pinned-value'), ind = inst.rsuitePinned.indexOf(uri);
            // if it's in the array, remove it
            if (ind > -1) {
              inst.rsuitePinned.slice(ind,1);
            } else {
              inst.rsuitePinned.push(uri);
            }
            item.toggleClass('rsuite-is-pinned');
          });
        } else {
          pinner.find('.rsuite-pinner-results').empty();
        }
        if (pinner.attr('pinner-uri') !== uri) {
          pinner.attr('pinner-uri', uri);
          pinner.fadeIn('fast');
        } else {
          clearTimeout(to); // just for safe measure
          pinner.fadeToggle('fast');
        }
        pos = icon.offset();
        pinner.css({ left: pos.left + 30, top: pos.top });
        pinner.find('.rsuite-pinner-text').val('').focus();
      }
    }
  ],
  tools: [
    { builtin: 'close' },
    { builtin: 'rootNode'},
    { builtin: 'expand' }
  ],
  // docInfo: function() {},
  nodeHover: function() {},
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