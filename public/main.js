import { FSM, ReduxExtensionConnector } from '../lib/index';
import EventEmitter from 'eventemitter3';

const eventEmitter = new EventEmitter();

const states = [
    {
        name: 'initial',
        transitions: [
            {
                action: 'to A',
                to: 'A',
            },
        ]
    },
    {
        name: 'A',
        transitions: [],
    }
];

const machine = new FSM(
    eventEmitter, states, states[0],
);
new ReduxExtensionConnector(machine, 'myFms_');

machine.init();

machine.dispatch('to A');
