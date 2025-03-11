export const gameCategories = [
  {
    id: 'ww2',
    name: 'World War II',
    description: 'Test your knowledge about different countries during World War II',
    featured: true, // This category is featured as "Category of the Week"
    games: [
      {
        id: 'switzerland',
        name: 'Switzerland in WWII',
        description: 'Estimate key statistics about neutral Switzerland during World War II',
        addedDate: '2025-03-11',
        featured: true, // This is the "Game of the Day"
        questions: [
          {
            id: 1,
            text: "How many troops did Switzerland mobilize at its peak during World War II?",
            answer: 850000,
            unit: "troops",
            context: "Switzerland mobilized around 850,000 men at its peak during WWII. This represented about 20% of the Swiss population at the time."
          },
          {
            id: 2,
            text: "How many times was Swiss airspace violated during World War II?",
            answer: 6501,
            unit: "violations",
            context: "There were 6,501 recorded airspace violations during the war. In response, Swiss fighter planes shot down 11 German aircraft."
          },
          {
            id: 3,
            text: "How many refugees did Switzerland accept during World War II?",
            answer: 295000,
            unit: "refugees",
            context: "Switzerland provided asylum to around 295,000 refugees during WWII, but also turned away many others, particularly Jewish refugees."
          },
          {
            id: 4,
            text: "What was the total weight (in tons) of bombs accidentally dropped on Switzerland by Allied bombers?",
            answer: 84,
            unit: "tons",
            context: "About 84 tons of bombs were accidentally dropped on Swiss territory by Allied aircraft, primarily due to navigation errors."
          },
          {
            id: 5,
            text: "How many Swiss citizens were held in Nazi concentration camps?",
            answer: 1000,
            unit: "citizens",
            context: "Approximately 1,000 Swiss citizens were detained in Nazi concentration camps, many of whom were dual nationals or ethnic Jews."
          }
        ]
      },
      {
        id: 'austria',
        name: 'Austria in WWII',
        description: 'Estimate key statistics about Austria during World War II',
        addedDate: '2025-03-10',
        questions: [
          {
            id: 1,
            text: "How many Austrians served in the German Wehrmacht during World War II?",
            answer: 1300000,
            unit: "soldiers",
            context: "Approximately 1.3 million Austrians served in the German armed forces after the Anschluss (annexation) in 1938."
          },
          {
            id: 2,
            text: "How many Austrian Jews were killed during the Holocaust?",
            answer: 65000,
            unit: "people",
            context: "About 65,000 Austrian Jews were killed during the Holocaust, representing around one-third of Austria's pre-war Jewish population."
          },
          {
            id: 3,
            text: "How many tons of bombs were dropped on Austria by Allied forces?",
            answer: 79000,
            unit: "tons",
            context: "Allied forces dropped approximately 79,000 tons of bombs on Austria, with Vienna being the primary target of these air raids."
          },
          {
            id: 4,
            text: "What was the number of Austrian civilians killed by Allied bombing?",
            answer: 24000,
            unit: "people",
            context: "About 24,000 Austrian civilians lost their lives due to Allied bombing campaigns during the war."
          },
          {
            id: 5,
            text: "How many Austrians were executed for resistance activities against the Nazi regime?",
            answer: 2700,
            unit: "people",
            context: "Approximately 2,700 Austrians were executed for their resistance activities against the Nazi regime, with thousands more sent to concentration camps."
          }
        ]
      },
      {
        id: 'liechtenstein-ww2',
        name: 'Liechtenstein in WWII',
        description: 'Explore the unique position of this tiny principality during World War II',
        comingSoon: true, // Flag to indicate this game isn't playable yet
        releaseDate: '2025-03-12T09:00:00Z', // Released tomorrow at 9am UTC
        addedDate: '2025-03-12',
        questions: [
          {
            id: 1,
            text: "How many refugees were granted asylum in Liechtenstein during World War II?",
            answer: 406,
            unit: "refugees",
            context: "Liechtenstein granted asylum to 406 refugees during WWII. Despite its small size, this represented a significant humanitarian effort for the principality."
          },
          {
            id: 2,
            text: "How many Liechtenstein citizens served in the Swiss Army during World War II?",
            answer: 125,
            unit: "soldiers",
            context: "Around 125 Liechtenstein citizens served in the Swiss Army during WWII, as Liechtenstein had no army of its own but had close military cooperation with Switzerland."
          },
          {
            id: 3,
            text: "How many times was Liechtenstein's neutrality violated by air during WWII?",
            answer: 7,
            unit: "incidents",
            context: "Liechtenstein's neutrality was violated 7 times by Allied aircraft. These were considered accidental overflights or navigation errors."
          },
          {
            id: 4,
            text: "What was the percentage decline in Liechtenstein's economy during the early war years (1939-1941)?",
            answer: 18,
            unit: "percent",
            context: "The Liechtenstein economy contracted by approximately 18% during the early war years, primarily due to disruption of trade with neighbors and wartime restrictions."
          },
          {
            id: 5,
            text: "How many Liechtenstein citizens or residents were documented as having joined the Nazi Party?",
            answer: 239,
            unit: "people",
            context: "Records show that 239 Liechtenstein citizens or residents joined the Nazi Party, representing about 2% of the population at that time."
          }
        ]
      }
    ]
  },
  {
    id: 'microstates',
    name: 'Micro States',
    description: 'Test your knowledge about some of the smallest countries in the world',
    games: [
      {
        id: 'liechtenstein',
        name: 'Liechtenstein Facts',
        description: 'Estimate key statistics about the principality of Liechtenstein',
        addedDate: '2025-03-09',
        questions: [
          {
            id: 1,
            text: "What is the current population of Liechtenstein?",
            answer: 39039,
            unit: "people",
            context: "Liechtenstein has approximately 39,039 inhabitants, making it one of the smallest countries in Europe by population."
          },
          {
            id: 2,
            text: "What is Liechtenstein's annual GDP (in millions of USD)?",
            answer: 6275,
            unit: "million USD",
            context: "Liechtenstein's GDP is around $6.275 billion, giving it one of the highest GDP per capita in the world."
          },
          {
            id: 3,
            text: "What percentage of Liechtenstein's GDP comes from financial services?",
            answer: 27,
            unit: "percent",
            context: "Financial services account for approximately 27% of Liechtenstein's GDP, making it a significant part of their economy alongside manufacturing."
          },
          {
            id: 4,
            text: "What is the land area of Liechtenstein in square kilometers?",
            answer: 160,
            unit: "square kilometers",
            context: "Liechtenstein covers just 160 square kilometers, making it the fourth-smallest country in Europe and the sixth-smallest in the world."
          },
          {
            id: 5,
            text: "How many municipalities (Gemeinden) does Liechtenstein have?",
            answer: 11,
            unit: "municipalities",
            context: "Liechtenstein is divided into 11 municipalities (Gemeinden). The capital, Vaduz, is one of these municipalities."
          }
        ]
      }
    ]
  }
];
