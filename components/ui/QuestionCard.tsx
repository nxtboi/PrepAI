
import React, { useState } from 'react';
import { Question } from '../../types';
import { suggestVideo, generateNotesForQuestion } from '../../services/geminiService';
import VideoCard from './VideoCard';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, VideoCameraIcon, BookOpenIcon } from '../icons/Icons';
import MarkdownRenderer from './MarkdownRenderer';
import Loader from './Loader';

interface QuestionCardProps {
  question: Question;
  exam: string;
  subject: string;
  questionNumber: number;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, exam, subject, questionNumber }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showPoints, setShowPoints] = useState(false);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState('');

  const [relatedNotes, setRelatedNotes] = useState<string | null>(null);
  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');

  const isCorrect = selectedAnswer === question.correctAnswer;

  const handleAnswerSelect = (answer: string) => {
    if (isRevealed) return;
    setSelectedAnswer(answer);
    setIsRevealed(true);
    if (answer === question.correctAnswer) {
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 1500);
    }
  };

  const handleSuggestVideo = async () => {
    setIsVideoLoading(true);
    setVideoError('');
    setVideoUrl(null);
    try {
        const url = await suggestVideo(question.topic, exam);
        if (url && (url.includes('youtube.com/') || url.includes('youtu.be/'))) {
            setVideoUrl(url);
        } else {
            setVideoError('AI returned an invalid URL. Please try again.');
        }
    } catch (error) {
        setVideoError('Could not fetch video suggestion.');
    } finally {
        setIsVideoLoading(false);
    }
  }

  const handleGetNotes = async () => {
    setIsNotesLoading(true);
    setNotesError('');
    setRelatedNotes(null);
    try {
        const notes = await generateNotesForQuestion(question, exam, subject);
        setRelatedNotes(notes);
    } catch (error) {
        setNotesError('Could not fetch related notes.');
    } finally {
        setIsNotesLoading(false);
    }
  };


  const getOptionClass = (option: string) => {
    if (!isRevealed) {
      return 'border-slate-300 hover:bg-slate-100 hover:border-slate-400';
    }
    if (option === question.correctAnswer) {
      return 'bg-green-50 border-green-500 text-green-800 font-semibold';
    }
    if (option === selectedAnswer && option !== question.correctAnswer) {
      return 'bg-red-50 border-red-500 text-red-800 font-semibold';
    }
    return 'border-slate-300 bg-white';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 relative overflow-hidden">
      {showPoints && (
        <div className="absolute top-4 right-4 text-accent font-bold text-lg animate-ping">+10 PTS</div>
      )}
      <div className="flex justify-between items-start">
        <div className="text-charcoal mb-4 leading-relaxed pr-4 flex-1">
            <p className="font-semibold text-charcoal-light">Question {questionNumber}:</p>
            <MarkdownRenderer content={question.questionText} />
        </div>
        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
            question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
        }`}>{question.difficulty}</span>
      </div>
      
      <div className="space-y-3">
        {question.options && question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            disabled={isRevealed}
            className={`w-full text-left p-3 border rounded-lg transition-colors duration-200 flex items-center justify-between ${getOptionClass(option)}`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
            <div className="flex-1"><MarkdownRenderer content={option} /></div>
            {isRevealed && option === question.correctAnswer && <CheckCircleIcon className="text-green-600" />}
            {isRevealed && option === selectedAnswer && option !== question.correctAnswer && <XCircleIcon className="text-red-600" />}
          </button>
        ))}
      </div>

      {isRevealed && (
        <div className={`mt-4 p-4 rounded-lg border-l-4 ${isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
          <h4 className={`font-bold font-serif text-lg ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h4>
          <div className="text-sm mt-2 prose-sm max-w-none text-charcoal">
            <p><strong>Correct Answer:</strong> <MarkdownRenderer content={question.correctAnswer} /></p>
            <strong className="font-serif">Explanation:</strong>
            <MarkdownRenderer content={question.explanation} />
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-slate-200 pt-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button onClick={handleSuggestVideo} disabled={isVideoLoading} className="flex items-center text-sm font-semibold text-primary hover:underline disabled:text-slate-400">
               {isVideoLoading ? <SparklesIcon className="animate-spin mr-2"/> : <VideoCameraIcon className="mr-2"/>}
               {isVideoLoading ? 'Finding Video...' : 'Suggest Video'}
            </button>
             <button onClick={handleGetNotes} disabled={isNotesLoading} className="flex items-center text-sm font-semibold text-green-600 hover:underline disabled:text-slate-400">
               {isNotesLoading ? <SparklesIcon className="animate-spin mr-2"/> : <BookOpenIcon className="mr-2 h-5 w-5"/>}
               {isNotesLoading ? 'Generating...' : 'Concept Notes'}
            </button>
        </div>

        {videoUrl && !isVideoLoading && <VideoCard url={videoUrl} />}
        {videoError && <p className="text-red-500 text-sm mt-2">{videoError}</p>}
        
        {isNotesLoading && <div className="text-center py-4"><Loader size="sm"/></div>}
        {relatedNotes && !isNotesLoading && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                <MarkdownRenderer content={relatedNotes} />
            </div>
        )}
        {notesError && <p className="text-red-500 text-sm mt-2">{notesError}</p>}

      </div>
    </div>
  );
};

export default QuestionCard;
