import { Lesson } from '../types';

export const lessons: Lesson[] = [
  {
    id: 'js-basics-1',
    languageId: 'javascript',
    title: 'JavaScript 기초 - 변수와 데이터 타입',
    description: 'JavaScript의 기본 변수 선언과 데이터 타입을 학습합니다',
    difficulty: 'beginner',
    xpReward: 10,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'JavaScript에서 변수를 선언하는 올바른 키워드는?',
        options: ['var', 'let', 'const', '모두 정답'],
        correctAnswer: 3,
        explanation: 'var, let, const 모두 JavaScript에서 변수를 선언하는 키워드입니다.',
        points: 5
      },
      {
        id: 'q2',
        type: 'fill-blank',
        question: '다음 빈 칸을 채우세요: _____ name = "JavaScript";',
        correctAnswer: 'let',
        explanation: 'let 키워드를 사용하여 변수를 선언합니다.',
        points: 5
      },
      {
        id: 'q3',
        type: 'code-completion',
        question: 'console.log()를 사용하여 "Hello, World!"를 출력하는 코드를 완성하세요.',
        code: 'console.log(_____);',
        correctAnswer: '"Hello, World!"',
        explanation: 'console.log() 함수에 문자열을 전달하여 출력합니다.',
        points: 10
      }
    ]
  },
  {
    id: 'py-basics-1',
    languageId: 'python',
    title: 'Python 기초 - 변수와 출력',
    description: 'Python의 기본 변수 선언과 출력 함수를 학습합니다',
    difficulty: 'beginner',
    xpReward: 10,
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Python에서 화면에 출력하는 함수는?',
        options: ['console.log()', 'print()', 'echo()', 'output()'],
        correctAnswer: 1,
        explanation: 'Python에서는 print() 함수를 사용하여 화면에 출력합니다.',
        points: 5
      },
      {
        id: 'q2',
        type: 'code-completion',
        question: '"Hello, Python!"을 출력하는 코드를 완성하세요.',
        code: '_____(\'Hello, Python!\')',
        correctAnswer: 'print',
        explanation: 'print 함수를 사용하여 문자열을 출력합니다.',
        points: 10
      }
    ]
  }
];