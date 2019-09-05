import React, { useState, useEffect } from 'react';
import Cockpit from './Cockpit';
import Card from './Card';
import shuffle from './shuffle';
import { AGENT, OPPONENT, AI, STATE } from './constants';
import './Game.css';

function Game() {

    const [game, setGame] = useState();
    const [texts, setTexts] = useState();

    const setup = () => {
        fetch('/api/codenames')
            .then(res => res.json())
            .then(codenames => {
                var identities = [];
                var i;
                for (i = 0; i < 9; i++) identities.push(AGENT.RED);
                for (i = 0; i < 8; i++) identities.push(AGENT.BLUE);
                for (i = 0; i < 7; i++) identities.push(AGENT.BYSTANDER);
                identities.push(AGENT.ASSASSIN);
                shuffle(identities);
                setGame({
                    agents: codenames.map((codename, i) => {
                        return {
                            index: i,
                            codename: codename,
                            identity: identities[i],
                            madeContact: false
                        }
                    }),
                    state: STATE.READY,
                    turns: [],
                    remainingAgents: {
                        [AGENT.RED]: 9,
                        [AGENT.BLUE]: 8
                    }
                });
            });
    };

    const start = (ai) => {
        if (game.state !== STATE.READY) return;

        const updatedGame = Object.assign({}, game);
        updatedGame.ai = {
            spymaster: ai === AI.SPYMASTER || ai === AI.ALL,
            fieldOperative: ai === AI.FIELD_OPERATIVE || ai === AI.ALL
        };
        updatedGame.state = STATE.SPYMASTER;
        updatedGame.turn = {
            team: AGENT.RED
        };
        setGame(updatedGame);
    }

    const pass = () => {
        if (game.state !== STATE.FIELD_OPERATIVE || game.ai.fieldOperative) return;

        const turn = game.turn;

        const updatedGame = Object.assign({}, game);
        updatedGame.turns.push(turn);
        updatedGame.state = STATE.SPYMASTER;
        updatedGame.turn = {
            team: OPPONENT[turn.team]
        };
        setGame(updatedGame);
    }

    const requestClue = (minRelated, maxRelated) => {
        if (game.state !== STATE.SPYMASTER || !game.ai.spymaster) return;

        const ourAgents = game.agents
            .filter(agent => !agent.madeContact && agent.identity === game.turn.team)
            .map(agent => agent.codename);
        const theirAgents = game.agents
            .filter(agent => !agent.madeContact && agent.identity === OPPONENT[game.turn.team])
            .map(agent => agent.codename);
        const bystanders = game.agents
            .filter(agent => !agent.madeContact && agent.identity === AGENT.BYSTANDER)
            .map(agent => agent.codename);
        const assassin = game.agents.find(agent => agent.identity === AGENT.ASSASSIN).codename;
        const previousClues = game.turns.filter(turn => turn.team === game.turn.team).map(turn => turn.clue.word);

        fetch('/api/clue', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ourAgents,
                theirAgents,
                bystanders,
                assassin,
                previousClues,
                minRelated,
                maxRelated
            })
        }).then(res => res.json())
        .then(clue => {
            const updatedGame = Object.assign({}, game);
            updatedGame.state = STATE.FIELD_OPERATIVE;
            updatedGame.turn.aiClue = clue;
            updatedGame.turn.clue = {
                word: clue.word,
                number: clue.agents.length
            }
            updatedGame.turn.guesses = [];
            setGame(updatedGame);
        });
    }

    const giveClue = (word, number) => {
        if (game.state !== STATE.SPYMASTER || game.ai.spymaster) return;

        const codenames = game.agents
            .filter(agent => !agent.madeContact)
            .map(agent => agent.codename);

        fetch('/api/guess', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                word,
                number,
                codenames 
            })
        }).then(res => res.json())
        .then(guesses => {
            const updatedGame = Object.assign({}, game);
            updatedGame.state = STATE.FIELD_OPERATIVE;
            updatedGame.turn.clue = {
                word,
                number
            }
            updatedGame.turn.guesses = [];
            updatedGame.turn.aiGuesses = guesses;
            setGame(updatedGame);
        });
    }

    const guessIndex = (i) => {
        if (game.state !== STATE.FIELD_OPERATIVE || game.ai.fieldOperative) return;

        makeContact(game.agents[i]);
    }

    const guessCodename = (codename) => {
        if (game.state !== STATE.FIELD_OPERATIVE || !game.ai.fieldOperative) return;

        makeContact(game.agents.find(a => a.codename === codename));
    }

    const makeContact = (agent) => {
        const turn = game.turn;

        // evaluate
        const foundOwnAgent = turn.team === agent.identity;
        const foundTheirAgent = OPPONENT[turn.team] === agent.identity;
        const remainingGuesses = (turn.clue.number - turn.guesses.length) - 1;
        const turnOver = !foundOwnAgent || remainingGuesses === 0;
        const foundAssassin = agent.identity === AGENT.ASSASSIN;
        const ownRemainingAgents = game.remainingAgents[turn.team] - (foundOwnAgent ? 1 : 0);
        const theirRemainingAgents = game.remainingAgents[OPPONENT[turn.team]] - (foundTheirAgent ? 1 : 0);
        const gameOver = foundAssassin || ownRemainingAgents === 0 || theirRemainingAgents === 0;

        // update
        const updatedGame = Object.assign({}, game);
        updatedGame.agents[agent.index].madeContact = true;
        updatedGame.remainingAgents[turn.team] = ownRemainingAgents;
        updatedGame.remainingAgents[OPPONENT[turn.team]] = theirRemainingAgents;
        updatedGame.turn.guesses.push({
            codename: agent.codename,
            identity: agent.identity
        });
        if (gameOver || turnOver) {
            updatedGame.turns.push(updatedGame.turn);
        }
        if (gameOver) {
            updatedGame.state = STATE.OVER;
            updatedGame.turn = undefined;
            updatedGame.winner = foundAssassin || theirRemainingAgents === 0 ? OPPONENT[turn.team] : turn.team;
        } else if (turnOver) {
            updatedGame.state = STATE.SPYMASTER;
            updatedGame.turn = {
                team: OPPONENT[turn.team]
            };
        }
        setGame(updatedGame);
    }

    useEffect(() => {
        setup();
        fetch('/api/texts')
            .then(res => res.json())
            .then(texts => {
                setTexts(texts);
            });
    }, []);

    if (!game || !texts) {
        return (<div></div>);
    }
    return (
        <div className="Game">
            <div className="Cockpit">
                <Cockpit {...{texts, game, setup, start, pass, requestClue, giveClue, guessCodename}}/>
            </div>
            <div className="Cards">
                {game.agents.map((agent, key) => <Card {...{key, game, agent, guessIndex}}/> )}
            </div>
        </div>
    );
}

export default Game;
