/*global Marginalism, $*/

window.Marginalism = {};

Marginalism.Round = Backbone.Model.extend({
  defaults: {
    numberOfWorkers: 0,
    numberOfGlovesProduced: 0,
    marginalProduct: 0,
    valueOfAdditionalGlovesProduced: 0,
    marginalCostOfLabor: 0.12
  },
  
  initialize: function () {
    this.on('change:numberOfGlovesProduced', this.updateComputedProperties);
    if (this.has('previousRound')) {
      this.listenTo(this.get('previousRound'), 'change', this.updateComputedProperties);
    }
    this.updateComputedProperties();
  },
  
  setMarginalProduct: function () {
    if (this.has('previousRound')) {
      var previousRound = this.get('previousRound');
      var marginalProduct = this.get('numberOfGlovesProduced') - previousRound.get('numberOfGlovesProduced');
      this.set('marginalProduct', marginalProduct);
    } else {
      this.set('marginalProduct', this.get('numberOfGlovesProduced'));
    }
  },
  
  setValueOfAdditionalGloves: function () {
    if (this.has('previousRound')) {
      this.set('valueOfAdditionalGlovesProduced', this.get('marginalProduct') * .02);
    } else {
      this.set('valueOfAdditionalGlovesProduced', this.get('marginalProduct') * .02);
    }
  },
  
  updateComputedProperties: function () {
    this.setMarginalProduct();
    this.setValueOfAdditionalGloves();
  }
  
});

Marginalism.Rounds = Backbone.Collection.extend({
  model: Marginalism.Round
});

Marginalism.RoundView = Backbone.View.extend({
  
  tagName: 'tr',
  
  className: 'round-row',
  
  template: _.template($('#round-table-row-template').html()),
  
  events: {
    'change input.gloves-produced': 'handleChangeInNumberOfGlovesProduced',
    'click .increment-gloves-produced': 'incrementGlovesProduced',
    'click .decrement-gloves-produced': 'decrementGlovesProduced',
    'submit .increment-gloves-produced': 'incrementGlovesProduced',
    'submit .decrement-gloves-produced': 'decrementGlovesProduced'
  },
  
  initialize: function() {
    _.bindAll(this, "render");
    this.model.bind('change', this.render);
    this.render();
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    return this;
  },
  
  handleChangeInNumberOfGlovesProduced: function (e) {
    var numberOfGlovesProduced;
    var numberOfGlovesInputted = this.$('input.gloves-produced').val();
    
    if (numberOfGlovesInputted.match(/\d+/)) {
      numberOfGlovesProduced = parseInt(numberOfGlovesInputted, 10);
    } else {
      numberOfGlovesProduced = 0;
    }
    
    this.model.set('numberOfGlovesProduced', numberOfGlovesProduced);
    this.$('input.gloves-produced').focus();
  },
  
  incrementGlovesProduced: function () {
    var numberOfGlovesProduced = this.model.get('numberOfGlovesProduced') + 1;
    this.model.set('numberOfGlovesProduced', numberOfGlovesProduced);
    this.$('input.gloves-produced').val(numberOfGlovesProduced);
  },
  
  decrementGlovesProduced: function () {
    var numberOfGlovesProduced = this.model.get('numberOfGlovesProduced') - 1;
    this.model.set('numberOfGlovesProduced', numberOfGlovesProduced);
    this.$('input.gloves-produced').val(numberOfGlovesProduced);
  }

});

Marginalism.RoundsView = Backbone.View.extend({

  tagName: 'div',
  
  template: _.template($('#round-table-template').html()),
  
  events: {
    'click .add-round': 'addRound'
  },
  
  initialize: function () {
    var round = new Marginalism.Round({ numberOfWorkers: 1 });
    this.collection.add(round)
  },
  
  render: function(){
    var $rounds;

    this.$el.html(this.template(this.collection.attributes));
    $rounds = this.$('.rounds');
    
    this.collection.each(function(round){
      var roundView = new Marginalism.RoundView({ model: round });
      $rounds.append(roundView.el);
    }, this);
    return this;
  },
  
  addRound: function (e) {
    e.preventDefault();
    var round = new Marginalism.Round({
      numberOfWorkers: this.collection.length + 1,
      previousRound: this.collection.last()
    });
    this.collection.add(round);
    this.render();
  }
  
});


Marginalism.init = function () {
  var rounds = new Marginalism.Rounds([]);
  var roundsView = new Marginalism.RoundsView({ collection: rounds });
  $('#marginalism-calculator').append(roundsView.render().el);
}

$(document).ready(function () {
    'use strict';
    Marginalism.init();
});
