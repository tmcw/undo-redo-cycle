var xs = require('xstream').default;
var run = require('@cycle/xstream-run').run;
var dom = require('@cycle/dom');
var h1 = dom.h1, div = dom.div, input = dom.input, button = dom.button;

function intent(source) {
  return {
    addDots$: source.select('#dots').events('click')
      .map(ev => ({ type: 'dot', position: { x: ev.offsetX, y: ev.offsetY } })),
    undoClick$: source.select('.undo').events('click')
      .map(ev => ({ type: 'undo' })),
    redoClick$: source.select('.redo').events('click')
      .map(ev => ({ type: 'redo' }))
  };
}

function model(actions) {
   const dots$ = actions.addDots$.startWith([[]]);
   const undoClick$ = actions.undoClick$.startWith(0);
   const redoClick$ = actions.redoClick$.startWith(0);

   return xs.combine(dots$, undoClick$, redoClick$)
     .map(([dots, undo, redo]) => {
       return {
         dots: []
       };
     });
}

function main(sources) {
  var actions = intent(sources.DOM);
  var state$ = model(actions);

  const sinks = {
    DOM: 
      state$
      .map(state =>
        div([
          div({attrs: {id: 'dots'}}, 
            state.dots.map(dot => 
              div({attrs: {class: 'dot'}}))
          ),
          button('.undo', 'undo'),
          button('.redo', 'redo')
        ])
      )
  };
  return sinks;
}

const drivers = {
  DOM: dom.makeDOMDriver('#app')
};

run(main, drivers);
