
import React, { useState, useEffect, useMemo } from 'react';
import { syllabus } from '../data/syllabus';
import { Question, PriorityTopic } from '../types';
import { generateQuestions, getPriorityTopics, getSubTopics } from '../services/geminiService';
import QuestionCard from '../components/ui/QuestionCard';
import Loader from '../components/ui/Loader';
import { FilterIcon, BookOpenIcon, SparklesIcon } from '../components/icons/Icons';

const QBankGenerator: React.FC = () => {
    const [exam, setExam] = useState(Object.keys(syllabus)[0]);
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [subTopic, setSubTopic] = useState('Entire Chapter');
    const [numQuestions, setNumQuestions] = useState(5);

    const [subjects, setSubjects] = useState<string[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [subTopics, setSubTopics] = useState<string[]>(['Entire Chapter']);

    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [priorityTopics, setPriorityTopics] = useState<PriorityTopic[]>([]);
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [isLoadingTopics, setIsLoadingTopics] = useState(false);
    const [isLoadingSubTopics, setIsLoadingSubTopics] = useState(false);
    const [error, setError] = useState('');
    
    // Filters
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');

    useEffect(() => {
        const availableSubjects = Object.keys(syllabus[exam] || {});
        setSubjects(availableSubjects);
        setSubject(availableSubjects[0] || '');
    }, [exam]);

    useEffect(() => {
        if (subject) {
            const availableTopics = syllabus[exam]?.[subject] || [];
            setTopics(availableTopics);
            setTopic(availableTopics[0] || '');
        } else {
            setTopics([]);
            setTopic('');
        }
    }, [exam, subject]);
    
    // Fetch priority topics
    useEffect(() => {
        const handler = setTimeout(() => {
            const fetchPriorityTopics = async () => {
                if (exam && subject) {
                    setIsLoadingTopics(true);
                    setPriorityTopics([]);
                    setError(''); // Clear previous errors
                    try {
                        const topicsResult = await getPriorityTopics(exam, subject);
                        setPriorityTopics(topicsResult);
                    } catch (err) {
                        console.error("Failed to fetch priority topics:", err);
                        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch priority topics.';
                        setError(errorMessage);
                    } finally {
                        setIsLoadingTopics(false);
                    }
                }
            };
            fetchPriorityTopics();
        }, 400); // Reduced from 750ms for faster response

        return () => clearTimeout(handler);
    }, [exam, subject]);

    // Fetch sub-topics
    useEffect(() => {
        setSubTopic('Entire Chapter');
        setSubTopics(['Entire Chapter']);
        if (!topic) return;

        const handler = setTimeout(() => {
            const fetchSubTopics = async () => {
                if (exam && subject && topic) {
                    setIsLoadingSubTopics(true);
                    try {
                        const subTopicsResult = await getSubTopics(exam, subject, topic);
                        setSubTopics(['Entire Chapter', ...subTopicsResult]);
                    } catch (err) {
                        console.error("Failed to fetch sub-topics:", err);
                        setSubTopics(['Entire Chapter']);
                    } finally {
                        setIsLoadingSubTopics(false);
                    }
                }
            };
            fetchSubTopics();
        }, 400); // Reduced from 750ms for faster response

        return () => clearTimeout(handler);
    }, [exam, subject, topic]);


    const handleGenerate = async () => {
        if (!exam || !subject || !topic) {
            setError('Please select all fields.');
            return;
        }
        setIsGeneratingQuestions(true);
        setError('');
        setGeneratedQuestions([]);
        try {
            const questionsResult = await generateQuestions(exam, subject, topic, numQuestions, subTopic);
            setGeneratedQuestions(questionsResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate content. Please try again.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const filteredQuestions = useMemo(() => {
        return generatedQuestions.filter(q => {
            const difficultyMatch = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
            const typeMatch = typeFilter === 'All' || q.type === typeFilter;
            return difficultyMatch && typeMatch;
        });
    }, [generatedQuestions, difficultyFilter, typeFilter]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">Q-Bank Generator</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <SelectControl label="Exam" value={exam} onChange={e => setExam(e.target.value)} options={Object.keys(syllabus)} />
                    <SelectControl label="Subject" value={subject} onChange={e => setSubject(e.target.value)} options={subjects} disabled={!exam} />
                    <SelectControl label="Chapter" value={topic} onChange={e => setTopic(e.target.value)} options={topics} disabled={!subject} />
                    <SelectControl label="Sub-Topic" value={subTopic} onChange={e => setSubTopic(e.target.value)} options={subTopics} disabled={isLoadingSubTopics || !topic} />
                    <div>
                        <label className="block text-sm font-medium text-charcoal">Number of Questions</label>
                        <input
                            type="number"
                            value={numQuestions}
                            onChange={e => {
                                const val = parseInt(e.target.value, 10) || 1;
                                if (val < 1) setNumQuestions(1);
                                else setNumQuestions(val);
                            }}
                            min="1"
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerate} disabled={isGeneratingQuestions} className="flex items-center justify-center bg-accent text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-accent-600 transition-colors disabled:bg-slate-400">
                        {isGeneratingQuestions ? <><Loader size="sm" /> Generating...</> : <><SparklesIcon /> Generate Questions</>}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {isGeneratingQuestions && (
                <div className="text-center p-10 bg-white rounded-xl shadow-md border border-slate-200">
                    <Loader />
                    <p className="mt-4 text-charcoal font-medium animate-pulse">
                        {numQuestions > 15 
                            ? "Generating a large question bank... This might take a few seconds." 
                            : "Crafting high-quality questions for you..."}
                    </p>
                    <p className="text-xs text-charcoal-light mt-2 italic">
                        "Success is the sum of small efforts, repeated day in and day out."
                    </p>
                </div>
            )}

            {(generatedQuestions.length > 0 || priorityTopics.length > 0 || isLoadingTopics) && !isGeneratingQuestions && (
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-grow space-y-4">
                        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 flex items-center justify-between">
                            <h3 className="text-xl font-bold font-serif text-charcoal">Generated Questions ({filteredQuestions.length})</h3>
                            <div className="flex items-center gap-4">
                                <FilterIcon />
                                <SelectControl value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)} options={['All', 'Easy', 'Medium', 'Hard']} small />
                                <SelectControl value={typeFilter} onChange={e => setTypeFilter(e.target.value)} options={['All', 'MCQ', 'FillInTheBlank', 'TrueFalse']} small />
                            </div>
                        </div>
                        {filteredQuestions.map((q, index) => <QuestionCard key={`${q.id}-${index}`} question={q} exam={exam} subject={subject} questionNumber={index + 1} />)}
                    </div>

                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="sticky top-6 space-y-4">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <h3 className="text-lg font-bold font-serif text-charcoal mb-3 border-b border-slate-200 pb-2">Top Priority Chapters</h3>
                                {isLoadingTopics ? (
                                    <div className="flex justify-center items-center h-40">
                                        <Loader />
                                    </div>
                                ) : (
                                    <ul className="space-y-3">
                                        {priorityTopics.map(pt => (
                                            <li key={pt.topic} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-semibold text-charcoal">{pt.topic}</span>
                                                    <span className={`font-bold text-sm px-2 py-0.5 rounded-full ${pt.priority >= 4 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        Priority: {pt.priority}/5
                                                    </span>
                                                </div>
                                                <p className="text-xs text-charcoal-light mt-1">{pt.reason}</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const SelectControl: React.FC<{ label?: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], disabled?: boolean, small?: boolean }> = ({ label, value, onChange, options, disabled, small }) => (
    <div>
        {label && <label className="block text-sm font-medium text-charcoal">{label}</label>}
        <select value={value} onChange={onChange} disabled={disabled} className={`mt-1 block w-full pl-3 pr-10 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md ${small ? 'py-1' : 'py-2'} disabled:bg-slate-100`}>
            {options.length === 0 && <option>None</option>}
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

export default QBankGenerator;
