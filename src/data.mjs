// Advanced English Level II Practice Curriculum
// Comprehensive communicative activities, grammar challenges, and listening labs
import { extraExercises } from './exercises.mjs';
import { guideExercises } from './guide-unit1.mjs';

const bi = (es, en) => ({ es, en });

const choice = (prompt, answer, options, es, en, accept = []) => ({
  type: 'choice',
  prompt,
  answer,
  options,
  accept,
  explanation: bi(es, en)
});

const fill = (prompt, answer, es, en, accept = []) => ({
  type: 'fill',
  prompt,
  answer,
  accept,
  explanation: bi(es, en)
});

const order = (answer, translation, es, en) => ({
  type: 'order',
  prompt: translation,
  answer,
  words: answer.split(' '),
  explanation: bi(es, en)
});

const errorHunt = (sentence, prompt, answer, options, es, en, accept = []) => ({
  type: 'error_hunt',
  sentence,
  prompt: bi(prompt.es, prompt.en),
  answer,
  options,
  accept,
  explanation: bi(es, en)
});

const match = (prompt, pairs, es, en) => ({
  type: 'match',
  prompt: bi(prompt.es, prompt.en),
  answer: JSON.stringify(pairs),
  pairs,
  explanation: bi(es, en)
});

const transform = (sourceSentence, prompt, answer, options, es, en, accept = []) => ({
  type: 'transform',
  sourceSentence,
  prompt: bi(prompt.es, prompt.en),
  answer,
  options,
  accept,
  explanation: bi(es, en)
});

const reading = (storyTitle, story, prompt, answer, options, es, en, accept = []) => ({
  type: 'reading',
  storyTitle,
  story,
  prompt: bi(prompt.es, prompt.en),
  answer,
  options,
  accept,
  explanation: bi(es, en)
});

const listen = (audio, prompt, answer, options, es, en, accept = []) => ({
  type: 'listen',
  audio,
  prompt: bi(prompt.es, prompt.en),
  answer,
  options,
  accept,
  explanation: bi(es, en)
});

export const curriculum = [
  {
    id: 1,
    title: bi('Imagina las posibilidades', 'Imagine the possibilities'),
    subtitle: bi('Hipótesis, énfasis y acciones', 'Hypotheses, emphasis & actions'),
    topics: [
      {
        id: 'conditional',
        name: 'Second conditional',
        translation: 'Segundo condicional',
        icon: 'Sparkles',
        level: 'C1',
        description: bi('¿Qué harías si…? Explora situaciones hipotéticas en presente o futuro.', 'What would you do if…? Explore hypothetical situations in present or future.'),
        rule: bi('Estructura: If + Past Simple, would/could + base verb. Se usa para situaciones imaginarias o irreales en el presente o futuro.', 'Structure: If + Past Simple, would/could + base verb. Used for imaginary or unreal situations in the present or future.'),
        example: 'If I won the lottery, I would buy a big house.',
        questions: [
          choice('If I ___ harder, I would get to Oxford University.', 'studied', ['studied', 'study', 'will study'], 'Después de "if" en segundo condicional usamos el pasado simple: studied.', 'In the second conditional "if" clause, we use the past simple: studied.'),
          choice('If she ___ a bike, she would go on a trip with us.', 'had', ['had', 'has', 'would have'], 'La condición hipotética requiere pasado simple: had.', 'The hypothetical condition requires past simple: had.'),
          choice('We would make a pizza if we ___ all the ingredients.', 'bought', ['bought', 'buy', 'will buy'], 'La cláusula con "if" lleva pasado simple: bought.', 'The "if" clause takes the past simple: bought.'),
          fill('If my dad could speak English, he ___ go to England.', 'would', 'La cláusula principal del segundo condicional usa would + verbo en forma base.', 'The main clause in the second conditional takes would + base verb.', ['would']),
          fill('If I checked the time, I ___ not be late for work.', 'would', 'El espacio va antes de not: escribe would para formar would not. Wouldn’t not duplicaría la negación.', 'The gap comes before not: use would to form would not. Wouldn’t not would duplicate the negative.'),
          errorHunt(
            'If I will be taller, I would play basketball.',
            bi('Encuentra el error gramatical y elige la forma correcta:', 'Spot the grammatical error and choose the correct form:'),
            'were',
            ['were', 'will be', 'am', 'had been'],
            'En la cláusula "if" nunca usamos will/would; usamos pasado simple (were/was).',
            'We never use will/would in the "if" clause; use past simple (were/was).'
          ),
          errorHunt(
            'If she knows the answer, she would tell you.',
            bi('Encuentra el error gramatical y elige la forma correcta:', 'Spot the grammatical error and choose the correct form:'),
            'knew',
            ['knew', 'knows', 'would know', 'had known'],
            'Para que coincida con "would tell", la condición debe estar en pasado simple: knew.',
            'To match "would tell", the condition must be in the past simple: knew.'
          ),
          match(
            bi('Une las mitades condicionales correspondientes:', 'Match the conditional sentence halves:'),
            {
              'If I had a car,': 'I would drive to the beach.',
              'If she studied more,': 'she would pass the exam.',
              'If we were famous,': 'we would be on TV.',
              'If I were a doctor,': 'I would help more people.',
              'If it rained today,': "we wouldn't go out."
            },
            'Cada condición (If + past simple) se conecta con su consecuencia hipotética (would + base verb).',
            'Each condition (If + past simple) connects to its hypothetical consequence (would + base verb).'
          ),
          reading(
            'What would I do if I lived in Berlin?',
            'Sometimes I wonder what my life would be like if I lived in another city. I enjoy my routine, but a change could be exciting. If I moved to Berlin, I might explore new cultures and meet people from all over the world. I’d probably learn German and try different foods. I wouldn’t take the same bus every day or eat at the same café. My weekends might be full of museums, concerts, and street festivals.\n\nOf course, things wouldn’t be perfect. I’d miss my family and friends, and I might feel lonely at first. Finding a job could be difficult, and I’d need to adapt to a new lifestyle. But I think I’d grow as a person. I’d become more independent and confident.\n\nIt’s not something I’m planning now but imagining it helps me think about what I really want in life.',
            bi('Según la lectura, ¿cuál es uno de los desafíos que el autor menciona sobre mudarse a Berlín?', 'According to the text, what is one challenge the writer mentions about moving to Berlin?'),
            'Finding a job',
            ['Finding a job', 'Learning to drive', 'Studying for exams'],
            'El texto menciona explícitamente: "Finding a job could be difficult, and I’d need to adapt to a new lifestyle."',
            'The text explicitly states: "Finding a job could be difficult, and I’d need to adapt to a new lifestyle."'
          ),
          listen(
            'I really like my daily job, but I would love to change the schedule. If I had more free time, I would study computers because the career prospects are great.',
            bi('Escucha el audio con atención y responde: ¿Qué le encantaría cambiar a la mujer de su empleo?', 'Listen carefully to the audio and answer: What would the woman love to change about her job?'),
            'The schedule',
            ['The schedule', 'The pay', 'Her supervisor'],
            'La hablante dice: "I would love to change the schedule".',
            'The speaker says: "I would love to change the schedule".'
          )
        ]
      },
      {
        id: 'intensifiers',
        name: 'So & such',
        translation: 'Intensificadores',
        icon: 'Zap',
        level: 'C1',
        description: bi('Dale más fuerza a lo que dices. So + adjetivo; Such + sustantivo.', 'Add emphasis to what you say. So + adjective; Such + noun phrase.'),
        rule: bi('Usa "so" antes de adjetivos o adverbios (so fast, so tired). Usa "such" antes de frases sustantivas (such a good teacher, such lovely shoes). Con many/much usamos "so".', 'Use "so" before adjectives or adverbs (so fast, so tired). Use "such" before noun phrases (such a good teacher, such lovely shoes). Use "so" with many/much.'),
        example: "The movie was so interesting that I watched it twice. It was such a beautiful day!",
        questions: [
          choice('The movie was ___ interesting that I watched it twice.', 'so', ['so', 'such', 'such an'], '"Interesting" es un adjetivo directo, por lo que usamos "so".', '"Interesting" is an adjective, so we use "so".'),
          choice('It was ___ a beautiful day that we went to the beach.', 'such', ['such', 'so', 'so much'], '"A beautiful day" es un sustantivo precedido por adjetivo y artículo: usamos "such".', '"A beautiful day" is a noun phrase with an article: use "such".'),
          choice("He's ___ a talented musician that he won a scholarship.", 'such', ['such', 'so', 'very'], 'Va seguido de "a talented musician" (frase nominal): usamos "such".', 'Followed by "a talented musician" (noun phrase): use "such".'),
          fill('She speaks English ___ fluently that everyone understands her.', 'so', '"Fluently" es un adverbio, por lo tanto usamos "so".', '"Fluently" is an adverb, so we use "so".', ['so']),
          fill('They were ___ tired that they fell asleep immediately.', 'so', '"Tired" es un adjetivo: usamos "so".', '"Tired" is an adjective: use "so".', ['so']),
          errorHunt(
            'It was so a nice evening.',
            bi('Corrige el error gramatical en la oración:', 'Correct the grammatical error in the sentence:'),
            'such',
            ['such', 'so', 'too', 'much'],
            'Con frases nominales con artículo (a nice evening) debemos usar "such": "It was such a nice evening."',
            'With singular countable noun phrases (a nice evening), use "such": "It was such a nice evening."'
          ),
          errorHunt(
            'He drives such fast on the highway.',
            bi('Corrige el intensificador incorrecto:', 'Correct the misplaced intensifier:'),
            'so',
            ['so', 'such', 'such a', 'very much'],
            '"Fast" aquí funciona como adverbio, por lo que requiere "so fast", no "such fast".',
            '"Fast" functions as an adverb here, requiring "so fast", not "such fast".'
          ),
          order(
            'He is such a good teacher',
            bi('Reescribe "He is a very good teacher" usando such:', 'Rewrite "He is a very good teacher" using such:'),
            'Such + a + adjetivo + sustantivo singular.',
            'Such + a + adjective + singular noun.'
          ),
          order(
            'The weather was so hot',
            bi('Reescribe "The weather was very hot" usando so:', 'Rewrite "The weather was very hot" using so:'),
            'So + adjetivo directo.',
            'So + direct adjective.'
          ),
          listen(
            'We had such a wonderful morning at the beach. The weather was calm, the sand was so soft, and we are such good sisters!',
            bi('Escucha atentamente el audio y responde: ¿Cómo describe la hablante a la arena de la playa?', 'Listen closely to the audio and answer: How does the speaker describe the beach sand?'),
            'It was so soft',
            ['It was so soft', 'It was such wet', 'It was too cold to walk on'],
            'En el audio dice: "the sand was so soft".',
            'In the audio she says: "the sand was so soft".'
          )
        ]
      },
      {
        id: 'passive',
        name: 'Passive voice',
        translation: 'Voz pasiva',
        icon: 'Repeat2',
        level: 'C1',
        description: bi('Pon el foco en la acción y en el objeto que la recibe.', 'Focus on the action and the receiver of the action.'),
        rule: bi('Estructura: Objeto + verbo to be + participio pasado (+ by agente). Presente: is/are + participio. Pasado: was/were + participio.', 'Structure: Object + verb to be + past participle (+ by agent). Present: is/are + past participle. Past: was/were + past participle.'),
        example: 'The documents are printed every morning. The cake was baked by my aunt.',
        questions: [
          choice('The documents ___ printed every morning.', 'are', ['are', 'is', 'was'], '"Documents" es plural y "every morning" indica presente simple pasivo: are printed.', '"Documents" is plural and "every morning" indicates present simple passive: are printed.'),
          choice('The cake ___ baked yesterday by my aunt.', 'was', ['was', 'is', 'were'], '"Cake" es singular y "yesterday" indica pasado simple: was baked.', '"Cake" is singular and "yesterday" marks past simple: was baked.'),
          choice('The windows ___ cleaned every Friday.', 'are cleaned', ['are cleaned', 'were cleaning', 'is cleaned'], 'Acción habitual en presente simple pasivo para plural: are cleaned.', 'Habitual present simple passive action for a plural noun: are cleaned.'),
          fill('The emails were ___ last week by the secretary. (send)', 'sent', 'El participio pasado irregular de "send" es "sent".', 'The irregular past participle of "send" is "sent".', ['sent']),
          fill('The homework was ___ this morning by the teacher. (correct)', 'corrected', 'Participio regular de "correct": corrected.', 'Regular past participle of "correct": corrected.', ['corrected']),
          transform(
            'The room is cleaned by the janitor.',
            bi('Transforma la oración de voz pasiva a voz activa:', 'Transform the sentence from passive to active voice:'),
            'The janitor cleans the room.',
            ['The janitor cleans the room.', 'The janitor cleaned the room.', 'The janitor is cleaning the room.'],
            '"Is cleaned" está en presente simple; el sujeto activo es "the janitor" (3ra persona singular: cleans).',
            '"Is cleaned" is present simple; the active subject "the janitor" takes "cleans".'
          ),
          transform(
            'The car was washed by Tom.',
            bi('Transforma la oración de voz pasiva a voz activa:', 'Transform the sentence from passive to active voice:'),
            'Tom washed the car.',
            ['Tom washed the car.', 'Tom washes the car.', 'Tom has washed the car.'],
            '"Was washed" está en pasado simple; en voz activa Tom realizó la acción en pasado: washed.',
            '"Was washed" is past simple; in active voice Tom performed the action in the past: washed.'
          ),
          order(
            'The tickets were bought by my parents',
            bi('Construye la oración en voz pasiva en pasado:', 'Build the past passive sentence:'),
            'Tickets (plural) + were + participio bought + by + agente.',
            'Tickets (plural) + were + past participle bought + by + agent.'
          ),
          reading(
            "Sofia's Weekend in the City",
            'Last weekend, Sofia walked through the historic city center. She visited an art café where paintings were displayed by university students. Later, in the central plaza, a live music performance was enjoyed by crowds of people. At the public library, a rare book recommended by her professor was found on the second floor. Finally, fresh bread was bought at the local bakery because the aroma was irresistible.',
            bi('Según la lectura, ¿quién creó las pinturas que estaban expuestas en el café?', 'According to the reading, who created the paintings displayed in the café?'),
            'University students',
            ['University students', 'Professional artists', 'Local children'],
            'El texto dice: "paintings were displayed by university students".',
            'The text states: "paintings were displayed by university students".'
          ),
          listen(
            'Good evening guests. Please note that hot dinner is served until 11 PM. The stadium football match was not cancelled, but one chair in the main lobby is broken.',
            bi('Escucha el aviso del hotel y responde: ¿Hasta qué hora se sirve la cena?', 'Listen to the hotel notice and answer: Until what time is dinner served?'),
            '11 PM',
            ['11 PM', '12 AM', '10 PM'],
            'El audio indica claramente: "dinner is served until 11 PM".',
            'The audio clearly says: "dinner is served until 11 PM".',
            ['11', '11 pm', '11:00', '11:00 pm']
          )
        ]
      }
    ]
  },
  {
    id: 2,
    title: bi('Un viaje al pasado', 'A trip to the past'),
    subtitle: bi('Historias, recuerdos y hábitos', 'Stories, memories & habits'),
    topics: [
      {
        id: 'past-perfect',
        name: 'Past perfect',
        translation: 'Secuencias del pasado',
        icon: 'History',
        level: 'C1',
        description: bi('Descubre qué acción ocurrió antes en el pasado. Had + participio.', 'Discover which action happened first in the past. Had + past participle.'),
        rule: bi('Had + participio pasado. Se utiliza para hablar de una acción que ocurrió antes de otro momento o evento en el pasado (que suele ir en pasado simple).', 'Had + past participle. Used to talk about an action that happened before another moment or event in the past (often in simple past).'),
        example: 'By the time the teacher arrived, the students had finished their homework.',
        questions: [
          choice('When I got to the station, the train ___ .', 'had left', ['had left', 'left', 'has left'], 'El tren partió antes de que yo llegara a la estación: past perfect (had left).', 'The train departed before I arrived at the station: past perfect (had left).'),
          choice('She ___ all night before taking the morning exam.', 'had studied', ['had studied', 'studied', 'studies'], 'El estudio ocurrió antes del examen: past perfect (had studied).', 'The studying occurred prior to the exam: past perfect (had studied).'),
          choice('We ___ our professor at the library yesterday afternoon.', 'met', ['met', 'had met', 'have met'], 'Evento simple completado en el pasado con marcador "yesterday": met (past simple).', 'A single completed past event marked with "yesterday": met (past simple).'),
          fill('She had ___ the book before watching the film. (read)', 'read', 'El participio de "read" se escribe igual pero se pronuncia /red/: read.', 'The past participle of "read" is spelled the same: read.', ['read']),
          fill('You got wet because you had not ___ your umbrella. (take)', 'taken', 'El participio pasado de "take" es "taken": had not taken.', 'The past participle of "take" is "taken": had not taken.', ['taken']),
          choice('Past Perfect Question: "What ___ you ___ before you arrived at the party?"', 'had / done', ['had / done', 'did / do', 'have / done'], 'Pregunta en pasado perfecto: What + had + sujeto + participio (done).', 'Past perfect question: What + had + subject + past participle (done).'),
          choice('Past Perfect Question: "___ she ___ her homework before dinner?"', 'Had / finished', ['Had / finished', 'Did / finish', 'Has / finished'], 'Inversión en pasado perfecto: Had + she + finished.', 'Inversion in past perfect: Had + she + finished.'),
          order(
            'They had already packed their bags before the taxi arrived',
            bi('Ordena los eventos cronológicamente:', 'Order the past events chronologically:'),
            'La acción anterior va en past perfect (had already packed) antes del taxi (arrived).',
            'The earlier action takes past perfect (had already packed) before the taxi (arrived).'
          ),
          reading(
            "Carla's University Networking Event",
            'Last Friday, Carla had planned to attend a networking event at the university. She was excited because she had never been to one before, and she knew it could help her meet professionals in her field. By the time she arrived, the event had already started. She looked around but didn’t see anyone she recognized.\n\nEarlier that day, Carla had printed her CV and had prepared a short introduction about herself. She had even practiced it in front of the mirror. However, she forgot to bring the printed CV with her. She realized this only after she had entered the room.\n\nShe spoke to a few people, but she felt nervous. One of the speakers had already finished their presentation, and Carla had missed it. It was someone she had wanted to meet for months. Later, she found out that her friend Lucas had met the speaker and had even exchanged contact information. Carla felt disappointed, but she knew she had learned something important: preparation is key, but remembering the details matters just as much.',
            bi('Según la lectura, ¿qué detalle importante había olvidado Carla en su casa?', 'According to the story, what important item had Carla forgotten at home?'),
            'Her printed CV',
            ['Her printed CV', 'Her university badge', 'Her presentation slides'],
            'El texto relata: "However, she forgot to bring the printed CV with her. She realized this only after she had entered the room."',
            'The text explains: "However, she forgot to bring the printed CV with her. She realized this only after she had entered the room."'
          ),
          listen(
            'Yesterday morning Sarah woke up late because her alarm clock had not gone off. When she ran downstairs, her brother had already left for school, and by the time she reached the stop, the bus had already gone!',
            bi('Escucha la historia de Sarah y responde: ¿Por qué se despertó tarde?', 'Listen to Sarah’s morning and answer: Why did Sarah wake up late?'),
            "Her alarm hadn't gone off",
            ["Her alarm hadn't gone off", 'She went to bed too late', 'Her brother woke her up late'],
            'En el audio se escucha: "Sarah woke up late because her alarm clock had not gone off".',
            'In the audio she says: "Sarah woke up late because her alarm clock had not gone off".',
            ["her alarm had not gone off", "her alarm hadn't gone off"]
          )
        ]
      },
      {
        id: 'used-to',
        name: 'Used to',
        translation: 'Hábitos y rutinas antiguas',
        icon: 'Clock3',
        level: 'C1',
        description: bi('Habla de cosas que hacías antes y que ya no haces hoy.', 'Talk about things you did regularly in the past, but do not do now.'),
        rule: bi('Estructura: Used to + verbo en infinitivo base. En negativas e interrogativas con did, usamos "use to" sin "d" (didn’t use to, Did you use to...?).', 'Structure: Used to + base infinitive. In negatives and questions with did, use "use to" without "d" (didn’t use to, Did you use to...?).'),
        example: 'I used to walk to school, but now I drive to work.',
        questions: [
          choice('I ___ play video games every weekend when I was younger.', 'used to', ['used to', 'use to', 'am used to'], 'En oraciones afirmativas en pasado se escribe "used to" con d.', 'In positive past habit statements, write "used to" with d.'),
          choice('She ___ like black coffee, but now she drinks it every morning.', "didn't use to", ["didn't use to", "didn't used to", 'not used to'], 'Con el auxiliar negativo "didn’t", el verbo vuelve a su forma base: didn’t use to.', 'With the negative auxiliary "didn’t", the verb returns to base form: didn’t use to.'),
          choice('___ you use to go to school by bus or by bike?', 'Did', ['Did', 'Do', 'Were'], 'Las preguntas sobre hábitos pasados con use to comienzan con el auxiliar "Did".', 'Questions about past habits with use to start with the auxiliary "Did".'),
          fill('Did your parents ___ to travel a lot when they were younger?', 'use', 'Después de "Did" se escribe "use" sin la letra "d".', 'After "Did", write "use" without the letter "d".', ['use']),
          fill("My brother didn't ___ to eat fresh vegetables, but now he loves them.", 'use', 'Con "didn’t" ya está marcado el pasado, usamos "use to".', 'With "didn’t" the past is already marked, so use "use to".', ['use']),
          errorHunt(
            'I use to play piano when I was a child.',
            bi('Encuentra el error en la afirmación de hábito pasado:', 'Find the mistake in this past habit statement:'),
            'used to',
            ['used to', 'use to', 'was used to', 'am using to'],
            'En afirmativo siempre lleva "d": "I used to play piano".',
            'In the affirmative, it always requires "d": "I used to play piano".'
          ),
          errorHunt(
            'Did you used to have long hair in school?',
            bi('Encuentra el error en la pregunta:', 'Find the mistake in this question:'),
            'use to',
            ['use to', 'used to', 'using to', 'use'],
            'Después de "Did", el verbo principal no lleva terminación pasada: "Did you use to...".',
            'After "Did", the main verb does not take a past ending: "Did you use to...".'
          ),
          match(
            bi('Relaciona los hábitos del pasado con la vida presente:', 'Match past habits with present situations:'),
            {
              'I used to ride my bike to school.': 'I drive to work now.',
              'We used to write letters by hand.': 'We send emails now.',
              'She used to live with her parents.': 'She has her own apartment now.',
              'My brother used to play video games all day.': 'He works full time now.'
            },
            '"Used to" contrasta cómo eran las cosas antes frente a cómo son en la actualidad.',
            '"Used to" highlights how things used to be compared to how they are nowadays.'
          ),
          reading(
            "Daniel's Life Ten Years Ago",
            'Ten years ago, life was quite different for Daniel. He used to carry a small notebook everywhere he went. He used to write down phone numbers, addresses, and reminders by hand. He didn’t use to check social media every hour, because he didn’t even have an account. Instead, he used to spend more time reading books or talking to friends face-to-face.\n\nDaniel used to wake up early and read the newspaper with his morning coffee. Now, he checks the news on his phone while still in bed. He also used to listen to music on a portable MP3 player, but now he uses streaming apps.\n\nBack then, if he wanted to meet someone, he used to call them or just show up at their house. He didn’t use to send messages or share his location. He remembers how he used to get lost often because he didn’t have GPS. He had to ask people for directions or use a paper map.\n\nAlthough Daniel enjoys the convenience of smartphones today, he sometimes misses the slower pace of life he used to have.',
            bi('Según la lectura, ¿cómo se orientaba Daniel antes de los teléfonos inteligentes y el GPS?', 'According to the text, how did Daniel find directions before smartphones and GPS?'),
            'He asked people or used a paper map',
            ['He asked people or used a paper map', 'He used GPS on his smartphone', 'He never got lost in the city'],
            'El texto explica: "He had to ask people for directions or use a paper map."',
            'The text explains: "He had to ask people for directions or use a paper map."'
          ),
          listen(
            'When I was a child, I used to live in a small town. I used to walk to school every morning and play outside with friends. Today, I usually drive to work because the university campus is far away.',
            bi('Escucha la descripción del hablante y responde: ¿Cómo se traslada al trabajo hoy en día?', 'Listen to the speaker and answer: How do they commute to work nowadays?'),
            'They drive to work',
            ['They drive to work', 'They walk every morning', 'They ride their bicycle'],
            'En el audio dice claramente: "Today, I usually drive to work because it’s far away".',
            'In the audio the speaker clearly says: "Today, I usually drive to work because it’s far away".'
          )
        ]
      },
      {
        id: 'phrasal',
        name: 'Phrasal verbs',
        translation: 'Verbos compuestos',
        icon: 'Puzzle',
        level: 'C1',
        description: bi('Verbo + partícula con significados esenciales para nivel C1.', 'Verb + particle combinations with idiomatic meanings.'),
        rule: bi('Un phrasal verb combina un verbo con una preposición o adverbio para formar un nuevo significado idiomático (give up = rendirse; look after = cuidar; put off = posponer).', 'A phrasal verb combines a verb and a particle to produce a unique idiomatic meaning (give up = stop trying; look after = take care of; put off = postpone).'),
        example: "Don't give up! We can figure out the solution together.",
        questions: [
          choice("Don't ___! Keep practicing and you will achieve your goal.", 'give up', ['give up', 'give in', 'put off'], '"Give up" significa rendirse o dejar de intentar.', '"Give up" means to stop trying or surrender.'),
          choice('Could you please ___ my pet dog while I am away on vacation?', 'look after', ['look after', 'look for', 'look into'], '"Look after" significa cuidar o atender a alguien/algo.', '"Look after" means to take care of someone or something.'),
          choice('We had to ___ the project meeting because the professor was ill.', 'put off', ['put off', 'put on', 'drop off'], '"Put off" significa posponer o postergar.', '"Put off" means to postpone or delay.'),
          fill('Last year my older brother decided to give ___ smoking.', 'up', 'La expresión es "give up" (dejar un hábito / rendirse).', 'The expression is "give up" (quit a habit).', ['up']),
          fill('Please calm ___ and take a deep breath before speaking.', 'down', '"Calm down" significa tranquilizarse o calmarse.', '"Calm down" means to become less angry or upset.', ['down']),
          match(
            bi('Empareja cada phrasal verb con su definición exacta:', 'Match each phrasal verb to its exact meaning:'),
            {
              'Give up': 'Stop trying',
              'Look after': 'Take care of someone or something',
              'Calm down': 'Become less angry or upset',
              'Drop off': 'Take someone or something to a place',
              'Get over': 'Recover from something',
              'Hold on': 'Wait a moment'
            },
            'Estos phrasal verbs son fundamentales en el repertorio de nivel avanzado.',
            'These phrasal verbs are core components in the advanced English repertoire.'
          ),
          choice('When I was a teenager, I ___ playing the acoustic guitar.', 'took up', ['took up', 'gave up', 'got up'], '"Take up" (en pasado: took up) significa comenzar un pasatiempo o actividad.', '"Take up" (past: took up) means to begin a hobby or activity.'),
          order(
            'We need to figure out the solution together',
            bi('Construye la oración utilizando el phrasal verb "figure out":', 'Build the sentence using the phrasal verb "figure out":'),
            '"Figure out" significa resolver o encontrar la respuesta a un problema.',
            '"Figure out" means to solve or understand a problem.'
          ),
          choice('My friends and I used to ___ every Friday night at the campus café.', 'go out', ['go out', 'get up', 'take up'], '"Go out" significa salir a divertirse o socializar.', '"Go out" means to leave home for leisure or socialising.'),
          listen(
            'Please make sure you back up all your project files and essays on cloud storage before you format your laptop.',
            bi('Escucha la recomendación y responde: ¿Qué significa "back up" en esta situación?', 'Listen to the recommendation and answer: What does "back up" mean here?'),
            'Save a security copy',
            ['Save a security copy', 'Delete old documents', 'Move backward slowly'],
            '"Back up" en informática y estudio significa guardar una copia de seguridad.',
            '"Back up" in computing and studies means saving a duplicate safety copy.',
            ['Save a security copy', 'save a copy']
          )
        ]
      }
    ]
  },
  {
    id: 3,
    title: bi('Conecta y conversa', 'Connect & converse'),
    subtitle: bi('Comparte ideas y sigue la conversación', 'Share ideas & keep conversations going'),
    topics: [
      {
        id: 'reported',
        name: 'Reported speech',
        translation: 'Estilo indirecto',
        icon: 'MessageCircle',
        level: 'C1',
        description: bi('Cuenta lo que otras personas dijeron. Retroceso de tiempos verbales.', 'Report what others said. Tense backshift and reporting verbs.'),
        rule: bi('Al reportar con un verbo en pasado (said/told), los tiempos retroceden un paso: Present Simple → Past Simple, Present Continuous → Past Continuous, Past Simple → Past Perfect, will → would, can → could. "Tell" siempre lleva un objeto de persona (told me); "say" no lleva objeto directo (said that).', 'When reporting after a past reporting verb (said/told), tenses shift back: Present Simple → Past Simple, Past Simple → Past Perfect, will → would, can → could. "Tell" takes a person object (told me); "say" does not (said that).'),
        example: 'Direct: "I live in New York." → Indirect: She said she lived in New York.',
        questions: [
          choice('Direct: "I live in New York." → She said she ___ in New York.', 'lived', ['lived', 'lives', 'had lived'], 'Present simple (live) retrocede a past simple (lived).', 'Present simple (live) backshifts to past simple (lived).'),
          choice('Direct: "He works in a bank." → He said he ___ in a bank.', 'worked', ['worked', 'works', 'is working'], 'Present simple (works) pasa a past simple (worked).', 'Present simple (works) backshifts to past simple (worked).'),
          choice('Direct: "John studied German." → She said John ___ German.', 'had studied', ['had studied', 'studies', 'has studied'], 'Past simple (studied) retrocede a past perfect (had studied).', 'Past simple (studied) backshifts to past perfect (had studied).'),
          fill('Direct: "I will help tomorrow." → She said she ___ help tomorrow.', 'would', '"Will" cambia a "would" en el estilo indirecto.', '"Will" shifts to "would" in reported speech.', ['would']),
          fill('Say vs Tell: He ___ me that he loved living in London.', 'told', 'Con el pronombre objeto "me" usamos "told", no "said".', 'With the object pronoun "me" we use "told", not "said".', ['told']),
          match(
            bi('Empareja cada verbo de reporte con su función comunicativa:', 'Match each reporting verb with its communicative purpose:'),
            {
              'Admit': 'Say that something is true',
              'Suggest': 'Say an idea',
              'Advise': 'Recommend something',
              'Deny': 'Say something is not true',
              'Promise': 'Say you will do something'
            },
            'Estos reporting verbs añaden precisión académica al estilo indirecto.',
            'These reporting verbs add academic nuance to indirect communication.'
          ),
          transform(
            'Kelly said she was so tired of working every weekend.',
            bi('Transforma del estilo indirecto al estilo directo original:', 'Transform from reported speech back into the original direct quote:'),
            '"I am so tired of working every weekend."',
            ['"I am so tired of working every weekend."', '"I was so tired of working every weekend."', '"I will be tired of working every weekend."'],
            'El "was" del estilo indirecto proviene del presente original "I am".',
            'The reported "was" originates from the direct present "I am".'
          ),
          order(
            'He told me that he loved living in London',
            bi('Construye la oración en estilo indirecto:', 'Build the reported speech sentence:'),
            'Sujeto + told + objeto (me) + that + sujeto + verbo en pasado.',
            'Subject + told + object (me) + that + subject + past verb.'
          ),
          reading(
            'An Unforgettable Trip',
            'An Englishman wanted to go back home from France where he had spent many wonderful days. He was short of money, just enough to buy a ticket. As his trip wasn’t very long, he hoped that he would be able to stay without eating. So he bought a ticket and got on the ship. In the morning he wasn’t very hungry and he didn’t go to have breakfast.\n\nIn the afternoon he pretended to get seasick, but when dinner time came he was starving. He couldn’t stand it any longer. “I’ll go and eat even if they kick me out into the sea”, he said to himself. So he went to the dining room and had his dinner. Then he quickly got up and went away into his cabin. The man was very much afraid of his future, but in the evening when the ship was not far from London, he asked the waiter to bring his bill. “What bill?”, asked the waiter. “For the dinner I ate”, answered the Englishman. “Don’t trouble, sir. You paid for your meal when you bought the ticket”, the waiter answered.',
            bi('Según la lectura, ¿qué sorpresa descubrió el pasajero inglés al pedir la cuenta?', 'According to the story, what surprise did the English passenger discover when asking for the bill?'),
            'His meal was already included in the ticket',
            ['His meal was already included in the ticket', 'The dinner cost double the normal price', 'He had to wash dishes in the kitchen'],
            'El camarero le aclaró: "Don’t trouble, sir. You paid for your meal when you bought the ticket".',
            'The waiter clarified: "Don’t trouble, sir. You paid for your meal when you bought the ticket".'
          ),
          listen(
            'Maria told Jorge that she was feeling very nervous because she did not understand some chapters for the final exam. Jorge suggested creating a weekly study plan together, and Maria said she felt much better.',
            bi('Escucha la conversación y responde: ¿Por qué dijo María que estaba nerviosa?', 'Listen to the conversation and answer: Why did Maria say she was nervous?'),
            'She did not understand some chapters',
            ['She did not understand some chapters', 'She lost her university notes', 'The library was too crowded to study'],
            'El audio indica: "Maria told Jorge that she was feeling very nervous because she did not understand some chapters".',
            'The audio states: "Maria told Jorge that she was feeling very nervous because she did not understand some chapters".'
          )
        ]
      },
      {
        id: 'tags',
        name: 'Tag questions',
        translation: 'Preguntas de confirmación',
        icon: 'CircleHelp',
        level: 'C1',
        description: bi('Confirma información y busca acuerdo. Afirmativo ↔ negativo.', 'Check information and seek agreement. Positive ↔ negative.'),
        rule: bi('Una afirmación afirmativa lleva una coletilla (tag) negativa; una afirmación negativa lleva una tag afirmativa. Se repite el auxiliar del tiempo verbal. Caso especial: "I am" lleva "aren’t I?".', 'A positive statement takes a negative tag; a negative statement takes a positive tag. Repeat the auxiliary of the tense. Special case: "I am" takes "aren’t I?".'),
        example: "You will go to France, won't you? / Pedro is working from home today, isn't he?",
        questions: [
          choice("I am new in the school, ___?", "aren't I", ["aren't I", 'am not I', "isn't I"], 'La tag question para "I am" afirmativo es la forma idiomática "aren’t I?".', 'The grammatical tag for positive "I am" is the idiom "aren’t I?".'),
          choice('You will go to France for your next vacation, ___?', "won't you", ["won't you", 'will not you', "aren't you"], '"Will" afirmativo se confirma con "won’t you?".', 'Positive "will" takes the negative contraction "won’t you?".'),
          choice('Your classmates had a really good time at the party, ___?', "didn't they", ["didn't they", "haven't they", "weren't they"], '"Had" es el pasado simple del verbo have: el auxiliar pasado es "didn’t they?".', '"Had" is past simple: use the past auxiliary "didn’t they?".'),
          choice('Pedro is working from home today, ___?', "isn't he", ["isn't he", 'is he', 'did he'], 'Afirmación positiva con "is" → tag negativa "isn’t he?".', 'Positive statement with "is" → negative tag "isn’t he?".'),
          choice("Tomorrow is Monday, so you'll be at work, ___?", "won't you", ["won't you", "don't you", "aren't you"], '"You’ll" es la contracción de you will: la tag es "won’t you?".', '"You’ll" is you will: the tag is "won’t you?".'),
          fill('You already own a car. You won’t buy another one, ___ you?', 'will', 'Oración negativa con "won’t" → tag afirmativa con "will".', 'Negative statement with "won’t" → positive tag with "will".', ['will']),
          fill("Hey, there’s a new restaurant near our school, isn’t ___?", 'there', 'Con estructuras existenciales "there is", repetimos "there" en la tag: isn’t there?', 'With existential "there is", repeat "there" in the tag: isn’t there?', ['there']),
          order(
            "You can't tell the difference can you",
            bi('Construye la oración y su tag question:', 'Build the sentence and its question tag:'),
            'Oración negativa con "can’t" seguida de su tag afirmativa "can you".',
            'Negative statement with "can’t" followed by the positive tag "can you".'
          ),
          reading(
            'The Beginning of a New Chef',
            'Carlos is a young chef from La Paz. He loves cooking, and he always dreamed of working in a famous restaurant. One day, he gets a call from “Sabores de Bolivia”, a well-known restaurant in the city. They tell him he got the job. Carlos is very happy because he knows his life will change, won’t it?\n\nOn his first day, Carlos arrives early. The manager says that he must learn the menu and work with the other chefs. Carlos listens carefully. The head chef shows him how to prepare traditional dishes like salteñas, ají de fideo, and pique macho. Carlos practices many times because he wants everything to be perfect. During lunch time, the restaurant becomes very busy. Carlos feels a little nervous but the team tells him he is doing a good job. After work, the manager says that Carlos has talent and that he can grow in the restaurant. Carlos goes home tired but proud. He says to himself that this is only the beginning of his new cooking adventure, isn’t it?',
            bi('Según la lectura, ¿qué platos tradicionales le enseñó a preparar el chef principal a Carlos?', 'According to the reading, which traditional dishes did the head chef teach Carlos to prepare?'),
            'Salteñas, ají de fideo, and pique macho',
            ['Salteñas, ají de fideo, and pique macho', 'Gourmet burgers and fries', 'Italian pasta and pizzas'],
            'El texto detalla: "The head chef shows him how to prepare traditional dishes like salteñas, ají de fideo, and pique macho."',
            'The text states: "The head chef shows him how to prepare traditional dishes like salteñas, ají de fideo, and pique macho."'
          ),
          listen(
            'Miguel is a dedicated marketing student at the university. He has not finished his university degree yet, but the marketing manager loved his presentation and offered him a full internship!',
            bi('Escucha la historia y responde: ¿Ha terminado Miguel sus estudios universitarios?', 'Listen to the story and answer: Has Miguel finished his university courses yet?'),
            'No, he has not finished yet',
            ['No, he has not finished yet', 'Yes, he graduated last month', 'He decided to change majors'],
            'En el audio dice: "He has not finished his university degree yet".',
            'In the audio she says: "He has not finished his university degree yet".',
            ['No', 'no', 'No he has not', 'No, he has not']
          )
        ]
      },
      {
        id: 'agreement',
        name: 'So do I / Neither do I',
        translation: 'Acuerdo y coincidencias',
        icon: 'MessagesSquare',
        level: 'C1',
        description: bi('Coincide con frases positivas y negativas usando el auxiliar adecuado.', 'Express agreement with positive and negative statements using the correct auxiliary.'),
        rule: bi('Para coincidir: usa "So + auxiliar + sujeto" ante declaraciones afirmativas. Usa "Neither + auxiliar + sujeto" ante declaraciones negativas. El auxiliar debe coincidir con el tiempo verbal de la primera frase.', 'To agree: use "So + auxiliary + subject" for affirmative statements. Use "Neither + auxiliary + subject" for negative statements. Match the auxiliary to the tense of the prompt.'),
        example: '“I like chocolate.” → “So do I.” / “I can’t swim.” → “Neither can I.”',
        questions: [
          choice('“I like chocolate.” → “___”', 'So do I.', ['So do I.', 'So am I.', 'Neither do I.'], 'Frase positiva en presente simple: usamos "So do I."', 'Affirmative present simple statement: use "So do I."'),
          choice('“She doesn’t eat meat.” → “___”', 'Neither do I.', ['Neither do I.', 'So do I.', 'Neither am I.'], 'Frase negativa en presente simple: usamos "Neither do I."', 'Negative present simple statement: use "Neither do I."'),
          choice('“We are going to the cinema tonight.” → “___”', 'So am I.', ['So am I.', 'So do I.', 'Neither am I.'], 'Frase afirmativa con el verbo "to be": repetimos el auxiliar correspondido a I: "So am I."', 'Affirmative statement with "be": match the auxiliary for I: "So am I."'),
          fill('“I can’t swim.” → “Neither ___ I.”', 'can', 'La oración usa el modal negativo "can’t": en la respuesta repetimos "Neither can I".', 'The prompt uses negative modal "can’t": repeat "Neither can I".', ['can']),
          fill('“I didn’t like school.” → “Neither ___ I.”', 'did', 'La oración está en pasado simple negativo: usamos el auxiliar "did": Neither did I.', 'The prompt is in past simple negative: use the auxiliary "did": Neither did I.', ['did']),
          fill('“I have studied for the test.” → “So ___ I.”', 'have', 'La oración está en present perfect (have studied): usamos "So have I".', 'The prompt is in present perfect (have studied): use "So have I".', ['have']),
          match(
            bi('Relaciona cada declaración con su respuesta de coincidencia correcta:', 'Match each statement with its correct agreement response:'),
            {
              'I am from London.': 'So am I.',
              "I'm not tired at all.": 'Neither am I.',
              'Lisa can play the guitar.': 'So can Tim.',
              "I didn't see the film yesterday.": 'Neither did I.',
              "I'll be at the library at 7.": 'So will I.'
            },
            'El auxiliar de "So" o "Neither" debe coincidir estrictamente con el tiempo verbal y la polaridad.',
            'The auxiliary in "So" or "Neither" must strictly match the verb tense and polarity.'
          ),
          order(
            'Neither will I',
            bi('Coincide con la frase negativa: "I won’t take a taxi today":', 'Agree with the negative statement: "I won’t take a taxi today":'),
            '"Won’t" es negativo en futuro: respondemos con "Neither will I".',
            '"Won’t" is negative future: agree with "Neither will I".'
          ),
          reading(
            "Mrs. Lopez's Marketing Class",
            'Mrs. Lopez teaches marketing at a university. One Monday, she tells her students that the class will be about advertising strategies. She asked her students, “You have ever worked on a marketing project, haven’t you?”\n\nLuis said that he has created a small project for a school assignment. Maria said, “So did I”. Actually, Maria had worked in a small company before getting into university.\n\nDuring the class, the professor explains the steps to create an advertising campaign. She says that students should always plan carefully and ask for feedback from others. The students listen and take notes.\n\nAfter class, the professor tells the students that they will have a group activity next week. She says they must work together and share their ideas. The students were excited and so was Mrs. Lopez.',
            bi('Según la lectura, ¿qué respondió María para coincidir con Luis cuando él mencionó su proyecto anterior?', 'According to the story, what did Maria reply to agree with Luis regarding previous projects?'),
            '“So did I”',
            ['“So did I”', '“Neither did I”', '“So have I”'],
            'El texto cita directamente la expresión de María: "Maria said, “So did I”".',
            'The text directly quotes Maria: "Maria said, “So did I”".',
            ['So did I', '"So did I"', '“So did I”']
          ),
          listen(
            "Maria: I made scrambled eggs for breakfast today. Marcos: So did I! But I don't like spicy food at all. Maria: Neither do I. We really need to eat more vegetables because they are healthy.",
            bi('Escucha la conversación sobre preferencias de comida y responde: ¿En qué coinciden María y Marcos?', 'Listen to the conversation about food preferences and answer: What do Maria and Marcos agree on?'),
            'Neither of them likes spicy food',
            ['Neither of them likes spicy food', 'Both of them love spicy food', 'They only eat fast food at lunch'],
            'En el diálogo dicen: Marcos: "I don\'t like spicy food at all." Maria: "Neither do I."',
            'In the dialogue they state: Marcos: "I don\'t like spicy food at all." Maria: "Neither do I."'
          )
        ]
      }
    ]
  }
];

// Preserve the existing IDs so saved mistakes remain valid after adding content.
for (const unit of curriculum) {
  for (const topic of unit.topics) {
    topic.questions.push(...extraExercises[topic.id], ...(guideExercises[topic.id] || []));
    topic.questions.forEach((q, i) => {
      q.id = `${topic.id}-${i + 1}`;
      q.topicId = topic.id;
    });
  }
}

export const topics = curriculum.flatMap(unit => unit.topics.map(topic => ({ ...topic, unit: unit.id })));
export const questions = topics.flatMap(topic => topic.questions);
