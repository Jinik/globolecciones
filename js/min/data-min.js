$.support.cors=!0;var data={},pumpTimer=[],votos=[],maxTimer=0,updated,animationTime=15;data.load=function(e){var a=url[e];return $.ajax({url:a,dataType:"json",success:function(e){data.loaded=e.datos},error:function(e){render.error("Momentáneamente los datos no están disponibles. Volvé a intentarlo nuevamente.")}})};var render={_:function(e,a){$('[data-render="'+e+'"]').html(a)},thousands:function(e){return"undefined"!=typeof e?e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,"&nbsp;"):e},decimal:function(e){return"undefined"!=typeof e?parseFloat(e).toFixed(2).toString().replace(/\./g,","):e},hour:function(e){return e>9?""+e:"0"+e},_globos:function(e,a){$(e).each(function(e,n){if("NUL"!=n.nro_lista&&"REC"!=n.nro_lista&&"IMP"!=n.nro_lista&&"TEC"!=n.nro_lista&&"BLC"!=n.nro_lista){var r=render.decimal(n.pct_afirmativo).split(",");render._(n.nro_lista+"Entero",r[0]),render._(n.nro_lista+"Decimal",r[1]),votos[n.nro_lista]=n.pct_afirmativo;var t=n.pct_afirmativo*a/1e4;$(".c"+n.nro_lista+" .globo").css({transform:"scale("+(7*t+1)+")",transition:"transform "+n.pct_afirmativo*a/1e4*15+"s ease-out"}),$(".c"+n.nro_lista+" .varometro .aguja").css({transform:"rotate("+n.pct_afirmativo/100*360+"deg)",transition:"transform "+15*t+"s linear"}),$(".c"+n.nro_lista+" .torso").css({animation:"inflar .5s infinite"}),pumpTimer[n.nro_lista]=setTimeout(function(){$(".c"+n.nro_lista+" .torso").css({animation:"none"})},t*animationTime*1e3),maxTimer=t*animationTime*1e3>maxTimer?t*animationTime*1e3:maxTimer}})},data:function(){if("undefined"==typeof data.loaded.resumen||null==data.loaded.resumen.UltimaActualizacion)render._("fecha","-"),render._("hora","-");else{var e=new Date(Date.parse(data.loaded.resumen.UltimaActualizacion.replace(/\s+/g,"T").concat(".000-03:00")));render._("fecha",render.hour(e.getDate())+"-"+render.hour(e.getMonth()+1)+"-"+e.getFullYear()),render._("hora",render.hour(e.getHours())+":"+render.hour(e.getMinutes())+":"+render.hour(e.getSeconds()))}var a=0==data.loaded.resumen.Mesas||null==data.loaded.resumen.Mesas?0:100*data.loaded.resumen.MesasInformadas/data.loaded.resumen.Mesas;render._globos(data.loaded.jefes.listas,a);var n=render.decimal(a).split(",");render._("escrutadoEntero",n[0]),render._("escrutadoDecimal",n[1]),pumpTimer[0]=setTimeout(function(){a>94&&($(".torso .principal").css({display:"none"}),$(".torso .final").css({display:"block"}),votos[700]>votos[702]?($(".c700 .torso .i").css({animation:"festejarI .5s infinite"}),$(".c700 .torso .d").css({animation:"festejarD .5s infinite"}),$(".c702 .torso .i").css({animation:"lamentarI .5s infinite"}),$(".c702 .torso .d").css({animation:"lamentarD .5s infinite"})):($(".c702 .torso .i").css({animation:"festejarI .5s infinite"}),$(".c702 .torso .d").css({animation:"festejarD .5s infinite"}),$(".c700 .torso .i").css({animation:"lamentarI .5s infinite"}),$(".c700 .torso .d").css({animation:"lamentarD .5s infinite"})))},maxTimer)},error:function(e){render._("error",e),$('[data-render="error"]').removeClass("hidden"),$(".loader").addClass("hidden")}},load=function(){$.when.apply($,[data.load("general")]).then(function(){render.data(),$(".loader").addClass("hidden")})};load();