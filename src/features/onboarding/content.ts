/**
 * Words shown by the first-launch introduction. Scripture quotes are KJV (public domain).
 * Follow CONTENT_GUIDELINES.md when editing.
 */

export interface Verse {
  ref: string;
  text: string;
}

export interface HabitIntro {
  /** one or two sentences: what the habit is */
  what: string;
  /** lasting fruit of keeping it */
  benefits: string[];
  verses: Verse[];
}

export const WELCOME = {
  title: 'Christ Habits',
  lines: [
    'Welcome. This app exists to help you walk closely with the Father, the Lord Jesus and the Holy Spirit — every day, not just on good days.',
    'Small, faithful habits, kept over years, make a believer steady in the Spirit and dangerous to the kingdom of darkness.',
  ],
};

export const PURPOSE = {
  title: 'Why it was made',
  lines: [
    'Most of us know what we should do. The struggle is doing it daily. This app is built to close that gap.',
    'It does not run on willpower. It runs on who you already are in Christ, small steps, and a clear moment in your day for each habit.',
  ],
  verse: {
    ref: 'Galatians 2:20',
    text: 'I am crucified with Christ: nevertheless I live; yet not I, but Christ liveth in me.',
  } satisfies Verse,
};

export const HOW_IT_WORKS = {
  title: 'How it works',
  points: [
    {
      heading: 'Identity first',
      body: 'Every habit starts with who you are: "I am someone who…". Each time you do it, you cast a vote for that identity.',
    },
    {
      heading: 'Floor and target',
      body: 'Each habit has a small floor — so small you can do it on your worst day — and a bigger target. The floor still counts.',
    },
    {
      heading: 'A set time and place',
      body: 'Habits are attached to moments you already have — your morning, your time of peace — so you are reminded once, not nagged all day.',
    },
    {
      heading: 'Never miss twice',
      body: 'Missing one day is an accident. Missing two is the start of a new habit. One miss never breaks your streak — grace, not guilt.',
    },
    {
      heading: 'Honest weekly look',
      body: 'Some things are not daily checkboxes. Once a week the app asks you honest questions — to adjust, never to condemn.',
    },
  ],
};

export const RHYTHMS = {
  title: 'Your daily rhythm',
  intro:
    'Two moments carry most of your habits. Pick the times that fit your life — you can change them later.',
  morning: {
    label: 'Morning prayer',
    hint: 'Before the phone: silence, presence, gratitude, and declaring who you are in Christ.',
  },
  peace: {
    label: 'Time of peace',
    hint: 'A daily hour to wait on the Lord — a walk, the garden, a quiet room. Word, prayer in the Spirit, listening.',
  },
};

export const HABIT_INTROS: Record<string, HabitIntro> = {
  scripture: {
    what: 'Taking in God’s Word every day — reading or listening.',
    benefits: [
      'Your mind is renewed and you start to think like Him.',
      'Faith grows — it comes by hearing the Word.',
      'You carry the sword of the Spirit: Jesus answered every temptation with "It is written."',
    ],
    verses: [
      {
        ref: 'Matthew 4:4',
        text: 'Man shall not live by bread alone, but by every word that proceedeth out of the mouth of God.',
      },
      {
        ref: 'Romans 10:17',
        text: 'So then faith cometh by hearing, and hearing by the word of God.',
      },
    ],
  },
  tongues: {
    what: 'Praying in the Spirit — a few minutes at first, growing into a background prayer through the day.',
    benefits: [
      'You build yourself up in your most holy faith.',
      'The Spirit prays through you when you do not know what to pray.',
      'Sensitivity to His voice grows.',
    ],
    verses: [
      {
        ref: 'Jude 1:20',
        text: 'Building up yourselves on your most holy faith, praying in the Holy Ghost.',
      },
      {
        ref: 'Romans 8:26',
        text: 'The Spirit itself maketh intercession for us with groanings which cannot be uttered.',
      },
    ],
  },
  obey: {
    what: 'Obeying the Holy Spirit’s nudges right away — especially the public ones, like stopping for a stranger.',
    benefits: [
      'You become someone God can trust with more.',
      'Every act of obedience becomes a testimony — the app keeps them for you.',
      'Hesitation loses its grip once the decision is made in advance.',
    ],
    verses: [
      {
        ref: 'Romans 8:14',
        text: 'For as many as are led by the Spirit of God, they are the sons of God.',
      },
      { ref: '1 Samuel 15:22', text: 'Behold, to obey is better than sacrifice.' },
    ],
  },
  offense: {
    what: 'When offense comes, you notice it, take it to the Lord, ask for help and forgive — quickly.',
    benefits: [
      'Offense gives the enemy a foothold. Forgiveness takes it back.',
      'Your prayers stay unhindered.',
      'Relationships with brothers and sisters survive hard disagreements.',
    ],
    verses: [
      {
        ref: 'Ephesians 4:26–27',
        text: 'Let not the sun go down upon your wrath: neither give place to the devil.',
      },
      {
        ref: 'Mark 11:25',
        text: 'When ye stand praying, forgive, if ye have ought against any.',
      },
    ],
  },
  wisdom: {
    what: 'Choosing what is wise, not only what is allowed — games, YouTube, how you talk and listen.',
    benefits: [
      'Your time goes to what matters: you redeem the days.',
      'You listen more and speak with weight.',
      'Small daily wins on your responsibilities compound into a faithful life.',
    ],
    verses: [
      {
        ref: '1 Corinthians 10:23',
        text: 'All things are lawful for me, but all things are not expedient.',
      },
      { ref: 'James 1:19', text: 'Let every man be swift to hear, slow to speak, slow to wrath.' },
    ],
  },
  purity: {
    what: 'Guarding your eyes and heart. This one is private — details stay hidden on the main screen.',
    benefits: [
      'The pure in heart see God.',
      'Shame loses its hold and your boldness returns.',
      'You resist the devil — and he flees.',
    ],
    verses: [
      { ref: 'Matthew 5:8', text: 'Blessed are the pure in heart: for they shall see God.' },
      {
        ref: 'James 4:7',
        text: 'Submit yourselves therefore to God. Resist the devil, and he will flee from you.',
      },
    ],
  },
  serve: {
    what: 'Serving others and keeping your promises — family, hospital ministry, the street.',
    benefits: [
      'You become like Jesus, who came to serve.',
      'People can count on you: your yes means yes.',
      'What you do for the least, you do for Him.',
    ],
    verses: [
      {
        ref: 'Mark 10:45',
        text: 'For even the Son of man came not to be ministered unto, but to minister.',
      },
      {
        ref: 'Matthew 25:40',
        text: 'Inasmuch as ye have done it unto one of the least of these my brethren, ye have done it unto me.',
      },
    ],
  },
  fasting: {
    what: 'Regular fasting — setting aside food to seek God. You can start later; it can stay parked.',
    benefits: [
      'Your hunger for God grows stronger than your appetites.',
      'Your flesh learns it does not rule you.',
      'Chains break: fasting and prayer go together in spiritual battle.',
    ],
    verses: [
      {
        ref: 'Isaiah 58:6',
        text: 'Is not this the fast that I have chosen? to loose the bands of wickedness.',
      },
      {
        ref: 'Matthew 6:17–18',
        text: 'When thou fastest… thy Father, which seeth in secret, shall reward thee openly.',
      },
    ],
  },
};

export const FINISH = {
  title: 'You are ready',
  lines: [
    'Start with the floors. Show up small, every day. The targets will come.',
    'Every check is a vote for who you are in Christ.',
  ],
};
