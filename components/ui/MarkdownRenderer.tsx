
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  isChat?: boolean;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, isChat = false }) => {
  
  const processMath = (mathContent: string): string => {
    const replacements: string[] = [];

    // This is the main processor for a chunk of a math string.
    // It handles "flat" replacements like symbols, super/subscripts, and basic styling.
    const processChunk = (chunk: string): string => {
        let processed = ` ${chunk.trim()} `;

        // Greek letters
        const greek: { [key: string]: string } = {
            'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ', 'epsilon': 'ε', 'zeta': 'ζ', 'eta': 'η', 'theta': 'θ', 'iota': 'ι', 'kappa': 'κ', 'lambda': 'λ', 'mu': 'μ', 'nu': 'ν', 'xi': 'ξ', 'omicron': 'ο', 'pi': 'π', 'rho': 'ρ', 'sigma': 'σ', 'tau': 'τ', 'upsilon': 'υ', 'phi': 'φ', 'chi': 'χ', 'psi': 'ψ', 'omega': 'ω',
            'Gamma': 'Γ', 'Delta': 'Δ', 'Theta': 'Θ', 'Lambda': 'Λ', 'Xi': 'Ξ', 'Pi': 'Π', 'Sigma': 'Σ', 'Upsilon': 'Υ', 'Phi': 'Φ', 'Psi': 'Ψ', 'Omega': 'Ω',
        };
        processed = processed.replace(/\\([a-zA-Z]+)/g, (m, letter) => greek[letter] || m);
        
        // Other symbols and structures
        processed = processed
            .replace(/\\vec\{?([a-zA-Z])\}?/g, '$1\u20d7')
            .replace(/\\sqrt\{([^}]+)\}/g, '&radic;($1)')
            .replace(/\\dots/g, '…')
            .replace(/\\times/g, '&times;')
            .replace(/\\cdot/g, '&middot;')
            .replace(/\\pm/g, '&plusmn;')
            .replace(/(\\degree|\^\\circ)/g, '&deg;');

        // Superscripts: handles x^2, x^{10}, H^+, OH^-, (RT)^{...}
        processed = processed.replace(/([a-zA-Z0-9\u20d7Δ\)])\^\{([^}]+)\}/g, '$1<sup>$2</sup>');
        processed = processed.replace(/([a-zA-Z0-9\u20d7Δ\)])\^([a-zA-Z0-9.+-]+)/g, '$1<sup>$2</sup>');
        
        // Subscripts: handles x_2, x_{10}, Δn_g
        processed = processed.replace(/([a-zA-Z0-9\u20d7Δ\)])_\{([^}]+)\}/g, '$1<sub>$2</sub>');
        processed = processed.replace(/([a-zA-Z0-9\u20d7Δ\)])_([a-zA-Z0-9.+-]+)/g, '$1<sub>$2</sub>');

        // Safer auto-subscript for chemical formulas ONLY (e.g., H2O)
        processed = processed.replace(/\b([A-Z][a-z]?)(\d+)\b/g, '$1<sub>$2</sub>');

        // Make numbers, function names, brackets, and operators non-italic for correct typographical style.
        const nonItalicRegex = /(\d+(\.\d+)?|[()\[\]=+-]|\b(log|sin|cos|tan|ln|lim|pH|pOH|pK)\b)/g;
        processed = processed.replace(nonItalicRegex, (match) => {
            if (match.trim()) {
                return `<span style="font-style: normal;">${match}</span>`;
            }
            return match;
        });

        return processed.trim();
    };

    // Helper to recursively substitute placeholders back into the string
    const processPlaceholders = (str: string): string => {
        let oldStr;
        let newStr = str;
        // Loop multiple times to handle nested placeholders
        for (let i = 0; i < 5; i++) {
            oldStr = newStr;
            newStr = oldStr.replace(/%%REP_(\d+)%%/g, (match, index) => {
                return replacements[parseInt(index, 10)];
            });
            if (oldStr === newStr) break;
        }
        return newStr;
    };
    
    let processedMath = ` ${mathContent.replace(/\s+/g, ' ')} `;

    // Pass 1: Isolate non-italic literals (text) and recursive structures (fractions) first.
    // This protects their content from being processed by the main chunk processor.
    processedMath = processedMath.replace(/\\text\{([^}]+)\}/g, (match, content) => {
        replacements.push(`<span style="font-style: normal; font-family: 'Inter', sans-serif;">${content}</span>`);
        return `%%REP_${replacements.length - 1}%%`;
    });

    const fracRegex = /\\frac\{([^}]+)\}\{([^}]+)\}/g;
    for(let i=0; i<5 && fracRegex.test(processedMath); i++) { // Limit iterations to prevent infinite loops
      processedMath = processedMath.replace(fracRegex, (match, num, den) => {
          // IMPORTANT: Recursively call processMath on numerator and denominator
          const processedNum = processMath(num);
          const processedDen = processMath(den);
          const fractionHTML = `<span style="display: inline-block; vertical-align: -0.6em; text-align: center; font-style: normal; line-height: 1.2em;">
                                <span style="display: block; font-size: 0.9em; padding: 0 0.2em;">${processedNum}</span>
                                <span style="display: block; border-top: 1.5px solid currentColor; min-width: 2em;"></span>
                                <span style="display: block; font-size: 0.9em; padding: 0 0.2em;">${processedDen}</span>
                              </span>`;
          replacements.push(fractionHTML);
          return `%%REP_${replacements.length - 1}%%`;
      });
    }

    // Pass 2: Process the rest of the string for structure and typography.
    processedMath = processChunk(processedMath);

    // Final Pass: Substitute all placeholders back.
    processedMath = processPlaceholders(processedMath);

    return `<span style="font-family: 'Times New Roman', Times, serif; font-style: italic; white-space: nowrap;">${processedMath.trim()}</span>`;
  };
  
  const renderContent = () => {
    let processedContent = content;
    
    const lightBulbSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>`;
    const bookmarkSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>`;
    const proTipSVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L10 16l-4 4 4-4 5.293 5.293a1 1 0 001.414 0L21 16m-3-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>`;

    // 1. Process LaTeX-style math blocks first, as they have their own parsing rules.
    processedContent = processedContent.replace(/\$([^$]+?)\$/g, (match, mathContent) => processMath(mathContent));

    // 2. Custom hints styling (before standard markdown)
    processedContent = processedContent.replace(/\*\*\[Key Concept\]\*\*(.*?)(\n|$)/g, 
        `<div class="my-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg flex items-start"><span class="mr-3 text-blue-500 flex-shrink-0">${lightBulbSVG}</span><div><strong class="font-serif text-blue-700">Key Concept</strong><div class="mt-1">$1</div></div></div>`
    );
    processedContent = processedContent.replace(/\*\*\[Memorize this formula\]\*\*(.*?)(\n|$)/g, 
        `<div class="my-4 p-4 border border-amber-400 bg-amber-50 rounded-lg flex items-start"><span class="mr-3 text-amber-500 flex-shrink-0">${bookmarkSVG}</span><div><strong class="font-serif text-amber-700">Memorize This Formula</strong><div class="mt-1">$1</div></div></div>`
    );
    processedContent = processedContent.replace(/\*\*\[Pro Tip\]\*\*(.*?)(\n|$)/g,
        `<div class="my-4 p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg flex items-start"><span class="mr-3 text-green-500 flex-shrink-0">${proTipSVG}</span><div><strong class="font-serif text-green-700">Pro Tip</strong><div class="mt-1">$1</div></div></div>`
    );
    
    // 3. Common symbols (non-math)
    processedContent = processedContent
      .replace(/(\s?)->(\s?)/g, '$1&rarr;$2')   // Arrow right
      .replace(/(\s?)<->(\s?)/g, '$1&harr;$2')  // Arrow both ways
      .replace(/(\s?)>=(\s?)/g, '$1&ge;$2')     // Greater than or equal to
      .replace(/(\s?)<=(\s?)/g, '$1&le;$2');    // Less than or equal to

    // 4. Standard markdown block elements
    processedContent = processedContent
      .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 text-white p-4 rounded-md my-4 overflow-x-auto"><code>$1</code></pre>')
      .replace(/^\s*### (.*$)/gim, '<h3 class="font-serif text-xl font-bold my-4 text-charcoal">$1</h3>')
      .replace(/^\s*## (.*$)/gim, '<h2 class="font-serif text-2xl font-bold my-5 border-b pb-2 text-charcoal">$1</h2>')
      .replace(/^\s*# (.*$)/gim, '<h1 class="font-serif text-3xl font-bold my-6 border-b pb-3 text-charcoal-dark">$1</h1>');
      
    // 5. Intelligent List Handling (groups consecutive items)
    processedContent = processedContent.replace(/(?:^\s*-\s.*$\n?)+/gim, (match) => {
        const items = match.trim().split('\n').map(item => `<li class="mb-1">${item.replace(/^\s*-\s/, '')}</li>`).join('');
        return `<ul class="list-disc list-inside my-4 pl-4">${items}</ul>`;
    });
    processedContent = processedContent.replace(/(?:^\s*\d+\.\s.*$\n?)+/gim, (match) => {
        const items = match.trim().split('\n').map(item => `<li class="mb-1">${item.replace(/^\s*\d+\.\s/, '')}</li>`).join('');
        return `<ol class="list-decimal list-inside my-4 pl-4">${items}</ol>`;
    });

    // 6. Standard markdown inline elements (run after blocks)
    processedContent = processedContent
      .replace(/`([^`]+)`/g, '<code class="bg-slate-200 text-slate-800 px-1 py-0.5 rounded-sm font-mono text-sm">$1</code>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 7. Paragraphs and Line Breaks: A common technique to wrap non-block lines in <p> tags and then clean up.
    processedContent = processedContent
      .split('\n')
      .map(line => line.trim() === '' ? '' : `<p>${line}</p>`)
      .join('')
      .replace(/<\/p><p>/g, '</p><p class="mt-4">') // Add margin between paragraphs
      // Remove <p> tags that were incorrectly wrapped around block elements
      .replace(/<p><(ul|ol|li|pre|div|h[1-3])/g, '<$1') 
      .replace(/<\/(ul|ol|li|pre|div|h[1-3])><\/p>/g, '</$1>');

    return { __html: processedContent };
  };

  const textClass = isChat ? 'text-inherit' : 'text-charcoal leading-relaxed';
  
  return <div className={`prose max-w-none ${textClass}`} dangerouslySetInnerHTML={renderContent()} />;
};

export default MarkdownRenderer;
