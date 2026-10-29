const bi = (es, en) => ({ es, en });
export const teaching = {
  conditional: {
    pattern: 'If + past simple → would/could + verb',
    hint: bi('Imagina algo distinto al presente. En la parte con if usa pasado; para el resultado usa would o could + verbo base.', 'Imagine something different from the present. Use past simple after if; use would or could + base verb for the result.'),
    example: 'If I had more time, I would practise every day.'
  },
  intensifiers: {
    pattern: 'so + adjective/adverb · such + noun phrase',
    hint: bi('Mira qué viene después: so va con un adjetivo/adverbio; such va con una frase que contiene sustantivo. Con many/much, usa so.', 'Look at what follows: so goes with an adjective/adverb; such goes with a noun phrase. With many/much use so.'),
    example: 'The game is so fun. It is such a fun game.'
  },
  passive: {
    pattern: 'am/is/are · was/were + past participle',
    hint: bi('Identifica quién recibe la acción. Elige be según el tiempo y si el sujeto es singular o plural. Luego usa el participio.', 'Identify what receives the action. Choose be for the tense and singular/plural subject. Then use the past participle.'),
    example: 'Students use this app. → This app is used by students.'
  },
  'past-perfect': {
    pattern: 'earlier: had + past participle → later: past simple',
    hint: bi('Busca dos momentos pasados. La acción que ya había ocurrido se expresa con had + participio; la acción posterior suele ir en pasado simple.', 'Find two past events. The action already completed uses had + past participle; the later action usually uses past simple.'),
    example: 'I had saved my work before the computer shut down.'
  },
  'used-to': {
    pattern: 'used to + verb · did/didn’t + use to + verb',
    hint: bi('¿Es una rutina antigua? Usa used to. Si ya aparece did o didn’t, escribe use to sin la d. El verbo siguiente va en forma base.', 'Is it an old routine? Use used to. If did or didn’t is already there, write use to without d. The following verb stays in its base form.'),
    example: 'I used to study alone. Did you use to study alone?'
  },
  phrasal: {
    pattern: 'verb + particle → a new meaning',
    hint: bi('Lee toda la situación. La partícula cambia el significado: look for = buscar; look after = cuidar. Aprende la expresión completa.', 'Read the whole situation. The particle changes the meaning: look for = search; look after = take care of. Learn the whole expression.'),
    example: 'Don’t give up! Let’s figure out the answer.'
  },
  reported: {
    pattern: 'said (that)… · told someone (that)…',
    hint: bi('Identifica quién habla. Al aplicar backshift, am/is → was, will → would y can → could. En told me la persona es necesaria; said that no la lleva.', 'Identify the speaker. When applying backshift, am/is → was, will → would and can → could. Told me needs the person object; said that does not.'),
    example: '“I can help.” → She said that she could help.'
  },
  tags: {
    pattern: 'positive statement → negative tag (and vice versa)',
    hint: bi('Busca el auxiliar y cambia la polaridad. Si no hay auxiliar visible, usa do/does en presente o did en pasado. Conserva el pronombre del sujeto.', 'Find the auxiliary and reverse the polarity. With no visible auxiliary use do/does in the present or did in the past. Keep the subject pronoun.'),
    example: 'You like games, don’t you? You aren’t tired, are you?'
  },
  agreement: {
    pattern: 'So / Neither + auxiliary + subject',
    hint: bi('Para coincidir con una afirmación usa So; con una negación usa Neither. Después repite el auxiliar del mismo tiempo verbal.', 'To agree with a positive statement use So; with a negative one use Neither. Then repeat the auxiliary in the same tense.'),
    example: '“I can swim.” “So can I.” · “I can’t.” “Neither can I.”'
  }
};

export const reviewPlans = {
  conditional: { focus: bi('Condición y resultado', 'Condition and result'), task: bi('Practica dos hipótesis: pasado simple después de if y would + verbo base en el resultado.', 'Practise two hypotheses: past simple after if and would + base verb in the result.') },
  intensifiers: { focus: bi('Adjetivo o sustantivo', 'Adjective or noun'), task: bi('Clasifica cinco frases: so + adjetivo/adverbio, such + frase con sustantivo. Revisa también so many y so much.', 'Classify five phrases: so + adjective/adverb, such + noun phrase. Also review so many and so much.') },
  passive: { focus: bi('Auxiliar y participio', 'Auxiliary and participle'), task: bi('Transforma dos frases activas a pasivas. Comprueba el tiempo de be, el singular/plural y el participio.', 'Turn two active sentences into passive ones. Check the tense of be, singular/plural and the past participle.') },
  'past-perfect': { focus: bi('Qué ocurrió primero', 'What happened first'), task: bi('Ordena dos eventos pasados y describe el anterior con had + participio. Repasa seen, gone y eaten.', 'Order two past events and describe the earlier one with had + past participle. Review seen, gone and eaten.') },
  'used-to': { focus: bi('Hábitos y preguntas en pasado', 'Past habits and questions'), task: bi('Escribe un hábito anterior en afirmativa, negativa y pregunta. Recuerda use to sin d después de did.', 'Write an old habit as a statement, negative and question. Remember use to without d after did.') },
  phrasal: { focus: bi('Significado en contexto', 'Meaning in context'), task: bi('Practica look for, look after, put off y give up en situaciones completas. Luego une cada expresión con su significado.', 'Practise look for, look after, put off and give up in full situations. Then match each expression to its meaning.') },
  reported: { focus: bi('Pronombres y cambios de tiempo', 'Pronouns and tense shifts'), task: bi('Reporta dos mensajes. Revisa quién habla, los cambios am → was, will → would y cuándo usar said o told.', 'Report two messages. Check who is speaking, the shifts am → was and will → would, and when to use said or told.') },
  tags: { focus: bi('Auxiliar y polaridad', 'Auxiliary and polarity'), task: bi('Añade coletillas a tres frases. Conserva el auxiliar y cambia de afirmativo a negativo o de negativo a afirmativo.', 'Add tags to three statements. Keep the auxiliary and change positive to negative or negative to positive.') },
  agreement: { focus: bi('Coincidir con So o Neither', 'Agreeing with So or Neither'), task: bi('Responde a una frase positiva y otra negativa. Elige So o Neither y conserva el auxiliar y el tiempo verbal.', 'Reply to a positive and a negative statement. Choose So or Neither and keep the auxiliary and tense.') }
};
