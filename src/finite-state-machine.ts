export interface Transition {
  action: string;
  from?: string;
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
    transition: 'transitioning',
  };
  private currentState: State | undefined;
  public initialTransition: Transition;

  constructor(
    private eventEmitter: EventEmitter,
    private states: State[],
    private initialState: State,
  ) {
      this.initialTransition = {
          action: 'initial',
          to: this.initialState.name,
      };
  }

  init(): FSM {
    this.setState(this.initialState, this.initialTransition);
    return this;
  }

  private setState(value: State | undefined, transition: Transition): void {
    if (this.currentState) {
      this.eventEmitter.emit(FSM.events.leave, this.currentState);
    }
    this.eventEmitter.emit(
        FSM.events.transition,
        {
            ...transition,
            from: this.currentState?.name,
        },
    );
    this.currentState = value;
    this.eventEmitter.emit(FSM.events.enter, this.currentState);
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
        this.setState(targetState, transition);
      }
    }
  }

  get state(): State | undefined {
    return this.currentState;
  }
}
