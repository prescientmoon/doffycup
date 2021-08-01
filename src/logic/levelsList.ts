import { Level, Program } from "src/types/Program";
export const levelsList: Level[] = [
  {
    cups: 4,
    startingBall: 2,

    sections: [
      {
        hidden: true,
        program: [
          {
            _type: "repeat",
            times: 1,
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
