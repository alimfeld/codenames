export const AGENT = Object.freeze({
    RED: 'Red',
    BLUE: 'Blue',
    BYSTANDER: 'Bystander',
    ASSASSIN : 'Assassin'
});
export const OPPONENT = Object.freeze({
    [AGENT.RED]: AGENT.BLUE,
    [AGENT.BLUE]: AGENT.RED,
});
export const STATE = Object.freeze({
    READY: 'ready',
    SPYMASTER: 'spymaster',
    FIELD_OPERATIVE: 'field operative',
    OVER: 'over' 
});
export const AI = Object.freeze({
    SPYMASTER: 'spymaster',
    FIELD_OPERATIVE: 'field_operative',
    ALL: 'all' 
});
