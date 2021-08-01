import { Level, Program } from "src/types/Program";
export const levelsList: Level[] = [
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
            times: 1,
            program: [
              {
                _type: "ifContainsBall",
                ballColor: "cyan",
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
                target: 1,
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
