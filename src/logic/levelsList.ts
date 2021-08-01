import { Level, Program } from "src/types/Program";
export const levelsList: Level[] = [
  {
    cups: 2,
    startingBalls: {
      orange: 1,
    },

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
            cups: [0, 1],
          },
        ],
      },
    ],
  },
  {
    cups: 3,
    startingBalls: {
      orange: 2,
    },

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
    ],
  },
  {
    cups: 3,
    startingBalls: {
      orange: 2,
    },

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
    ],
  },
  {
    cups: 3,
    startingBalls: {
      orange: 1,
    },

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "ifContainsBall",
            ballColor: "orange",
            then: [
              {
                _type: "swap",
                cups: [1, 2],
              },
            ],
            otherwise: [
              {
                _type: "swap",
                cups: [0, 2],
              },
            ],
            target: 1,
          },
        ],
      },
    ],
  },
  {
    cups: 3,
    startingBalls: {
      green: 1,
    },

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "swap",
            cups: [0, 1],
          },
          {
            _type: "ifContainsBall",
            ballColor: "orange",
            then: [
              {
                _type: "swap",
                cups: [1, 2],
              },
            ],
            otherwise: [
              {
                _type: "swap",
                cups: [0, 2],
              },
            ],
            target: 0,
          },
        ],
      },
    ],
  },
  {
    cups: 4,
    startingBalls: {
      blue: 1,
    },

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "ifContainsBall",
            ballColor: "blue",
            then: [
              {
                _type: "swap",
                cups: [1, 2],
              },
            ],
            otherwise: [
              {
                _type: "swap",
                cups: [3, 1],
              },
            ],
            target: 1,
          },
          {
            _type: "swap",
            cups: [2, 3],
          },
          {
            _type: "ifContainsBall",
            ballColor: "blue",
            then: [
              {
                _type: "swap",
                cups: [2, 0],
              },
            ],
            otherwise: [
              {
                _type: "swap",
                cups: [3, 2],
              },
            ],
            target: 2,
          },
        ],
      },
    ],
  },
  {
    cups: 3,
    startingBalls: {
      cyan: 1,
    },

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "repeat",
            times: 3,
            program: [
              {
                _type: "swap",
                cups: [1, 2],
              },

              {
                _type: "swap",
                cups: [2, 0],
              },
              {
                _type: "swap",
                cups: [0, 1],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    cups: 4,
    startingBalls: {
      orange: 3,
    },
    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "repeat",
            times: 4,
            program: [
              {
                _type: "ifContainsBall",
                ballColor: "orange",
                then: [
                  {
                    _type: "swap",
                    cups: [1, 3],
                  },
                ],
                otherwise: [
                  {
                    _type: "swap",
                    cups: [2, 3],
                  },
                ],
                target: 3,
              },
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
    ],
  },
];
