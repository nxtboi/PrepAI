
import React, { useState, useEffect, useCallback } from 'react';
import { syllabus } from '../data/syllabus';
import { getSubTopics, generateTopicNotes } from '../services/geminiService';
import Loader from '../components/ui/Loader';
import { SparklesIcon, AcademicCapIcon } from '../components/icons/Icons';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';

const TopicNotes: React.FC = () => {
    const [exam, setExam] = useState(Object.keys(syllabus)[0]);
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [subTopic, setSubTopic] = useState('Entire Chapter');

    const [subjects, setSubjects] = useState<string[]>([]);
    const [topics, setTopics] = useState<string[]>([]);
    const [subTopics, setSubTopics] = useState<string[]>(['Entire Chapter']);

    const [generatedNotes, setGeneratedNotes] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLoadingSubTopics, setIsLoadingSubTopics] = useState(false);
    const [error, setError] = useState('');
    
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
        }, 750);

        return () => clearTimeout(handler);
    }, [exam, subject, topic]);

    const handleGenerate = useCallback(async () => {
        if (!exam || !subject || !topic) {
            setError('Please select an exam, subject, and chapter.');
            return;
        }
        setIsGenerating(true);
        setError('');
        setGeneratedNotes('');
        try {
            const notesResult = await generateTopicNotes(exam, subject, topic, subTopic);
            setGeneratedNotes(notesResult);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate notes. Please try again.';
            setError(errorMessage);
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    }, [exam, subject, topic, subTopic]);

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">Topic Wise Notes</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <SelectControl label="Exam" value={exam} onChange={e => setExam(e.target.value)} options={Object.keys(syllabus)} />
                    <SelectControl label="Subject" value={subject} onChange={e => setSubject(e.target.value)} options={subjects} disabled={!exam} />
                    <SelectControl label="Chapter" value={topic} onChange={e => setTopic(e.target.value)} options={topics} disabled={!subject} />
                    <SelectControl label="Sub-Topic" value={subTopic} onChange={e => setSubTopic(e.target.value)} options={subTopics} disabled={isLoadingSubTopics || !topic} />
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleGenerate} disabled={isGenerating} className="flex items-center justify-center bg-accent text-white font-bold py-2 px-6 rounded-lg shadow-sm hover:bg-accent-600 transition-colors disabled:bg-slate-400">
                        {isGenerating ? <><Loader size="sm" /> Generating...</> : <><SparklesIcon /> Generate Notes</>}
                    </button>
                </div>
                {error && <p className="text-red-500 mt-4">{error}</p>}
            </div>

            {isGenerating && (
                 <div className="bg-white p-10 rounded-xl shadow-md border border-slate-200 flex flex-col items-center justify-center space-y-4">
                    <Loader size="lg" />
                    <p className="text-charcoal font-semibold">Brewing some fresh notes for you...</p>
                    <p className="text-sm text-charcoal-light">This might take a moment.</p>
                </div>
            )}
            
            {generatedNotes && !isGenerating && (
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-4">
                        <AcademicCapIcon className="w-8 h-8 text-primary"/>
                        <h3 className="text-2xl font-bold font-serif text-charcoal">
                            {subTopic && subTopic !== 'Entire Chapter' ? subTopic : topic}
                        </h3>
                    </div>
                    <MarkdownRenderer content={generatedNotes} />
                </div>
            )}
        </div>
    );
};

const SelectControl: React.FC<{ label?: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], disabled?: boolean }> = ({ label, value, onChange, options, disabled }) => (
    <div>
        {label && <label className="block text-sm font-medium text-charcoal">{label}</label>}
        <select value={value} onChange={onChange} disabled={disabled} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md disabled:bg-slate-100">
            {options.length === 0 && <option>None</option>}
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);


export default TopicNotes;
