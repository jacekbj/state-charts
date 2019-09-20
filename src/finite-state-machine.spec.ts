import { EventEmitter, FSM, State } from './finite-state-machine';

function getInitialState(): State {
  return {
    name: 'A',
    transitions: [
      {
        action: 'to A',
        to: 'A',
      },
      {
        action: 'to B',
        to: 'B',
      },
      {
        action: 'to B',
        to: 'C',
      },
      {
        action: 'to D',
        to: 'D',
      },
    ],
  };
}

describe('Finite State FSM', () => {
  let eventEmitter: EventEmitter;
  const states: State[] = [
    getInitialState(),
    {
      name: 'B',
      transitions: [
        {
          action: 'to C',
          to: 'C',
        },
      ],
    },
    {
      name: 'B',
      transitions: [],
    },
  ];

  beforeEach(() => {
    eventEmitter = {
      emit: jest.fn(),
      on: jest.fn(),
    };
  });

  describe('constructor', () => {
    it('should not dispatch event if not initialized', () => {
      new FSM(eventEmitter, states, getInitialState());

      expect((eventEmitter.emit as jest.Mock).mock.calls.length).toEqual(0);
    });

    it('should not set state if not initialized', () => {
      const machine = new FSM(eventEmitter, states, getInitialState());

      expect(machine.state).toBeUndefined();
    });

    it('should dispatch event when initialized', () => {
      const initialState = states.find(state => state.name === 'A');
      const machine = new FSM(eventEmitter, states, getInitialState());

      machine.init();

      const calls = (eventEmitter.emit as jest.Mock).mock.calls;
      expect(calls.length).toEqual(1);
      expect(calls[0][0]).toEqual(FSM.events.enter);
      expect(calls[0][1]).toEqual(initialState);
    });

    it('should set state when initialized', () => {
      const initialState = getInitialState();
      const machine = new FSM(eventEmitter, states, initialState);

      machine.init();

      expect(machine.state).toHaveProperty('name', initialState.name);
    });
  });

  describe('dispatch', () => {
    it('should do nothing if action does not exist', () => {
      const initialState = getInitialState();
      const machine = new FSM(eventEmitter, states, initialState);

      machine.init();
      machine.dispatch('not existing');

      expect(machine.state).toHaveProperty('name', initialState.name);
    });

    it('should do nothing if machine is not initiated', () => {
      const initialState = getInitialState();
      const machine = new FSM(eventEmitter, states, initialState);

      machine.dispatch('not existing');

      expect(machine.state).toBeUndefined();
    });

    it('should change state', () => {
      const initialState = getInitialState();
      const machine = new FSM(eventEmitter, states, initialState);

      machine.init();
      machine.dispatch('to B');

      const calls = (eventEmitter.emit as jest.Mock).mock.calls;

      expect(calls.length).toEqual(3);

      expect(calls[0][0]).toEqual(FSM.events.enter);
      expect(calls[0][1]).toEqual(initialState);

      expect(calls[1][0]).toEqual(FSM.events.leave);
      expect(calls[1][1]).toEqual(initialState);

      expect(calls[2][0]).toEqual(FSM.events.enter);
      expect(calls[2][1]).toEqual(states.find(state => state.name === 'B'));

      expect(machine.state).toHaveProperty('name', 'B');
    });

    it('should not change state if it is transition to the same state but emit', () => {
      const initialState = getInitialState();
      const machine = new FSM(eventEmitter, states, initialState);

      machine.init();
      machine.dispatch('to A');

      expect(machine.state).toHaveProperty('name', 'A');

      const calls = (eventEmitter.emit as jest.Mock).mock.calls;

      expect(calls.length).toEqual(3);

      expect(calls[0][0]).toEqual(FSM.events.enter);
      expect(calls[0][1]).toEqual(initialState);

      expect(calls[1][0]).toEqual(FSM.events.leave);
      expect(calls[1][1]).toEqual(initialState);

      expect(calls[2][0]).toEqual(FSM.events.enter);
      expect(calls[2][1]).toEqual(initialState);

      expect(machine.state).toHaveProperty('name', 'A');
    });

    it('should not change state if transition target does not exist', () => {
      const initialState = getInitialState();
      const machine = new FSM(eventEmitter, states, initialState);

      machine.init();
      machine.dispatch('to D');

      expect(machine.state).toHaveProperty('name', 'A');
    });

    describe('conditional', () => {
      it('should not change state if condition is not met', () => {
        const initialState: State = {
          name: 'A',
          transitions: [
            {
              action: 'to B',
              to: 'B',
              condition: jest.fn(() => false),
            },
          ],
        };
        const machine = new FSM(
          eventEmitter,
          [initialState, { name: 'B', transitions: [] }],
          initialState,
        );

        machine.init();
        machine.dispatch('to B');

        expect(machine.state).toHaveProperty('name', 'A');
      });

      it('should change state if condition is met', () => {
        const initialState: State = {
          name: 'A',
          transitions: [
            {
              action: 'to B',
              to: 'B',
              condition: jest.fn(() => true),
            },
          ],
        };
        const machine = new FSM(
          eventEmitter,
          [initialState, { name: 'B', transitions: [] }],
          initialState,
        );

        machine.init();
        machine.dispatch('to B');

        expect(machine.state).toHaveProperty('name', 'B');
      });

      it('should call transition condition without arguments', () => {
        const conditionStub = jest.fn(() => true);
        const initialState: State = {
          name: 'A',
          transitions: [
            {
              action: 'to B',
              to: 'B',
              condition: conditionStub,
            },
          ],
        };
        const machine = new FSM(
          eventEmitter,
          [initialState, { name: 'B', transitions: [] }],
          initialState,
        );

        machine.init();
        machine.dispatch('to B');

        const calls = conditionStub.mock.calls;

        expect(calls.length).toEqual(1);
        expect(calls[0].length).toEqual(0);
      });
    });
  });
});
