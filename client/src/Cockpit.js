import React, { useState } from 'react';
import Thinking from './Thinking';
import { AI, STATE }  from './constants';
import './Cockpit.css';

function Cockpit({ texts, game, setup, start, pass, requestClue, giveClue, guessCodename }) {

    const [thinking, setThinking] = useState(false);
    const [clue, setClue] = useState('');

    const requestClueThinking = (min, max) => {
        setThinking(true);
        requestClue(min, max);
    }

    const giveClueThinking = (clue, number) => {
        setThinking(true);
        setClue('');
        giveClue(clue, number);
    }

    const text = (key, arg) => {
        let result = texts[key];
        if (arg) {
            result = result.replace('{}', arg);
        }
        return result;
    }

    const turn = game.turn;
    var fragment;

    switch (game.state) {
        case STATE.READY:
            fragment = (
                <>
                    <span>{text('ai.choice')}</span>
                    <div>
                        <button onClick={() => start(AI.SPYMASTER)} autoFocus>{text('ai.choice.spymaster')}</button>
                        <button onClick={() => start(AI.FIELD_OPERATIVE)}>{text('ai.choice.fieldOperative')}</button>
                    </div>
                </>
            );
            break;
        case STATE.SPYMASTER:
            if (thinking) {
                fragment = (
                    <div className={"Turn " + turn.team}>
                        <Thinking/>
                    </div>
                );
            } else if (game.ai.spymaster) {
                fragment = (
                    <div className={"Turn " + turn.team}>
                        <span>{text('clue.choice')}</span>
                        <div>
                            <button onClick={() => requestClueThinking(2, 3)} autoFocus>
                                {text('clue.choice.conservative')}
                            </button>
                            <button onClick={() => requestClueThinking(3, 4)}>
                                {text('clue.choice.moderate')}
                            </button>
                            <button onClick={() => requestClueThinking(4, 5)}>
                                {text('clue.choice.aggressive')}
                            </button>
                        </div>
                    </div>
                );
            } else {
                    fragment = (
                        <div className={"Turn " + turn.team}>
                            <span>{text('clue.prompt')}</span>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                giveClueThinking(clue.slice(0, -2), parseInt(clue.slice(-1)))
                            }}>
                                <input type="text" pattern=".+ \d" placeholder={text('clue.hint')}
                                    value={clue} onChange={e => setClue(e.target.value)} autoFocus/>
                            </form>
                        </div>
                    );
            }
            break;
        case STATE.FIELD_OPERATIVE:
            if (thinking) {
                setThinking(false);
            }
            if (game.ai.fieldOperative) {
                fragment = (
                    <div className={"Turn " + turn.team}>
                        <div className={"Clue " + turn.team}>{turn.clue.word} {turn.aiGuesses.length}</div>
                        <button onClick={() => guessCodename(turn.aiGuesses[turn.guesses.length].codename)} autoFocus>
                            {text('guess.action.reveal')}
                        </button>
                    </div>
                );
            } else {
                fragment = (
                    <div className={"Turn " + turn.team}>
                        <div className={"Clue " + turn.team}>{turn.clue.word} {turn.clue.number}</div>
                        <button onClick={pass} disabled={turn.guesses.length === 0} autoFocus>
                            {text('turn.action.pass')}
                        </button>
                    </div>
                );
            }
            break;
        case STATE.OVER:
            fragment = (
                <div className={"Turn " + game.winner}>
                    <div>{text('game.message.winner', `'${game.winner}'`)}</div>
                    <button onClick={setup} autoFocus>{text('game.action.new')}</button>
                </div>
            );
            break;
        default:
            break;
    }

    return (
        <div className="Container">
            <div className="Remaining Red">{game.remainingAgents['Red']}</div>
            <div className="Control">{fragment}</div>
            <div className="Remaining Blue">{game.remainingAgents['Blue']}</div>
        </div>
    );
}

export default Cockpit;
