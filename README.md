# state-charts

Implementation of [finite-state automaton](https://en.wikipedia.org/wiki/Finite-state_machine) and [state diagram](https://en.wikipedia.org/wiki/State_diagram) in TypeScript.

## Finite State Machine
Models finite-state machine with conditional transitions.

### Configuration
The machine has 3 configuration parameters.

#### Event Emitter
Object implementing the interface:
```javascript
interface EventEmitter {
  emit: (name: string, payload: any) => void;
  on: (name: string, cb: (payload: any) => void) => void;
}
```
It is used to dispatch events on leaving and entering states.

#### States
Array of state objects.
```javascript
interface State {
  name: string;
  transitions: Transition[];
}
```

Transitions are defined as:
```javascript
interface Transition {
  action: string;               // Action name
  to: string;                   // Target state
  condition?: () => boolean;    // Condition which must be fulfilled to enable transition
}
```

#### Initial state
Initial state is not entered until `machine.init()` method is called.
Thanks to that it is possible to subscribe to `entering` event of the inital state

### Events
There are two types of events emitted through the event emitter:
* `FSM.events.enter` - emitted on entering a state
* `FSM.events.leave` - emitted on leaving a state

Each event is emitted with payload. The payload is the state for which the event happens.

### Example
Example of usage:

```javascript
// Optional, you can use your own event emitter object
import * as EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();
const initialState = {
  name: 'A',
  transitions: [
    {
      action: 'to A',
      to: 'A'
    },
    {
      action: 'to B',
      to: 'B'
    },
  ]
};
const machine = new FSM(
  eventEmitter,
  [
      initialState,
      {
          name: 'B',
          transitions: [
              {
                  action: 'to C',
                  to: 'C',
                  condition: () => false,
              }
          ],
      },
      {
          name: 'C',
          transitions: [],
      }
  ],
  initialState,
);

eventEmitter.on(FSM.events.enter, state => console.log(`Entering state "${state.name}".`));
eventEmitter.on(FSM.events.leave, state => console.log(`Leaving state "${state.name}".`));

machine.init();
// -> Entering state "A".

machine.dispatch('to B');
// -> Leaving state "A".
// -> Entering state "B".

machine.dispatch('to C');
// Nothing happens because condition is not met.
```

## State Charts
Finite-state machines are a great tool to describe automatons.
However, it's not an efficient tool to model nested states.
This is where state charts come in handy.

## Project setup
Run `yarn` to install project dependencies.

Run `yarn test` and `yarn test:coverage` to fire up unit tests.
100% coverage is required.
Tests are fired on pre-commit and pre-push hooks with Husky.
Open `state-charts/coverage/lcov-report/index.html` to see coverage report.
