(function (eventemitter3) {
    'use strict';

    class FSM {
        constructor(eventEmitter, states, initialState) {
            this.eventEmitter = eventEmitter;
            this.states = states;
            this.initialState = initialState;
            this.initialTransition = {
                action: 'initial',
                to: this.initialState.name,
            };
        }
        init() {
            this.setState(this.initialState, this.initialTransition);
            return this;
        }
        setState(value, transition) {
            var _a;
            if (this.currentState) {
                this.eventEmitter.emit(FSM.events.leave, this.currentState);
            }
            this.eventEmitter.emit(FSM.events.transition, Object.assign(Object.assign({}, transition), { from: (_a = this.currentState) === null || _a === void 0 ? void 0 : _a.name }));
            this.currentState = value;
            this.eventEmitter.emit(FSM.events.enter, this.currentState);
        }
        dispatch(action) {
            if (!this.currentState) {
                return;
            }
            const transition = this.currentState.transitions.find(transition => {
                return (transition.action === action &&
                    (!transition.condition || transition.condition()));
            });
            if (transition) {
                const targetState = this.states.find(state => state.name === transition.to);
                if (targetState) {
                    this.setState(targetState, transition);
                }
            }
        }
        get state() {
            return this.currentState;
        }
    }
    FSM.events = {
        enter: 'entering',
        leave: 'leaving',
        transition: 'transitioning',
    };

    class ReduxExtensionConnector {
        constructor(fsm, prefix) {
            this.fsm = fsm;
            this.extension = window._devToolsExtension;
            fsm.eventEmitter.on(FSM.events.leave, (state) => {
                if (typeof this.extension !== 'undefined') {
                    this.extension.send(`${prefix}${FSM.events.leave}`, state.name);
                }
            });
            fsm.eventEmitter.on(FSM.events.enter, (state) => {
                if (typeof this.extension !== 'undefined') {
                    this.extension.send(`${prefix}${FSM.events.enter}`, state.name);
                }
            });
            fsm.eventEmitter.on(FSM.events.transition, (transition) => {
                if (typeof this.extension !== 'undefined') {
                    const from = transition.from ? `from ${transition.from} ` : '';
                    this.extension.send(`${prefix}${FSM.events.transition}`, `${from}to ${transition.to}`);
                }
            });
        }
    }

    const eventEmitter = new eventemitter3.EventEmitter();

    const states = [
        {
            name: 'initial',
            transitions: [
                {
                    action: 'to A',
                    to: 'A',
                },
            ]
        }
    ];

    const machine = new FSM(
        eventEmitter, states, states[0],
    );
    new ReduxExtensionConnector(machine);

    machine.init();

}(eventemitter3));
