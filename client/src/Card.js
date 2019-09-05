import React from 'react';
import './Card.css';

function Card({ game, agent, guessIndex }) {

    const classes = ['Card'];
    const isKey = game.ai && game.ai.fieldOperative;
    if (agent.madeContact || isKey) {
        classes.push(agent.identity);
    }
    if (!agent.madeContact && isKey) {
        classes.push('Key');
    }
    if (agent.madeContact) {
        classes.push('Contacted');
    }

    return (
        <div className={classes.join(' ')} onClick={() => guessIndex(agent.index)}>
            <span>{agent.codename}</span>
        </div>
    );
}

export default Card;
