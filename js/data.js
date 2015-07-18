
/* ==============================
/*  Snippets de html
/* ============================== */

var snippets = {
  jefe: '<tr><td data-title="Candidatos" class="candidatos"><img src="img/{lista}.jpg" alt="{candidato}" /><img src="img/{lista}b.jpg" alt="{vice}" /><div class="partido"><span class="text-muted">Lista {lista}</span>{partido}<strong></div>{candidato}</strong><br>{vice}</td><td data-title="Votos">{votos}</td><td data-title="%&nbsp; Afirmativos">{porcentaje}%</td></tr>'
}

/* ==============================
/*  Datos y loader
/* ============================== */

// Agrega soporte de CORS en IE
$.support.cors = true;

// Guarda todos los datos en una variable
var data = {};
var pumpTimer = [];
var maxTimer = 0;
var updated;
var animationTime = 15;

data.load = function(key, comuna){
  if(comuna == 0){
    var ajaxUrl = url[key];
  }else{
    var ajaxUrl = url[key] + comuna;
  }

  if(key == 'nueve'){
    var label = 'popu';
  }else{
    var label = 'loaded';
  }

  return $.ajax({
    url: ajaxUrl,
    dataType: 'json',
    success: function(response){
      data[label] = response.datos;
    },
    error: function(response){
      render.error('MomentÃ¡neamente los datos no estÃ¡n disponibles.');
    }
  });
}

data.checkAbailable =  function(){
  if( typeof data.loaded.resumen !== 'undefined' ){
    $('body').removeClass('loading');
    return;
  }
}

/* ==============================
/*  Render de cada tipo de datos
/* ============================== */

var render = {

  // common
  _: function(key, value){
    $('[data-render="'+ key +'"]').html(value);
  },

  thousands: function(x) {
    return (typeof x !== 'undefined') ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "&nbsp;") : x;
  },

  decimal: function(x) {
    return (typeof x !== 'undefined') ? parseFloat(x).toFixed(2).toString().replace(/\./g, ",") : x;
  },

  hour: function(n){
    return n > 9 ? "" + n: "0" + n;
  },

  _table: function(listas, escrutado){


    $(listas).each(function(key, lista){

      if( lista.nro_lista!='NUL' && lista.nro_lista!='REC' && lista.nro_lista!='IMP' && lista.nro_lista!='TEC' && lista.nro_lista!='BLC'){

        var pct = render.decimal(lista.pct_afirmativo).split(',');
        render._(lista.nro_lista+'Entero', pct[0]);
        render._(lista.nro_lista+'Decimal', pct[1]);

        var progress = lista.pct_afirmativo * escrutado / 10000;

        $('.c'+lista.nro_lista+' .globo').css({
          transform: 'scale('+( progress * 7 + 1)+')', 
          transition: 'transform '+( lista.pct_afirmativo * escrutado / 10000 * 15)+'s ease-out'
        });
        $('.c'+lista.nro_lista+' .varometro .aguja').css({
          transform: 'rotate('+( lista.pct_afirmativo / 100 * 360)+'deg)',
          transition: 'transform '+( progress * 15)+'s linear'
        });

        $('.c'+lista.nro_lista+' .torso').css({
          animation: 'inflar .5s infinite'
        });

        pumpTimer[lista.nro_lista] = setTimeout(function(){
          $('.c'+lista.nro_lista+' .torso').css({
            animation: 'none'
          });     
        }, (progress * animationTime * 1000) );

        maxTimer = (progress * animationTime * 1000 > maxTimer) ? progress * animationTime * 1000 : maxTimer;
      }

    });
  },

  // Render data to tables and info
  data : function(){

    // Fecha de actualizaciÃ³n, si viene null le pongo un guioncito
    // if (typeof data.loaded.resumen == 'undefined' || data.loaded.resumen.UltimaActualizacion == null) { 
    //   render._('fecha', '-');
    //   render._('hora', '-');
    // } else {
    //   var update = new Date(Date.parse(data.loaded.resumen.UltimaActualizacion.replace(/\s+/g, 'T').concat('.000-03:00')));
    //   render._('fecha', render.hour(update.getDate()) +'-'+ render.hour(update.getMonth()+1) +'-'+ update.getFullYear());
    //   render._('hora', render.hour(update.getHours()) +':'+ render.hour(update.getMinutes()) +':'+ render.hour(update.getSeconds()));
    // }

    
    // Porcentaje de votos
    var porcentajeMesas = (data.loaded.resumen.Mesas == 0 || data.loaded.resumen.Mesas == null) ? 0 : data.loaded.resumen.MesasInformadas * 100 / data.loaded.resumen.Mesas;

    // Tablas
    render._table(data.loaded.jefes.listas, porcentajeMesas);
    var 
    porcentajeSplit = render.decimal(porcentajeMesas).split(',');
    render._('escrutadoEntero', porcentajeSplit[0]);
    render._('escrutadoDecimal', porcentajeSplit[1]);

    pumpTimer[0] = setTimeout(function(){
      if(porcentajeMesas > 92){
        $('.torso .principal').css({
          display: 'none'
        });
        $('.torso .final').css({
          display: 'block'
        });
      }
    }, maxTimer)

  },

  error : function(error){
    render._('error', error);
    $('[data-render="error"]').removeClass('hidden');
    $('.spinner').removeClass('glyphicon-refresh rotate').addClass('glyphicon-warning-sign');
  }
}

/* ==============================
/*  Carga de datos inicial
/* ============================== */

var load = function(){
  // Carga los datos principales
  $.when.apply($, [
    data.load('general', 0)

  ]).then(function(){
    // Render de contenido
    render.data();
  });
}

load();
