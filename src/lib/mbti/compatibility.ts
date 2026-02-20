import { MbtiCompatibility, MbtiType } from './types';

const compatibilityMatrix: Record<MbtiType, Record<MbtiType, number>> = {
  INTJ: {
    INTJ: 75,
    INTP: 83,
    ENTJ: 85,
    ENTP: 88,
    INFJ: 82,
    INFP: 72,
    ENFJ: 72,
    ENFP: 90,
    ISTJ: 78,
    ISFJ: 67,
    ESTJ: 68,
    ESFJ: 50,
    ISTP: 68,
    ISFP: 57,
    ESTP: 55,
    ESFP: 45,
  },
  INTP: {
    INTJ: 83,
    INTP: 75,
    ENTJ: 82,
    ENTP: 85,
    INFJ: 72,
    INFP: 82,
    ENFJ: 62,
    ENFP: 85,
    ISTJ: 68,
    ISFJ: 57,
    ESTJ: 58,
    ESFJ: 55,
    ISTP: 78,
    ISFP: 67,
    ESTP: 68,
    ESFP: 50,
  },
  ENTJ: {
    INTJ: 85,
    INTP: 82,
    ENTJ: 75,
    ENTP: 83,
    INFJ: 72,
    INFP: 88,
    ENFJ: 82,
    ENFP: 72,
    ISTJ: 68,
    ISFJ: 52,
    ESTJ: 78,
    ESFJ: 67,
    ISTP: 58,
    ISFP: 55,
    ESTP: 68,
    ESFP: 55,
  },
  ENTP: {
    INTJ: 88,
    INTP: 85,
    ENTJ: 83,
    ENTP: 75,
    INFJ: 90,
    INFP: 72,
    ENFJ: 72,
    ENFP: 82,
    ISTJ: 58,
    ISFJ: 55,
    ESTJ: 68,
    ESFJ: 57,
    ISTP: 68,
    ISFP: 57,
    ESTP: 78,
    ESFP: 67,
  },
  INFJ: {
    INTJ: 82,
    INTP: 72,
    ENTJ: 72,
    ENTP: 90,
    INFJ: 75,
    INFP: 83,
    ENFJ: 83,
    ENFP: 88,
    ISTJ: 67,
    ISFJ: 78,
    ESTJ: 55,
    ESFJ: 68,
    ISTP: 57,
    ISFP: 68,
    ESTP: 52,
    ESFP: 58,
  },
  INFP: {
    INTJ: 72,
    INTP: 82,
    ENTJ: 88,
    ENTP: 72,
    INFJ: 83,
    INFP: 75,
    ENFJ: 90,
    ENFP: 83,
    ISTJ: 57,
    ISFJ: 68,
    ESTJ: 50,
    ESFJ: 58,
    ISTP: 67,
    ISFP: 78,
    ESTP: 57,
    ESFP: 68,
  },
  ENFJ: {
    INTJ: 72,
    INTP: 62,
    ENTJ: 82,
    ENTP: 72,
    INFJ: 83,
    INFP: 90,
    ENFJ: 75,
    ENFP: 83,
    ISTJ: 51,
    ISFJ: 68,
    ESTJ: 67,
    ESFJ: 78,
    ISTP: 52,
    ISFP: 85,
    ESTP: 57,
    ESFP: 68,
  },
  ENFP: {
    INTJ: 90,
    INTP: 85,
    ENTJ: 72,
    ENTP: 82,
    INFJ: 88,
    INFP: 83,
    ENFJ: 83,
    ENFP: 75,
    ISTJ: 50,
    ISFJ: 58,
    ESTJ: 55,
    ESFJ: 68,
    ISTP: 57,
    ISFP: 68,
    ESTP: 67,
    ESFP: 78,
  },
  ISTJ: {
    INTJ: 78,
    INTP: 68,
    ENTJ: 68,
    ENTP: 58,
    INFJ: 67,
    INFP: 57,
    ENFJ: 51,
    ENFP: 50,
    ISTJ: 75,
    ISFJ: 81,
    ESTJ: 82,
    ESFJ: 71,
    ISTP: 82,
    ISFP: 71,
    ESTP: 68,
    ESFP: 65,
  },
  ISFJ: {
    INTJ: 67,
    INTP: 57,
    ENTJ: 52,
    ENTP: 55,
    INFJ: 78,
    INFP: 68,
    ENFJ: 68,
    ENFP: 58,
    ISTJ: 81,
    ISFJ: 75,
    ESTJ: 71,
    ESFJ: 82,
    ISTP: 71,
    ISFP: 82,
    ESTP: 70,
    ESFP: 82,
  },
  ESTJ: {
    INTJ: 68,
    INTP: 58,
    ENTJ: 78,
    ENTP: 68,
    INFJ: 55,
    INFP: 50,
    ENFJ: 67,
    ENFP: 55,
    ISTJ: 82,
    ISFJ: 71,
    ESTJ: 75,
    ESFJ: 81,
    ISTP: 78,
    ISFP: 72,
    ESTP: 82,
    ESFP: 71,
  },
  ESFJ: {
    INTJ: 50,
    INTP: 55,
    ENTJ: 67,
    ENTP: 57,
    INFJ: 68,
    INFP: 58,
    ENFJ: 78,
    ENFP: 68,
    ISTJ: 71,
    ISFJ: 82,
    ESTJ: 81,
    ESFJ: 75,
    ISTP: 74,
    ISFP: 86,
    ESTP: 71,
    ESFP: 82,
  },
  ISTP: {
    INTJ: 68,
    INTP: 78,
    ENTJ: 58,
    ENTP: 68,
    INFJ: 57,
    INFP: 67,
    ENFJ: 52,
    ENFP: 57,
    ISTJ: 82,
    ISFJ: 71,
    ESTJ: 78,
    ESFJ: 74,
    ISTP: 75,
    ISFP: 81,
    ESTP: 82,
    ESFP: 71,
  },
  ISFP: {
    INTJ: 57,
    INTP: 67,
    ENTJ: 55,
    ENTP: 57,
    INFJ: 68,
    INFP: 78,
    ENFJ: 85,
    ENFP: 68,
    ISTJ: 71,
    ISFJ: 82,
    ESTJ: 72,
    ESFJ: 86,
    ISTP: 81,
    ISFP: 75,
    ESTP: 71,
    ESFP: 82,
  },
  ESTP: {
    INTJ: 55,
    INTP: 68,
    ENTJ: 68,
    ENTP: 78,
    INFJ: 52,
    INFP: 57,
    ENFJ: 57,
    ENFP: 67,
    ISTJ: 68,
    ISFJ: 70,
    ESTJ: 82,
    ESFJ: 71,
    ISTP: 82,
    ISFP: 71,
    ESTP: 75,
    ESFP: 81,
  },
  ESFP: {
    INTJ: 45,
    INTP: 50,
    ENTJ: 55,
    ENTP: 67,
    INFJ: 58,
    INFP: 68,
    ENFJ: 68,
    ENFP: 78,
    ISTJ: 65,
    ISFJ: 82,
    ESTJ: 71,
    ESFJ: 82,
    ISTP: 71,
    ISFP: 82,
    ESTP: 81,
    ESFP: 75,
  },
};

function calculateAxes(typeA: MbtiType, typeB: MbtiType): MbtiCompatibility['axes'] {
  const axesA = typeA.split('') as [string, string, string, string];
  const axesB = typeB.split('') as [string, string, string, string];

  let communication = 50;
  let conflict = 50;
  let stability = 50;
  let growth = 50;

  if (axesA[0] === axesB[0]) {
    communication += 20;
    if (axesA[0] === 'I') stability += 10;
  }

  if (axesA[1] === axesB[1]) {
    communication += 15;
    if (axesA[1] === 'S') stability += 15;
  } else {
    growth += 10;
  }

  if (axesA[2] === axesB[2]) {
    communication += 10;
    conflict += 15;
  }

  if (axesA[3] === axesB[3]) {
    conflict += 15;
    if (axesA[3] === 'J') stability += 20;
  }

  const oppositeCount = axesA.filter((axis, index) => axis !== axesB[index]).length;
  if (oppositeCount >= 3) {
    conflict -= 20;
    growth += 15;
  }

  const clamp = (value: number) => Math.min(100, Math.max(0, value));

  return {
    communication: clamp(communication),
    conflict: clamp(conflict),
    stability: clamp(stability),
    growth: clamp(growth),
  };
}

export function calculateMbtiCompatibility(typeA: MbtiType, typeB: MbtiType): MbtiCompatibility {
  const score = compatibilityMatrix[typeA][typeB];
  const axes = calculateAxes(typeA, typeB);

  let summary = '';
  if (score >= 80) {
    summary = '非常に良い相性です。お互いを理解し、刺激し合える関係。';
  } else if (score >= 65) {
    summary = '良い相性です。違いを尊重すればうまくいきます。';
  } else if (score >= 50) {
    summary = '普通の相性です。努力次第で関係を築けます。';
  } else {
    summary = '難しい相性です。価値観の違いを認識しましょう。';
  }

  return { score, axes, summary };
}

export { compatibilityMatrix };
