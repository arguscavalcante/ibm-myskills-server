module.exports = function(Avaliacao) {
  Avaliacao.observe('before save', function(ctx, next) {
    if (ctx.isNewInstance) {
      var avaliacao = ctx.instance;
      var nota = 0;
      var totalQuestoes = 0;
      var Gabarito = Avaliacao.app.models.Gabarito;
      var Timer = Avaliacao.app.models.Timer;


      Timer.find({where: {email: avaliacao.email}}).then(function(timer) {
        if (timer) {
          timer.status = 1;
          Timer.upsert(timer);
        }
      }, function(error) {
        console.log('Erro recuperando o timer: %j', error);
        next(error, null);
      }).catch(function(error) {
        console.log('Catch: Erro recuperando o timer: %j', error);
      });

      Gabarito.find({
        where: {
          template: avaliacao.template,
        },
      }).then(function(gabarito) {
        console.log('Gabarito: %j', gabarito);
        if (gabarito) {
          gabarito = gabarito[0];
          for (var i = 0; i < avaliacao.questoes.length; i++) {
            if (avaliacao.questoes[i].resposta.id === gabarito.questoes[i].respostaCorreta) {
              nota++;
            }
            totalQuestoes++;
          }
          ctx.instance.nota = (nota / totalQuestoes) * 100;
        }
        next();
      }, function(error) {
        console.log('Erro recuperando o gabarito: %j', error);
        next(error, null);
      }).catch(function(error) {
        console.log('Catch: Erro recuperando o gabarito: %j', error);
        next(error, null);
      });
    }
  });
};
