
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
var updated;

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

  _table: function(prefix, listas, votos){
    $('[data-render="'+ prefix +'Tabla"]').html('');

    var votosValidos = votos;
    var votosAfirmativos = votos;

    $(listas).each(function(key, lista){

      if( lista.nro_lista!='NUL' && lista.nro_lista!='REC' && lista.nro_lista!='IMP' && lista.nro_lista!='TEC' && lista.nro_lista!='BLC'){

        var row = snippets.jefe;
        
        row = row.replace(/\{lista\}/gi, lista.nro_lista)
          .replace(/\{partido\}/gi, lista.lista)
          .replace(/\{candidato\}/gi, lista.candidato)
          .replace(/\{vice\}/gi, lista.candidato_vice)
          .replace(/\{votos\}/gi, render.thousands(lista.votos));

        row = row.replace('{porcentaje}', render.decimal(lista.pct_afirmativo));

        $('[data-render="'+ prefix +'Tabla"]').append(row);

      }else{
        render._(prefix + lista.nro_lista, render.thousands(lista.votos));
        render._(prefix + lista.nro_lista +'%', render.decimal(lista.pct_total));

        votosAfirmativos = votosAfirmativos - lista.votos;

        if( lista.nro_lista!='BLC' ){
          votosValidos = votosValidos - lista.votos;
        }
      }

    });
    
    var afirmativosPorcentaje = (votos == 0) ? 0 : votosAfirmativos * 100 / votos;

    var validosPorcentaje = (votos == 0) ? 0 : votosValidos * 100 / votos;

    render._(prefix +'Afirmativos', render.thousands(votosAfirmativos));
    render._(prefix +'AfirmativosPorcentaje', render.decimal(afirmativosPorcentaje.toFixed(3)));
    render._(prefix +'Validos', render.thousands(votosValidos));
    render._(prefix +'ValidosPorcentaje', render.decimal(validosPorcentaje.toFixed(3)));
  },

  // Render data to tables and info
  data : function(){

    // Fecha de actualizaciÃ³n, si viene null le pongo un guioncito
    if (typeof data.loaded.resumen == 'undefined' || data.loaded.resumen.UltimaActualizacion == null) { 
      render._('fecha', '-');
      render._('hora', '-');
    } else {
      var update = new Date(Date.parse(data.loaded.resumen.UltimaActualizacion.replace(/\s+/g, 'T').concat('.000-03:00')));
      render._('fecha', render.hour(update.getDate()) +'-'+ render.hour(update.getMonth()+1) +'-'+ update.getFullYear());
      render._('hora', render.hour(update.getHours()) +':'+ render.hour(update.getMinutes()) +':'+ render.hour(update.getSeconds()));
    }
 
    // Stats
    render._('totalLectores', render.thousands(data.loaded.resumen.Electores));
    render._('totalMesas', render.thousands(data.loaded.resumen.Mesas));
    render._('mesasInformadas', render.thousands(data.loaded.resumen.MesasInformadas));

    var porcentajeMesas = (data.loaded.resumen.Mesas == 0 || data.loaded.resumen.Mesas == null) ? 0 : data.loaded.resumen.MesasInformadas * 100 / data.loaded.resumen.Mesas;
    render._('porcentajeMesas', render.decimal(porcentajeMesas.toFixed(3)) + '%');

    // Tabla de votos
    render._('jefeTotal', render.thousands(data.loaded.resumen.VotantesJef));

    // Porcentaje de votos
    var jefePorcentaje = (data.loaded.resumen.VotantesMesa == 0 || data.loaded.resumen.VotantesMesa == null) ? 0 : data.loaded.resumen.VotantesJef * 100 / data.loaded.resumen.VotantesMesa;
    var legisPorcentaje = (data.loaded.resumen.VotantesMesa == 0 || data.loaded.resumen.VotantesMesa == null) ? 0 : data.loaded.resumen.VotantesLeg * 100 / data.loaded.resumen.VotantesMesa;
    render._('jefePorcentajeAsistencia', render.decimal(jefePorcentaje.toFixed(3)) + '%');
    render._('legisPorcentajeAsistencia', render.decimal(legisPorcentaje.toFixed(3)) + '%');

    // Tablas
    render._table('jefe', data.loaded.jefes.listas, data.loaded.resumen.VotantesJef);

    if(selectedTable != 0){
      // Info de mesa
      render._('detallesMesa', data.loaded.resumen.Establecimiento+' - '+data.loaded.resumen.Domicilio);
      render._('comunaMesa', data.loaded.resumen.IDComuna);
    }

  },

  error : function(error){
    render._('error', error);
    $('[data-render="error"]').removeClass('hidden');
    $('.spinner').removeClass('glyphicon-refresh rotate').addClass('glyphicon-warning-sign');
  }
}

/* ==============================
/*  Selector de comuna
/* ============================== */

var selectedCommune = 0;

var selectCommune = function(comuna){
  $('body').addClass('loading');

  if(comuna != 0){

    $.when.apply($, [
      data.load('comuna', comuna)

    ]).then(function(){

      data.checkAbailable();
      selectedTable = 0;
      selectedCommune = comuna;
      render.data();

      $('body').removeClass('loading');
    });

  }else{

    $.when.apply($, [
      data.load('general', 0)

    ]).then(function(){

      data.checkAbailable();
      selectedTable = 0;
      selectedCommune = comuna;
      render.data();

      $('body').removeClass('loading');
    });

  }
}

/* ==============================
/*  Selector de mesa
/* ============================== */

var selectedTable = 0;

var selectTable = function(mesa){
  $('body').addClass('loading');

  $.when.apply($, [
    data.load('mesa', mesa)

  ]).then(function(){

    selectedCommune = 0;
    selectedTable = mesa;

    if(data.loaded != "Mesa no escrutada."){
      // Escondo el mensaje de mesa no escrutada
      data.checkAbailable();
      hideTableMessage();
      render.data();
    }else{
      // Muestro el mensaje de mesa no escrutada
      showTableMessage();
    }
    
    $('body').removeClass('loading');
  });
}

/* ==============================
/*  Carga de datos inicial
/* ============================== */

// Carga los datos principales
$.when.apply($, [
  data.load('general', 0)

]).then(function(){
  // Render de contenido
  render.data();

  $('body').removeClass('loading');
});
