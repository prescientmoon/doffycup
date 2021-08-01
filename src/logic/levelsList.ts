import { Level, Program } from "src/types/Program";
export const levelsList: Level[] = [
  {
    cups: 2,
    startingBall: 2,

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "swap",
            cups: [1, 0],
          },
        ],
      },
      {
        hidden: false,
        program: [
          {
            _type: "swap",
            cups: [0, 3],
          },
          {
            _type: "swap",
            cups: [2, 3],
          },
        ],
      },
    ],
  },
  {
    cups: 3,
    startingBall: 2,

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "swap",
            cups: [1, 2],
          },
          {
            _type: "swap",
            cups: [0, 2],
          },
          {
            _type: "swap",
            cups: [1, 2],
          },
        ],
      },
      {
        hidden: false,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "swap",
            cups: [1, 2],
          },
          {
            _type: "swap",
            cups: [0, 2],
          },
          {
            _type: "swap",
            cups: [1, 2],
          },
        ],
      },
    ],
  },
  {
    cups: 3,
    startingBall: 2,

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "swap",
            cups: [2, 0],
          },
          {
            _type: "swap",
            cups: [1, 2],
          },
        ],
      },
      {
        hidden: false,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "swap",
            cups: [2, 0],
          },
          {
            _type: "swap",
            cups: [1, 2],
          },
        ],
      },
    ],
  },
  {
    cups: 4,
    startingBall: 2,

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "repeat",
            times: 4,
            program: [
              {
                _type: "swap",
                cups: [0, 3],
              },
              {
                _type: "swap",
                cups: [2, 3],
              },
            ],
          },
        ],
      },
      {
        hidden: false,
        program: [
          {
            _type: "repeat",
            times: 2,
            program: [
              {
                _type: "swap",
                cups: [0, 1],
              },
              {
                _type: "swap",
                cups: [1, 2],
              },
              {
                _type: "swap",
                cups: [2, 3],
              },
            ],
          },
        ],
      },
    ],
  },
];
