import { Program } from "src/types/Program";
export const levelsList: Program[] = [
  [
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
          cups: [2, 4],
        },
      ],
    },
  ],
];
