
export interface User {
  name: string;
  email: string;
  isAdmin: boolean;
  targetExam?: string;
  currentClass?: string;
  subjects?: string[];
}

export interface Syllabus {
  [exam: string]: {
    [subject: string]: string[];
  };
}

export interface Question {
  id: string;
  questionText: string;
  type: 'MCQ' | 'FillInTheBlank' | 'TrueFalse' | 'ShortAnswer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
}

export interface PriorityTopic {
    topic: string;
    priority: number;
    reason: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
