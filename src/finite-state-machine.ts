export interface Transition {
  action: string;
  to: string;
  condition?: () => boolean;
}

export interface State {
  name: string;
  transitions: Transition[];
}

export interface EventEmitter {
  emit: (name: string, payload: any) => void;
  on: (name: string, cb: (payload: any) => void) => void;
}

export class FSM {
  static readonly events = {
    enter: 'entering',
    leave: 'leaving',
  };
  private currentState: State | undefined;

  constructor(
    private eventEmitter: EventEmitter,
    private states: State[],
    private initialState: State,
  ) {}

  init(): FSM {
    this.setState(this.initialState);
    return this;
  }

  private setState(value: State | undefined): void {
    if (this.currentState) {
      this.eventEmitter.emit('leaving', this.currentState);
    }
    this.currentState = value;
    this.eventEmitter.emit('entering', this.currentState);
  }

  dispatch(action: string): void {
    if (!this.currentState) {
      return;
    }

    const transition = this.currentState.transitions.find(transition => {
      return (
        transition.action === action &&
        (!transition.condition || transition.condition())
      );
    });

    if (transition) {
      const targetState = this.states.find(
        state => state.name === transition.to,
      );

      if (targetState) {
        this.setState(targetState);
      }
    }
  }

  get state(): State | undefined {
    return this.currentState;
  }
}
