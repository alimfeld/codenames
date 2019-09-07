from random import sample
from itertools import combinations
from concurrent.futures import ThreadPoolExecutor
import gensim

def load_model():
    return gensim.models.fasttext.load_facebook_vectors('i18n/cc.de.300.bin.gz')

executor = ThreadPoolExecutor(max_workers=1)
model = executor.submit(load_model)
all_codenames = [line.rstrip('\n') for line in open('i18n/cn.de.txt')]

def codenames():
    return sample(all_codenames, 25)

def clue(our_agents, their_agents=[], bystanders=[], assassin=None, previous_clues=[], min_related=2, max_related=3):
    negative = []
    if assassin is not None:
        negative.append(assassin)
    negative.extend(their_agents)
    negative.extend(bystanders)
    candidates = []
    for r in range (min(min_related, len(our_agents)), min(max_related, len(our_agents)) + 1):
        positive_combinations = list(combinations(our_agents, r))
        for positive in positive_combinations:
            results = model.result().most_similar(positive=positive, negative=negative, restrict_vocab=100000)
            for result in results:
                word = result[0]
                candidate = {}
                candidate['word'] = word
                candidate['similarity'] = result[1]
                candidate['agents'] = positive
                candidates.append(candidate)
    candidates.sort(key=lambda c: c['similarity'], reverse=True)
    filtered_candidates = list(filter(lambda c: c['word'] not in previous_clues, candidates))
    return (filtered_candidates if len(filtered_candidates) > 0 else candidates)[0]

def guess(codenames, word, number):
    guesses = []
    for codename in codenames:
        guess = {}
        guess['codename'] = codename
        guess['similarity'] = model.result().similarity(codename, word).item()
        guesses.append(guess)
    guesses.sort(key=lambda g: g['similarity'], reverse=True)
    return guesses[0: number]
